from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    jsonpe_base_url: str = "https://api.json.pe"
    jsonpe_token: str = ""
    anthropic_api_key: str = ""
    app_secret: str = "dev-secret"
    cache_ttl_seconds: int = 600
    cors_origins: list[str] = ["*"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
