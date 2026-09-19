"""
AgroCare AI — Pydantic schemas and validation
Defines request/response models and the canonical diagnosis output schema.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


# ------------------------------------------------------------------
# Enums
# ------------------------------------------------------------------

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SafetyDecision(str, Enum):
    ALLOW = "ALLOW"
    MODIFY = "MODIFY"
    BLOCK = "BLOCK"
    DEFER = "DEFER"
    ESCALATE = "ESCALATE"


class GrowthStage(str, Enum):
    SEEDLING = "Seedling"
    VEGETATIVE = "Vegetative"
    FLOWERING = "Flowering"
    FRUITING = "Fruiting"
    HARVESTING = "Harvesting"
    POST_HARVEST = "Post-Harvest"


# ------------------------------------------------------------------
# Request schemas
# ------------------------------------------------------------------

class DiagnosisRequest(BaseModel):
    """POST /diagnosis"""
    image_key: str = Field(..., min_length=1, max_length=500,
                           description="S3 key of the uploaded crop image")
    crop: str = Field(..., min_length=1, max_length=100,
                      description="Crop name, e.g. Arecanut, Rice, Tomato")
    location: str = Field(..., min_length=1, max_length=200,
                          description="Farm location, e.g. Karnataka, India")
    growth_stage: str = Field(..., description="Current growth stage of the crop")
    symptoms: str | None = Field(None, max_length=1000,
                                  description="Optional farmer-observed symptoms")
    farm_size_acres: float | None = Field(None, gt=0,
                                          description="Optional farm area in acres")

    @field_validator("crop", "location")
    @classmethod
    def strip_and_validate(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be blank")
        return v

    @field_validator("image_key")
    @classmethod
    def validate_image_key(cls, v: str) -> str:
        # Basic injection guard — only allow safe S3 key characters
        import re
        if ".." in v or not re.match(r"^[a-zA-Z0-9\-_./]+$", v):
            raise ValueError("Invalid image_key format")
        return v


class RAGQueryRequest(BaseModel):
    """POST /agriculture/query"""
    question: str = Field(..., min_length=3, max_length=1000)
    crop: str | None = Field(None, max_length=100)
    location: str | None = Field(None, max_length=200)


class ProfileUpdateRequest(BaseModel):
    """PUT /profile"""
    name: str | None = Field(None, min_length=1, max_length=100)
    phone: str | None = Field(None, max_length=20)
    location: str | None = Field(None, max_length=200)
    farm_size_acres: float | None = Field(None, gt=0)
    primary_crops: list[str] | None = Field(None, max_length=10)


class FarmCreateRequest(BaseModel):
    """POST /profile/farms"""
    farm_name: str = Field(..., min_length=1, max_length=100)
    area_acres: float = Field(..., gt=0)
    soil_type: str | None = Field(None, max_length=50)
    irrigation_type: str | None = Field(None, max_length=50)
    location: str | None = Field(None, max_length=200)
    primary_crops: list[str] = Field(default_factory=list)


class SafetyValidationRequest(BaseModel):
    """POST /recommendation/validate"""
    diagnosis_id: str = Field(..., min_length=1, max_length=100)
    proposed_action: str = Field(..., min_length=1, max_length=2000)


# ------------------------------------------------------------------
# Core AI output schema — returned to farmer after processing
# ------------------------------------------------------------------

class DiagnosisResult(BaseModel):
    """
    Structured output from the multimodal crop analysis.
    This is the intermediate result before RAG + recommendation.
    """
    crop: str
    possible_condition: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    observations: list[str]
    uncertainty: str = ""
    risk_level: RiskLevel = RiskLevel.MEDIUM


class Evidence(BaseModel):
    """A single piece of retrieved agricultural evidence."""
    text: str
    source: str
    score: float = 0.0


class WeatherContext(BaseModel):
    """Weather summary relevant to the recommendation."""
    summary: str
    spray_window_safe: bool
    rain_expected_hours: int | None = None
    temperature_celsius: float | None = None
    humidity_percent: float | None = None
    advisory: str = ""


class SafetyValidationResult(BaseModel):
    """Output from the deterministic safety validator."""
    decision: SafetyDecision
    reason: str
    modified_action: str | None = None
    checks_performed: list[str] = Field(default_factory=list)


class Recommendation(BaseModel):
    """
    Final grounded recommendation for the farmer.
    All citations must come from the Knowledge Base — never fabricated.
    """
    summary: str
    action_plan: list[str]
    dosage_instructions: str | None = None
    timing_instructions: str | None = None
    precautions: list[str] = Field(default_factory=list)
    sources: list[Evidence] = Field(default_factory=list)
    needs_expert_review: bool = False
    follow_up_days: int | None = None


class CompleteDiagnosisResponse(BaseModel):
    """
    Complete response returned to the farmer after the full workflow.
    This is what the frontend renders as the diagnosis result.
    """
    diagnosis_id: str
    farmer_id: str
    created_at: str

    # Step 1 — multimodal analysis
    crop: str
    possible_condition: str
    confidence: float
    observations: list[str]
    risk_level: RiskLevel

    # Step 2 — evidence
    evidence: list[Evidence] = Field(default_factory=list)

    # Step 3 — weather
    weather_context: WeatherContext | None = None

    # Step 4 — safety
    safety_status: SafetyDecision
    safety_reason: str = ""

    # Step 5 — recommendation
    recommendation: Recommendation | None = None

    # Meta
    needs_expert_review: bool = False
    workflow_complete: bool = True


# ------------------------------------------------------------------
# HTTP response helpers
# ------------------------------------------------------------------

def success_response(data: Any, status_code: int = 200) -> dict[str, Any]:
    import json
    return {
        "statusCode": status_code,
        "headers": _cors_headers(),
        "body": json.dumps(
            data.model_dump() if hasattr(data, "model_dump") else data,
            default=str,
        ),
    }


def error_response(
    error_code: str,
    message: str,
    status_code: int = 400,
    request_id: str = "",
) -> dict[str, Any]:
    import json
    from datetime import datetime, timezone
    return {
        "statusCode": status_code,
        "headers": _cors_headers(),
        "body": json.dumps({
            "error": error_code,
            "message": message,
            "requestId": request_id,
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        }),
    }


def _cors_headers() -> dict[str, str]:
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",   # API Gateway CORS handles restriction
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    }
