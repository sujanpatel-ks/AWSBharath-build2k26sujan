"""
AgroCare AI — Alerts Lambda (P4 — EventBridge + SNS)
Triggered by EventBridge when a high-risk diagnosis is persisted.
Sends farmer alert via SNS.

This is a P4 feature — wired but not enabled until core P0 workflow is stable.
"""

from __future__ import annotations

import json
import os
import sys

import boto3

sys.path.insert(0, "/opt/python")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../shared"))

from shared.logger import get_logger

log = get_logger("alerts")

_REGION = os.environ.get("AWS_REGION_NAME", "ap-south-1")
_SNS_TOPIC_ARN = os.environ.get("SNS_ALERT_TOPIC_ARN", "")

_sns = boto3.client("sns", region_name=_REGION)


def lambda_handler(event: dict, context: object) -> dict:
    """
    Triggered by EventBridge rule on high-risk diagnosis events.
    Event detail:
      {
        "diagnosisId": "...",
        "farmerId": "...",
        "crop": "...",
        "condition": "...",
        "riskLevel": "HIGH|CRITICAL",
        "location": "..."
      }
    """
    request_id = context.aws_request_id if hasattr(context, "aws_request_id") else "local"

    # EventBridge wraps the payload in event["detail"]
    detail = event.get("detail", event)
    risk_level = detail.get("riskLevel", "")
    farmer_id = detail.get("farmerId", "")
    crop = detail.get("crop", "")
    condition = detail.get("condition", "")
    location = detail.get("location", "")
    diagnosis_id = detail.get("diagnosisId", "")

    log.info(
        "alert_triggered",
        risk_level=risk_level,
        farmer_id=farmer_id,
        diagnosis_id=diagnosis_id,
        crop=crop,
    )

    if not _SNS_TOPIC_ARN:
        log.warning("sns_topic_not_configured", message="SNS_ALERT_TOPIC_ARN not set — alert skipped")
        return {"statusCode": 200, "body": "SNS not configured"}

    if risk_level not in ("HIGH", "CRITICAL"):
        log.info("alert_skipped_low_risk", risk_level=risk_level)
        return {"statusCode": 200, "body": "Low risk — no alert"}

    message = _build_alert_message(crop, condition, risk_level, location, diagnosis_id)
    subject = f"🚨 AgroCare Alert: {risk_level} risk detected in your {crop}"

    try:
        _sns.publish(
            TopicArn=_SNS_TOPIC_ARN,
            Message=message,
            Subject=subject,
            MessageAttributes={
                "riskLevel": {"DataType": "String", "StringValue": risk_level},
                "farmerId": {"DataType": "String", "StringValue": farmer_id},
            },
        )
        log.info("alert_sent", farmer_id=farmer_id, diagnosis_id=diagnosis_id)
        return {"statusCode": 200, "body": "Alert sent"}
    except Exception as exc:
        log.error("alert_send_failed", exc=exc, farmer_id=farmer_id)
        return {"statusCode": 500, "body": "Alert failed"}


def _build_alert_message(
    crop: str, condition: str, risk_level: str, location: str, diagnosis_id: str
) -> str:
    return f"""AgroCare AI — Agricultural Alert

Risk Level: {risk_level}
Crop: {crop}
Detected Condition: {condition}
Location: {location}
Diagnosis ID: {diagnosis_id}

Please open the AgroCare app to view the full diagnosis and recommended action plan.

If this is a CRITICAL condition, contact your local agricultural extension officer immediately.

This is an automated alert from AgroCare AI.
"""
