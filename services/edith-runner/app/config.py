from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    service_name: str = "astra-runner"
    port: int = 8003
    internal_service_key: str = Field(
        default="dev_internal_service_key_change_in_production",
        description="Shared key for authenticating inter-service requests"
    )
    # Execution mode: "disabled" is the MANDATORY secure default on native Windows.
    # Arbitrary code execution is disabled unless a verified hardware/container sandbox is active.
    execution_mode: str = Field(
        default="disabled",
        description="Execution mode: disabled (default), restricted_subprocess, or verified_sandbox"
    )
    max_timeout_seconds: int = 15
    max_memory_mb: int = 256
    max_output_bytes: int = 32768
    workspace_base_dir: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
