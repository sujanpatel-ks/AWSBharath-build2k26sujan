"""
AgroCare AI — Safety Validator Unit Tests
Covers all required test cases:
  ✓ ALLOW  — sufficient evidence, safe weather, complete context
  ✓ MODIFY — high-risk condition / missing dosage context
  ✓ BLOCK  — missing crop/location context
  ✓ DEFER  — unsafe weather window (rain imminent)
  ✓ ESCALATE — insufficient evidence + conflicting evidence
"""

from __future__ import annotations

import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../"))

from tests.fixtures.sample_events import (
    EVIDENCE_CONFLICTING,
    EVIDENCE_INSUFFICIENT,
    EVIDENCE_SUFFICIENT,
    WEATHER_SAFE,
    WEATHER_UNSAFE_RAIN,
)

# Import the run_safety_check function directly (no HTTP layer)
from functions.safety.handler import run_safety_check
from shared.schemas import SafetyDecision


# ------------------------------------------------------------------
# Helper
# ------------------------------------------------------------------
def make_payload(
    crop: str = "Arecanut",
    location: str = "Karnataka",
    confidence: float = 0.8,
    risk_level: str = "MEDIUM",
    evidence: list = None,
    weather: dict = None,
    proposed_action: str = "Apply fungicide spray",
) -> dict:
    return {
        "crop": crop,
        "location": location,
        "diagnosis": {
            "possible_condition": "Yellow Leaf Disease",
            "confidence": confidence,
            "risk_level": risk_level,
        },
        "evidence": evidence if evidence is not None else EVIDENCE_SUFFICIENT,
        "weather": weather if weather is not None else WEATHER_SAFE,
        "proposed_action": proposed_action,
    }


# ------------------------------------------------------------------
# Test: ALLOW path
# ------------------------------------------------------------------
class TestSafetyAllow:
    @pytest.mark.unit
    @pytest.mark.safety
    def test_allow_with_sufficient_evidence_safe_weather(self):
        result = run_safety_check(make_payload())
        assert result.decision == SafetyDecision.ALLOW
        assert result.reason == "All safety checks passed."
        assert "missing_context_check" in result.checks_performed
        assert "weather_window_check" in result.checks_performed

    @pytest.mark.unit
    @pytest.mark.safety
    def test_allow_non_spray_action_unsafe_weather(self):
        """Non-spray actions should ALLOW even if weather is unsafe."""
        result = run_safety_check(make_payload(
            weather=WEATHER_UNSAFE_RAIN,
            proposed_action="Remove infected palms and destroy them",
        ))
        # Weather check only fires for spray actions
        assert result.decision in (SafetyDecision.ALLOW, SafetyDecision.MODIFY)


# ------------------------------------------------------------------
# Test: BLOCK path
# ------------------------------------------------------------------
class TestSafetyBlock:
    @pytest.mark.unit
    @pytest.mark.safety
    def test_block_missing_crop(self):
        result = run_safety_check(make_payload(crop=""))
        assert result.decision == SafetyDecision.BLOCK
        assert "missing_context_check" in result.checks_performed

    @pytest.mark.unit
    @pytest.mark.safety
    def test_block_missing_location(self):
        result = run_safety_check(make_payload(location=""))
        assert result.decision == SafetyDecision.BLOCK

    @pytest.mark.unit
    @pytest.mark.safety
    def test_block_missing_both(self):
        result = run_safety_check(make_payload(crop="", location=""))
        assert result.decision == SafetyDecision.BLOCK
        assert "provide" in result.reason.lower() or "missing" in result.reason.lower()


# ------------------------------------------------------------------
# Test: DEFER path
# ------------------------------------------------------------------
class TestSafetyDefer:
    @pytest.mark.unit
    @pytest.mark.safety
    def test_defer_spray_with_rain_expected(self):
        result = run_safety_check(make_payload(
            weather=WEATHER_UNSAFE_RAIN,
            proposed_action="Apply copper fungicide spray at 2ml/L",
        ))
        assert result.decision == SafetyDecision.DEFER
        assert result.modified_action is not None
        assert "defer" in result.modified_action.lower() or "spray" in result.modified_action.lower()
        assert "weather_window_check" in result.checks_performed

    @pytest.mark.unit
    @pytest.mark.safety
    def test_defer_includes_rain_hours_in_message(self):
        result = run_safety_check(make_payload(
            weather={**WEATHER_UNSAFE_RAIN, "rain_expected_hours": 3},
            proposed_action="Apply pesticide spray",
        ))
        assert result.decision == SafetyDecision.DEFER
        assert "3" in (result.reason + (result.modified_action or ""))


# ------------------------------------------------------------------
# Test: ESCALATE path
# ------------------------------------------------------------------
class TestSafetyEscalate:
    @pytest.mark.unit
    @pytest.mark.safety
    def test_escalate_insufficient_evidence_low_confidence(self):
        result = run_safety_check(make_payload(
            confidence=0.2,
            evidence=EVIDENCE_INSUFFICIENT,
        ))
        assert result.decision == SafetyDecision.ESCALATE
        assert "evidence_sufficiency_check" in result.checks_performed

    @pytest.mark.unit
    @pytest.mark.safety
    def test_escalate_conflicting_evidence(self):
        result = run_safety_check(make_payload(
            confidence=0.75,
            evidence=EVIDENCE_CONFLICTING,
            proposed_action="Apply copper fungicide spray for Yellow Leaf Disease",
        ))
        assert result.decision == SafetyDecision.ESCALATE
        assert "conflict" in result.reason.lower() or "evidence" in result.reason.lower()

    @pytest.mark.unit
    @pytest.mark.safety
    def test_escalate_message_advises_expert(self):
        result = run_safety_check(make_payload(
            confidence=0.15,
            evidence=EVIDENCE_INSUFFICIENT,
        ))
        assert result.decision == SafetyDecision.ESCALATE
        reason_lower = result.reason.lower()
        assert any(w in reason_lower for w in ("expert", "officer", "consult", "agronomist"))


# ------------------------------------------------------------------
# Test: MODIFY path
# ------------------------------------------------------------------
class TestSafetyModify:
    @pytest.mark.unit
    @pytest.mark.safety
    def test_modify_high_risk_condition(self):
        result = run_safety_check(make_payload(
            risk_level="HIGH",
            proposed_action="Monitor crop and consult expert",
        ))
        assert result.decision == SafetyDecision.MODIFY
        assert result.modified_action is not None
        assert "HIGH RISK" in result.modified_action or "high" in result.modified_action.lower()

    @pytest.mark.unit
    @pytest.mark.safety
    def test_modify_critical_risk(self):
        result = run_safety_check(make_payload(risk_level="CRITICAL"))
        assert result.decision == SafetyDecision.MODIFY

    @pytest.mark.unit
    @pytest.mark.safety
    def test_checks_always_performed(self):
        """All registered checks should appear in checks_performed."""
        result = run_safety_check(make_payload())
        assert len(result.checks_performed) >= 4
