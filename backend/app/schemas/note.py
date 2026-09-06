from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.category import CategoryResponse


class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=10000)
    category_id: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list, max_length=10)
    is_favorite: bool = False
    color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    reminder: Optional[datetime] = None

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> List[str]:
        if not v:
            return []
        cleaned = []
        for tag in v:
            tag_clean = tag.strip().lower()
            if " " in tag_clean:
                raise ValueError(f"Tag '{tag}' must not contain spaces")
            if tag_clean and tag_clean not in cleaned:
                cleaned.append(tag_clean)
        if len(cleaned) > 10:
            raise ValueError("Maximum 10 tags allowed per note")
        return cleaned


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1, max_length=10000)
    category_id: Optional[str] = None
    tags: Optional[List[str]] = Field(None, max_length=10)
    is_favorite: Optional[bool] = None
    color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    reminder: Optional[datetime] = None

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return None
        cleaned = []
        for tag in v:
            tag_clean = tag.strip().lower()
            if " " in tag_clean:
                raise ValueError(f"Tag '{tag}' must not contain spaces")
            if tag_clean and tag_clean not in cleaned:
                cleaned.append(tag_clean)
        if len(cleaned) > 10:
            raise ValueError("Maximum 10 tags allowed per note")
        return cleaned


class NoteResponse(NoteBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


class BatchDeleteRequest(BaseModel):
    note_ids: List[str] = Field(..., min_length=1, description="List of Note IDs to delete")


class BatchDeleteResponse(BaseModel):
    deleted_count: int


class NoteShareRequest(BaseModel):
    user_id: str = Field(..., description="Recipient user ID")
    permission: Literal["view", "edit"] = "view"
