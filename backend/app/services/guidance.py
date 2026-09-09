"""Conservative general skincare guidance. Never diagnoses or prescribes."""

from __future__ import annotations

from app.schemas.analysis import DarkCircleReport, RegionCounts, VisibleSpotLevel

LEVEL_DISCLAIMER = (
    "This level describes the number of visible spots detected by the AI "
    "and is not a medical diagnosis."
)

CORE_GUIDANCE = [
    "Avoid picking or squeezing visible spots.",
    "Maintain a consistent gentle skincare routine.",
    "Use sunscreen appropriate for your skin.",
    "Keep frequently touched objects such as phones clean.",
    "Pay attention to persistent or worsening symptoms.",
]

DERMATOLOGIST_NOTE = "Consider consulting a qualified dermatologist."


def visible_spot_level(count: int) -> tuple[VisibleSpotLevel, str]:
    if count <= 2:
        return "low", "Low visible spot level"
    if count <= 6:
        return "moderate", "Moderate visible spot level"
    return "high", "High visible spot level"


def build_guidance(
    count: int,
    regions: RegionCounts,
    image_quality: str,
    dark_circles: DarkCircleReport | None = None,
) -> list[str]:
    items = list(CORE_GUIDANCE)

    if regions.forehead >= 2:
        items.append("Forehead spots are often more visible with hair products or hats. Keep the area clean and avoid heavy residue when possible.")
    if regions.left_cheek + regions.right_cheek >= 3:
        items.append("Cheek areas can be affected by pillowcases, phone screens, and hands. Clean surfaces that frequently touch your face.")
    if regions.chin >= 2:
        items.append("The chin area can be irritated by masks, helmets, or frequent touching. Give the skin space to recover.")
    if regions.nose >= 2:
        items.append("The nose area can look shinier under strong light. Gentle cleansing is usually enough; avoid harsh scrubbing.")

    if dark_circles and dark_circles.detected:
        items.append(
            "Under-eye darkness can look stronger with shadows, late nights, or camera angle. This is a visual estimate, not a medical finding."
        )
        items.append(
            "A cool compress and consistent sleep habits are common general approaches. They are not treatment for a diagnosed condition."
        )
        if dark_circles.left.visible and dark_circles.right.visible:
            items.append("Visible under-eye darkness was estimated on both sides of the photo.")
        elif dark_circles.left.visible:
            items.append("Visible under-eye darkness was estimated more on the left side of the image.")
        elif dark_circles.right.visible:
            items.append("Visible under-eye darkness was estimated more on the right side of the image.")

    if image_quality == "poor":
        items.append("A clearer, better-lit photo can change how many spots the AI estimates. Results may vary with lighting and angle.")

    if count >= 7:
        items.append("A higher number of visible spots can be influenced by lighting, camera quality, and detection variation.")
        items.append(DERMATOLOGIST_NOTE)
    else:
        items.append("For persistent, painful, severe, rapidly changing, or concerning symptoms, consider consulting a qualified dermatologist.")

    # Preserve order while removing accidental duplicates.
    seen: set[str] = set()
    unique: list[str] = []
    for item in items:
        if item not in seen:
            seen.add(item)
            unique.append(item)
    return unique
