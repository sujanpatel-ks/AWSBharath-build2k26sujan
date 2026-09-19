"""
AgroCare AI — Weather Lambda
Fetches current and forecast weather for a farmer's location.
Evaluates spray window safety.
Results are cached in DynamoDB for 30 minutes to avoid API rate limits.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta

import boto3
from botocore.exceptions import ClientError

sys.path.insert(0, "/opt/python")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../shared"))

from shared.auth import AuthError, get_farmer_id
from shared.db import get_item, put_item
from shared.logger import get_logger
from shared.schemas import WeatherContext, error_response, success_response

log = get_logger("weather")

_REGION = os.environ.get("AWS_REGION_NAME", "ap-south-1")
_WEATHER_API_KEY_PARAM = os.environ.get("WEATHER_API_KEY_PARAM", "/agrocare/weather-api-key")
_CACHE_TTL_MINUTES = 30
_OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5"

_ssm = boto3.client("ssm", region_name=_REGION)
_weather_api_key: str | None = None  # cached after first SSM fetch


def lambda_handler(event: dict, context: object) -> dict:
    """
    GET /weather?lat=12.97&lon=77.59
    Returns weather context and spray window safety assessment.
    """
    request_id = context.aws_request_id if hasattr(context, "aws_request_id") else "local"
    log.info("weather_request", request_id=request_id)

    try:
        get_farmer_id(event)
    except AuthError as exc:
        return error_response("UNAUTHORIZED", exc.message, 401, request_id)

    params = event.get("queryStringParameters") or {}
    lat_str = params.get("lat", "")
    lon_str = params.get("lon", "")
    location_name = params.get("location", "")

    # Allow location name fallback (geocode via OpenWeatherMap)
    if not lat_str or not lon_str:
        if not location_name:
            return error_response(
                "VALIDATION_ERROR",
                "Provide lat/lon query parameters or a location name",
                400,
                request_id,
            )
        lat_str, lon_str = _geocode_location(location_name)
        if not lat_str:
            return error_response(
                "WEATHER_ERROR",
                f"Could not determine coordinates for location: {location_name}",
                422,
                request_id,
            )

    try:
        lat = float(lat_str)
        lon = float(lon_str)
    except ValueError:
        return error_response("VALIDATION_ERROR", "lat and lon must be numeric", 400, request_id)

    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        return error_response("VALIDATION_ERROR", "lat/lon out of valid range", 400, request_id)

    # --- Cache check ---
    cache_key = f"WEATHER#{lat:.2f}#{lon:.2f}"
    cached = _get_cached_weather(cache_key)
    if cached:
        log.info("weather_cache_hit", lat=lat, lon=lon)
        return success_response(cached)

    # --- Fetch from API ---
    api_key = _get_api_key()
    if not api_key:
        # Return a neutral weather context if API key not configured
        log.warning("weather_api_key_missing", message="Returning neutral weather context")
        neutral = WeatherContext(
            summary="Weather data unavailable. Configure WEATHER_API_KEY_PARAM.",
            spray_window_safe=True,
            advisory="Weather information could not be retrieved. Exercise caution.",
        )
        return success_response(neutral.model_dump())

    weather_data = _fetch_weather(lat, lon, api_key)
    if not weather_data:
        return error_response("WEATHER_ERROR", "Failed to fetch weather data", 502, request_id)

    context_obj = _evaluate_weather(weather_data)
    result = context_obj.model_dump()

    # --- Cache result ---
    _cache_weather(cache_key, result)

    log.info(
        "weather_fetched",
        lat=lat,
        lon=lon,
        spray_safe=context_obj.spray_window_safe,
        rain_hours=context_obj.rain_expected_hours,
    )
    return success_response(result)


def get_weather_for_location(lat: float, lon: float) -> WeatherContext:
    """
    Direct Python call from diagnosis orchestrator.
    Returns a WeatherContext object.
    """
    cache_key = f"WEATHER#{lat:.2f}#{lon:.2f}"
    cached = _get_cached_weather(cache_key)
    if cached:
        return WeatherContext(**cached)

    api_key = _get_api_key()
    if not api_key:
        return WeatherContext(
            summary="Weather data unavailable.",
            spray_window_safe=True,
            advisory="Weather information could not be retrieved.",
        )

    weather_data = _fetch_weather(lat, lon, api_key)
    if not weather_data:
        return WeatherContext(
            summary="Weather fetch failed.",
            spray_window_safe=True,
            advisory="Could not retrieve weather. Please check manually.",
        )

    ctx = _evaluate_weather(weather_data)
    _cache_weather(cache_key, ctx.model_dump())
    return ctx


# ------------------------------------------------------------------
# Internal helpers
# ------------------------------------------------------------------

def _get_api_key() -> str | None:
    global _weather_api_key
    if _weather_api_key:
        return _weather_api_key
    try:
        response = _ssm.get_parameter(Name=_WEATHER_API_KEY_PARAM, WithDecryption=True)
        _weather_api_key = response["Parameter"]["Value"]
        return _weather_api_key
    except ClientError as exc:
        log.warning("ssm_api_key_fetch_failed", exc=exc)
        return None


def _fetch_weather(lat: float, lon: float, api_key: str) -> dict | None:
    """Call OpenWeatherMap One Call API."""
    url = (
        f"{_OPENWEATHER_BASE}/forecast"
        f"?lat={lat}&lon={lon}&appid={api_key}&units=metric&cnt=8"
    )
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:  # nosec — no user data in URL
            return json.loads(resp.read().decode())
    except Exception as exc:
        log.error("weather_api_fetch_failed", exc=exc)
        return None


def _geocode_location(location: str) -> tuple[str, str]:
    """Simple geocoding via OpenWeatherMap Geo API."""
    api_key = _get_api_key()
    if not api_key:
        return "", ""
    encoded = urllib.parse.quote(location)
    url = f"http://api.openweathermap.org/geo/1.0/direct?q={encoded}&limit=1&appid={api_key}"
    try:
        with urllib.request.urlopen(url, timeout=8) as resp:  # nosec
            data = json.loads(resp.read().decode())
            if data:
                return str(data[0]["lat"]), str(data[0]["lon"])
    except Exception as exc:
        log.error("geocode_failed", exc=exc, location=location)
    return "", ""


def _evaluate_weather(data: dict) -> WeatherContext:
    """Parse API response and evaluate spray window."""
    try:
        # Use the forecast list (3-hour intervals, cnt=8 = 24h)
        forecasts = data.get("list", [])
        current = forecasts[0] if forecasts else {}

        temp = current.get("main", {}).get("temp")
        humidity = current.get("main", {}).get("humidity")
        wind_speed = current.get("wind", {}).get("speed", 0)
        weather_desc = current.get("weather", [{}])[0].get("description", "")

        # Check for rain in next 24h
        rain_in_hours: int | None = None
        for i, forecast in enumerate(forecasts):
            rain_data = forecast.get("rain", {})
            pop = forecast.get("pop", 0)  # probability of precipitation
            if rain_data.get("3h", 0) > 0.5 or pop > 0.6:
                rain_in_hours = i * 3
                break

        # Spray window safe if:
        # - no rain expected within 6 hours
        # - wind speed < 15 km/h
        # - humidity < 90%
        wind_kmh = wind_speed * 3.6
        spray_safe = (
            (rain_in_hours is None or rain_in_hours >= 6)
            and wind_kmh < 15
            and (humidity is None or humidity < 90)
        )

        advisory_parts = []
        if rain_in_hours is not None and rain_in_hours < 6:
            advisory_parts.append(f"Rain expected in approximately {rain_in_hours} hours — avoid spraying.")
        if wind_kmh >= 15:
            advisory_parts.append(f"Wind speed {wind_kmh:.0f} km/h — too high for safe spraying.")
        if humidity and humidity >= 90:
            advisory_parts.append(f"Humidity {humidity}% — consider waiting for drier conditions.")

        summary_parts = []
        if temp is not None:
            summary_parts.append(f"{temp:.0f}°C")
        if humidity is not None:
            summary_parts.append(f"{humidity}% humidity")
        if weather_desc:
            summary_parts.append(weather_desc.capitalize())
        summary = ", ".join(summary_parts) if summary_parts else "Conditions unavailable"

        return WeatherContext(
            summary=summary,
            spray_window_safe=spray_safe,
            rain_expected_hours=rain_in_hours,
            temperature_celsius=temp,
            humidity_percent=float(humidity) if humidity else None,
            advisory=" ".join(advisory_parts) if advisory_parts else "Conditions appear suitable for field operations.",
        )

    except Exception as exc:
        log.error("weather_evaluation_failed", exc=exc)
        return WeatherContext(
            summary="Weather evaluation failed.",
            spray_window_safe=True,
            advisory="Could not evaluate weather conditions. Check manually.",
        )


def _get_cached_weather(cache_key: str) -> dict | None:
    try:
        item = get_item(cache_key, "CACHE")
        if item:
            expires_at = item.get("expiresAt", "")
            if expires_at > datetime.now(tz=timezone.utc).isoformat():
                return json.loads(item.get("data", "{}"))
    except Exception:
        pass
    return None


def _cache_weather(cache_key: str, data: dict) -> None:
    try:
        expires_at = (
            datetime.now(tz=timezone.utc) + timedelta(minutes=_CACHE_TTL_MINUTES)
        ).isoformat()
        put_item({
            "PK": cache_key,
            "SK": "CACHE",
            "data": json.dumps(data, default=str),
            "expiresAt": expires_at,
        })
    except Exception as exc:
        log.warning("weather_cache_write_failed", exc=exc)
