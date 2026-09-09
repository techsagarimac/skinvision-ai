from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.analysis import Analysis
from app.schemas.history import HistoryCreate, HistoryListResponse, HistoryRecord
from app.utils.errors import ApiError

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/history", response_model=HistoryListResponse)
def list_history(db: Session = Depends(get_db)) -> HistoryListResponse:
    try:
        rows = db.query(Analysis).order_by(Analysis.created_at.asc()).all()
    except Exception as exc:  # noqa: BLE001
        logger.exception("History list failed: %s", exc)
        raise ApiError(500, "DATABASE_FAILURE", "Saved analyses could not be loaded right now.") from None
    return HistoryListResponse(items=[HistoryRecord.model_validate(row) for row in rows])


@router.get("/history/{analysis_id}", response_model=HistoryRecord)
def get_history_item(analysis_id: int, db: Session = Depends(get_db)) -> HistoryRecord:
    row = db.get(Analysis, analysis_id)
    if row is None:
        raise ApiError(404, "NOT_FOUND", "That saved analysis could not be found.")
    return HistoryRecord.model_validate(row)


@router.post("/history", response_model=HistoryRecord, status_code=201)
def create_history(payload: HistoryCreate, db: Session = Depends(get_db)) -> HistoryRecord:
    row = Analysis(
        visible_spot_count=payload.visible_spot_count,
        region_data=payload.region_data.model_dump(),
        image_quality=payload.image_quality,
        detection_mode=payload.detection_mode,
        dark_circle_data=payload.dark_circle_data.model_dump() if payload.dark_circle_data else None,
    )
    try:
        db.add(row)
        db.commit()
        db.refresh(row)
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        logger.exception("History save failed: %s", exc)
        raise ApiError(500, "DATABASE_FAILURE", "We could not save those analysis statistics.") from None
    return HistoryRecord.model_validate(row)


@router.delete("/history/{analysis_id}", status_code=204)
def delete_history_item(analysis_id: int, db: Session = Depends(get_db)) -> Response:
    row = db.get(Analysis, analysis_id)
    if row is None:
        raise ApiError(404, "NOT_FOUND", "That saved analysis could not be found.")
    try:
        db.delete(row)
        db.commit()
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        logger.exception("History delete failed: %s", exc)
        raise ApiError(500, "DATABASE_FAILURE", "We could not delete that saved analysis.") from None
    return Response(status_code=204)
