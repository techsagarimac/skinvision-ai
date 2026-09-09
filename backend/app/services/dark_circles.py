"""Visual estimate of under-eye darkness. Not a medical finding."""

from __future__ import annotations

import logging

import cv2
import numpy as np

from app.schemas.analysis import DarkCircleReport, FaceBox, UnderEyeEstimate

logger = logging.getLogger(__name__)

DARK_CIRCLE_DISCLAIMER = (
    "This describes estimated under-eye darkness in the photo. Shadows, lighting, "
    "camera angle, and fatigue can change the result. It is not a medical diagnosis."
)


def estimate_dark_circles(
    image: np.ndarray,
    under_eye_boxes: dict[str, FaceBox],
    region_boxes: dict[str, FaceBox],
) -> DarkCircleReport:
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    luma = lab[:, :, 0].astype(np.float32)

    left_box = under_eye_boxes.get("left_under_eye") or _fallback_box(region_boxes, "left")
    right_box = under_eye_boxes.get("right_under_eye") or _fallback_box(region_boxes, "right")
    left_ref = _reference_box(region_boxes.get("left_cheek"), left_box)
    right_ref = _reference_box(region_boxes.get("right_cheek"), right_box)

    left = _side_estimate("left_under_eye", luma, left_box, left_ref)
    right = _side_estimate("right_under_eye", luma, right_box, right_ref)
    detected = left.visible or right.visible
    level, label = _level(max(left.darkness_score, right.darkness_score), detected)

    logger.info(
        "Dark circle estimate left=%.2f right=%.2f level=%s",
        left.darkness_score,
        right.darkness_score,
        level,
    )
    return DarkCircleReport(
        detected=detected,
        level=level,
        level_label=label,
        disclaimer=DARK_CIRCLE_DISCLAIMER,
        left=left,
        right=right,
    )


def _side_estimate(
    region: str,
    luma: np.ndarray,
    box: FaceBox | None,
    reference: FaceBox | None,
) -> UnderEyeEstimate:
    empty = box or FaceBox(x=0.2, y=0.3, width=0.15, height=0.08)
    eye_value = _mean_luma(luma, box)
    ref_value = _mean_luma(luma, reference)
    if eye_value is None or ref_value is None:
        return UnderEyeEstimate(
            region=region,  # type: ignore[arg-type]
            box=empty,
            darkness_score=0.0,
            confidence=0.4,
            visible=False,
        )
    delta = float(ref_value - eye_value)
    score = float(np.clip(delta / 50.0, 0.0, 1.0))
    visible = score >= 0.22
    confidence = float(np.clip(0.58 + score * 0.36, 0.5, 0.96))
    return UnderEyeEstimate(
        region=region,  # type: ignore[arg-type]
        box=empty,
        darkness_score=round(score, 3),
        confidence=round(confidence, 3),
        visible=visible,
    )


def _level(score: float, detected: bool) -> tuple[str, str]:
    if not detected:
        return "none", "No clear under-eye darkness detected"
    if score < 0.35:
        return "low", "Low visible under-eye darkness"
    if score < 0.55:
        return "moderate", "Moderate visible under-eye darkness"
    return "high", "High visible under-eye darkness"


def _mean_luma(luma: np.ndarray, box: FaceBox | None) -> float | None:
    crop = _crop(luma, box)
    if crop is None or crop.size < 25:
        return None
    return float(np.median(crop))


def _crop(channel: np.ndarray, box: FaceBox | None) -> np.ndarray | None:
    if box is None:
        return None
    height, width = channel.shape[:2]
    x1 = int(max(0, min(width - 1, box.x * width)))
    y1 = int(max(0, min(height - 1, box.y * height)))
    x2 = int(max(x1 + 1, min(width, (box.x + box.width) * width)))
    y2 = int(max(y1 + 1, min(height, (box.y + box.height) * height)))
    return channel[y1:y2, x1:x2]


def _reference_box(cheek: FaceBox | None, under_eye: FaceBox | None) -> FaceBox | None:
    """Use the lower cheek so the sample sits below the under-eye band."""
    if cheek is None:
        return under_eye
    return FaceBox(
        x=cheek.x + cheek.width * 0.15,
        y=cheek.y + cheek.height * 0.45,
        width=cheek.width * 0.70,
        height=cheek.height * 0.45,
    )


def _fallback_box(region_boxes: dict[str, FaceBox], side: str) -> FaceBox | None:
    cheek = region_boxes.get(f"{side}_cheek")
    if cheek is None:
        return None
    return FaceBox(x=cheek.x, y=max(0.0, cheek.y - cheek.height * 0.15), width=cheek.width, height=cheek.height * 0.28)
