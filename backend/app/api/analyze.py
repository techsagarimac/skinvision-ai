from __future__ import annotations

import logging

from fastapi import APIRouter, File, UploadFile

from app.config import get_settings
from app.schemas.analysis import AnalysisResult
from app.services.image_io import decode_image, resize_for_analysis, validate_upload

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=AnalysisResult)
async def analyze_image(file: UploadFile = File(...)) -> AnalysisResult:
    from app.runtime import get_engine

    settings = get_settings()
    payload = await file.read()
    validate_upload(file.filename, file.content_type, len(payload), settings)
    image = decode_image(payload)
    image = resize_for_analysis(image, settings.max_image_size)
    logger.info("Analyze request filename=%s bytes=%s shape=%s", file.filename, len(payload), image.shape)
    return get_engine().analyze(image)
