from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Any, List

from app.db.database import get_db
from app.models.user import User
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, Category as CategorySchema
from app.core.dependencies import get_current_user
from app.core.responses import SuccessResponse

from app.services.category_service import CategoryService

router = APIRouter()

@router.post("", response_model=SuccessResponse[CategorySchema])
async def create_category(
    category_in: CategoryCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    category = await CategoryService.create_category(db, category_in, current_user.id)
    return SuccessResponse(data=category, message="Category created")

@router.get("", response_model=SuccessResponse[List[CategorySchema]])
async def read_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    categories = await CategoryService.get_categories(db, current_user.id)
    return SuccessResponse(data=categories, message="Categories retrieved")

@router.patch("/{id}", response_model=SuccessResponse[CategorySchema])
async def update_category(
    id: int,
    category_in: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    category = await CategoryService.update_category(db, id, category_in, current_user.id)
    return SuccessResponse(data=category, message="Category updated")

@router.delete("/{id}", response_model=SuccessResponse)
async def delete_category(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    await CategoryService.delete_category(db, id, current_user.id)
    return SuccessResponse(message="Category deleted")
