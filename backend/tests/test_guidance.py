from app.schemas.analysis import DarkCircleReport, FaceBox, RegionCounts, UnderEyeEstimate
from app.services.guidance import build_guidance, visible_spot_level

def _dark(detected: bool = True) -> DarkCircleReport:
    box = FaceBox(x=0.2, y=0.3, width=0.15, height=0.08)
    side = UnderEyeEstimate(region="left_under_eye", box=box, darkness_score=0.4, confidence=0.8, visible=detected)
    other = UnderEyeEstimate(region="right_under_eye", box=box, darkness_score=0.1, confidence=0.6, visible=False)
    return DarkCircleReport(
        detected=detected,
        level="moderate" if detected else "none",
        level_label="Moderate visible under-eye darkness",
        disclaimer="test",
        left=side,
        right=other,
    )


def test_visible_spot_levels() -> None:
    assert visible_spot_level(0)[0] == "low"
    assert visible_spot_level(2)[0] == "low"
    assert visible_spot_level(3)[0] == "moderate"
    assert visible_spot_level(7)[0] == "high"


def test_guidance_mentions_dermatologist() -> None:
    notes = build_guidance(8, RegionCounts(forehead=3, left_cheek=2, right_cheek=2, nose=0, chin=1), "good", _dark())
    assert any("dermatologist" in item.lower() for item in notes)
    assert any("under-eye" in item.lower() for item in notes)
    assert all("prescription" not in item.lower() for item in notes)
