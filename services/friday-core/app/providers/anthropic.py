import httpx
from typing import Dict, Any
from app.providers.base import BaseProvider
from app.core.config import settings

class AnthropicProvider(BaseProvider):
    def __init__(self):
        self.api_key = settings.anthropic_api_key

    @property
    def name(self) -> str:
        return "anthropic"

    async def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def execute_task(self, prompt: str, task_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        if not await self.is_configured():
            raise ValueError("Anthropic provider requested but ANTHROPIC_API_KEY is not configured.")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 1024,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            response.raise_for_status()
            data = response.json()
            return {
                "provider": "anthropic",
                "model": data.get("model"),
                "response": data["content"][0]["text"]
            }
