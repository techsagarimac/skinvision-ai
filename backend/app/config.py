"""Environment-based application configuration."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "SkinVision AI"
    app_env: str = "development"
    frontend_origin: str = "http://localhost:3000"
    database_url: str = "sqlite:///./data/skinvision.db"

    model_path: str = "../models/acne_yolo.pt"
    face_landmarker_path: str = "../models/face_landmarker.task"
    download_face_model: bool = True
    # MediaPipe 1.x Tasks can abort the process on some macOS Metal setups.
    # Keep off by default; OpenCV still provides face detection.
    use_mediapipe_tasks: bool = False
    yolo_confidence: float = 0.35
    detector_mode: str = "auto"  # auto | mock | yolo
    max_image_size: int = 1280
    max_upload_bytes: int = 8 * 1024 * 1024
    log_level: str = "INFO"

    allowed_mime_types: tuple[str, ...] = (
        "image/jpeg",
        "image/png",
        "image/webp",
    )

    @property
    def model_file(self) -> Path:
        return Path(self.model_path).expanduser()

    @property
    def cors_origins(self) -> list[str]:
        origins = [origin.strip() for origin in self.frontend_origin.split(",") if origin.strip()]
        if self.app_env == "development":
            extras = [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ]
            for extra in extras:
                if extra not in origins:
                    origins.append(extra)
        return origins


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
