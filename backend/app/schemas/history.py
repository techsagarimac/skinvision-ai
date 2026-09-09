from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.analysis import DarkCircleLevel, DetectionMode, ImageQuality, RegionCounts


class DarkCircleHistory(BaseModel):
    detected: bool = False
    level: DarkCircleLevel = "none"
    left_score: float = Field(default=0.0, ge=0.0, le=1.0)
    right_score: float = Field(default=0.0, ge=0.0, le=1.0)


class HistoryCreate(BaseModel):
    visible_spot_count: int = Field(ge=0, le=500)
    region_data: RegionCounts
    image_quality: ImageQuality
    detection_mode: DetectionMode
    dark_circle_data: DarkCircleHistory | None = None


class HistoryRecord(BaseModel):
    id: int
    created_at: datetime
    visible_spot_count: int
    region_data: RegionCounts
    image_quality: ImageQuality
    detection_mode: DetectionMode
    dark_circle_data: DarkCircleHistory | None = None

    model_config = {"from_attributes": True}


class HistoryListResponse(BaseModel):
    items: list[HistoryRecord]
