from fastapi import FastAPI
from app.api.health import router as health_router
from app.api.tasks import router as tasks_router
from app.config import settings

app = FastAPI(
    title="ASTRA Engine Service",
    version="1.0.0"
)

app.include_router(health_router)
app.include_router(tasks_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
