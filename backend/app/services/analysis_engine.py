"""Combines face analysis, quality checks, and visible-spot detection."""

from __future__ import annotations

import logging

import numpy as np

from app.schemas.analysis import (
    AnalysisResult,
    AnalysisSummary,
    Detection,
    ImageQualityReport,
    RegionCounts,
)
from app.services.acne_detector import BaseDetector
from app.services.dark_circles import estimate_dark_circles
from app.services.face_analysis import FaceAnalyzer, assign_region
from app.services.guidance import LEVEL_DISCLAIMER, build_guidance, visible_spot_level
from app.services.image_quality import assess_image_quality
from app.utils.errors import ApiError

logger = logging.getLogger(__name__)


class AnalysisEngine:
    def __init__(self, face_analyzer: FaceAnalyzer, detector: BaseDetector) -> None:
        self.face_analyzer = face_analyzer
        self.detector = detector

    @property
    def detection_mode(self) -> str:
        return self.detector.mode

    def analyze(self, image: np.ndarray) -> AnalysisResult:
        face = self.face_analyzer.analyze(image)
        quality = assess_image_quality(image, face.face_box, face.landmarks)

        if face.face_count == 0:
            raise ApiError(
                422,
                "NO_FACE",
                "We could not find a face in this image. Face the camera, keep your face centered, and try again.",
                details=quality.instructions,
            )
        if face.face_count > 1:
            raise ApiError(
                422,
                "MULTIPLE_FACES",
                "More than one face was visible. Please capture a photo with a single face centered in the frame.",
                details=quality.instructions,
            )

        raw = self.detector.detect(image, face.face_box, face.region_boxes)
        detections = [_normalize_detection(item, face.region_boxes, face.face_box) for item in raw]
        regions = _count_regions(detections)
        count = len(detections)
        level, label = visible_spot_level(count)
        dark_circles = estimate_dark_circles(image, face.under_eye_boxes, face.region_boxes)

        logger.info(
            "Analysis complete mode=%s spots=%s dark_circles=%s quality=%s engine=%s",
            self.detector.mode,
            count,
            dark_circles.level,
            quality.level,
            face.engine,
        )

        return AnalysisResult(
            face_detected=True,
            face_count=face.face_count,
            image_quality=quality.level,
            image_quality_report=quality,
            detection_mode=self.detector.mode,  # type: ignore[arg-type]
            total_visible_spots=count,
            regions=regions,
            detections=detections,
            landmarks=face.landmarks,
            face_box=face.face_box,
            summary=AnalysisSummary(
                visible_spot_level=level,
                level_label=label,
                disclaimer=LEVEL_DISCLAIMER,
            ),
            dark_circles=dark_circles,
            guidance=build_guidance(count, regions, quality.level, dark_circles),
        )


def empty_quality() -> ImageQualityReport:
    return ImageQualityReport(
        level="poor",
        brightness=0,
        blur_score=0,
        face_size_ratio=0,
        alignment_ok=False,
        instructions=[],
    )


def _count_regions(detections: list[Detection]) -> RegionCounts:
    counts = RegionCounts()
    for item in detections:
        current = getattr(counts, item.region)
        setattr(counts, item.region, current + 1)
    return counts


def _normalize_detection(item: Detection, region_boxes, face_box) -> Detection:
    cx = item.x + item.width / 2
    cy = item.y + item.height / 2
    region = assign_region(cx, cy, region_boxes, face_box)
    return item.model_copy(update={"region": region})
