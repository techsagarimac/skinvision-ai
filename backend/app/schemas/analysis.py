from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

FacialRegion = Literal["forehead", "left_cheek", "right_cheek", "nose", "chin"]
ImageQuality = Literal["good", "acceptable", "poor"]
DetectionMode = Literal["demo", "yolo"]
VisibleSpotLevel = Literal["low", "moderate", "high"]
DarkCircleLevel = Literal["none", "low", "moderate", "high"]
UnderEyeRegion = Literal["left_under_eye", "right_under_eye"]


class Detection(BaseModel):
    x: float = Field(ge=0.0, le=1.0)
    y: float = Field(ge=0.0, le=1.0)
    width: float = Field(ge=0.0, le=1.0)
    height: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(ge=0.0, le=1.0)
    category: Literal["visible_spot"] = "visible_spot"
    region: FacialRegion


class RegionCounts(BaseModel):
    forehead: int = 0
    left_cheek: int = 0
    right_cheek: int = 0
    nose: int = 0
    chin: int = 0


class FaceBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class Landmark(BaseModel):
    x: float
    y: float


class ImageQualityReport(BaseModel):
    level: ImageQuality
    brightness: float
    blur_score: float
    face_size_ratio: float
    alignment_ok: bool
    instructions: list[str] = []


class AnalysisSummary(BaseModel):
    visible_spot_level: VisibleSpotLevel
    level_label: str
    disclaimer: str


class UnderEyeEstimate(BaseModel):
    region: UnderEyeRegion
    box: FaceBox
    darkness_score: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(ge=0.0, le=1.0)
    visible: bool


class DarkCircleReport(BaseModel):
    detected: bool
    level: DarkCircleLevel
    level_label: str
    disclaimer: str
    left: UnderEyeEstimate
    right: UnderEyeEstimate


class AnalysisResult(BaseModel):
    face_detected: bool
    face_count: int
    image_quality: ImageQuality
    image_quality_report: ImageQualityReport
    detection_mode: DetectionMode
    total_visible_spots: int
    regions: RegionCounts
    detections: list[Detection]
    landmarks: list[Landmark]
    face_box: FaceBox | None
    summary: AnalysisSummary
    dark_circles: DarkCircleReport
    guidance: list[str]
    error_code: str | None = None
    message: str | None = None


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    detection_mode: DetectionMode
    face_engine: str
    app: str
