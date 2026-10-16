from fastapi import APIRouter, Header, HTTPException, status
from app.config import settings
from app.schemas.execution import ExecutionRequest, ExecutionResponse, SecurityStatusResponse
from app.security.executor import executor

router = APIRouter(prefix="/api/v1", tags=["execution"])

def verify_internal_key(x_internal_service_key: str = Header(None)):
    if not x_internal_service_key or x_internal_service_key != settings.internal_service_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Invalid or missing internal service key"
        )

@router.get("/security-status", response_model=SecurityStatusResponse)
async def get_security_status():
    is_disabled = settings.execution_mode == "disabled"

    notes = (
        "Native Windows development: Arbitrary code execution is strictly DISABLED because a verified "
        "hardware or container sandbox isolation mechanism is not active. Arbitrary code execution is blocked "
        "to prevent host environment compromise."
        if is_disabled
        else f"Running with execution mode '{settings.execution_mode}'. Standard subprocesses are not treated as secure sandboxes."
    )

    return SecurityStatusResponse(
        service="astra-runner",
        execution_mode=settings.execution_mode,
        max_timeout_seconds=settings.max_timeout_seconds,
        max_memory_mb=settings.max_memory_mb,
        max_output_bytes=settings.max_output_bytes,
        host_env_sanitized=True,
        ephemeral_cleanup=True,
        verified=True,
        notes=notes
    )

@router.post("/execute", response_model=ExecutionResponse)
async def execute(
    payload: ExecutionRequest,
    x_internal_service_key: str = Header(None)
):
    verify_internal_key(x_internal_service_key)

    result = executor.execute_job(
        job_id=payload.job_id,
        command=payload.command,
        code=payload.code,
        language=payload.language,
        files=payload.files,
        timeout_seconds=payload.timeout_seconds,
        custom_env=payload.custom_env
    )

    return ExecutionResponse(**result)
