from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models.activity import Activity
from app.models.occurrence import ActivityOccurrence
from app.schemas.activity import ActivityCreate, ActivityUpdate
from datetime import datetime, date

class ActivityService:
    @staticmethod
    async def create_activity(db: AsyncSession, activity_in: ActivityCreate, user_id: int) -> Activity:
        activity_data = activity_in.model_dump(exclude={"recurrence_rule"})
        activity_data["user_id"] = user_id
        activity = Activity(**activity_data)  # type: ignore
        db.add(activity)
        await db.commit()
        await db.refresh(activity)
        return activity

    @staticmethod
    async def get_activities(db: AsyncSession, user_id: int) -> list[Activity]:
        result = await db.execute(select(Activity).filter(Activity.user_id == user_id))
        return result.scalars().all()

    @staticmethod
    async def get_activity(db: AsyncSession, activity_id: int, user_id: int) -> Activity:
        result = await db.execute(select(Activity).filter(Activity.id == activity_id, Activity.user_id == user_id))
        activity = result.scalars().first()
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        return activity

    @staticmethod
    async def update_activity(db: AsyncSession, activity_id: int, activity_in: ActivityUpdate, user_id: int) -> Activity:
        activity = await ActivityService.get_activity(db, activity_id, user_id)
        
        update_data = activity_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(activity, field, value)
            
        await db.commit()
        await db.refresh(activity)
        return activity

    @staticmethod
    async def delete_activity(db: AsyncSession, activity_id: int, user_id: int):
        activity = await ActivityService.get_activity(db, activity_id, user_id)
        await db.delete(activity)
        await db.commit()
