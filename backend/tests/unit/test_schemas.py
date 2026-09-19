"""
AgroCare AI — Schema validation unit tests
"""

from __future__ import annotations

import pytest
from pydantic import ValidationError

import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../"))

from shared.schemas import (
    DiagnosisRequest,
    RAGQueryRequest,
    RiskLevel,
    SafetyDecision,
)


class TestDiagnosisRequest:
    @pytest.mark.unit
    def test_valid_request(self):
        req = DiagnosisRequest(
            image_key="crop-images/farmer1/2026/09/19/abc_leaf.jpg",
            crop="Arecanut",
            location="Karnataka",
            growth_stage="Vegetative",
        )
        assert req.crop == "Arecanut"
        assert req.symptoms is None

    @pytest.mark.unit
    def test_missing_crop_fails(self):
        with pytest.raises(ValidationError):
            DiagnosisRequest(
                image_key="crop-images/farmer/img.jpg",
                crop="",
                location="Karnataka",
                growth_stage="Vegetative",
            )

    @pytest.mark.unit
    def test_missing_location_fails(self):
        with pytest.raises(ValidationError):
            DiagnosisRequest(
                image_key="crop-images/farmer/img.jpg",
                crop="Rice",
                location="",
                growth_stage="Flowering",
            )

    @pytest.mark.unit
    def test_invalid_image_key_rejected(self):
        with pytest.raises(ValidationError):
            DiagnosisRequest(
                image_key="../../etc/passwd",
                crop="Rice",
                location="Punjab",
                growth_stage="Vegetative",
            )

    @pytest.mark.unit
    def test_optional_symptoms_accepted(self):
        req = DiagnosisRequest(
            image_key="crop-images/f/img.jpg",
            crop="Tomato",
            location="Maharashtra",
            growth_stage="Fruiting",
            symptoms="Brown spots on fruit",
        )
        assert req.symptoms == "Brown spots on fruit"


class TestRAGQueryRequest:
    @pytest.mark.unit
    def test_valid_query(self):
        req = RAGQueryRequest(question="What is DAP fertilizer?")
        assert req.question == "What is DAP fertilizer?"
        assert req.crop is None

    @pytest.mark.unit
    def test_query_too_short(self):
        with pytest.raises(ValidationError):
            RAGQueryRequest(question="ab")

    @pytest.mark.unit
    def test_query_with_context(self):
        req = RAGQueryRequest(
            question="How to treat fungal disease?",
            crop="Arecanut",
            location="Karnataka",
        )
        assert req.crop == "Arecanut"


class TestEnums:
    @pytest.mark.unit
    def test_risk_levels(self):
        assert RiskLevel.LOW == "LOW"
        assert RiskLevel.CRITICAL == "CRITICAL"

    @pytest.mark.unit
    def test_safety_decisions(self):
        assert SafetyDecision.ALLOW == "ALLOW"
        assert SafetyDecision.DEFER == "DEFER"
        assert SafetyDecision.ESCALATE == "ESCALATE"

    @pytest.mark.unit
    def test_invalid_risk_level(self):
        with pytest.raises(ValueError):
            RiskLevel("UNKNOWN")
