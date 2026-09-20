from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from fastapi import HTTPException
from datetime import datetime, date
from app.models.occurrence import ActivityOccurrence
from app.schemas.activity import ActivityOccurrenceCreate, ActivityOccurrenceUpdate
from app.services.recurrence_service import RecurrenceService

class ScheduleService:
    @staticmethod
    async def create_occurrence(db: AsyncSession, occurrence_in: ActivityOccurrenceCreate, user_id: int) -> ActivityOccurrence:
        # Create an occurrence manually
        data = occurrence_in.dict()
        data["user_id"] = user_id
        data["original_start_time"] = occurrence_in.start_time
        data["original_end_time"] = occurrence_in.end_time
        occ = ActivityOccurrence(**data)  # type: ignore
        db.add(occ)
        await db.commit()
        await db.refresh(occ)
        # Eager load activity
        res = await db.execute(
            select(ActivityOccurrence).options(joinedload(ActivityOccurrence.activity)).filter(ActivityOccurrence.id == occ.id)
        )
        return res.scalars().first()
        
    @staticmethod
    async def get_occurrences(db: AsyncSession, user_id: int, start_date: date, end_date: date) -> list[ActivityOccurrence]:
        result = await db.execute(
            select(ActivityOccurrence)
            .options(joinedload(ActivityOccurrence.activity))
            .filter(
                ActivityOccurrence.user_id == user_id,
                ActivityOccurrence.date >= start_date,
                ActivityOccurrence.date <= end_date,
                ActivityOccurrence.is_deleted == False
            )
        )
        return result.scalars().all()

    @staticmethod
    async def update_occurrence(db: AsyncSession, occurrence_id: int, occurrence_in: ActivityOccurrenceUpdate, user_id: int) -> ActivityOccurrence:
        result = await db.execute(select(ActivityOccurrence).filter(ActivityOccurrence.id == occurrence_id, ActivityOccurrence.user_id == user_id))
        occ = result.scalars().first()
        
        if not occ:
            raise HTTPException(status_code=404, detail="Occurrence not found")
            
        update_data = occurrence_in.dict(exclude_unset=True)
        
        # Detect time edits for override tracking
        time_edited = ('start_time' in update_data and update_data['start_time'] != occ.start_time) or \
                      ('end_time' in update_data and update_data['end_time'] != occ.end_time)
        if time_edited:
            occ.is_override = True

        if 'status' in update_data:
            if update_data['status'] == 'COMPLETED' and occ.status != 'COMPLETED':
                occ.completed_at = datetime.utcnow()
            elif update_data['status'] != 'COMPLETED' and occ.status == 'COMPLETED':
                occ.completed_at = None

        for field, value in update_data.items():
            setattr(occ, field, value)
            
        await db.commit()
        await db.refresh(occ)
        
        # return with eager load
        res = await db.execute(
            select(ActivityOccurrence).options(joinedload(ActivityOccurrence.activity)).filter(ActivityOccurrence.id == occ.id)
        )
        return res.scalars().first()

    @staticmethod
    async def delete_occurrence(db: AsyncSession, occurrence_id: int, user_id: int):
        # Soft delete
        result = await db.execute(select(ActivityOccurrence).filter(ActivityOccurrence.id == occurrence_id, ActivityOccurrence.user_id == user_id))
        occ = result.scalars().first()
        if not occ:
            raise HTTPException(status_code=404, detail="Occurrence not found")
        occ.is_deleted = True
        await db.commit()
