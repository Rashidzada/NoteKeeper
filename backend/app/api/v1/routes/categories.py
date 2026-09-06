from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services.category_service import CategoryService

router = APIRouter()


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new category for the authenticated user."""
    service = CategoryService(db)
    return await service.create_category(current_user.id, category_in)


@router.get("/", response_model=List[CategoryResponse])
async def list_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all categories belonging to the authenticated user."""
    service = CategoryService(db)
    return await service.list_categories(current_user.id)


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific category by ID."""
    service = CategoryService(db)
    category = await service.get_category(category_id, current_user.id)
    return CategoryResponse.model_validate(category)


@router.patch("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category_in: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a category's name, color, or icon."""
    service = CategoryService(db)
    return await service.update_category(category_id, current_user.id, category_in)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a category. Associated notes will have category set to null."""
    service = CategoryService(db)
    await service.delete_category(category_id, current_user.id)
