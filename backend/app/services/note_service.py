from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.pagination import PaginatedResponse
from app.models.note import Note
from app.repositories.category_repository import CategoryRepository
from app.repositories.note_repository import NoteRepository
from app.schemas.note import NoteCreate, NoteResponse, NoteUpdate
from app.utils.exceptions import NotFoundException


class NoteService:
    def __init__(self, db: Session):
        self.db = db
        self.note_repo = NoteRepository(db)
        self.category_repo = CategoryRepository(db)

    async def create_note(self, user_id: str, note_in: NoteCreate) -> NoteResponse:
        if note_in.category_id:
            category = self.category_repo.get_by_id(note_in.category_id, user_id)
            if not category:
                raise NotFoundException(
                    message=f"Category with ID '{note_in.category_id}' not found",
                    code="CAT-001"
                )
        note = self.note_repo.create(note_in, user_id)
        return NoteResponse.model_validate(note)

    async def get_notes(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        category_id: Optional[str] = None,
        tag: Optional[str] = None,
        is_favorite: Optional[bool] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> PaginatedResponse[NoteResponse]:
        items, total = self.note_repo.list_notes(
            user_id=user_id,
            skip=skip,
            limit=limit,
            search=search,
            category_id=category_id,
            tag=tag,
            is_favorite=is_favorite,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        return PaginatedResponse[NoteResponse](
            items=[NoteResponse.model_validate(item) for item in items],
            total=total,
            skip=skip,
            limit=limit,
        )

    async def get_note(self, note_id: str, user_id: str) -> Note:
        note = self.note_repo.get_by_id(note_id, user_id)
        if not note:
            raise NotFoundException(
                message=f"Note with ID '{note_id}' not found",
                code="NOTE-001"
            )
        return note

    async def update_note(self, note_id: str, user_id: str, note_in: NoteUpdate) -> NoteResponse:
        note = await self.get_note(note_id, user_id)

        if note_in.category_id:
            category = self.category_repo.get_by_id(note_in.category_id, user_id)
            if not category:
                raise NotFoundException(
                    message=f"Category with ID '{note_in.category_id}' not found",
                    code="CAT-001"
                )

        updated = self.note_repo.update(note, note_in)
        return NoteResponse.model_validate(updated)

    async def delete_note(self, note_id: str, user_id: str) -> None:
        note = await self.get_note(note_id, user_id)
        self.note_repo.delete(note)

    async def batch_delete_notes(self, note_ids: List[str], user_id: str) -> int:
        return self.note_repo.batch_delete(note_ids, user_id)
