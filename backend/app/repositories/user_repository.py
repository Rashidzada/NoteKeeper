from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username_or_email(self, identifier: str) -> Optional[User]:
        return self.db.query(User).filter(
            (User.username == identifier) | (User.email == identifier)
        ).first()

    def create(self, user_in: UserCreate, password_hash: str) -> User:
        user = User(
            username=user_in.username,
            email=user_in.email,
            password_hash=password_hash,
            full_name=user_in.full_name,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
