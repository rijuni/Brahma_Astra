from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.health import router as health_router
from app.api.tasks import router as tasks_router
from app.observability.logger import logger
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("BRAHMA Core service starting up", extra={"meta": {"port": settings.port, "provider": settings.ai_provider}})
    yield
    logger.info("BRAHMA Core service shutting down")

app = FastAPI(
    title="BRAHMA Core Orchestration Service",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(health_router)
app.include_router(tasks_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
