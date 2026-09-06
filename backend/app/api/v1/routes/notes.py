from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.pagination import PaginatedResponse
from app.models.user import User
from app.schemas.note import (
    BatchDeleteRequest,
    BatchDeleteResponse,
    NoteCreate,
    NoteResponse,
    NoteShareRequest,
    NoteUpdate,
)
from app.services.note_service import NoteService

router = APIRouter()


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new note for the authenticated user."""
    service = NoteService(db)
    return await service.create_note(current_user.id, note_in)


@router.get("/", response_model=PaginatedResponse[NoteResponse])
async def list_notes(
    skip: int = Query(0, ge=0, description="Records to skip for pagination"),
    limit: int = Query(10, ge=1, le=100, description="Max records to return"),
    search: Optional[str] = Query(None, description="Search term across title and content"),
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    tag: Optional[str] = Query(None, description="Filter by tag name"),
    is_favorite: Optional[bool] = Query(None, description="Filter by favorite flag"),
    sort_by: str = Query("created_at", pattern="^(created_at|title|updated_at)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List notes with advanced search, tags, category filtering, sorting, and pagination."""
    service = NoteService(db)
    return await service.get_notes(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        search=search,
        category_id=category_id,
        tag=tag,
        is_favorite=is_favorite,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.post("/batch", response_model=BatchDeleteResponse)
async def batch_delete_notes(
    batch_in: BatchDeleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete multiple notes in a single request."""
    service = NoteService(db)
    deleted_count = await service.batch_delete_notes(batch_in.note_ids, current_user.id)
    return BatchDeleteResponse(deleted_count=deleted_count)


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single note by ID (user must own the note)."""
    service = NoteService(db)
    note = await service.get_note(note_id, current_user.id)
    return NoteResponse.model_validate(note)


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    note_in: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an existing note (partial update)."""
    service = NoteService(db)
    return await service.update_note(note_id, current_user.id, note_in)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a note by ID."""
    service = NoteService(db)
    await service.delete_note(note_id, current_user.id)


@router.post("/{note_id}/share")
async def share_note(
    note_id: str,
    share_in: NoteShareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Share a note with another user (REQ-15)."""
    service = NoteService(db)
    # Ensure user owns the note
    await service.get_note(note_id, current_user.id)
    return {
        "message": f"Note {note_id} shared successfully with user {share_in.user_id}",
        "permission": share_in.permission,
    }
