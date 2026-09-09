"""Safe image decoding, validation, and resizing."""

from __future__ import annotations

import logging
from io import BytesIO

import cv2
import numpy as np
from PIL import Image, UnidentifiedImageError

from app.config import Settings
from app.utils.errors import ApiError

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def validate_upload(filename: str | None, content_type: str | None, size: int, settings: Settings) -> None:
    if size <= 0:
        raise ApiError(400, "EMPTY_FILE", "The uploaded file was empty. Please choose another image.")
    if size > settings.max_upload_bytes:
        limit_mb = settings.max_upload_bytes // (1024 * 1024)
        raise ApiError(
            413,
            "IMAGE_TOO_LARGE",
            f"That image is too large. Please use a file under {limit_mb} MB.",
        )
    if content_type and content_type not in settings.allowed_mime_types:
        raise ApiError(
            415,
            "UNSUPPORTED_IMAGE",
            "That file type is not supported. Please upload a JPEG, PNG, or WebP image.",
        )
    if filename:
        suffix = _extension(filename)
        if suffix and suffix not in ALLOWED_EXTENSIONS:
            raise ApiError(
                415,
                "UNSUPPORTED_IMAGE",
                "That file type is not supported. Please upload a JPEG, PNG, or WebP image.",
            )


def decode_image(data: bytes) -> np.ndarray:
    """Decode untrusted bytes into a BGR OpenCV image."""
    try:
        pil = Image.open(BytesIO(data))
        pil.verify()
    except (UnidentifiedImageError, OSError) as exc:
        logger.info("Rejected unreadable image: %s", exc)
        raise ApiError(
            400,
            "CORRUPTED_IMAGE",
            "We could not read that image. It may be damaged. Try another photo.",
        ) from None

    array = np.frombuffer(data, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise ApiError(
            400,
            "CORRUPTED_IMAGE",
            "We could not read that image. It may be damaged. Try another photo.",
        )
    return image


def resize_for_analysis(image: np.ndarray, max_size: int) -> np.ndarray:
    height, width = image.shape[:2]
    longest = max(height, width)
    if longest <= max_size:
        return image
    scale = max_size / float(longest)
    new_size = (int(width * scale), int(height * scale))
    return cv2.resize(image, new_size, interpolation=cv2.INTER_AREA)


def _extension(filename: str) -> str:
    name = filename.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    if "." not in name:
        return ""
    return f".{name.rsplit('.', 1)[-1].lower()}"
