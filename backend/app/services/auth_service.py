from sqlalchemy.orm import Session
import jwt
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import TokenRefreshResponse, TokenResponse, UserCreate, UserResponse
from app.utils.exceptions import BadRequestException, ConflictException, UnauthorizedException


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, user_in: UserCreate) -> TokenResponse:
        # Check email uniqueness
        if self.user_repo.get_by_email(user_in.email):
            raise ConflictException(
                message="A user with this email already exists",
                code="VAL-001",
                details=f"Email {user_in.email} is already registered"
            )

        # Check username uniqueness
        if self.user_repo.get_by_username(user_in.username):
            raise ConflictException(
                message="A user with this username already exists",
                code="VAL-001",
                details=f"Username {user_in.username} is already taken"
            )

        password_hash = get_password_hash(user_in.password)
        user = self.user_repo.create(user_in, password_hash)

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    async def login(self, identifier: str, password: str) -> TokenResponse:
        user = self.user_repo.get_by_username_or_email(identifier)
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedException(
                message="Invalid username/email or password",
                code="AUTH-001"
            )

        if not user.is_active:
            raise BadRequestException(
                message="User account is inactive",
                code="AUTH-004"
            )

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    async def refresh_access_token(self, refresh_token: str) -> TokenRefreshResponse:
        try:
            payload = decode_token(refresh_token, is_refresh=True)
            user_id = payload.get("sub")
            if not user_id:
                raise UnauthorizedException(message="Invalid token payload", code="AUTH-003")
        except jwt.ExpiredSignatureError:
            raise UnauthorizedException(message="Refresh token has expired", code="AUTH-002")
        except jwt.InvalidTokenError:
            raise UnauthorizedException(message="Invalid refresh token", code="AUTH-003")

        user = self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise UnauthorizedException(message="User not found or inactive", code="AUTH-004")

        new_access_token = create_access_token(user.id)
        return TokenRefreshResponse(access_token=new_access_token)
