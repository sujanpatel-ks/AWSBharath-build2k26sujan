"""
AgroCare AI — Structured CloudWatch Logger
Emits JSON logs. Never logs raw farmer PII or secrets.
"""

import json
import logging
import os
import traceback
from datetime import datetime, timezone
from typing import Any

LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()

logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO))
_root = logging.getLogger()
_root.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))


class StructuredLogger:
    """
    Wraps Python logging to emit structured JSON records to CloudWatch.
    Usage:
        log = get_logger("diagnosis")
        log.info("diagnosis_started", crop="Arecanut", location="Karnataka")
        log.error("bedrock_error", error=str(e))
    """

    def __init__(self, name: str) -> None:
        self._logger = logging.getLogger(f"agrocare.{name}")
        self._service = os.environ.get("POWERTOOLS_SERVICE_NAME", "agrocare-ai")
        self._name = name

    def _emit(self, level: str, event: str, **kwargs: Any) -> None:
        record: dict[str, Any] = {
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "level": level,
            "service": self._service,
            "logger": self._name,
            "event": event,
        }
        # Scrub obviously sensitive keys — never log raw values
        safe_kwargs = {
            k: ("***REDACTED***" if k.lower() in _SENSITIVE_KEYS else v)
            for k, v in kwargs.items()
        }
        record.update(safe_kwargs)
        message = json.dumps(record, default=str)

        if level == "DEBUG":
            self._logger.debug(message)
        elif level == "INFO":
            self._logger.info(message)
        elif level == "WARNING":
            self._logger.warning(message)
        elif level == "ERROR":
            self._logger.error(message)
        elif level == "CRITICAL":
            self._logger.critical(message)

    def debug(self, event: str, **kwargs: Any) -> None:
        self._emit("DEBUG", event, **kwargs)

    def info(self, event: str, **kwargs: Any) -> None:
        self._emit("INFO", event, **kwargs)

    def warning(self, event: str, **kwargs: Any) -> None:
        self._emit("WARNING", event, **kwargs)

    def error(self, event: str, exc: Exception | None = None, **kwargs: Any) -> None:
        if exc is not None:
            kwargs["exception_type"] = type(exc).__name__
            kwargs["exception_message"] = str(exc)
            kwargs["traceback"] = traceback.format_exc()
        self._emit("ERROR", event, **kwargs)

    def critical(self, event: str, **kwargs: Any) -> None:
        self._emit("CRITICAL", event, **kwargs)


_SENSITIVE_KEYS = frozenset({
    "password", "token", "secret", "api_key", "apikey",
    "authorization", "credential", "credentials",
    "phone", "phone_number", "email", "address",
})


def get_logger(name: str) -> StructuredLogger:
    """Return a named structured logger."""
    return StructuredLogger(name)
