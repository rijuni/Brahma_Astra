import httpx
from typing import Dict, Any, Optional
from app.config import settings
from app.observability.logger import logger

class RunnerClient:
    def __init__(self):
        self.base_url = settings.astra_runner_url
        self.service_key = settings.internal_service_key

    async def execute(
        self,
        job_id: str,
        code: Optional[str] = None,
        command: Optional[str] = None,
        language: str = "python",
        files: Optional[Dict[str, str]] = None,
        timeout_seconds: int = 15
    ) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                res = await client.post(
                    f"{self.base_url}/api/v1/execute",
                    headers={
                        "Content-Type": "application/json",
                        "X-Internal-Service-Key": self.service_key
                    },
                    json={
                        "job_id": job_id,
                        "code": code,
                        "command": command,
                        "language": language,
                        "files": files or {},
                        "timeout_seconds": timeout_seconds
                    }
                )
                res.raise_for_status()
                return res.json()
            except httpx.HTTPError as e:
                logger.error("Runner client execution call failed", exc_info=True, extra={"meta": {"job_id": job_id}})
                return {
                    "job_id": job_id,
                    "status": "failed",
                    "exit_code": 1,
                    "stdout": "",
                    "stderr": f"Failed to contact runner: {str(e)}",
                    "sandboxed": False
                }

runner_client = RunnerClient()
