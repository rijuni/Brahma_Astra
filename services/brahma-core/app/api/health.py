from fastapi import APIRouter
from datetime import datetime, timezone
from app.schemas.tasks import HealthResponse
from app.providers.factory import get_provider
from app.core.config import settings

router = APIRouter(tags=["health"])

@router.get("/health/live")
async def health_live():
    return {
        "status": "ok",
        "service": "brahma-core",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/health/ready", response_model=HealthResponse)
async def health_ready():
    provider = get_provider()
    is_ready = await provider.is_configured()
    return HealthResponse(
        status="ready" if is_ready else "degraded",
        provider=provider.name,
        ready=is_ready,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
