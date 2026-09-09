"""Conservative visual quality estimates. Not a clinical assessment."""

from __future__ import annotations

import cv2
import numpy as np

from app.schemas.analysis import FaceBox, ImageQualityReport, Landmark


def assess_image_quality(
    image: np.ndarray,
    face_box: FaceBox | None,
    landmarks: list[Landmark],
) -> ImageQualityReport:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    brightness = float(np.mean(gray))
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    face_size_ratio = 0.0
    if face_box is not None:
        face_size_ratio = max(0.0, min(1.0, face_box.width * face_box.height))

    alignment_ok = _eyes_roughly_level(landmarks)
    instructions: list[str] = []
    flags = 0

    if brightness < 55:
        flags += 2
        instructions.append("Lighting is too dark. Try moving toward a light source.")
    elif brightness < 80:
        flags += 1
        instructions.append("The photo looks a little dark. A brighter room may help.")
    elif brightness > 230:
        flags += 1
        instructions.append("The photo looks washed out. Soften harsh light if you can.")

    if blur_score < 40:
        flags += 2
        instructions.append("The image looks blurry. Hold the camera steady and tap to focus.")
    elif blur_score < 80:
        flags += 1
        instructions.append("The image is a bit soft. A steadier capture may improve detection.")

    if face_box is not None and face_size_ratio < 0.06:
        flags += 2
        instructions.append("Your face appears far from the camera. Move a little closer and keep it centered.")
    elif face_box is not None and face_size_ratio < 0.10:
        flags += 1
        instructions.append("Your face is a bit small in the frame. Moving closer can help.")

    if face_box is not None and not alignment_ok:
        flags += 1
        instructions.append("Try facing the camera more directly with your head level.")

    if flags >= 3:
        level = "poor"
    elif flags >= 1:
        level = "acceptable"
    else:
        level = "good"
        instructions.append("Image quality looks suitable for a visual analysis.")

    return ImageQualityReport(
        level=level,
        brightness=round(brightness, 2),
        blur_score=round(blur_score, 2),
        face_size_ratio=round(face_size_ratio, 4),
        alignment_ok=alignment_ok,
        instructions=instructions,
    )


def _eyes_roughly_level(landmarks: list[Landmark]) -> bool:
    if len(landmarks) < 8:
        return True
    xs = [point.x for point in landmarks]
    ys = [point.y for point in landmarks]
    width = max(xs) - min(xs)
    height = max(ys) - min(ys)
    if width <= 0:
        return True
    # Very rough tilt proxy: face bounding box should not be extremely tall vs wide.
    ratio = height / width
    return 0.7 <= ratio <= 1.8
