"""
AgroCare AI — Upload Lambda unit tests
"""

from __future__ import annotations

import json
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../"))

from tests.fixtures.sample_events import api_event, unauthenticated_event, FARMER_ID


class TestUploadHandler:
    @pytest.mark.unit
    @pytest.mark.auth
    def test_unauthorized_request_returns_401(self, lambda_context):
        from functions.upload.handler import lambda_handler

        event = unauthenticated_event(method="GET", path="/upload/presigned")
        resp = lambda_handler(event, lambda_context)
        assert resp["statusCode"] == 401

    @pytest.mark.unit
    def test_missing_filename_returns_400(self, lambda_context):
        from functions.upload.handler import lambda_handler

        event = api_event(method="GET", path="/upload/presigned", query_params={})
        resp = lambda_handler(event, lambda_context)
        assert resp["statusCode"] == 400
        body = json.loads(resp["body"])
        assert "filename" in body["message"].lower()

    @pytest.mark.unit
    def test_invalid_content_type_returns_400(self, lambda_context):
        from functions.upload.handler import lambda_handler

        event = api_event(
            method="GET",
            path="/upload/presigned",
            query_params={"filename": "crop.txt", "contentType": "text/plain"},
        )
        resp = lambda_handler(event, lambda_context)
        assert resp["statusCode"] == 400

    @pytest.mark.unit
    def test_sanitize_filename_removes_path_traversal(self):
        from functions.upload.handler import _sanitize_filename

        assert ".." not in _sanitize_filename("../../etc/passwd")
        assert "/" not in _sanitize_filename("a/b/c.jpg")

    @pytest.mark.unit
    def test_sanitize_filename_preserves_safe_chars(self):
        from functions.upload.handler import _sanitize_filename

        result = _sanitize_filename("my-crop-image_01.jpg")
        assert "my-crop-image_01.jpg" == result
