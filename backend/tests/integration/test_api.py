"""
AgroCare AI — API integration tests
Requires a deployed stack. Run with: pytest -m integration
Set environment variables:
  API_BASE_URL  — e.g. https://abc123.execute-api.ap-south-1.amazonaws.com/dev
  TEST_ID_TOKEN — valid Cognito ID token for test user
"""

from __future__ import annotations

import json
import os

import pytest
import requests

API_BASE = os.environ.get("API_BASE_URL", "")
TOKEN = os.environ.get("TEST_ID_TOKEN", "")
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

pytestmark = pytest.mark.integration


@pytest.fixture(autouse=True)
def require_deployed_stack():
    if not API_BASE or not TOKEN:
        pytest.skip("API_BASE_URL and TEST_ID_TOKEN must be set for integration tests")


class TestProfileAPI:
    def test_get_profile_authenticated(self):
        resp = requests.get(f"{API_BASE}/profile", headers=HEADERS, timeout=10)
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert "farmerId" in data

    def test_get_profile_no_auth_returns_401(self):
        resp = requests.get(f"{API_BASE}/profile", timeout=10)
        assert resp.status_code == 401

    def test_update_profile(self):
        resp = requests.put(
            f"{API_BASE}/profile",
            headers=HEADERS,
            json={"location": "Karnataka"},
            timeout=10,
        )
        assert resp.status_code == 200


class TestPresignedUploadAPI:
    def test_get_presigned_url(self):
        resp = requests.get(
            f"{API_BASE}/upload/presigned",
            headers=HEADERS,
            params={"filename": "test.jpg", "contentType": "image/jpeg"},
            timeout=10,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "uploadUrl" in data
        assert "key" in data
        assert data["uploadUrl"].startswith("https://")

    def test_presigned_no_auth(self):
        resp = requests.get(
            f"{API_BASE}/upload/presigned",
            params={"filename": "test.jpg"},
            timeout=10,
        )
        assert resp.status_code == 401


class TestDiagnosisHistoryAPI:
    def test_get_history_authenticated(self):
        resp = requests.get(f"{API_BASE}/diagnosis/history", headers=HEADERS, timeout=10)
        assert resp.status_code == 200
        data = resp.json()
        assert "diagnoses" in data
        assert "count" in data

    def test_get_history_no_auth(self):
        resp = requests.get(f"{API_BASE}/diagnosis/history", timeout=10)
        assert resp.status_code == 401


class TestRAGQueryAPI:
    def test_static_knowledge_query(self):
        resp = requests.post(
            f"{API_BASE}/agriculture/query",
            headers=HEADERS,
            json={"question": "What is DAP fertilizer?", "crop": "Rice"},
            timeout=30,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "answer" in data
        assert "sources" in data

    def test_dynamic_query_returns_routing_message(self):
        resp = requests.post(
            f"{API_BASE}/agriculture/query",
            headers=HEADERS,
            json={"question": "What is the current market price of arecanut today?"},
            timeout=30,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("question_type") == "dynamic"
        assert data.get("insufficient_evidence") is True

    def test_rag_query_no_auth(self):
        resp = requests.post(
            f"{API_BASE}/agriculture/query",
            json={"question": "What is DAP?"},
            timeout=10,
        )
        assert resp.status_code == 401

    def test_rag_query_missing_question(self):
        resp = requests.post(
            f"{API_BASE}/agriculture/query",
            headers=HEADERS,
            json={"crop": "Rice"},
            timeout=10,
        )
        assert resp.status_code == 400


class TestWeatherAPI:
    def test_get_weather_with_coords(self):
        resp = requests.get(
            f"{API_BASE}/weather",
            headers=HEADERS,
            params={"lat": "12.97", "lon": "77.59"},
            timeout=15,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "spray_window_safe" in data
        assert "summary" in data

    def test_get_weather_invalid_coords(self):
        resp = requests.get(
            f"{API_BASE}/weather",
            headers=HEADERS,
            params={"lat": "999", "lon": "999"},
            timeout=10,
        )
        assert resp.status_code == 400
