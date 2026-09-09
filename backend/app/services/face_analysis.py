"""Face detection, landmarks, and approximate region mapping.

Supports MediaPipe 1.x Face Landmarker, MediaPipe 0.10 Face Mesh,
and OpenCV Haar cascades. Landmark regions are visual estimates,
not anatomical boundaries.
"""

from __future__ import annotations

import logging
import ssl
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import numpy as np

from app.config import get_settings
from app.schemas.analysis import FaceBox, Landmark

logger = logging.getLogger(__name__)

REGIONS = ("forehead", "left_cheek", "right_cheek", "nose", "chin")

LANDMARKER_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "face_landmarker/face_landmarker/float16/1/face_landmarker.task"
)

_FOREHEAD = (10, 67, 69, 104, 108, 151, 337, 299, 333, 297, 338, 9)
_NOSE = (1, 2, 4, 5, 6, 19, 94, 97, 98, 129, 358, 327, 326, 168)
_LEFT_IMAGE_CHEEK = (234, 93, 132, 58, 172, 136, 150, 176, 148, 152, 116, 117, 118)
_RIGHT_IMAGE_CHEEK = (454, 323, 361, 288, 397, 365, 379, 400, 377, 345, 346, 347)
_CHIN = (152, 175, 199, 200, 18, 176, 148, 400, 377, 365)
_LEFT_UNDER_EYE = (111, 117, 118, 119, 100, 142, 126, 145, 153, 154, 155)
_RIGHT_UNDER_EYE = (340, 346, 347, 348, 329, 371, 355, 374, 380, 381, 382)


@dataclass
class FaceAnalysis:
    face_count: int
    face_box: FaceBox | None
    landmarks: list[Landmark]
    region_boxes: dict[str, FaceBox] = field(default_factory=dict)
    under_eye_boxes: dict[str, FaceBox] = field(default_factory=dict)
    engine: str = "none"


class FaceAnalyzer:
    def __init__(self) -> None:
        self.engine = "opencv"
        self._landmarker = None
        self._mesh = None
        self._cascade = None
        self._init_engines()

    def _init_engines(self) -> None:
        settings = get_settings()
        if settings.use_mediapipe_tasks and self._init_mediapipe_tasks():
            return
        if self._init_mediapipe_solutions():
            return
        self._init_opencv()

    def _init_mediapipe_tasks(self) -> bool:
        try:
            import mediapipe as mp
            from mediapipe.tasks.python import BaseOptions, vision
        except Exception as exc:  # noqa: BLE001
            logger.info("MediaPipe Tasks API not available: %s", exc)
            return False

        if not hasattr(vision, "FaceLandmarker"):
            return False

        model_path = _ensure_landmarker_model()
        if model_path is None:
            return False

        try:
            options = vision.FaceLandmarkerOptions(
                base_options=BaseOptions(model_asset_path=str(model_path)),
                num_faces=3,
                min_face_detection_confidence=0.5,
                min_face_presence_confidence=0.5,
                output_face_blendshapes=False,
                output_facial_transformation_matrixes=False,
            )
            self._landmarker = vision.FaceLandmarker.create_from_options(options)
            self._mp_image_cls = mp.Image
            self._mp_format = mp.ImageFormat.SRGB
            self.engine = "mediapipe"
            logger.info("Face engine: MediaPipe Face Landmarker")
            return True
        except Exception as exc:  # noqa: BLE001
            logger.warning("MediaPipe Face Landmarker failed to load (%s).", exc)
            self._landmarker = None
            return False

    def _init_mediapipe_solutions(self) -> bool:
        try:
            import mediapipe as mp

            mesh_api = getattr(getattr(mp, "solutions", None), "face_mesh", None)
            if mesh_api is None:
                return False
            self._mesh = mesh_api.FaceMesh(
                static_image_mode=True,
                max_num_faces=3,
                refine_landmarks=False,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
            self.engine = "mediapipe"
            logger.info("Face engine: MediaPipe Face Mesh")
            return True
        except Exception as exc:  # noqa: BLE001
            logger.info("MediaPipe Face Mesh not available: %s", exc)
            return False

    def _init_opencv(self) -> None:
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self._cascade = cv2.CascadeClassifier(cascade_path)
        self.engine = "opencv"
        logger.info("Face engine: OpenCV Haar cascade")

    def analyze(self, image_bgr: np.ndarray) -> FaceAnalysis:
        if self._landmarker is not None:
            result = self._analyze_landmarker(image_bgr)
            if result.face_count > 0:
                return result
            logger.info("MediaPipe Landmarker found no face; trying fallback.")
        if self._mesh is not None:
            result = self._analyze_mesh(image_bgr)
            if result.face_count > 0:
                return result
            logger.info("MediaPipe Face Mesh found no face; trying OpenCV.")
        return self._analyze_opencv(image_bgr)

    def close(self) -> None:
        if self._landmarker is not None:
            closer = getattr(self._landmarker, "close", None)
            if callable(closer):
                closer()
        if self._mesh is not None:
            self._mesh.close()

    def _analyze_landmarker(self, image_bgr: np.ndarray) -> FaceAnalysis:
        rgb = np.ascontiguousarray(cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB))
        mp_image = self._mp_image_cls(image_format=self._mp_format, data=rgb)
        output = self._landmarker.detect(mp_image)
        faces = list(output.face_landmarks or [])
        if not faces:
            return FaceAnalysis(face_count=0, face_box=None, landmarks=[], engine=self.engine)

        primary = max(faces, key=lambda face: _points_area([(pt.x, pt.y) for pt in face]))
        landmarks = [Landmark(x=float(pt.x), y=float(pt.y)) for pt in primary]
        face_box = _box_from_points([(pt.x, pt.y) for pt in primary])
        return FaceAnalysis(
            face_count=len(faces),
            face_box=face_box,
            landmarks=_downsample_landmarks(landmarks),
            region_boxes=_regions_from_points(primary),
            under_eye_boxes=_under_eye_boxes(primary, face_box),
            engine=self.engine,
        )

    def _analyze_mesh(self, image_bgr: np.ndarray) -> FaceAnalysis:
        rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        output = self._mesh.process(rgb)
        if not output.multi_face_landmarks:
            return FaceAnalysis(face_count=0, face_box=None, landmarks=[], engine=self.engine)

        faces = list(output.multi_face_landmarks)
        primary = max(faces, key=lambda face: _points_area([(pt.x, pt.y) for pt in face.landmark]))
        landmarks = [Landmark(x=float(pt.x), y=float(pt.y)) for pt in primary.landmark]
        face_box = _box_from_points([(pt.x, pt.y) for pt in primary.landmark])
        return FaceAnalysis(
            face_count=len(faces),
            face_box=face_box,
            landmarks=_downsample_landmarks(landmarks),
            region_boxes=_regions_from_points(primary.landmark),
            under_eye_boxes=_under_eye_boxes(primary.landmark, face_box),
            engine=self.engine,
        )

    def _analyze_opencv(self, image_bgr: np.ndarray) -> FaceAnalysis:
        if self._cascade is None:
            self._init_opencv()
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        height, width = gray.shape[:2]
        detections = self._cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))
        if detections is None or len(detections) == 0:
            return FaceAnalysis(face_count=0, face_box=None, landmarks=[], engine="opencv")

        largest = max(detections, key=lambda box: box[2] * box[3])
        x, y, w, h = (int(v) for v in largest)
        face_box = FaceBox(x=x / width, y=y / height, width=w / width, height=h / height)
        return FaceAnalysis(
            face_count=len(detections),
            face_box=face_box,
            landmarks=_synthetic_landmarks(face_box),
            region_boxes=_regions_from_box(face_box),
            under_eye_boxes=_under_eye_from_box(face_box),
            engine="opencv",
        )


def assign_region(x: float, y: float, region_boxes: dict[str, FaceBox], face_box: FaceBox | None) -> str:
    hits: list[tuple[float, str]] = []
    for name, box in region_boxes.items():
        if _contains(box, x, y):
            hits.append((max(box.width * box.height, 1e-6), name))
    if hits:
        hits.sort(key=lambda item: item[0])
        return hits[0][1]
    return _nearest_region(x, y, region_boxes) or "forehead"


def _ensure_landmarker_model() -> Path | None:
    settings = get_settings()
    path = Path(settings.face_landmarker_path).expanduser()
    if path.is_file():
        return path
    if not settings.download_face_model:
        logger.info("Face Landmarker model missing and DOWNLOAD_FACE_MODEL is false.")
        return None
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        logger.info("Downloading Face Landmarker model to %s", path)
        try:
            import certifi

            context = ssl.create_default_context(cafile=certifi.where())
        except Exception:  # noqa: BLE001
            context = ssl.create_default_context()
        with urllib.request.urlopen(LANDMARKER_URL, context=context, timeout=60) as response:
            path.write_bytes(response.read())
        if path.is_file() and path.stat().st_size > 1000:
            return path
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not download Face Landmarker model: %s", exc)
    return None


def _regions_from_points(landmarks) -> dict[str, FaceBox]:
    groups = {
        "forehead": _FOREHEAD,
        "nose": _NOSE,
        "left_cheek": _LEFT_IMAGE_CHEEK,
        "right_cheek": _RIGHT_IMAGE_CHEEK,
        "chin": _CHIN,
    }
    boxes: dict[str, FaceBox] = {}
    count = len(landmarks)
    for name, indices in groups.items():
        points = [(landmarks[i].x, landmarks[i].y) for i in indices if i < count]
        if points:
            boxes[name] = _box_from_points(points, pad=0.015)
    return boxes


def _regions_from_box(face: FaceBox) -> dict[str, FaceBox]:
    x, y, w, h = face.x, face.y, face.width, face.height
    return {
        "forehead": FaceBox(x=x + 0.08 * w, y=y, width=0.84 * w, height=0.28 * h),
        "nose": FaceBox(x=x + 0.38 * w, y=y + 0.30 * h, width=0.24 * w, height=0.36 * h),
        "left_cheek": FaceBox(x=x, y=y + 0.32 * h, width=0.38 * w, height=0.40 * h),
        "right_cheek": FaceBox(x=x + 0.62 * w, y=y + 0.32 * h, width=0.38 * w, height=0.40 * h),
        "chin": FaceBox(x=x + 0.22 * w, y=y + 0.72 * h, width=0.56 * w, height=0.28 * h),
    }


def _under_eye_boxes(landmarks, face_box: FaceBox) -> dict[str, FaceBox]:
    """Approximate under-eye bands from landmarks when the mesh is dense enough."""
    if len(landmarks) < 400:
        return _under_eye_from_box(face_box)
    groups = {
        "left_under_eye": _LEFT_UNDER_EYE,
        "right_under_eye": _RIGHT_UNDER_EYE,
    }
    boxes: dict[str, FaceBox] = {}
    count = len(landmarks)
    for name, indices in groups.items():
        points = [(landmarks[i].x, landmarks[i].y) for i in indices if i < count]
        if points:
            boxes[name] = _nudge_under_eye(_box_from_points(points, pad=0.012))
    return boxes or _under_eye_from_box(face_box)


def _under_eye_from_box(face: FaceBox) -> dict[str, FaceBox]:
    x, y, w, h = face.x, face.y, face.width, face.height
    return {
        "left_under_eye": FaceBox(x=x + 0.12 * w, y=y + 0.38 * h, width=0.28 * w, height=0.12 * h),
        "right_under_eye": FaceBox(x=x + 0.60 * w, y=y + 0.38 * h, width=0.28 * w, height=0.12 * h),
    }


def _nudge_under_eye(box: FaceBox) -> FaceBox:
    """Shift a landmark band slightly below the eyelid so lashes are less dominant."""
    return FaceBox(
        x=box.x,
        y=min(0.95, box.y + box.height * 0.2),
        width=box.width,
        height=max(0.02, box.height * 0.95),
    )


def _synthetic_landmarks(face: FaceBox) -> list[Landmark]:
    points = [
        (0.50, 0.08), (0.20, 0.18), (0.80, 0.18), (0.32, 0.30), (0.68, 0.30),
        (0.50, 0.42), (0.50, 0.55), (0.22, 0.52), (0.78, 0.52), (0.35, 0.72),
        (0.65, 0.72), (0.50, 0.90),
    ]
    return [Landmark(x=face.x + px * face.width, y=face.y + py * face.height) for px, py in points]


def _downsample_landmarks(landmarks: list[Landmark], stride: int = 8) -> list[Landmark]:
    if len(landmarks) <= 80:
        return landmarks
    sampled = landmarks[::stride]
    xs = [pt.x for pt in landmarks]
    ys = [pt.y for pt in landmarks]
    for target in (
        landmarks[int(np.argmin(xs))],
        landmarks[int(np.argmax(xs))],
        landmarks[int(np.argmin(ys))],
        landmarks[int(np.argmax(ys))],
    ):
        if target not in sampled:
            sampled.append(target)
    return sampled


def _box_from_points(points: list[tuple[float, float]], pad: float = 0.01) -> FaceBox:
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    x1, y1 = max(0.0, min(xs) - pad), max(0.0, min(ys) - pad)
    x2, y2 = min(1.0, max(xs) + pad), min(1.0, max(ys) + pad)
    return FaceBox(x=x1, y=y1, width=max(0.01, x2 - x1), height=max(0.01, y2 - y1))


def _points_area(points: list[tuple[float, float]]) -> float:
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return (max(xs) - min(xs)) * (max(ys) - min(ys))


def _contains(box: FaceBox, x: float, y: float) -> bool:
    return box.x <= x <= box.x + box.width and box.y <= y <= box.y + box.height


def _nearest_region(x: float, y: float, region_boxes: dict[str, FaceBox]) -> str | None:
    best_name = None
    best_dist = 1e9
    for name, box in region_boxes.items():
        cx = box.x + box.width / 2
        cy = box.y + box.height / 2
        dist = (cx - x) ** 2 + (cy - y) ** 2
        if dist < best_dist:
            best_dist = dist
            best_name = name
    return best_name
