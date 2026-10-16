from fastapi import APIRouter, Header, HTTPException, status
from app.schemas.tasks import TaskRequest, TaskResponse, CancelResponse
from app.orchestration.orchestrator import orchestrator
from app.core.config import settings

router = APIRouter(prefix="/api/v1", tags=["tasks"])

def verify_internal_key(x_internal_service_key: str = Header(None)):
    if not x_internal_service_key or x_internal_service_key != settings.internal_service_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Invalid or missing internal service key"
        )

@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    payload: TaskRequest,
    x_internal_service_key: str = Header(None)
):
    verify_internal_key(x_internal_service_key)

    result = await orchestrator.execute_task(
        task_id=payload.task_id,
        prompt=payload.prompt,
        task_type=payload.task_type,
        context=payload.context or {}
    )

    return TaskResponse(
        task_id=payload.task_id,
        status=result["status"],
        provider=result.get("provider", "unknown"),
        result=result.get("result"),
        error=result.get("error"),
        completed_at=result.get("completed_at")
    )

@router.post("/tasks/{task_id}/cancel", response_model=CancelResponse)
async def cancel_task(
    task_id: str,
    x_internal_service_key: str = Header(None)
):
    verify_internal_key(x_internal_service_key)
    orchestrator.cancel_task(task_id)
    return CancelResponse(
        task_id=task_id,
        status="cancelled",
        message="Task cancelled successfully"
    )
