import json
import logging
from datetime import datetime, timezone
from typing import Any

SENSITIVE_KEYS = {
    "password", "passwordhash", "token", "authorization",
    "cookie", "apikey", "api_key", "secret", "internalservicekey", "internal_service_key"
}

def redact(data: Any, depth: int = 0) -> Any:
    if depth > 5:
        return data
    if isinstance(data, dict):
        return {
            k: "[REDACTED]" if k.lower() in SENSITIVE_KEYS else redact(v, depth + 1)
            for k, v in data.items()
        }
    if isinstance(data, list):
        return [redact(item, depth + 1) for item in data]
    return data

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname.lower(),
            "service": "astra-engine",
            "message": record.getMessage(),
        }
        if hasattr(record, "meta") and isinstance(record.meta, dict):
            log_obj["meta"] = redact(record.meta)
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)

def get_logger(name: str = "astra-engine") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

logger = get_logger()
