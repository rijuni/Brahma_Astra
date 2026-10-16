import pytest
from app.providers.factory import get_provider
from app.providers.mock import MockProvider
from app.providers.openai import OpenAIProvider

@pytest.mark.asyncio
async def test_mock_provider():
    provider = get_provider("mock")
    assert isinstance(provider, MockProvider)
    assert await provider.is_configured() is True
    result = await provider.execute_task("Sample prompt", "general", {})
    assert result["provider"] == "mock"
    assert "response" in result

@pytest.mark.asyncio
async def test_unconfigured_openai_provider():
    provider = OpenAIProvider()
    provider.api_key = None
    assert await provider.is_configured() is False
    with pytest.raises(ValueError):
        await provider.execute_task("Sample prompt", "general", {})
