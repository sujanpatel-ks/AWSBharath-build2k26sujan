"""
AgroCare AI — Profile Lambda
Farmer profile and farm context management.
All data is scoped to FARMER#<cognitoSub> — no cross-farmer access.
"""

from __future__ import annotations

import json
import os
import sys
import uuid
from datetime import datetime, timezone

sys.path.insert(0, "/opt/python")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../shared"))

from shared.auth import AuthError, farm_sk, farmer_pk, get_farmer_id, get_farmer_email, get_farmer_name
from shared.db import DBError, get_item, put_item, query_by_pk, update_item
from shared.logger import get_logger
from shared.schemas import (
    FarmCreateRequest,
    ProfileUpdateRequest,
    error_response,
    success_response,
)

log = get_logger("profile")


def lambda_handler(event: dict, context: object) -> dict:
    request_id = context.aws_request_id if hasattr(context, "aws_request_id") else "local"
    method = event.get("httpMethod", "GET")
    path = event.get("path", "")

    try:
        farmer_id = get_farmer_id(event)
    except AuthError as exc:
        return error_response("UNAUTHORIZED", exc.message, 401, request_id)

    try:
        # Route based on method + path
        if method == "GET" and path.endswith("/profile"):
            return _get_profile(farmer_id, event, request_id)
        elif method == "PUT" and path.endswith("/profile"):
            return _update_profile(farmer_id, event, request_id)
        elif method == "GET" and path.endswith("/farms"):
            return _list_farms(farmer_id, request_id)
        elif method == "POST" and path.endswith("/farms"):
            return _create_farm(farmer_id, event, request_id)
        else:
            return error_response("NOT_FOUND", "Route not found", 404, request_id)
    except DBError as exc:
        log.error("profile_db_error", exc=exc, farmer_id=farmer_id)
        return error_response("DATABASE_ERROR", "A storage error occurred", 500, request_id)
    except Exception as exc:
        log.error("profile_unexpected_error", exc=exc)
        return error_response("SERVER_ERROR", "An unexpected error occurred", 500, request_id)


# ------------------------------------------------------------------
# GET /profile
# ------------------------------------------------------------------
def _get_profile(farmer_id: str, event: dict, request_id: str) -> dict:
    pk = farmer_pk(farmer_id)
    item = get_item(pk, "PROFILE")

    if not item:
        # Auto-create profile on first access using Cognito attributes
        item = _create_default_profile(farmer_id, event)

    # Never return PK/SK to the client
    return success_response(_sanitize_item(item))


# ------------------------------------------------------------------
# PUT /profile
# ------------------------------------------------------------------
def _update_profile(farmer_id: str, event: dict, request_id: str) -> dict:
    try:
        body = json.loads(event.get("body") or "{}")
        req = ProfileUpdateRequest(**body)
    except json.JSONDecodeError:
        return error_response("VALIDATION_ERROR", "Invalid JSON body", 400, request_id)
    except Exception as exc:
        return error_response("VALIDATION_ERROR", str(exc), 400, request_id)

    pk = farmer_pk(farmer_id)
    updates: dict = {"updatedAt": datetime.now(tz=timezone.utc).isoformat()}

    if req.name is not None:
        updates["name"] = req.name
    if req.phone is not None:
        updates["phone"] = req.phone
    if req.location is not None:
        updates["location"] = req.location
    if req.farm_size_acres is not None:
        updates["farmSizeAcres"] = req.farm_size_acres
    if req.primary_crops is not None:
        updates["primaryCrops"] = req.primary_crops

    updated = update_item(pk, "PROFILE", updates)
    log.info("profile_updated", farmer_id=farmer_id)
    return success_response(_sanitize_item(updated))


# ------------------------------------------------------------------
# GET /profile/farms
# ------------------------------------------------------------------
def _list_farms(farmer_id: str, request_id: str) -> dict:
    pk = farmer_pk(farmer_id)
    items, _ = query_by_pk(pk, sk_prefix="FARM#")
    farms = [_sanitize_item(i) for i in items]
    return success_response({"farms": farms, "count": len(farms)})


# ------------------------------------------------------------------
# POST /profile/farms
# ------------------------------------------------------------------
def _create_farm(farmer_id: str, event: dict, request_id: str) -> dict:
    try:
        body = json.loads(event.get("body") or "{}")
        req = FarmCreateRequest(**body)
    except json.JSONDecodeError:
        return error_response("VALIDATION_ERROR", "Invalid JSON body", 400, request_id)
    except Exception as exc:
        return error_response("VALIDATION_ERROR", str(exc), 400, request_id)

    farm_id = uuid.uuid4().hex
    now = datetime.now(tz=timezone.utc).isoformat()

    item = {
        "PK": farmer_pk(farmer_id),
        "SK": farm_sk(farm_id),
        "farmerId": farmer_id,
        "farmId": farm_id,
        "farmName": req.farm_name,
        "areaAcres": req.area_acres,
        "soilType": req.soil_type or "",
        "irrigationType": req.irrigation_type or "",
        "location": req.location or "",
        "primaryCrops": req.primary_crops,
        "createdAt": now,
        "updatedAt": now,
    }
    put_item(item)
    log.info("farm_created", farmer_id=farmer_id, farm_id=farm_id)
    return success_response(_sanitize_item(item), status_code=201)


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _create_default_profile(farmer_id: str, event: dict) -> dict:
    now = datetime.now(tz=timezone.utc).isoformat()
    email = get_farmer_email(event)
    name = get_farmer_name(event)
    item = {
        "PK": farmer_pk(farmer_id),
        "SK": "PROFILE",
        "farmerId": farmer_id,
        "name": name or "Farmer",
        "email": email or "",
        "phone": "",
        "location": "",
        "farmSizeAcres": None,
        "primaryCrops": [],
        "createdAt": now,
        "updatedAt": now,
    }
    put_item(item)
    log.info("profile_auto_created", farmer_id=farmer_id)
    return item


def _sanitize_item(item: dict) -> dict:
    """Remove internal DynamoDB keys before returning to client."""
    return {k: v for k, v in item.items() if k not in ("PK", "SK")}
