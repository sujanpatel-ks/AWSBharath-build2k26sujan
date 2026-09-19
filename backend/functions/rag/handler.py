"""
AgroCare AI — RAG Lambda
Handles agricultural knowledge queries via Bedrock Knowledge Base.
Implements knowledge-gap detection to route static vs dynamic questions.
Never fabricates citations.
"""

from __future__ import annotations

import json
import os
import sys

sys.path.insert(0, "/opt/python")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../shared"))

from shared.auth import AuthError, get_farmer_id
from shared.bedrock import BedrockError, retrieve_and_generate, retrieve_from_knowledge_base
from shared.logger import get_logger
from shared.schemas import RAGQueryRequest, error_response, success_response

log = get_logger("rag")

# Minimum relevance score to include a result
_MIN_SCORE_THRESHOLD = 0.4
# Minimum number of results to consider "sufficient evidence"
_MIN_EVIDENCE_COUNT = 1


def lambda_handler(event: dict, context: object) -> dict:
    """
    POST /agriculture/query
    Body: { question, crop?, location? }
    """
    request_id = context.aws_request_id if hasattr(context, "aws_request_id") else "local"
    log.info("rag_query_request", request_id=request_id)

    try:
        get_farmer_id(event)
    except AuthError as exc:
        return error_response("UNAUTHORIZED", exc.message, 401, request_id)

    try:
        body = json.loads(event.get("body") or "{}")
        req = RAGQueryRequest(**body)
    except json.JSONDecodeError:
        return error_response("VALIDATION_ERROR", "Invalid JSON body", 400, request_id)
    except Exception as exc:
        return error_response("VALIDATION_ERROR", str(exc), 400, request_id)

    # Route based on question type
    question_type = _classify_question(req.question)
    log.info("question_classified", question_type=question_type, crop=req.crop)

    if question_type == "dynamic":
        return success_response({
            "answer": (
                "This question requires current market or real-time data which is not "
                "available in the static agricultural knowledge base. "
                "Please consult your local agricultural market or extension office."
            ),
            "sources": [],
            "confidence": 0.0,
            "question_type": "dynamic",
            "insufficient_evidence": True,
        })

    # Build enriched query with crop/location context
    enriched_query = _build_query(req.question, req.crop, req.location)

    try:
        # First: retrieve raw chunks to check evidence sufficiency
        chunks = retrieve_from_knowledge_base(enriched_query, num_results=5)
        relevant_chunks = [c for c in chunks if c.get("score", 0) >= _MIN_SCORE_THRESHOLD]

        if len(relevant_chunks) < _MIN_EVIDENCE_COUNT:
            log.warning(
                "insufficient_evidence",
                query=req.question[:100],
                chunks_found=len(chunks),
                relevant=len(relevant_chunks),
            )
            return success_response({
                "answer": (
                    "Insufficient evidence was found in the agricultural knowledge base "
                    "to answer this question confidently. "
                    "Please consult a local agricultural extension officer or agronomist."
                ),
                "sources": [],
                "confidence": 0.0,
                "question_type": question_type,
                "insufficient_evidence": True,
            })

        # Use managed RAG for grounded answer with citations
        rag_result = retrieve_and_generate(enriched_query)
        answer = rag_result.get("answer", "")
        citations = rag_result.get("citations", [])

        # Format sources for frontend
        sources = [
            {
                "text": c.get("snippet", ""),
                "source": _format_source_name(c.get("source", "")),
                "score": 1.0,  # Citations from managed RAG are already ranked
            }
            for c in citations
            if c.get("source")
        ]

        confidence = min(1.0, len(relevant_chunks) / 3.0)  # rough confidence proxy

        log.info(
            "rag_query_complete",
            sources_count=len(sources),
            answer_length=len(answer),
            confidence=confidence,
        )

        return success_response({
            "answer": answer,
            "sources": sources,
            "confidence": round(confidence, 2),
            "question_type": question_type,
            "insufficient_evidence": False,
        })

    except BedrockError as exc:
        log.error("rag_bedrock_error", exc=exc)
        return error_response("AI_ERROR", "Knowledge retrieval failed. Please try again.", 502, request_id)


def retrieve_agricultural_evidence(
    condition: str,
    crop: str,
    location: str,
    num_results: int = 5,
) -> list[dict]:
    """
    Direct call from the diagnosis orchestrator.
    Returns a list of evidence dicts with text/source/score.
    Returns empty list (never raises) — evidence absence is handled by safety layer.
    """
    query = f"{condition} in {crop} crop, {location} region — treatment and management"
    try:
        chunks = retrieve_from_knowledge_base(query, num_results=num_results)
        return [c for c in chunks if c.get("score", 0) >= _MIN_SCORE_THRESHOLD]
    except BedrockError as exc:
        log.error("evidence_retrieval_failed", exc=exc, condition=condition, crop=crop)
        return []


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _classify_question(question: str) -> str:
    """
    Route question to 'static' (KB) or 'dynamic' (real-time) source.
    Static: disease, fertilizer, agronomy knowledge
    Dynamic: market prices, current news, live weather
    """
    dynamic_keywords = {
        "price", "market", "cost", "mandi", "today", "current", "latest",
        "stock", "rate", "sell", "buy", "forecast", "news",
    }
    words = set(question.lower().split())
    if words & dynamic_keywords:
        return "dynamic"
    return "static"


def _build_query(question: str, crop: str | None, location: str | None) -> str:
    """Add crop and location context to improve retrieval relevance."""
    parts = [question]
    if crop:
        parts.append(f"Crop: {crop}")
    if location:
        parts.append(f"Region: {location}")
    return " | ".join(parts)


def _format_source_name(s3_uri: str) -> str:
    """Convert S3 URI to a readable citation name."""
    if not s3_uri:
        return "Agricultural Knowledge Base"
    # s3://bucket/fertilizer/dap-guide.pdf → dap-guide.pdf
    filename = s3_uri.split("/")[-1]
    # Remove extension and replace dashes/underscores
    name = filename.rsplit(".", 1)[0].replace("-", " ").replace("_", " ").title()
    return name or "Agricultural Knowledge Base"
