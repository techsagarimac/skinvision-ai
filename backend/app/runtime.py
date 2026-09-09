"""Process-wide analysis engine. Isolated to avoid circular imports."""

from __future__ import annotations

from app.services.analysis_engine import AnalysisEngine

engine: AnalysisEngine | None = None


def get_engine() -> AnalysisEngine:
    if engine is None:
        raise RuntimeError("Analysis engine is not initialized")
    return engine
