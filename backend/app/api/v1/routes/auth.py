from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import (
    TokenRefreshRequest,
    TokenRefreshResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user and return JWT tokens."""
    service = AuthService(db)
    return await service.register(user_in)


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Authenticate user with username/email and password."""
    service = AuthService(db)
    return await service.login(credentials.username, credentials.password)


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(
    refresh_in: TokenRefreshRequest,
    db: Session = Depends(get_db)
):
    """Exchange a valid refresh token for a new access token."""
    service = AuthService(db)
    return await service.refresh_access_token(refresh_in.refresh_token)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Log out the current user and invalidate session on client."""
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve details of the currently authenticated user."""
    return UserResponse.model_validate(current_user)
