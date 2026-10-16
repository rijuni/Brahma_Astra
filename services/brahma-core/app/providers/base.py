from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseProvider(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the provider adapter."""
        pass

    @abstractmethod
    async def is_configured(self) -> bool:
        """Check if provider credentials and endpoints are validly configured."""
        pass

    @abstractmethod
    async def execute_task(self, prompt: str, task_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute intelligence task and return structured output."""
        pass
