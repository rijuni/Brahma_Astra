from typing import Dict, Any, Set
from datetime import datetime, timezone
from app.providers.factory import get_provider
from app.observability.logger import logger

class TaskOrchestrator:
    def __init__(self):
        self.cancelled_tasks: Set[str] = set()

    async def execute_task(self, task_id: str, prompt: str, task_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        if task_id in self.cancelled_tasks:
            return {
                "status": "cancelled",
                "message": "Task cancelled prior to execution"
            }

        provider = get_provider()
        logger.info("Executing task via provider", extra={"meta": {"task_id": task_id, "provider": provider.name, "task_type": task_type}})

        try:
            result = await provider.execute_task(prompt, task_type, context)
            if task_id in self.cancelled_tasks:
                return {
                    "status": "cancelled",
                    "message": "Task cancelled during execution"
                }

            return {
                "status": "completed",
                "provider": provider.name,
                "result": result,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }
        except Exception as e:
            logger.error("Task execution failed", exc_info=True, extra={"meta": {"task_id": task_id}})
            return {
                "status": "failed",
                "provider": provider.name,
                "error": str(e),
                "completed_at": datetime.now(timezone.utc).isoformat()
            }

    def cancel_task(self, task_id: str) -> bool:
        self.cancelled_tasks.add(task_id)
        logger.info("Task marked cancelled", extra={"meta": {"task_id": task_id}})
        return True

orchestrator = TaskOrchestrator()
