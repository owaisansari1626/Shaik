from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_
from typing import Any, List
from datetime import date, timedelta
import calendar as pycalendar

from app.db.database import get_db
from app.models.user import User
from app.models.task import Task
from app.models.occurrence import ActivityOccurrence
from app.schemas.activity import ActivityOccurrence as ActivityOccurrenceSchema
from app.core.dependencies import get_current_user
from app.core.responses import SuccessResponse

router = APIRouter()

# Note: In a real recurrence engine, this route would dynamically generate 
# non-materialized ActivityOccurrences from Activity + RecurrenceRules 
# if they don't exist yet for the given range, but for phase 1 we just query 
# existing items or return empty arrays. We will use dummy generation in seed.py.

@router.get("/day", response_model=SuccessResponse[dict])
async def get_day_calendar(
    date: date = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Get occurrences
    occ_query = await db.execute(
        select(ActivityOccurrence).filter(
            ActivityOccurrence.user_id == current_user.id,
            ActivityOccurrence.date == date,
            ActivityOccurrence.is_deleted == False
        )
    )
    occurrences = occ_query.scalars().all()

    # 2. Get tasks due on this date
    tasks_query = await db.execute(
        select(Task).filter(
            Task.user_id == current_user.id,
            Task.due_date == date
        )
    )
    tasks = tasks_query.scalars().all()
    
    return SuccessResponse(data={"occurrences": occurrences, "tasks": tasks}, message="Day schedule retrieved")

@router.get("/week", response_model=SuccessResponse[dict])
async def get_week_calendar(
    start_date: date = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    end_date = start_date + timedelta(days=6)
    
    occ_query = await db.execute(
        select(ActivityOccurrence).filter(
            ActivityOccurrence.user_id == current_user.id,
            ActivityOccurrence.date >= start_date,
            ActivityOccurrence.date <= end_date,
            ActivityOccurrence.is_deleted == False
        )
    )
    occurrences = occ_query.scalars().all()
    
    return SuccessResponse(data={"occurrences": occurrences}, message="Week schedule retrieved")

@router.get("/month", response_model=SuccessResponse[dict])
async def get_month_calendar(
    year: int = Query(...),
    month: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    _, last_day = pycalendar.monthrange(year, month)
    start_date = date(year, month, 1)
    end_date = date(year, month, last_day)
    
    occ_query = await db.execute(
        select(ActivityOccurrence).filter(
            ActivityOccurrence.user_id == current_user.id,
            ActivityOccurrence.date >= start_date,
            ActivityOccurrence.date <= end_date,
            ActivityOccurrence.is_deleted == False
        )
    )
    occurrences = occ_query.scalars().all()
    
    return SuccessResponse(data={"occurrences": occurrences}, message="Month schedule retrieved")
