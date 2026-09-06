from fastapi import APIRouter
from app.api.v1.routes import auth, categories, notes

api_v1_router = APIRouter()
api_v1_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_v1_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_v1_router.include_router(categories.router, prefix="/categories", tags=["categories"])
