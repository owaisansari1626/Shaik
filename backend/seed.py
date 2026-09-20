import asyncio
import os
import sys
from datetime import date, time, timedelta, datetime
from passlib.context import CryptContext

# Set up path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import AsyncSessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.category import Category
from app.models.task import Task
from app.models.activity import Activity
from app.models.recurrence import RecurrenceRule
from app.models.occurrence import ActivityOccurrence

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_data():
    # 1. Create tables directly for development
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        print("Database tables created.")

    async with AsyncSessionLocal() as db:
        # Seed User
        user = User(
            name="Owais",
            email="user@example.com",
            password_hash=pwd_context.hash("password")
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        print(f"Created User: {user.email}")

        # Seed Categories
        categories = {
            "Study": Category(name="Study", user_id=user.id, icon="book"),
            "College": Category(name="College", user_id=user.id, icon="graduation-cap"),
            "Gym": Category(name="Gym", user_id=user.id, icon="dumbbell"),
            "Running": Category(name="Running", user_id=user.id, icon="footprints"),
            "Coding": Category(name="Coding", user_id=user.id, icon="code"),
            "Project": Category(name="Project", user_id=user.id, icon="briefcase"),
            "Personal": Category(name="Personal", user_id=user.id, icon="user"),
            "Health": Category(name="Health", user_id=user.id, icon="heart")
        }
        for cat in categories.values():
            db.add(cat)
        await db.commit()
        for cat in categories.values():
            await db.refresh(cat)
        print("Created Categories.")

        # Seed Activities with Recurrence
        today = date.today()
        
        activities_data = [
            ("Morning Routine", categories["Personal"], "ROUTINE", 30, [0, 1, 2, 3, 4, 5, 6], time(8, 0)),
            ("College", categories["College"], "ACADEMIC", 360, [0, 1, 2, 3, 4], time(9, 0)),
            ("Running", categories["Running"], "WORKOUT", 45, [1, 3, 5], time(17, 30)),
            ("Study", categories["Study"], "ACADEMIC", 120, [0, 1, 2, 3, 4, 5, 6], time(19, 0)),
            ("Project Work", categories["Project"], "WORK", 90, [0, 1, 2, 3, 4, 5, 6], time(21, 0)),
        ]

        # Add predefined specific recurring rules and occurrences
        for title, cat, type_, duration, days, start_t in activities_data:
            act = Activity(
                user_id=user.id,
                category_id=cat.id,
                title=title,
                activity_type=type_,
                default_duration_minutes=duration,
                is_recurring=True,
            )
            db.add(act)
            await db.commit()
            await db.refresh(act)
            
            # RecurrenceRule
            rr = RecurrenceRule(
                activity_id=act.id,
                frequency="WEEKLY",
                days_of_week=days,
                start_date=date(today.year, 1, 1)
            )
            db.add(rr)
            
            # Generate dummy occurrences for the surrounding 14 days
            for offset in range(-7, 7):
                d = today + timedelta(days=offset)
                if d.weekday() in days:
                    end_t = (datetime.combine(d, start_t) + timedelta(minutes=duration)).time()
                    occ = ActivityOccurrence(
                        activity_id=act.id,
                        user_id=user.id,
                        date=d,
                        start_time=start_t,
                        end_time=end_t,
                        original_start_time=start_t,
                        original_end_time=end_t,
                    )
                    db.add(occ)
        
        await db.commit()
        print("Created Activities and generated Occurrences.")

        # Seed Tasks
        tasks_data = [
            ("Study Algorithms", categories["Study"], "HIGH", today),
            ("Complete DBMS assignment", categories["College"], "MEDIUM", today + timedelta(days=1)),
            ("Work on Marine Debris API", categories["Project"], "HIGH", today),
            ("Review GitHub repository", categories["Coding"], "LOW", today + timedelta(days=2)),
        ]
        
        for title, cat, priority, due in tasks_data:
            t = Task(
                user_id=user.id,
                category_id=cat.id,
                title=title,
                priority=priority,
                status="PENDING",
                due_date=due
            )
            db.add(t)
            
        await db.commit()
        print("Created Tasks.")
        print("Seed script completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
