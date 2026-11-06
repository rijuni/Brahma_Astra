from typing import Any, Dict, Optional


class IsolatedExecutor:
    """Fail closed until a verified sandbox adapter is implemented."""

    def execute_job(
        self,
        job_id: str,
        command: Optional[str] = None,
        code: Optional[str] = None,
        language: str = "python",
        files: Optional[Dict[str, str]] = None,
        timeout_seconds: Optional[int] = None,
        custom_env: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        return {
            "job_id": job_id,
            "status": "disabled",
            "exit_code": -1,
            "stdout": "",
            "stderr": (
                "Execution unavailable: this runner has no verified sandbox runtime adapter. "
                "Execution remains disabled for every configured mode. Add and verify an OS-level "
                "sandbox or microVM adapter before enabling arbitrary code execution."
            ),
            "execution_time_ms": 0,
            "sandboxed": False,
        }


executor = IsolatedExecutor()
