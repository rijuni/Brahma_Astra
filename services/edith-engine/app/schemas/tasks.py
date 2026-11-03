from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class PlanTaskRequest(BaseModel):
    task_id: str
    workspace_id: str
    instruction: str
    files: Optional[Dict[str, str]] = Field(default_factory=dict)

class PatchFile(BaseModel):
    file_path: str
    operation: str = Field(default="modify", description="create, modify, delete")
    diff: str
    content: Optional[str] = None

class PatchProposal(BaseModel):
    summary: str
    files: List[PatchFile]
    risk_level: str = "low" # low, medium, high

class PlanTaskResponse(BaseModel):
    task_id: str
    workspace_id: str
    status: str = "proposed"
    patch_proposal: PatchProposal

class ExecuteTaskResponse(BaseModel):
    task_id: str
    status: str
    exit_code: int
    output: str
    sandboxed: bool
