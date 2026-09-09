"""Visible-spot detectors sharing one interface.

MockDetector keeps the product usable without a trained model.
YOLODetector can replace it by setting MODEL_PATH to a valid weights file.
"""

from __future__ import annotations

import hashlib
import logging
import random
from abc import ABC, abstractmethod
from pathlib import Path

import numpy as np

from app.config import Settings
from app.schemas.analysis import Detection, FaceBox
from app.services.face_analysis import REGIONS, assign_region

logger = logging.getLogger(__name__)


class BaseDetector(ABC):
    mode: str

    @abstractmethod
    def detect(
        self,
        image: np.ndarray,
        face_box: FaceBox | None,
        region_boxes: dict[str, FaceBox],
    ) -> list[Detection]:
        raise NotImplementedError


class MockDetector(BaseDetector):
    """Deterministic demo detections derived from the image contents."""

    mode = "demo"

    def detect(
        self,
        image: np.ndarray,
        face_box: FaceBox | None,
        region_boxes: dict[str, FaceBox],
    ) -> list[Detection]:
        rng = random.Random(_image_seed(image))
        count = rng.randint(5, 11)
        detections: list[Detection] = []
        available = [name for name in REGIONS if name in region_boxes] or list(REGIONS)

        for _ in range(count):
            region = rng.choice(available)
            box = region_boxes.get(region) or face_box
            if box is None:
                cx, cy = rng.uniform(0.3, 0.7), rng.uniform(0.2, 0.8)
            else:
                cx = box.x + rng.uniform(0.18, 0.82) * box.width
                cy = box.y + rng.uniform(0.18, 0.82) * box.height
            size = rng.uniform(0.016, 0.034)
            x = min(max(cx - size / 2, 0.0), 1.0 - size)
            y = min(max(cy - size / 2, 0.0), 1.0 - size)
            detections.append(
                Detection(
                    x=round(x, 4),
                    y=round(y, 4),
                    width=round(size, 4),
                    height=round(size, 4),
                    confidence=round(rng.uniform(0.74, 0.96), 2),
                    category="visible_spot",
                    region=region,  # type: ignore[arg-type]
                )
            )
        return detections


class YOLODetector(BaseDetector):
    mode = "yolo"

    def __init__(self, model_path: Path, confidence: float) -> None:
        from ultralytics import YOLO

        self.confidence = confidence
        self.model = YOLO(str(model_path))
        logger.info("Loaded YOLO weights from %s", model_path)

    def detect(
        self,
        image: np.ndarray,
        face_box: FaceBox | None,
        region_boxes: dict[str, FaceBox],
    ) -> list[Detection]:
        height, width = image.shape[:2]
        results = self.model.predict(image, conf=self.confidence, verbose=False)
        detections: list[Detection] = []
        if not results:
            return detections

        boxes = getattr(results[0], "boxes", None)
        if boxes is None:
            return detections

        for box in boxes:
            xyxy = box.xyxy[0].tolist()
            x1, y1, x2, y2 = (float(v) for v in xyxy)
            nx = max(0.0, min(1.0, x1 / width))
            ny = max(0.0, min(1.0, y1 / height))
            nw = max(0.0, min(1.0 - nx, (x2 - x1) / width))
            nh = max(0.0, min(1.0 - ny, (y2 - y1) / height))
            conf = float(box.conf[0]) if box.conf is not None else 0.0
            if conf < self.confidence:
                continue
            cx, cy = nx + nw / 2, ny + nh / 2
            region = assign_region(cx, cy, region_boxes, face_box)
            detections.append(
                Detection(
                    x=round(nx, 4),
                    y=round(ny, 4),
                    width=round(nw, 4),
                    height=round(nh, 4),
                    confidence=round(conf, 3),
                    category="visible_spot",
                    region=region,  # type: ignore[arg-type]
                )
            )
        return detections


def create_detector(settings: Settings) -> BaseDetector:
    """Configuration switch: mock, yolo, or auto (yolo if weights exist)."""
    requested = settings.detector_mode.lower().strip()
    model_path = settings.model_file

    if requested == "mock":
        logger.info("Detector: MockDetector (forced)")
        return MockDetector()

    if requested in {"yolo", "auto"}:
        if model_path.is_file():
            try:
                return YOLODetector(model_path, settings.yolo_confidence)
            except Exception as exc:  # noqa: BLE001
                logger.warning("YOLO model failed to load (%s). Using Demo AI Detection.", exc)
                if requested == "yolo":
                    logger.warning("DETECTOR_MODE=yolo but weights were unusable.")
        else:
            logger.info("MODEL_PATH %s not found. Using Demo AI Detection.", model_path)

    return MockDetector()


def _image_seed(image: np.ndarray) -> int:
    sample = image.reshape(-1)[:8192].tobytes()
    digest = hashlib.md5(sample).hexdigest()
    return int(digest[:8], 16)
