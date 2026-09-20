from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from datetime import date, datetime
from app.models.task import Task
from app.models.occurrence import ActivityOccurrence

class AnalyticsService:
    @staticmethod
    async def get_daily_progress(db: AsyncSession, user_id: int, target_date: date) -> dict:
        date_str = target_date.strftime("%Y-%m-%d")
        
        # TASKS
        tasks_res = await db.execute(
            select(Task).filter(
                Task.user_id == user_id,
                Task.due_date == date_str
            )
        )
        tasks = tasks_res.scalars().all()
        
        # Filter out CANCELLED for tasks if applicable (assuming CANCELLED status exists)
        active_tasks = [t for t in tasks if t.status != 'CANCELLED']
        planned_tasks = len(active_tasks)
        completed_tasks = len([t for t in active_tasks if t.status == 'COMPLETED'])
        skipped_tasks = len([t for t in active_tasks if t.status == 'SKIPPED'])
        
        task_completion_pct = round((completed_tasks / planned_tasks * 100)) if planned_tasks > 0 else 0
        
        # ACTIVITIES
        occ_res = await db.execute(
            select(ActivityOccurrence).filter(
                ActivityOccurrence.user_id == user_id,
                ActivityOccurrence.date == target_date,
                ActivityOccurrence.is_deleted == False
            )
        )
        occurrences = occ_res.scalars().all()
        
        active_occs = [o for o in occurrences if o.status != 'CANCELLED']
        planned_occs = len(active_occs)
        completed_occs = len([o for o in active_occs if o.status == 'COMPLETED'])
        skipped_occs = len([o for o in active_occs if o.status == 'SKIPPED'])
        
        occ_completion_pct = round((completed_occs / planned_occs * 100)) if planned_occs > 0 else 0
        
        # TOTAL PROGRESS (combined equally or weighted)
        total_planned = planned_tasks + planned_occs
        total_completed = completed_tasks + completed_occs
        total_pct = round((total_completed / total_planned * 100)) if total_planned > 0 else 0

        return {
            "date": date_str,
            "tasks": {
                "planned": planned_tasks,
                "completed": completed_tasks,
                "skipped": skipped_tasks,
                "completion_percentage": task_completion_pct
            },
            "activities": {
                "planned": planned_occs,
                "completed": completed_occs,
                "skipped": skipped_occs,
                "completion_percentage": occ_completion_pct
            },
            "total": {
                "planned": total_planned,
                "completed": total_completed,
                "completion_percentage": total_pct
            }
        }

    @staticmethod
    async def get_weekly_overview(db: AsyncSession, user_id: int, start_date: date, end_date: date) -> list:
        # Simplistic approach: query each day in range
        overview = []
        import datetime as dt
        current_date = start_date
        while current_date <= end_date:
            prog = await AnalyticsService.get_daily_progress(db, user_id, current_date)
            overview.append(prog)
            current_date += dt.timedelta(days=1)
            
        return overview
