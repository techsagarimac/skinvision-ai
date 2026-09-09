"""Persisted analysis statistics. Original images are never stored."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    visible_spot_count: Mapped[int] = mapped_column(Integer, nullable=False)
    region_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    image_quality: Mapped[str] = mapped_column(String(32), nullable=False)
    detection_mode: Mapped[str] = mapped_column(String(16), nullable=False)
    dark_circle_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
