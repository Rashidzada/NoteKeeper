from typing import List
from sqlalchemy.orm import Session
from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.utils.exceptions import ConflictException, NotFoundException


class CategoryService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CategoryRepository(db)

    async def create_category(self, user_id: str, category_in: CategoryCreate) -> CategoryResponse:
        existing = self.repo.get_by_name(category_in.name, user_id)
        if existing:
            raise ConflictException(
                message=f"Category '{category_in.name}' already exists",
                code="CAT-002"
            )
        category = self.repo.create(category_in, user_id)
        return CategoryResponse.model_validate(category)

    async def list_categories(self, user_id: str) -> List[CategoryResponse]:
        categories = self.repo.list_by_user(user_id)
        return [CategoryResponse.model_validate(c) for c in categories]

    async def get_category(self, category_id: str, user_id: str) -> Category:
        category = self.repo.get_by_id(category_id, user_id)
        if not category:
            raise NotFoundException(
                message=f"Category with ID '{category_id}' not found",
                code="CAT-001"
            )
        return category

    async def update_category(
        self, category_id: str, user_id: str, category_in: CategoryUpdate
    ) -> CategoryResponse:
        category = await self.get_category(category_id, user_id)

        if category_in.name and category_in.name != category.name:
            existing = self.repo.get_by_name(category_in.name, user_id)
            if existing and existing.id != category_id:
                raise ConflictException(
                    message=f"Category '{category_in.name}' already exists",
                    code="CAT-002"
                )

        updated = self.repo.update(category, category_in)
        return CategoryResponse.model_validate(updated)

    async def delete_category(self, category_id: str, user_id: str) -> None:
        category = await self.get_category(category_id, user_id)
        self.repo.delete(category)
