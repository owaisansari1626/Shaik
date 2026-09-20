from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate

class CategoryService:
    @staticmethod
    async def create_category(db: AsyncSession, category_in: CategoryCreate, user_id: int) -> Category:
        data = {
            "name": category_in.name,
            "description": category_in.description,
            "icon": category_in.icon,
            "user_id": user_id
        }
        category = Category(**data)  # type: ignore
        db.add(category)
        await db.commit()
        await db.refresh(category)
        return category

    @staticmethod
    async def get_categories(db: AsyncSession, user_id: int) -> list[Category]:
        result = await db.execute(select(Category).filter(Category.user_id == user_id))
        return result.scalars().all()

    @staticmethod
    async def get_category(db: AsyncSession, category_id: int, user_id: int) -> Category:
        result = await db.execute(select(Category).filter(Category.id == category_id, Category.user_id == user_id))
        category = result.scalars().first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category

    @staticmethod
    async def update_category(db: AsyncSession, category_id: int, category_in: CategoryUpdate, user_id: int) -> Category:
        category = await CategoryService.get_category(db, category_id, user_id)
        update_data = category_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
            
        await db.commit()
        await db.refresh(category)
        return category

    @staticmethod
    async def delete_category(db: AsyncSession, category_id: int, user_id: int):
        category = await CategoryService.get_category(db, category_id, user_id)
        await db.delete(category)
        await db.commit()
