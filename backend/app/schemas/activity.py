from pydantic import BaseModel
from datetime import datetime, date, time
from typing import Optional, List

class RecurrenceRuleBase(BaseModel):
    frequency: str # DAILY, WEEKLY, WEEKDAYS, WEEKENDS, CUSTOM
    interval: Optional[int] = 1
    days_of_week: Optional[List[str]] = None
    start_date: date
    end_date: Optional[date] = None
    count: Optional[int] = None

class RecurrenceRuleCreate(RecurrenceRuleBase):
    pass

class RecurrenceRule(RecurrenceRuleBase):
    id: int
    activity_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ActivityBase(BaseModel):
    title: str
    description: Optional[str] = None
    activity_type: Optional[str] = "ROUTINE"
    default_duration_minutes: Optional[int] = 60
    is_recurring: Optional[bool] = False
    category_id: Optional[int] = None

class ActivityCreate(ActivityBase):
    recurrence_rule: Optional[RecurrenceRuleCreate] = None
    # For a completely new recurring activity

class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    activity_type: Optional[str] = None
    category_id: Optional[int] = None
    default_duration_minutes: Optional[int] = None

class Activity(ActivityBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    recurrence_rule: Optional[RecurrenceRule] = None

    class Config:
        from_attributes = True

class ActivityOccurrenceBase(BaseModel):
    date: date
    start_time: time
    end_time: time
    status: Optional[str] = "SCHEDULED"
    notes: Optional[str] = None
    is_override: Optional[bool] = False
    is_deleted: Optional[bool] = False

class ActivityOccurrenceCreate(ActivityOccurrenceBase):
    activity_id: int

class ActivityOccurrenceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_deleted: Optional[bool] = None

class ActivityOccurrence(ActivityOccurrenceBase):
    id: int
    activity_id: int
    user_id: int
    original_start_time: Optional[time] = None
    original_end_time: Optional[time] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
