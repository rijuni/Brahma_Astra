from fastapi import APIRouter
from datetime import datetime, timezone
from app.config import settings

router = APIRouter(tags=["health"])

@router.get("/health/live")
async def health_live():
    return {
        "status": "ok",
        "service": "astra-runner",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/health/ready")
async def health_ready():
    return {
        "status": "ready",
        "service": "astra-runner",
        "execution_mode": settings.execution_mode,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
