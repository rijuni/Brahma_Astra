from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class TaskRequest(BaseModel):
    task_id: str = Field(..., description="Unique task ID assigned by the Application API")
    prompt: str = Field(..., description="Input prompt or instruction")
    task_type: str = Field(default="general", description="Task classification: general, chat, research, summarization")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Contextual parameters")

class TaskResponse(BaseModel):
    task_id: str
    status: str
    provider: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    completed_at: Optional[datetime] = None

class CancelResponse(BaseModel):
    task_id: str
    status: str
    message: str

class HealthResponse(BaseModel):
    status: str
    provider: str
    ready: bool
    timestamp: str
