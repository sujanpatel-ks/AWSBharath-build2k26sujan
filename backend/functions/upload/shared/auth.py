"""
AgroCare AI — Auth utilities
Extracts Cognito claims from the API Gateway request context.
All data access is scoped to the authenticated farmer's sub.
"""

from __future__ import annotations

from typing import Any

from .logger import get_logger

log = get_logger("auth")


class AuthError(Exception):
    """Raised when authentication/authorization fails."""

    def __init__(self, message: str = "Unauthorized") -> None:
        super().__init__(message)
        self.message = message


def get_farmer_id(event: dict[str, Any]) -> str:
    """
    Extract the Cognito sub (farmer ID) from the Lambda event.

    API Gateway injects the JWT claims into:
      event["requestContext"]["authorizer"]["claims"]["sub"]

    Returns the Cognito sub as the canonical farmer identifier.
    Raises AuthError if the identity cannot be established.
    """
    try:
        claims: dict[str, Any] = (
            event.get("requestContext", {})
            .get("authorizer", {})
            .get("claims", {})
        )
        sub: str | None = claims.get("sub")
        if not sub:
            raise AuthError("Missing 'sub' claim in JWT")
        return sub
    except (KeyError, AttributeError) as exc:
        log.error("auth_claims_missing", exc=exc)
        raise AuthError("Could not extract farmer identity from token") from exc


def get_farmer_email(event: dict[str, Any]) -> str | None:
    """Extract email from JWT claims — may be None."""
    try:
        claims = (
            event.get("requestContext", {})
            .get("authorizer", {})
            .get("claims", {})
        )
        return claims.get("email")
    except (KeyError, AttributeError):
        return None


def get_farmer_name(event: dict[str, Any]) -> str | None:
    """Extract name attribute from JWT claims."""
    try:
        claims = (
            event.get("requestContext", {})
            .get("authorizer", {})
            .get("claims", {})
        )
        return claims.get("name") or claims.get("cognito:username")
    except (KeyError, AttributeError):
        return None


def farmer_pk(farmer_id: str) -> str:
    """Return the DynamoDB partition key for a farmer record."""
    return f"FARMER#{farmer_id}"


def diagnosis_sk(timestamp: str) -> str:
    """Return the DynamoDB sort key for a diagnosis record."""
    return f"DIAG#{timestamp}"


def farm_sk(farm_id: str) -> str:
    """Return the DynamoDB sort key for a farm record."""
    return f"FARM#{farm_id}"
