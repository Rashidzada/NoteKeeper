from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, category_id: str, user_id: str) -> Optional[Category]:
        return self.db.query(Category).filter(
            Category.id == category_id,
            Category.user_id == user_id
        ).first()

    def get_by_name(self, name: str, user_id: str) -> Optional[Category]:
        return self.db.query(Category).filter(
            Category.name == name,
            Category.user_id == user_id
        ).first()

    def list_by_user(self, user_id: str) -> List[Category]:
        return self.db.query(Category).filter(
            Category.user_id == user_id
        ).order_by(Category.name.asc()).all()

    def create(self, category_in: CategoryCreate, user_id: str) -> Category:
        category = Category(
            user_id=user_id,
            name=category_in.name,
            color=category_in.color,
            icon=category_in.icon,
        )
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def update(self, category: Category, category_in: CategoryUpdate) -> Category:
        update_data = category_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
        self.db.commit()
        self.db.refresh(category)
        return category

    def delete(self, category: Category) -> None:
        self.db.delete(category)
        self.db.commit()
