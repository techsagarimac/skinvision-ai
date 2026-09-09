from __future__ import annotations

from fastapi import APIRouter

from app.config import get_settings
from app.schemas.analysis import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    from app.runtime import get_engine

    settings = get_settings()
    engine = get_engine()
    return HealthResponse(
        status="ok",
        detection_mode=engine.detection_mode,  # type: ignore[arg-type]
        face_engine=engine.face_analyzer.engine,
        app=settings.app_name,
    )
