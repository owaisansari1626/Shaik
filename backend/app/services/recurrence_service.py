from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_
import datetime
from typing import List, Dict, Any

from app.models.recurrence import RecurrenceRule
from app.models.occurrence import ActivityOccurrence

class RecurrenceService:
    @staticmethod
    async def materialize_occurrences(db: AsyncSession, user_id: int, start_date: datetime.date, end_date: datetime.date):
        """
        Lazy materialization:
        Finds all recurrence rules that overlap with the requested [start_date, end_date].
        Generates the expected dates based on rule frequency and limits.
        If an expected occurrence does not exist in the database, it creates it.
        """
        # Fetch all recurrence rules for this user that overlap the date range
        # Overlap condition: rule.start_date <= end_date AND (rule.end_date >= start_date OR rule.end_date IS NULL)
        stmt = select(RecurrenceRule).join(RecurrenceRule.activity).filter(
            RecurrenceRule.activity.has(user_id=user_id),
            RecurrenceRule.start_date <= end_date,
            or_(RecurrenceRule.end_date >= start_date, RecurrenceRule.end_date.is_(None))
        )
        rules_res = await db.execute(stmt)
        rules = rules_res.scalars().all()

        if not rules:
            return

        # Fetch existing occurrences in this range for this user
        occ_stmt = select(ActivityOccurrence).filter(
            ActivityOccurrence.user_id == user_id,
            ActivityOccurrence.date >= start_date,
            ActivityOccurrence.date <= end_date
        )
        existing_res = await db.execute(occ_stmt)
        existing = existing_res.scalars().all()

        # Map existing by (activity_id, date) to quickly avoid duplicates
        existing_map = {(o.activity_id, o.date): o for o in existing}
        
        new_occurrences = []

        for rule in rules:
            # We need to figure out which dates this rule should trigger within the [start_date, end_date] bounds
            bounds_start = max(start_date, rule.start_date)
            bounds_end = min(end_date, rule.end_date) if rule.end_date else end_date
            
            # Simple simulation of date generation
            curr = bounds_start
            while curr <= bounds_end:
                generate = False
                day_of_week = curr.weekday() # 0 = Monday, 6 = Sunday
                start_t = datetime.time(9, 0) # Fallback 
                end_t = datetime.time(10, 0)
                
                if rule.frequency == "DAILY":
                    generate = True
                elif rule.frequency == "WEEKDAYS" and day_of_week < 5:
                    generate = True
                elif rule.frequency == "WEEKENDS" and day_of_week >= 5:
                    generate = True
                elif rule.frequency == "WEEKLY":
                    # If it's weekly and no specific days, assume it repeats on the exact weekday of start_date
                    if rule.days_of_week is None and curr.weekday() == rule.start_date.weekday():
                        generate = True
                
                # Check custom specific days
                if rule.days_of_week and isinstance(rule.days_of_week, list):
                    if day_of_week in rule.days_of_week:
                        generate = True
                        
                # Check custom_times for per-day time overrides (Phase 3 requirements)
                if generate and rule.custom_times and isinstance(rule.custom_times, dict):
                    day_key = str(day_of_week)
                    if day_key in rule.custom_times:
                        t_data = rule.custom_times[day_key]
                        start_h, start_m = map(int, t_data.get('start_time', '09:00:00').split(':')[:2])
                        end_h, end_m = map(int, t_data.get('end_time', '10:00:00').split(':')[:2])
                        start_t = datetime.time(start_h, start_m)
                        end_t = datetime.time(end_h, end_m)
                    
                if generate:
                    if (rule.activity_id, curr) not in existing_map:
                        occ_data = {
                            "activity_id": rule.activity_id,
                            "user_id": user_id,
                            "date": curr,
                            "start_time": start_t,
                            "end_time": end_t,
                            "original_start_time": start_t,
                            "original_end_time": end_t,
                            "status": "SCHEDULED",
                            "is_override": False,
                            "is_deleted": False
                        }
                        new_occ = ActivityOccurrence(**occ_data)  # type: ignore
                        new_occurrences.append(new_occ)

                curr += datetime.timedelta(days=1)
                
        if new_occurrences:
            db.add_all(new_occurrences)
            await db.commit()

    @staticmethod
    async def split_recurrence(db: AsyncSession, user_id: int, occurrence_id: int, new_start_time: str, new_end_time: str):
        occ = await db.scalar(select(ActivityOccurrence).filter_by(id=occurrence_id, user_id=user_id))
        if not occ:
            return None
        
        # Assume activity and rule exist physically (needs lazy loading or joins, we use joins)
        from app.models.activity import Activity
        rule = await db.scalar(select(RecurrenceRule).filter_by(activity_id=occ.activity_id))
        activity = await db.scalar(select(Activity).filter_by(id=occ.activity_id))
        
        if not rule or not activity:
            return None
            
        # End old rule just before this occ date
        rule.end_date = occ.date - datetime.timedelta(days=1)
        
        # Create new activity and rule
        act_data = {
            "user_id": user_id,
            "title": activity.title,
            "description": activity.description,
            "category_id": activity.category_id,
            "activity_type": activity.activity_type,
            "default_duration_minutes": activity.default_duration_minutes,
            "is_recurring": True,
            "icon": activity.icon
        }
        new_act = Activity(**act_data)  # type: ignore
        db.add(new_act)
        await db.flush() # get new_act.id
        
        # Deep copy custom times, modify the time for this day of week
        import copy
        new_times = copy.deepcopy(rule.custom_times) if rule.custom_times else {}
        day_str = str(occ.date.weekday())
        
        new_times[day_str] = {
            "start_time": new_start_time,
            "end_time": new_end_time
        }
        
        rule_data = {
            "activity_id": new_act.id,
            "frequency": rule.frequency,
            "interval": rule.interval,
            "days_of_week": rule.days_of_week,
            "custom_times": new_times,
            "start_date": occ.date,
            "end_date": None
        }
        new_rule = RecurrenceRule(**rule_data)  # type: ignore
        db.add(new_rule)
        
        # Delete future untouched occurrences of the old rule so the new rule regenerates them
        # We must keep anything that is COMPLETED, CANCELLED, or is_override == True if the user wants historical accuracy,
        # but since we're splitting, all future standard things just get wiped and rebuilt by the lazy generator
        future_occ = await db.execute(select(ActivityOccurrence).filter(
            ActivityOccurrence.activity_id == activity.id,
            ActivityOccurrence.date >= occ.date,
            ActivityOccurrence.is_override == False,
            ActivityOccurrence.status == "SCHEDULED"
        ))
        for f_occ in future_occ.scalars().all():
            await db.delete(f_occ)
            
        await db.commit()
        return new_act

    @staticmethod
    async def resync_entire_series(db: AsyncSession, user_id: int, activity_id: int, from_date: datetime.date = None):
        if not from_date:
            from_date = datetime.date.today()
            
        # Delete future untouched occurrences of this activity so changes are reflected
        # We must keep completed and overridden ones intact!
        stmt = select(ActivityOccurrence).filter(
            ActivityOccurrence.activity_id == activity_id,
            ActivityOccurrence.user_id == user_id,
            ActivityOccurrence.date >= from_date,
            ActivityOccurrence.is_override == False,
            ActivityOccurrence.status == "SCHEDULED"
        )
        res = await db.execute(stmt)
        for occ in res.scalars().all():
            await db.delete(occ)
        await db.commit()
