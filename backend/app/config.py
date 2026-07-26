import os
import tempfile
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Codex Restaurant API"

    SECRET_KEY: str = "codex-secret-key-super-secure-production-ready-2026-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./codex_restaurant.db"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    # Uploads (Vercel compatible)
    UPLOAD_DIR: str = os.path.join(tempfile.gettempdir(), "uploads")

    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024
    ALLOWED_IMAGE_TYPES: set[str] = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    class Config:
        env_file = ".env"


settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
