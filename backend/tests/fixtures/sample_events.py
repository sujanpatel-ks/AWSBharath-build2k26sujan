"""
AgroCare AI — Shared test fixtures
Reusable API Gateway event and mock response builders.
"""

from __future__ import annotations

import base64
import json
import os


# ------------------------------------------------------------------
# Cognito JWT claim stub (no real token — test only)
# ------------------------------------------------------------------
FARMER_ID = "test-farmer-sub-12345"
FARMER_EMAIL = "farmer@example.com"
FARMER_NAME = "Test Farmer"

COGNITO_CLAIMS = {
    "sub": FARMER_ID,
    "email": FARMER_EMAIL,
    "name": FARMER_NAME,
    "cognito:username": FARMER_NAME,
    "iss": "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_TESTPOOL",
    "aud": "testclientid",
    "token_use": "id",
}


def api_event(
    method: str = "POST",
    path: str = "/diagnosis",
    body: dict | None = None,
    query_params: dict | None = None,
    path_params: dict | None = None,
    farmer_id: str = FARMER_ID,
    authenticated: bool = True,
) -> dict:
    """Build a mock API Gateway proxy event."""
    event: dict = {
        "httpMethod": method,
        "path": path,
        "pathParameters": path_params or {},
        "queryStringParameters": query_params or {},
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer test-token",
        },
        "body": json.dumps(body) if body is not None else None,
        "isBase64Encoded": False,
        "requestContext": {
            "requestId": "test-request-id",
            "stage": "dev",
        },
    }
    if authenticated:
        event["requestContext"]["authorizer"] = {
            "claims": {**COGNITO_CLAIMS, "sub": farmer_id}
        }
    return event


def unauthenticated_event(method: str = "GET", path: str = "/profile") -> dict:
    """Event with no authorizer claims — simulates missing/invalid JWT."""
    return {
        "httpMethod": method,
        "path": path,
        "pathParameters": {},
        "queryStringParameters": {},
        "headers": {},
        "body": None,
        "requestContext": {"requestId": "unauth-request-id"},  # no authorizer key
    }


# ------------------------------------------------------------------
# Sample diagnosis request bodies
# ------------------------------------------------------------------

VALID_DIAGNOSIS_REQUEST = {
    "image_key": "crop-images/test-farmer-sub-12345/2026/09/19/abc123_leaf.jpg",
    "crop": "Arecanut",
    "location": "Karnataka",
    "growth_stage": "Vegetative",
    "symptoms": "Yellow spots on leaves, wilting observed",
}

DIAGNOSIS_REQUEST_NO_CONTEXT = {
    "image_key": "crop-images/test/img.jpg",
    "crop": "",
    "location": "",
    "growth_stage": "Vegetative",
}

DIAGNOSIS_REQUEST_MISSING_IMAGE = {
    "crop": "Rice",
    "location": "Punjab",
    "growth_stage": "Flowering",
}


# ------------------------------------------------------------------
# Sample Haiku model JSON responses
# ------------------------------------------------------------------

HAIKU_RESPONSE_HEALTHY = json.dumps({
    "crop": "Arecanut",
    "possible_condition": "Healthy",
    "confidence": 0.92,
    "observations": ["Leaves appear green and healthy", "No visible lesions or spots"],
    "uncertainty": "",
    "risk_level": "LOW",
})

HAIKU_RESPONSE_DISEASE = json.dumps({
    "crop": "Arecanut",
    "possible_condition": "Yellow Leaf Disease",
    "confidence": 0.78,
    "observations": [
        "Yellowing of lower leaves starting from tips",
        "Premature nut fall visible",
        "Discoloration spreading to mid-canopy",
    ],
    "uncertainty": "Root cause not fully visible in image",
    "risk_level": "HIGH",
})

HAIKU_RESPONSE_LOW_CONFIDENCE = json.dumps({
    "crop": "Rice",
    "possible_condition": "Uncertain",
    "confidence": 0.21,
    "observations": ["Image quality insufficient for confident diagnosis"],
    "uncertainty": "Poor image resolution and lighting",
    "risk_level": "MEDIUM",
})

HAIKU_RESPONSE_INVALID_JSON = "This is not valid JSON at all."


# ------------------------------------------------------------------
# Sample Sonnet recommendation responses
# ------------------------------------------------------------------

SONNET_RESPONSE_RECOMMENDATION = json.dumps({
    "summary": (
        "Yellow Leaf Disease (YLD) caused by a phytoplasma has been detected in your "
        "Arecanut plantation. Immediate action is recommended to prevent spread."
    ),
    "action_plan": [
        "Remove and destroy visibly infected palms to prevent spread.",
        "Apply recommended insecticides to control leafhopper vectors.",
        "Do not use planting material from infected palms.",
        "Inform neighboring farmers for coordinated management.",
    ],
    "dosage_instructions": "Consult product label for insecticide dosage. Typical: 2 ml/L spray solution.",
    "timing_instructions": "Apply in the early morning or late evening when wind is calm. Avoid spraying before rain.",
    "precautions": [
        "Wear protective gear when applying chemicals.",
        "Keep children and animals away during application.",
        "Wash hands thoroughly after handling chemicals.",
    ],
    "needs_expert_review": True,
    "follow_up_days": 7,
})


# ------------------------------------------------------------------
# Sample evidence chunks from Knowledge Base
# ------------------------------------------------------------------

EVIDENCE_SUFFICIENT = [
    {
        "text": (
            "Yellow Leaf Disease (YLD) of arecanut is caused by a 16SrXI group phytoplasma. "
            "Management involves removal of affected palms and insecticide application to "
            "control leafhopper vectors (Proutista moesta). Early detection is critical."
        ),
        "source_uri": "s3://agrocare-agri-docs-dev/crop-guides/arecanut-diseases.pdf",
        "score": 0.89,
    },
    {
        "text": (
            "For arecanut Yellow Leaf Disease, no curative treatment is available. "
            "Preventive measures include removing infected palms within 3 months of symptom "
            "appearance and applying systemic insecticides at 3-month intervals."
        ),
        "source_uri": "s3://agrocare-agri-docs-dev/pest-disease/arecanut-yld-management.pdf",
        "score": 0.82,
    },
]

EVIDENCE_INSUFFICIENT: list[dict] = []

EVIDENCE_CONFLICTING = [
    {
        "text": "Apply copper fungicide spray for Yellow Leaf Disease management.",
        "source_uri": "s3://agrocare-agri-docs-dev/crop-guides/arecanut-diseases.pdf",
        "score": 0.75,
    },
    {
        "text": "Do not apply fungicides — Yellow Leaf Disease is caused by phytoplasma, not fungus. Contraindicated treatment may delay proper management.",
        "source_uri": "s3://agrocare-agri-docs-dev/pest-disease/arecanut-yld-management.pdf",
        "score": 0.71,
    },
]


# ------------------------------------------------------------------
# Weather contexts
# ------------------------------------------------------------------

WEATHER_SAFE = {
    "summary": "28°C, 65% humidity, Partly cloudy",
    "spray_window_safe": True,
    "rain_expected_hours": None,
    "temperature_celsius": 28.0,
    "humidity_percent": 65.0,
    "advisory": "Conditions appear suitable for field operations.",
}

WEATHER_UNSAFE_RAIN = {
    "summary": "26°C, 88% humidity, Rain expected",
    "spray_window_safe": False,
    "rain_expected_hours": 3,
    "temperature_celsius": 26.0,
    "humidity_percent": 88.0,
    "advisory": "Rain expected in approximately 3 hours — avoid spraying.",
}

WEATHER_UNAVAILABLE = {
    "summary": "Weather data unavailable.",
    "spray_window_safe": True,
    "rain_expected_hours": None,
    "temperature_celsius": None,
    "humidity_percent": None,
    "advisory": "Could not retrieve weather. Check manually before any field operations.",
}


# ------------------------------------------------------------------
# Minimal 1x1 JPEG for image upload tests
# ------------------------------------------------------------------
MINIMAL_JPEG_BYTES = base64.b64decode(
    "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U"
    "HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN"
    "DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy"
    "MjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAA"
    "AAAAAAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAA"
    "AAAA/9oADAMBAAIRAxEAPwCwABmX/9k="
)
