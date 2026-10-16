from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    service_name: str = "astra-engine"
    port: int = 8002
    internal_service_key: str = Field(
        default="dev_internal_service_key_change_in_production",
        description="Shared key for authenticating inter-service requests"
    )
    astra_runner_url: str = Field(
        default="http://localhost:8003",
        description="URL for isolated ASTRA Runner service"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
