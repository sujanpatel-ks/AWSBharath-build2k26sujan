"""
AgroCare AI — RAG routing unit tests (knowledge-gap detection)
Tests the question classifier without real Bedrock calls.
"""

from __future__ import annotations

import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../"))

from functions.rag.handler import _classify_question, _build_query, _format_source_name


class TestQuestionClassifier:
    @pytest.mark.unit
    @pytest.mark.rag
    def test_static_disease_question(self):
        assert _classify_question("What is Yellow Leaf Disease in arecanut?") == "static"

    @pytest.mark.unit
    @pytest.mark.rag
    def test_static_fertilizer_question(self):
        assert _classify_question("What is DAP fertilizer?") == "static"

    @pytest.mark.unit
    @pytest.mark.rag
    def test_static_agronomy_question(self):
        assert _classify_question("How to treat fungal infection in rice?") == "static"

    @pytest.mark.unit
    @pytest.mark.rag
    def test_dynamic_market_price(self):
        assert _classify_question("What is the current market price of arecanut?") == "dynamic"

    @pytest.mark.unit
    @pytest.mark.rag
    def test_dynamic_today_price(self):
        assert _classify_question("What is today's mandi rate for cotton?") == "dynamic"

    @pytest.mark.unit
    @pytest.mark.rag
    def test_dynamic_latest_news(self):
        assert _classify_question("Latest news about farmer subsidies") == "dynamic"

    @pytest.mark.unit
    @pytest.mark.rag
    def test_dynamic_current_forecast(self):
        assert _classify_question("What is the current weather forecast?") == "dynamic"


class TestQueryBuilder:
    @pytest.mark.unit
    @pytest.mark.rag
    def test_builds_query_with_crop_and_location(self):
        q = _build_query("How to treat rust?", "Wheat", "Punjab")
        assert "How to treat rust?" in q
        assert "Wheat" in q
        assert "Punjab" in q

    @pytest.mark.unit
    @pytest.mark.rag
    def test_builds_query_without_context(self):
        q = _build_query("What is DAP?", None, None)
        assert q == "What is DAP?"


class TestSourceFormatter:
    @pytest.mark.unit
    @pytest.mark.rag
    def test_formats_s3_uri(self):
        uri = "s3://agrocare-docs/crop-guides/arecanut-diseases.pdf"
        name = _format_source_name(uri)
        assert "Arecanut Diseases" in name

    @pytest.mark.unit
    @pytest.mark.rag
    def test_empty_uri_returns_default(self):
        name = _format_source_name("")
        assert name == "Agricultural Knowledge Base"

    @pytest.mark.unit
    @pytest.mark.rag
    def test_uri_with_underscores(self):
        uri = "s3://bucket/fertilizer/dap_usage_guide.pdf"
        name = _format_source_name(uri)
        assert "Dap Usage Guide" in name
