"""User-facing API errors. Internal traces stay in server logs."""

from __future__ import annotations

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class ApiError(HTTPException):
    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: list[str] | None = None,
    ) -> None:
        super().__init__(status_code=status_code, detail=message)
        self.error_code = error_code
        self.message = message
        self.details = details or []


class ErrorBody(BaseModel):
    error_code: str
    message: str
    details: list[str] = []


async def api_error_handler(_request: Request, exc: ApiError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorBody(
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details,
        ).model_dump(),
    )


async def unhandled_error_handler(_request: Request, _exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=ErrorBody(
            error_code="INTERNAL_ERROR",
            message="Something went wrong while processing your request. Please try again.",
        ).model_dump(),
    )
