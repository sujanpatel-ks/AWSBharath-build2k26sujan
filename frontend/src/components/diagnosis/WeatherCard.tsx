import { CloudSun, CloudRain, Wind, Thermometer, Droplets, AlertTriangle, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import type { WeatherContext } from "@/types";

interface Props {
  weather: WeatherContext;
  compact?: boolean;
}

export default function WeatherCard({ weather, compact = false }: Props) {
  const safe = weather.spray_window_safe;

  return (
    <div
      className={clsx(
        "card",
        !safe && "ring-amber-200 bg-amber-50"
      )}
    >
      {/* Summary row */}
      <div className="flex items-center gap-3 mb-3">
        <div className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          safe ? "bg-agro-100" : "bg-amber-100"
        )}>
          {safe
            ? <CloudSun className="w-5 h-5 text-agro-600" />
            : <CloudRain className="w-5 h-5 text-amber-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{weather.summary}</p>
          <div className={clsx(
            "flex items-center gap-1 text-xs mt-0.5",
            safe ? "text-green-600" : "text-amber-600"
          )}>
            {safe
              ? <><CheckCircle2 className="w-3 h-3" /> Suitable for field operations</>
              : <><AlertTriangle className="w-3 h-3" /> Unfavourable conditions</>}
          </div>
        </div>
      </div>

      {/* Stats row */}
      {!compact && (
        <div className="flex gap-4 text-xs text-gray-500 mb-3">
          {weather.temperature_celsius != null && (
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-red-400" />
              {weather.temperature_celsius.toFixed(0)}°C
            </span>
          )}
          {weather.humidity_percent != null && (
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              {weather.humidity_percent.toFixed(0)}%
            </span>
          )}
          {weather.rain_expected_hours != null && (
            <span className="flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-indigo-400" />
              Rain in ~{weather.rain_expected_hours}h
            </span>
          )}
        </div>
      )}

      {/* Advisory */}
      {weather.advisory && (
        <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2">
          {weather.advisory}
        </p>
      )}
    </div>
  );
}
