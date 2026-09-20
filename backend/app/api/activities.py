from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Any, List

from app.db.database import get_db
from app.models.user import User
from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityUpdate, Activity as ActivitySchema, RecurrenceRuleCreate
from app.core.dependencies import get_current_user
from app.core.responses import SuccessResponse
from app.models.recurrence import RecurrenceRule

from app.services.activity_service import ActivityService
from app.services.recurrence_service import RecurrenceService

router = APIRouter()

@router.post("", response_model=SuccessResponse[ActivitySchema])
async def create_activity(
    activity_in: ActivityCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    activity = await ActivityService.create_activity(db, activity_in, current_user.id)
    return SuccessResponse(data=activity, message="Activity created")

@router.get("", response_model=SuccessResponse[List[ActivitySchema]])
async def read_activities(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    activities = await ActivityService.get_activities(db, current_user.id)
    return SuccessResponse(data=activities, message="Activities retrieved")


@router.get("/{id}", response_model=SuccessResponse[ActivitySchema])
async def read_activity(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    activity = await ActivityService.get_activity(db, id, current_user.id)
    return SuccessResponse(data=activity, message="Activity retrieved")

@router.patch("/{activity_id}", response_model=SuccessResponse[ActivitySchema])
async def update_activity(
    activity_id: int, 
    activity_in: ActivityUpdate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
) -> Any:
    updated = await ActivityService.update_activity(db, activity_id, activity_in, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    # If the activity was updated, and it belongs to the user, we resync the series cleanly
    await RecurrenceService.resync_entire_series(db, current_user.id, activity_id)
    
    return updated

@router.delete("/{id}", response_model=SuccessResponse)
async def delete_activity(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    await ActivityService.delete_activity(db, id, current_user.id)
    return SuccessResponse(message="Activity deleted")
