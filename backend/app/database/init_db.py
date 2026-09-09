"""Create tables on startup. Isolated so migrations can replace this later."""

from __future__ import annotations

from sqlalchemy import inspect, text

from app.database.session import Base, engine
from app.models import analysis as _analysis_model  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    _add_missing_columns()


def _add_missing_columns() -> None:
    inspector = inspect(engine)
    if "analyses" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("analyses")}
    if "dark_circle_data" in columns:
        return
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE analyses ADD COLUMN dark_circle_data JSON"))
