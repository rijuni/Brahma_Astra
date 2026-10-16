from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ExecutionRequest(BaseModel):
    job_id: str = Field(..., description="Unique job ID")
    command: Optional[str] = Field(None, description="Command line string")
    code: Optional[str] = Field(None, description="Raw code to run")
    language: str = Field(default="python", description="Language: python, node, javascript")
    files: Optional[Dict[str, str]] = Field(default_factory=dict, description="Files to place into workspace")
    timeout_seconds: Optional[int] = Field(default=10, description="Execution timeout")
    custom_env: Optional[Dict[str, str]] = Field(default_factory=dict, description="Allowed non-sensitive env variables")

class ExecutionResponse(BaseModel):
    job_id: str
    status: str
    exit_code: int
    stdout: str
    stderr: str
    execution_time_ms: int
    sandboxed: bool

class SecurityStatusResponse(BaseModel):
    service: str
    execution_mode: str
    max_timeout_seconds: int
    max_memory_mb: int
    max_output_bytes: int
    host_env_sanitized: bool
    ephemeral_cleanup: bool
    verified: bool
    notes: str
