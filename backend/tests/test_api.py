"""Smoke tests for health, history, and safe image rejection."""

from __future__ import annotations

from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


def _blank_jpeg() -> bytes:
    image = Image.new("RGB", (320, 320), (40, 40, 40))
    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def test_health_and_history_and_no_face() -> None:
    with TestClient(app) as client:
        health = client.get("/api/health")
        assert health.status_code == 200
        body = health.json()
        assert body["status"] == "ok"
        assert body["detection_mode"] in {"demo", "yolo"}

        rejected = client.post(
            "/api/analyze",
            files={"file": ("blank.jpg", _blank_jpeg(), "image/jpeg")},
        )
        assert rejected.status_code == 422
        assert rejected.json()["error_code"] == "NO_FACE"

        created = client.post(
            "/api/history",
            json={
                "visible_spot_count": 8,
                "region_data": {
                    "forehead": 2,
                    "left_cheek": 3,
                    "right_cheek": 2,
                    "nose": 0,
                    "chin": 1,
                },
                "image_quality": "good",
                "detection_mode": "demo",
            },
        )
        assert created.status_code == 201
        record_id = created.json()["id"]

        listed = client.get("/api/history")
        assert listed.status_code == 200
        assert any(item["id"] == record_id for item in listed.json()["items"])

        deleted = client.delete(f"/api/history/{record_id}")
        assert deleted.status_code == 204
