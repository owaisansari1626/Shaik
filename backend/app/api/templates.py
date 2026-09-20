from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List
from sqlalchemy.future import select
from datetime import datetime, date, timedelta

from app.db.database import get_db
from app.models.user import User
from app.models.template import Template, TemplateActivity
from app.models.activity import Activity
from app.models.recurrence import RecurrenceRule
from app.core.dependencies import get_current_user
from app.core.responses import SuccessResponse

router = APIRouter()

@router.get("/", response_model=SuccessResponse)
async def get_templates(
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
) -> Any:
    stmt = select(Template).filter(Template.user_id == current_user.id)
    res = await db.execute(stmt)
    templates = res.scalars().all()
    # Eager loading template.activities would be better, but we return simplified for now
    return SuccessResponse(data=templates, message="Templates retrieved")

@router.post("/", response_model=SuccessResponse)
async def create_template(
    name: str,
    description: str = None,
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
) -> Any:
    temp = Template(user_id=current_user.id, name=name, description=description)
    db.add(temp)
    await db.commit()
    await db.refresh(temp)
    return SuccessResponse(data=temp, message="Template created")

@router.post("/{template_id}/apply", response_model=SuccessResponse)
async def apply_template(
    template_id: int,
    apply_date: date,
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Fetch Template and its activities
    from sqlalchemy.orm import selectinload
    stmt = select(Template).options(selectinload(Template.activities)).filter_by(id=template_id, user_id=current_user.id)
    template = await db.scalar(stmt)
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    """
    Applies the template starting on the apply_date by converting template activities to real activities.
    This safely provisions them into the database without touching historical records.
    """
    # 2. Iterate each TemplateActivity and create a real recurrent activity rule for it
    day_diff = apply_date.weekday() # The start day of the week applied (e.g. 0 for Mon)
    # Actually, apply template creates one-off or recurring? The prompt says: "Applying a template should create scheduled occurrences."
    # The simplest architecture is creating a RecurrenceRule for each.
    
    created_count = 0
    for ta in template.activities:
        # Create an Activity
        new_act = Activity(
            user_id=current_user.id,
            title=ta.title,
            category_id=ta.category_id,
            activity_type=ta.activity_type,
            is_recurring=True
        )
        db.add(new_act)
        await db.flush() # get id
        
        # Apply the recurrence mapped strictly to that day
        new_times = {str(ta.day_of_week): {"start_time": str(ta.start_time), "end_time": str(ta.end_time)}}
        new_rule = RecurrenceRule(
            activity_id=new_act.id,
            frequency="WEEKLY",
            days_of_week=[ta.day_of_week],
            custom_times=new_times,
            start_date=apply_date
        )
        db.add(new_rule)
        created_count += 1
        
    await db.commit()
    
    return SuccessResponse(message=f"Applied template, created {created_count} activities.")
