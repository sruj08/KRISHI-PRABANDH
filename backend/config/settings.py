from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "KRISHI-PRABANDH API"
    debug: bool = Field(
        default=True,
        description="When True, unauthenticated survey/GR routes use a synthetic Krushi Sahayak (local UI). Set False in production.",
    )

    jwt_secret: str = Field(
        default="local-dev-only-jwt-secret-change-me-32chars-min",
        validation_alias=AliasChoices("JWT_SECRET"),
        min_length=16,
    )

    jwt_algorithm: str = "HS256"
    jwt_exp_minutes: int = 60 * 12

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
