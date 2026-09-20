from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List
from datetime import date
from pydantic import BaseModel

from app.db.database import get_db
from app.models.user import User
from app.schemas.activity import ActivityOccurrenceCreate, ActivityOccurrenceUpdate, ActivityOccurrence as ActivityOccurrenceSchema
from app.core.dependencies import get_current_user
from app.core.responses import SuccessResponse, ErrorResponse
from app.services.schedule_service import ScheduleService
from app.services.recurrence_service import RecurrenceService

router = APIRouter()

@router.post("", response_model=SuccessResponse[ActivityOccurrenceSchema])
async def create_occurrence(
    occurrence_in: ActivityOccurrenceCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    occ = await ScheduleService.create_occurrence(db, occurrence_in, current_user.id)
    return SuccessResponse(data=occ, message="Schedule block created")

@router.get("", response_model=SuccessResponse[List[ActivityOccurrenceSchema]])
async def read_occurrences(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    occurrences = await ScheduleService.get_occurrences(db, current_user.id, start_date, end_date)
    return SuccessResponse(data=occurrences, message="Schedule retrieved")

@router.patch("/{id}", response_model=SuccessResponse[ActivityOccurrenceSchema])
async def update_occurrence(
    id: int,
    occurrence_in: ActivityOccurrenceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    occ = await ScheduleService.update_occurrence(db, id, occurrence_in, current_user.id)
    return SuccessResponse(data=occ, message="Schedule block updated")

@router.delete("/{occurrence_id}", response_model=SuccessResponse)
async def delete_occurrence(
    occurrence_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    success = await ScheduleService.delete_occurrence(db, occurrence_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Occurrence not found")
    return SuccessResponse(message="Occurrence deleted successfully")

class SplitRequest(BaseModel):
    start_time: str
    end_time: str

@router.post("/{occurrence_id}/split", response_model=SuccessResponse)
async def split_recurrence_occurrence(
    occurrence_id: int,
    request: SplitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Handles 'Change this and future' by splitting the RecurrenceRule"""
    res = await RecurrenceService.split_recurrence(db, current_user.id, occurrence_id, request.start_time, request.end_time)
    if not res:
        raise HTTPException(status_code=400, detail="Unable to split recurrence for this rule")
    return SuccessResponse(message="Recurrence split successfully")

@router.post("/{occurrence_id}/override", response_model=SuccessResponse)
async def override_occurrence(
    occurrence_id: int,
    request: ActivityOccurrenceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Handles 'Change this occurrence' by setting is_override=True safely on target occurrence"""
    request.is_override = True
    occ = await ScheduleService.update_occurrence(db, occurrence_id, request, current_user.id)
    return SuccessResponse(data=occ, message="Override applied successfully")
