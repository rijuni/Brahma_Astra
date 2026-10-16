from app.providers.base import BaseProvider
from app.providers.mock import MockProvider
from app.providers.openai import OpenAIProvider
from app.providers.anthropic import AnthropicProvider
from app.providers.gemini import GeminiProvider
from app.core.config import settings

def get_provider(provider_name: str = None) -> BaseProvider:
    name = (provider_name or settings.ai_provider).lower()

    if name == "mock":
        return MockProvider()
    elif name == "openai":
        return OpenAIProvider()
    elif name == "anthropic":
        return AnthropicProvider()
    elif name == "gemini":
        return GeminiProvider()
    else:
        # Default fallback to mock provider with a warning
        return MockProvider()
