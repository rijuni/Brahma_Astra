import os
import shutil
import tempfile
import time
import subprocess
from typing import Dict, Any, List, Optional
from app.config import settings
from app.security.sanitizer import sanitize_environment
from app.security.policy import validate_command_safety

class IsolatedExecutor:
    def execute_job(
        self,
        job_id: str,
        command: Optional[str] = None,
        code: Optional[str] = None,
        language: str = "python",
        files: Optional[Dict[str, str]] = None,
        timeout_seconds: Optional[int] = None,
        custom_env: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        # Enforce secure default: if verified sandbox runtime is unavailable, execution is disabled.
        # A normal Windows child process or Python subprocess is NOT a secure sandbox.
        if settings.execution_mode == "disabled":
            return {
                "job_id": job_id,
                "status": "disabled",
                "exit_code": -1,
                "stdout": "",
                "stderr": (
                    "Execution unavailable: Secure sandbox isolation is not available on this host. "
                    "In native Windows development, arbitrary user code execution is strictly disabled "
                    "to prevent host environment compromise. A verified OS-level sandbox or microVM "
                    "runtime must be configured before execution can be enabled."
                ),
                "execution_time_ms": 0,
                "sandboxed": False
            }

        # Validate timeout
        timeout = min(
            timeout_seconds or settings.max_timeout_seconds,
            settings.max_timeout_seconds
        )

        # Create isolated ephemeral directory
        temp_dir = tempfile.mkdtemp(prefix=f"astra_run_{job_id}_")
        start_time = time.time()

        try:
            # Populate workspace files
            if files:
                for rel_path, content in files.items():
                    # Prevent directory traversal
                    clean_rel = os.path.normpath(rel_path).lstrip("/\\")
                    if clean_rel.startswith("..") or os.path.isabs(clean_rel):
                        continue
                    file_path = os.path.join(temp_dir, clean_rel)
                    os.makedirs(os.path.dirname(file_path), exist_ok=True)
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(content)

            # Determine command to run
            exec_cmd = command
            if not exec_cmd and code:
                if language == "python":
                    script_file = os.path.join(temp_dir, "script.py")
                    with open(script_file, "w", encoding="utf-8") as f:
                        f.write(code)
                    exec_cmd = f"python script.py"
                elif language == "node" or language == "javascript":
                    script_file = os.path.join(temp_dir, "script.js")
                    with open(script_file, "w", encoding="utf-8") as f:
                        f.write(code)
                    exec_cmd = f"node script.js"
                else:
                    return {
                        "job_id": job_id,
                        "status": "failed",
                        "exit_code": 1,
                        "stdout": "",
                        "stderr": f"Unsupported language: {language}",
                        "execution_time_ms": 0,
                        "sandboxed": False
                    }

            # Safety check command
            is_safe, reason = validate_command_safety(exec_cmd)
            if not is_safe:
                return {
                    "job_id": job_id,
                    "status": "blocked",
                    "exit_code": 126,
                    "stdout": "",
                    "stderr": reason,
                    "execution_time_ms": 0,
                    "sandboxed": False
                }

            # Sanitize environment (scrubs all host secrets)
            isolated_env = sanitize_environment(custom_env)

            # Execute subprocess with timeout and isolated cwd
            process = subprocess.Popen(
                exec_cmd,
                shell=True,
                cwd=temp_dir,
                env=isolated_env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            try:
                stdout, stderr = process.communicate(timeout=timeout)
                duration_ms = int((time.time() - start_time) * 1000)

                # Cap output length
                max_bytes = settings.max_output_bytes
                truncated_stdout = stdout[:max_bytes] if stdout else ""
                truncated_stderr = stderr[:max_bytes] if stderr else ""

                if len(stdout or "") > max_bytes:
                    truncated_stdout += f"\n[Output truncated at {max_bytes} bytes]"
                if len(stderr or "") > max_bytes:
                    truncated_stderr += f"\n[Stderr truncated at {max_bytes} bytes]"

                return {
                    "job_id": job_id,
                    "status": "succeeded" if process.returncode == 0 else "failed",
                    "exit_code": process.returncode,
                    "stdout": truncated_stdout,
                    "stderr": truncated_stderr,
                    "execution_time_ms": duration_ms,
                    "sandboxed": False  # normal subprocess is never claimed to be a full sandbox
                }

            except subprocess.TimeoutExpired:
                # Force kill process
                process.kill()
                process.communicate()
                duration_ms = int((time.time() - start_time) * 1000)
                return {
                    "job_id": job_id,
                    "status": "timed_out",
                    "exit_code": 124,
                    "stdout": "",
                    "stderr": f"Execution timed out after {timeout} seconds.",
                    "execution_time_ms": duration_ms,
                    "sandboxed": False
                }

        finally:
            # Guaranteed workspace cleanup
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass

executor = IsolatedExecutor()
