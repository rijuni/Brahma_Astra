from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(tags=["health"])

@router.get("/health/live")
async def health_live():
    return {
        "status": "ok",
        "service": "astra-engine",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/health/ready")
async def health_ready():
    return {
        "status": "ready",
        "service": "astra-engine",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
