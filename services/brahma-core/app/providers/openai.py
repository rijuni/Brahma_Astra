import httpx
from typing import Dict, Any
from app.providers.base import BaseProvider
from app.core.config import settings

class OpenAIProvider(BaseProvider):
    def __init__(self):
        self.api_key = settings.openai_api_key

    @property
    def name(self) -> str:
        return "openai"

    async def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def execute_task(self, prompt: str, task_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        if not await self.is_configured():
            raise ValueError("OpenAI provider requested but OPENAI_API_KEY is not configured.")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": f"You are BRAHMA Intelligence Core executing {task_type}."},
                        {"role": "user", "content": prompt}
                    ]
                }
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return {
                "provider": "openai",
                "model": data.get("model", "gpt-4o-mini"),
                "response": content
            }
