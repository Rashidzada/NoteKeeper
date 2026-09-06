from typing import List, Optional, Tuple
from sqlalchemy import cast, desc, asc, String
from sqlalchemy.orm import Session, joinedload
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


class NoteRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, note_id: str, user_id: str) -> Optional[Note]:
        return (
            self.db.query(Note)
            .options(joinedload(Note.category))
            .filter(Note.id == note_id, Note.user_id == user_id)
            .first()
        )

    def list_notes(
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
    ) -> Tuple[List[Note], int]:
        query = (
            self.db.query(Note)
            .options(joinedload(Note.category))
            .filter(Note.user_id == user_id)
        )

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Note.title.ilike(search_pattern)) | (Note.content.ilike(search_pattern))
            )

        if category_id:
            query = query.filter(Note.category_id == category_id)

        if is_favorite is not None:
            query = query.filter(Note.is_favorite == is_favorite)

        if tag:
            clean_tag = tag.strip().lower()
            query = query.filter(cast(Note.tags, String).ilike(f'%"{clean_tag}"%'))

        total = query.count()

        # Sorting
        sort_column = getattr(Note, sort_by, Note.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        items = query.offset(skip).limit(limit).all()
        return items, total

    def create(self, note_in: NoteCreate, user_id: str) -> Note:
        note = Note(
            user_id=user_id,
            category_id=note_in.category_id,
            title=note_in.title,
            content=note_in.content,
            tags=note_in.tags or [],
            is_favorite=note_in.is_favorite,
            color=note_in.color,
            reminder=note_in.reminder,
        )
        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)
        # Load category relation if any
        if note.category_id:
            self.db.refresh(note, attribute_names=["category"])
        return note

    def update(self, note: Note, note_in: NoteUpdate) -> Note:
        update_data = note_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(note, field, value)
        self.db.commit()
        self.db.refresh(note)
        if note.category_id:
            self.db.refresh(note, attribute_names=["category"])
        return note

    def delete(self, note: Note) -> None:
        self.db.delete(note)
        self.db.commit()

    def batch_delete(self, note_ids: List[str], user_id: str) -> int:
        deleted_count = (
            self.db.query(Note)
            .filter(Note.id.in_(note_ids), Note.user_id == user_id)
            .delete(synchronize_session=False)
        )
        self.db.commit()
        return deleted_count
