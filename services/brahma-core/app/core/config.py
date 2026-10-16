from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    service_name: str = "brahma-core"
    port: int = 8001
    internal_service_key: str = Field(
        default="dev_internal_service_key_change_in_production",
        description="Shared key for authenticating inter-service requests"
    )
    ai_provider: str = Field(
        default="mock",
        description="Selected AI provider: mock, openai, anthropic, or gemini"
    )
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
