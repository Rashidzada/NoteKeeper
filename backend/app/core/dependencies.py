from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.utils.exceptions import ForbiddenException, UnauthorizedException

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise UnauthorizedException(
            message="Missing authentication token",
            code="AUTH-001"
        )
    token = credentials.credentials
    try:
        payload = decode_token(token, is_refresh=False)
        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException(message="Invalid token payload", code="AUTH-003")
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException(message="Access token has expired", code="AUTH-002")
    except jwt.InvalidTokenError:
        raise UnauthorizedException(message="Invalid access token", code="AUTH-003")

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    if not user:
        raise UnauthorizedException(message="User not found", code="AUTH-004")
    if not user.is_active:
        raise UnauthorizedException(message="User account is inactive", code="AUTH-004")

    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_admin:
        raise ForbiddenException(message="Admin privileges required")
    return current_user
