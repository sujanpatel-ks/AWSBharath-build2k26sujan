"""
AgroCare AI — Safety Validation Lambda
Deterministic rule-based safety checks on AI-generated recommendations.
The LLM output NEVER bypasses this layer.

Possible decisions:
  ALLOW      — recommendation is safe to present to farmer
  MODIFY     — recommendation needs adjustment (modified_action provided)
  BLOCK      — recommendation must not be shown (missing info / unsafe)
  DEFER      — timing-dependent deferral (e.g. rain expected)
  ESCALATE   — conflicting/insufficient evidence, needs expert
"""

from __future__ import annotations

import json
import os
import sys

sys.path.insert(0, "/opt/python")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../shared"))

from shared.auth import AuthError, get_farmer_id
from shared.logger import get_logger
from shared.schemas import (
    SafetyDecision,
    SafetyValidationResult,
    error_response,
    success_response,
)

log = get_logger("safety")


def lambda_handler(event: dict, context: object) -> dict:
    """
    POST /recommendation/validate
    Also called internally from the diagnosis orchestrator.
    """
    request_id = context.aws_request_id if hasattr(context, "aws_request_id") else "local"

    # Allow both external API calls and internal direct invocations
    if event.get("_internal"):
        return _run_validation(event.get("payload", {}), request_id)

    try:
        get_farmer_id(event)
    except AuthError as exc:
        return error_response("UNAUTHORIZED", exc.message, 401, request_id)

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return error_response("VALIDATION_ERROR", "Invalid JSON body", 400, request_id)

    result = _run_validation(body, request_id)
    return result


def _run_validation(payload: dict, request_id: str) -> dict:
    """
    Core deterministic validation logic.
    Called from both the HTTP handler and the diagnosis orchestrator.
    """
    diagnosis = payload.get("diagnosis", {})
    weather = payload.get("weather", {})
    evidence = payload.get("evidence", [])
    proposed_action = payload.get("proposed_action", "")
    crop = payload.get("crop", "")
    location = payload.get("location", "")

    checks: list[str] = []
    decision = SafetyDecision.ALLOW
    reason = "All safety checks passed."
    modified_action: str | None = None

    # ------------------------------------------------------------------
    # CHECK 1: Missing critical context
    # ------------------------------------------------------------------
    checks.append("missing_context_check")
    if not crop or not location:
        decision = SafetyDecision.BLOCK
        reason = (
            "Cannot provide a safe recommendation without crop and location information. "
            "Please complete your farm profile and try again."
        )
        return _build_response(
            SafetyValidationResult(
                decision=decision,
                reason=reason,
                checks_performed=checks,
            ),
            request_id,
        )

    # ------------------------------------------------------------------
    # CHECK 2: Insufficient evidence
    # ------------------------------------------------------------------
    checks.append("evidence_sufficiency_check")
    confidence = diagnosis.get("confidence", 0.0)
    if confidence < 0.3 and not evidence:
        decision = SafetyDecision.ESCALATE
        reason = (
            "The AI analysis has low confidence and no supporting evidence was retrieved "
            "from the agricultural knowledge base. Please consult a local agricultural "
            "extension officer or agronomist before taking any action."
        )
        return _build_response(
            SafetyValidationResult(
                decision=decision,
                reason=reason,
                checks_performed=checks,
            ),
            request_id,
        )

    # ------------------------------------------------------------------
    # CHECK 3: Conflicting evidence
    # ------------------------------------------------------------------
    checks.append("evidence_conflict_check")
    if _has_conflicting_evidence(evidence, diagnosis):
        decision = SafetyDecision.ESCALATE
        reason = (
            "The retrieved agricultural evidence contains conflicting information about "
            "this condition. A confident recommendation cannot be made. Please seek "
            "expert guidance before proceeding."
        )
        return _build_response(
            SafetyValidationResult(
                decision=decision,
                reason=reason,
                checks_performed=checks,
            ),
            request_id,
        )

    # ------------------------------------------------------------------
    # CHECK 4: Unsafe weather for spray-based actions
    # ------------------------------------------------------------------
    checks.append("weather_window_check")
    spray_action = _is_spray_action(proposed_action)
    spray_window_safe = weather.get("spray_window_safe", True)
    rain_hours = weather.get("rain_expected_hours")

    if spray_action and not spray_window_safe:
        rain_msg = f" Rain is expected in approximately {rain_hours} hours." if rain_hours else ""
        decision = SafetyDecision.DEFER
        modified_action = (
            "Spraying has been deferred due to unfavorable weather conditions."
            + rain_msg
            + " Please re-check the weather and apply when a dry window of at least "
            "6 hours is available. Store the prepared mixture safely in the interim."
        )
        reason = (
            f"Weather conditions are not suitable for spraying.{rain_msg} "
            "Applying pesticides or fungicides before rain reduces effectiveness "
            "and increases environmental risk."
        )
        return _build_response(
            SafetyValidationResult(
                decision=decision,
                reason=reason,
                modified_action=modified_action,
                checks_performed=checks,
            ),
            request_id,
        )

    # ------------------------------------------------------------------
    # CHECK 5: Unsupported / missing dosage context
    # ------------------------------------------------------------------
    checks.append("dosage_context_check")
    if _mentions_dosage(proposed_action) and not _has_dosage_context(proposed_action):
        decision = SafetyDecision.MODIFY
        modified_action = (
            proposed_action
            + "\n\n⚠️ IMPORTANT: The exact dosage should be confirmed with the product label "
            "or a licensed agrochemical retailer. Do not exceed the recommended rate."
        )
        reason = "Dosage was mentioned but specific rates could not be confirmed from available evidence."

    # ------------------------------------------------------------------
    # CHECK 6: High-risk crop / critical disease — flag for expert review
    # ------------------------------------------------------------------
    checks.append("expert_review_flag")
    risk_level = diagnosis.get("risk_level", "LOW")
    if risk_level in ("HIGH", "CRITICAL") and decision == SafetyDecision.ALLOW:
        decision = SafetyDecision.MODIFY
        if modified_action:
            modified_action += "\n\n🔴 HIGH RISK: Strongly recommended to confirm this diagnosis with a local agricultural extension officer."
        else:
            modified_action = (
                proposed_action
                + "\n\n🔴 HIGH RISK: Strongly recommended to confirm this diagnosis with a local agricultural extension officer."
            )
        reason = "High-risk condition detected. Expert review is recommended before applying any treatment."

    log.info(
        "safety_check_complete",
        decision=decision.value,
        risk_level=risk_level,
        spray_action=spray_action,
        confidence=confidence,
    )

    return _build_response(
        SafetyValidationResult(
            decision=decision,
            reason=reason,
            modified_action=modified_action,
            checks_performed=checks,
        ),
        request_id,
    )


# ------------------------------------------------------------------
# Internal helpers
# ------------------------------------------------------------------

def run_safety_check(payload: dict) -> SafetyValidationResult:
    """
    Direct Python call from the diagnosis orchestrator.
    Returns a SafetyValidationResult object (not an HTTP response dict).
    """
    diagnosis = payload.get("diagnosis", {})
    weather = payload.get("weather", {})
    evidence = payload.get("evidence", [])
    proposed_action = payload.get("proposed_action", "")
    crop = payload.get("crop", "")
    location = payload.get("location", "")

    checks: list[str] = []
    decision = SafetyDecision.ALLOW
    reason = "All safety checks passed."
    modified_action: str | None = None

    checks.append("missing_context_check")
    if not crop or not location:
        return SafetyValidationResult(
            decision=SafetyDecision.BLOCK,
            reason="Missing crop or location context.",
            checks_performed=checks,
        )

    checks.append("evidence_sufficiency_check")
    confidence = diagnosis.get("confidence", 0.0)
    if confidence < 0.3 and not evidence:
        return SafetyValidationResult(
            decision=SafetyDecision.ESCALATE,
            reason="Low confidence and no supporting evidence. Consult an expert.",
            checks_performed=checks,
        )

    checks.append("evidence_conflict_check")
    if _has_conflicting_evidence(evidence, diagnosis):
        return SafetyValidationResult(
            decision=SafetyDecision.ESCALATE,
            reason="Conflicting evidence detected. Seek expert guidance.",
            checks_performed=checks,
        )

    checks.append("weather_window_check")
    spray_action = _is_spray_action(proposed_action)
    spray_window_safe = weather.get("spray_window_safe", True)
    rain_hours = weather.get("rain_expected_hours")
    if spray_action and not spray_window_safe:
        rain_msg = f" Rain expected in ~{rain_hours}h." if rain_hours else ""
        return SafetyValidationResult(
            decision=SafetyDecision.DEFER,
            reason=f"Unsafe weather for spraying.{rain_msg}",
            modified_action=(
                "Defer spraying until a dry window of 6+ hours is available."
                + rain_msg
            ),
            checks_performed=checks,
        )

    checks.append("dosage_context_check")
    if _mentions_dosage(proposed_action) and not _has_dosage_context(proposed_action):
        decision = SafetyDecision.MODIFY
        modified_action = (
            proposed_action
            + "\n\n⚠️ Confirm exact dosage with the product label or a licensed retailer."
        )
        reason = "Dosage mentioned but specific rates not confirmed from evidence."

    checks.append("expert_review_flag")
    risk_level = diagnosis.get("risk_level", "LOW")
    if risk_level in ("HIGH", "CRITICAL") and decision == SafetyDecision.ALLOW:
        decision = SafetyDecision.MODIFY
        modified_action = (proposed_action or "") + "\n\n🔴 HIGH RISK: Confirm with extension officer."
        reason = "High-risk condition — expert review recommended."

    return SafetyValidationResult(
        decision=decision,
        reason=reason,
        modified_action=modified_action,
        checks_performed=checks,
    )


def _is_spray_action(action: str) -> bool:
    """Detect if the proposed action involves spraying."""
    spray_keywords = {"spray", "spraying", "apply", "application", "fungicide",
                      "pesticide", "insecticide", "herbicide", "foliar"}
    words = set(action.lower().split())
    return bool(words & spray_keywords)


def _mentions_dosage(action: str) -> bool:
    """Detect if the action mentions dosage."""
    import re
    return bool(re.search(r"\b(dose|dosage|ml|gram|kg|litre|liter|g\/l|ml\/l)\b", action.lower()))


def _has_dosage_context(action: str) -> bool:
    """Check if specific numeric dosage rate is provided."""
    import re
    # Looks for patterns like "2 ml/l", "500 g/ha", "3 kg per acre"
    return bool(re.search(r"\d+\.?\d*\s*(ml|g|kg|litre|liter)\s*(\/|per)\s*(l|litre|acre|ha|hectare)", action.lower()))


def _has_conflicting_evidence(evidence: list[dict], diagnosis: dict) -> bool:
    """
    Detect obviously conflicting evidence.
    Simple heuristic: if evidence snippets mention opposite conditions.
    """
    if len(evidence) < 2:
        return False
    condition = (diagnosis.get("possible_condition") or "").lower()
    # If evidence contains contradiction markers (simplified check)
    texts = [e.get("text", "").lower() for e in evidence]
    has_positive = any(condition in t for t in texts)
    has_negative = any(
        phrase in t
        for t in texts
        for phrase in ["not recommended", "contraindicated", "do not apply", "avoid"]
    )
    return has_positive and has_negative


def _build_response(result: SafetyValidationResult, request_id: str) -> dict:
    return success_response(result)
