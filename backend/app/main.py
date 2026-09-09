"""SkinVision AI FastAPI application."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import analyze, health, history
from app.config import get_settings
from app.database.init_db import init_db
from app.services.acne_detector import create_detector
from app.services.analysis_engine import AnalysisEngine
from app.services.face_analysis import FaceAnalyzer
from app.utils.errors import ApiError, api_error_handler
from app.utils.logging import configure_logging
from app import runtime


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings = get_settings()
    configure_logging(settings)
    init_db()
    face_analyzer = FaceAnalyzer()
    detector = create_detector(settings)
    runtime.engine = AnalysisEngine(face_analyzer, detector)
    yield
    face_analyzer.close()
    runtime.engine = None


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title=settings.app_name,
        description=(
            "AI visual analysis of visible skin spots. "
            "This service does not diagnose medical conditions."
        ),
        version="1.0.0",
        lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    application.add_exception_handler(ApiError, api_error_handler)
    application.include_router(health.router, prefix="/api")
    application.include_router(analyze.router, prefix="/api")
    application.include_router(history.router, prefix="/api")
    return application


app = create_app()
