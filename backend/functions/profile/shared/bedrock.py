"""
AgroCare AI — Amazon Bedrock client helpers

Model IDs verified for ap-south-1, September 2026:
  Haiku 4.5  : global.anthropic.claude-haiku-4-5-20251001-v1:0  (Global CRIS, bedrock-runtime)
  Sonnet 4.6 : anthropic.claude-sonnet-4-6                       (In-region, bedrock-runtime)
  Embeddings : amazon.titan-embed-text-v2:0                      (In-region, Knowledge Base)

All inference uses the Converse API (unified, supports vision + guardrails + streaming).
"""

from __future__ import annotations

import base64
import json
import os
from typing import Any

import boto3
from botocore.exceptions import ClientError

from .logger import get_logger

log = get_logger("bedrock")

# ------------------------------------------------------------------
# Configuration — pulled from Lambda environment variables
# ------------------------------------------------------------------
_REGION = os.environ.get("AWS_REGION_NAME", "ap-south-1")
_HAIKU_MODEL_ID = os.environ.get(
    "HAIKU_MODEL_ID",
    "global.anthropic.claude-haiku-4-5-20251001-v1:0",
)
_SONNET_MODEL_ID = os.environ.get(
    "SONNET_MODEL_ID",
    "anthropic.claude-sonnet-4-6",
)
_KNOWLEDGE_BASE_ID = os.environ.get("KNOWLEDGE_BASE_ID", "")

# Module-level clients — reused across warm Lambda invocations
_bedrock_runtime = boto3.client("bedrock-runtime", region_name=_REGION)
_bedrock_agent = boto3.client("bedrock-agent-runtime", region_name=_REGION)


class BedrockError(Exception):
    """Raised on Bedrock API failures."""


# ------------------------------------------------------------------
# Converse API helpers
# ------------------------------------------------------------------

def converse(
    model_id: str,
    messages: list[dict[str, Any]],
    system_prompt: str = "",
    max_tokens: int = 2048,
    temperature: float = 0.1,
    guardrail_id: str | None = None,
    guardrail_version: str | None = None,
) -> str:
    """
    Invoke a Bedrock model using the Converse API.
    Returns the text content of the first response message.

    Parameters
    ----------
    model_id      : Bedrock model/profile ID
    messages      : list of {"role": "user"|"assistant", "content": [...]}
    system_prompt : optional system instruction
    max_tokens    : max output tokens
    temperature   : 0.0–1.0 (low = more deterministic)
    guardrail_id  : optional Bedrock Guardrail ID
    guardrail_version : optional Guardrail version string
    """
    kwargs: dict[str, Any] = {
        "modelId": model_id,
        "messages": messages,
        "inferenceConfig": {
            "maxTokens": max_tokens,
            "temperature": temperature,
        },
    }
    if system_prompt:
        kwargs["system"] = [{"text": system_prompt}]
    if guardrail_id and guardrail_version:
        kwargs["guardrailConfig"] = {
            "guardrailIdentifier": guardrail_id,
            "guardrailVersion": guardrail_version,
            "trace": "enabled",
        }

    try:
        response = _bedrock_runtime.converse(**kwargs)
        content = response["output"]["message"]["content"]
        # Extract first text block
        for block in content:
            if block.get("type") == "text" or "text" in block:
                return block.get("text", "")
        return ""
    except ClientError as exc:
        code = exc.response["Error"]["Code"]
        msg = exc.response["Error"]["Message"]
        log.error("bedrock_converse_failed", model_id=model_id, error_code=code, error_msg=msg)
        raise BedrockError(f"Bedrock Converse failed [{code}]: {msg}") from exc


def build_text_message(role: str, text: str) -> dict[str, Any]:
    """Build a simple text message for the Converse API."""
    return {
        "role": role,
        "content": [{"text": text}],
    }


def build_image_message(
    role: str,
    text: str,
    image_bytes: bytes,
    media_type: str = "image/jpeg",
) -> dict[str, Any]:
    """
    Build a multimodal message with both text and an inline image.
    Used for crop image analysis with Claude Haiku 4.5.

    media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
    """
    # Converse API expects image as base64-encoded bytes in the content block
    format_map = {
        "image/jpeg": "jpeg",
        "image/jpg": "jpeg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
    }
    img_format = format_map.get(media_type.lower(), "jpeg")

    return {
        "role": role,
        "content": [
            {
                "image": {
                    "format": img_format,
                    "source": {
                        "bytes": image_bytes,
                    },
                }
            },
            {"text": text},
        ],
    }


# ------------------------------------------------------------------
# Knowledge Base retrieval
# ------------------------------------------------------------------

def retrieve_from_knowledge_base(
    query: str,
    knowledge_base_id: str | None = None,
    num_results: int = 5,
) -> list[dict[str, Any]]:
    """
    Retrieve relevant chunks from the Bedrock Knowledge Base.
    Returns a list of {text, source_uri, score} dicts.
    Never returns fabricated citations.
    """
    kb_id = knowledge_base_id or _KNOWLEDGE_BASE_ID
    if not kb_id:
        log.warning("retrieve_kb_no_id", message="KNOWLEDGE_BASE_ID not set")
        return []

    try:
        response = _bedrock_agent.retrieve(
            knowledgeBaseId=kb_id,
            retrievalQuery={"text": query},
            retrievalConfiguration={
                "vectorSearchConfiguration": {
                    "numberOfResults": num_results,
                    "overrideSearchType": "HYBRID",
                }
            },
        )
        results = []
        for chunk in response.get("retrievalResults", []):
            content = chunk.get("content", {})
            location = chunk.get("location", {})
            score = chunk.get("score", 0.0)

            # Extract source URI from location (S3 or other data source)
            source_uri = ""
            if "s3Location" in location:
                source_uri = location["s3Location"].get("uri", "")

            results.append({
                "text": content.get("text", ""),
                "source_uri": source_uri,
                "score": score,
            })

        log.info(
            "kb_retrieval_complete",
            query_length=len(query),
            num_results=len(results),
            kb_id=kb_id,
        )
        return results

    except ClientError as exc:
        code = exc.response["Error"]["Code"]
        msg = exc.response["Error"]["Message"]
        log.error("kb_retrieve_failed", error_code=code, error_msg=msg)
        raise BedrockError(f"Knowledge Base retrieval failed [{code}]: {msg}") from exc


def retrieve_and_generate(
    query: str,
    knowledge_base_id: str | None = None,
    model_id: str | None = None,
) -> dict[str, Any]:
    """
    Combined retrieve-and-generate using Bedrock managed RAG.
    Returns {answer, citations}.
    """
    kb_id = knowledge_base_id or _KNOWLEDGE_BASE_ID
    if not kb_id:
        log.warning("rag_no_kb_id", message="KNOWLEDGE_BASE_ID not set")
        return {"answer": "", "citations": []}

    gen_model_id = model_id or _SONNET_MODEL_ID

    try:
        response = _bedrock_agent.retrieve_and_generate(
            input={"text": query},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": kb_id,
                    "modelArn": f"arn:aws:bedrock:{_REGION}::foundation-model/{gen_model_id}",
                    "retrievalConfiguration": {
                        "vectorSearchConfiguration": {
                            "numberOfResults": 5,
                            "overrideSearchType": "HYBRID",
                        }
                    },
                },
            },
        )
        output_text = response.get("output", {}).get("text", "")
        citations = []
        for citation in response.get("citations", []):
            for ref in citation.get("retrievedReferences", []):
                loc = ref.get("location", {})
                source_uri = loc.get("s3Location", {}).get("uri", "")
                snippet = ref.get("content", {}).get("text", "")[:300]
                if source_uri:
                    citations.append({"source": source_uri, "snippet": snippet})

        return {"answer": output_text, "citations": citations}

    except ClientError as exc:
        code = exc.response["Error"]["Code"]
        msg = exc.response["Error"]["Message"]
        log.error("rag_retrieve_generate_failed", error_code=code, error_msg=msg)
        raise BedrockError(f"RetrieveAndGenerate failed [{code}]: {msg}") from exc
