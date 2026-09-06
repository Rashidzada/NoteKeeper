from datetime import datetime, timezone
from typing import Any, Optional
from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Any] = None,
    ):
        self.code = code
        self.message = message
        self.details = details or message
        self.timestamp = datetime.now(timezone.utc).isoformat()
        super().__init__(
            status_code=status_code,
            detail={
                "code": self.code,
                "message": self.message,
                "details": self.details,
                "timestamp": self.timestamp,
            },
        )


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", code: str = "NOT_FOUND", details: Optional[Any] = None):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, code=code, message=message, details=details)


class BadRequestException(AppException):
    def __init__(self, message: str = "Bad request", code: str = "BAD_REQUEST", details: Optional[Any] = None):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, code=code, message=message, details=details)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized", code: str = "AUTH-001", details: Optional[Any] = None):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, code=code, message=message, details=details)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Forbidden", code: str = "FORBIDDEN", details: Optional[Any] = None):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, code=code, message=message, details=details)


class ConflictException(AppException):
    def __init__(self, message: str = "Resource already exists", code: str = "CONFLICT", details: Optional[Any] = None):
        super().__init__(status_code=status.HTTP_409_CONFLICT, code=code, message=message, details=details)
