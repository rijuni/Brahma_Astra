import httpx
from typing import Dict, Any
from app.providers.base import BaseProvider
from app.core.config import settings

class GeminiProvider(BaseProvider):
    def __init__(self):
        self.api_key = settings.gemini_api_key

    @property
    def name(self) -> str:
        return "gemini"

    async def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def execute_task(self, prompt: str, task_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        if not await self.is_configured():
            raise ValueError("Gemini provider requested but GEMINI_API_KEY is not configured.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }
            )
            response.raise_for_status()
            data = response.json()
            candidates = data.get("candidates", [])
            text = candidates[0]["content"]["parts"][0]["text"] if candidates else ""
            return {
                "provider": "gemini",
                "model": "gemini-1.5-flash",
                "response": text
            }
