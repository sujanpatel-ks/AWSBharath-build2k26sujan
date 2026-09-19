"""
AgroCare AI — Upload Lambda
Generates pre-signed S3 URLs for direct crop image upload from the browser.
The large file never passes through Lambda — the client uploads directly to S3.
"""

from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

# Add shared layer to path when running locally
import sys
sys.path.insert(0, "/opt/python")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../shared"))

from shared.auth import AuthError, get_farmer_id
from shared.logger import get_logger
from shared.schemas import error_response, success_response

log = get_logger("upload")

_REGION = os.environ.get("AWS_REGION_NAME", "ap-south-1")
_BUCKET = os.environ.get("S3_IMAGES_BUCKET", "")
_PRESIGNED_EXPIRY = 900   # 15 minutes
_MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

_ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

from botocore.config import Config
_s3_client = boto3.client("s3", region_name=_REGION, config=Config(signature_version="s3v4", s3={"addressing_style": "virtual"}))


def lambda_handler(event: dict, context: object) -> dict:
    """
    GET /upload/presigned?filename=crop.jpg&contentType=image/jpeg

    Returns:
      { uploadUrl, key, expiresIn }
    """
    request_id = context.aws_request_id if hasattr(context, "aws_request_id") else "local"
    log.info("upload_presigned_request", request_id=request_id)

    # --- Auth ---
    try:
        farmer_id = get_farmer_id(event)
    except AuthError as exc:
        return error_response("UNAUTHORIZED", exc.message, 401, request_id)

    # --- Query parameters ---
    params = event.get("queryStringParameters") or {}
    filename: str = params.get("filename", "").strip()
    content_type: str = params.get("contentType", "image/jpeg").strip().lower()

    if not filename:
        return error_response("VALIDATION_ERROR", "filename query parameter required", 400, request_id)

    if content_type not in _ALLOWED_CONTENT_TYPES:
        return error_response(
            "VALIDATION_ERROR",
            f"Unsupported content type. Allowed: {', '.join(_ALLOWED_CONTENT_TYPES)}",
            400,
            request_id,
        )

    if not _BUCKET:
        log.error("upload_bucket_not_configured")
        return error_response("CONFIGURATION_ERROR", "Storage not configured", 500, request_id)

    # --- Build scoped S3 key ---
    # Pattern: crop-images/<farmerId>/<date>/<uuid>_<filename>
    today = datetime.now(tz=timezone.utc).strftime("%Y/%m/%d")
    safe_filename = _sanitize_filename(filename)
    object_key = f"crop-images/{farmer_id}/{today}/{uuid.uuid4().hex}_{safe_filename}"

    # --- Generate pre-signed URL ---
    try:
        upload_url = _s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": _BUCKET,
                "Key": object_key,
                "ContentType": content_type,
            },
            ExpiresIn=_PRESIGNED_EXPIRY,
        )
    except ClientError as exc:
        log.error("presigned_url_generation_failed", exc=exc)
        return error_response("UPLOAD_ERROR", "Failed to generate upload URL", 500, request_id)

    log.info(
        "presigned_url_generated",
        farmer_id=farmer_id,
        key=object_key,
        content_type=content_type,
    )

    return success_response({
        "uploadUrl": upload_url,
        "key": object_key,
        "bucket": _BUCKET,
        "expiresIn": _PRESIGNED_EXPIRY,
        "maxFileSizeBytes": _MAX_FILE_SIZE,
    })


def _sanitize_filename(filename: str) -> str:
    """Remove path traversal and special characters from filename."""
    import re
    # Keep only safe characters
    safe = re.sub(r"[^a-zA-Z0-9._-]", "_", os.path.basename(filename))
    return safe[:100]  # cap length
