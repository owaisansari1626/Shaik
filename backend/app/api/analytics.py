from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
from datetime import date

from app.db.database import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.core.responses import SuccessResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/daily", response_model=SuccessResponse)
async def get_daily_progress(
    date: date = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    progress = await AnalyticsService.get_daily_progress(db, current_user.id, date)
    return SuccessResponse(data=progress, message="Daily progress retrieved")

@router.get("/weekly", response_model=SuccessResponse)
async def get_weekly_overview(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    overview = await AnalyticsService.get_weekly_overview(db, current_user.id, start_date, end_date)
    return SuccessResponse(data=overview, message="Weekly overview retrieved")
