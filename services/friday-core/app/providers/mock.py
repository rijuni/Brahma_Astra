from typing import Dict, Any
from datetime import datetime, timezone
from app.providers.base import BaseProvider

class MockProvider(BaseProvider):
    @property
    def name(self) -> str:
        return "mock"

    async def is_configured(self) -> bool:
        return True

    async def execute_task(self, prompt: str, task_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Returns deterministic, testable intelligence output."""
        return {
            "provider": "mock",
            "task_type": task_type,
            "summary": f"Executed intelligence task: {prompt[:80]}...",
            "response": f"[BRAHMA Intelligence Synthesis] Processed request for task '{task_type}'. Input: '{prompt}'.",
            "metadata": {
                "confidence": 0.98,
                "model": "brahma-mock-v1",
                "processed_at": datetime.now(timezone.utc).isoformat()
            }
        }
