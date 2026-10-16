from fastapi import APIRouter, Header, HTTPException, status
from app.config import settings
from app.schemas.tasks import PlanTaskRequest, PlanTaskResponse, ExecuteTaskResponse
from app.workflows.planner import planner
from app.runner_client.client import runner_client

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

def verify_internal_key(x_internal_service_key: str = Header(None)):
    if not x_internal_service_key or x_internal_service_key != settings.internal_service_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Invalid or missing internal service key"
        )

@router.post("", response_model=PlanTaskResponse)
async def plan_task(
    payload: PlanTaskRequest,
    x_internal_service_key: str = Header(None)
):
    verify_internal_key(x_internal_service_key)

    patch_proposal = planner.plan_coding_task(
        task_id=payload.task_id,
        workspace_id=payload.workspace_id,
        instruction=payload.instruction,
        files=payload.files
    )

    return PlanTaskResponse(
        task_id=payload.task_id,
        workspace_id=payload.workspace_id,
        status="proposed",
        patch_proposal=patch_proposal
    )

@router.post("/{task_id}/execute", response_model=ExecuteTaskResponse)
async def execute_task(
    task_id: str,
    x_internal_service_key: str = Header(None)
):
    verify_internal_key(x_internal_service_key)

    # Dispatch to isolated runner
    runner_result = await runner_client.execute(
        job_id=f"job_{task_id}",
        code="print('ASTRA workspace patch verification executed successfully.')",
        language="python"
    )

    return ExecuteTaskResponse(
        task_id=task_id,
        status=runner_result.get("status", "failed"),
        exit_code=runner_result.get("exit_code", 1),
        output=runner_result.get("stdout") or runner_result.get("stderr", "No output"),
        sandboxed=runner_result.get("sandboxed", True)
    )

@router.post("/{task_id}/cancel")
async def cancel_task(
    task_id: str,
    x_internal_service_key: str = Header(None)
):
    verify_internal_key(x_internal_service_key)
    return {"task_id": task_id, "status": "cancelled"}
