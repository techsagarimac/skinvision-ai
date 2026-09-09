import numpy as np

from app.schemas.analysis import FaceBox
from app.services.dark_circles import estimate_dark_circles


def test_darker_under_eye_is_detected() -> None:
    image = np.full((200, 200, 3), 180, dtype=np.uint8)
    image[70:95, 20:70] = (40, 40, 40)
    image[70:95, 130:180] = (50, 50, 50)
    report = estimate_dark_circles(
        image,
        {
            "left_under_eye": FaceBox(x=0.10, y=0.35, width=0.25, height=0.12),
            "right_under_eye": FaceBox(x=0.65, y=0.35, width=0.25, height=0.12),
        },
        {
            "left_cheek": FaceBox(x=0.08, y=0.50, width=0.30, height=0.25),
            "right_cheek": FaceBox(x=0.62, y=0.50, width=0.30, height=0.25),
        },
    )
    assert report.detected
    assert report.left.visible
    assert report.right.visible
    assert report.level in {"low", "moderate", "high"}
