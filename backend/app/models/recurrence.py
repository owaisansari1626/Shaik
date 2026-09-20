from sqlalchemy import Column, String, DateTime, func, Integer, ForeignKey, Date, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

class RecurrenceRule(Base):
    __tablename__ = "recurrence_rules"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    frequency = Column(String, nullable=False) # DAILY, WEEKLY, WEEKDAYS, WEEKENDS, CUSTOM
    interval = Column(Integer, default=1)      # Every 1 week, every 2 days, etc.
    
    # Store arbitrary days like ["MONDAY", "WEDNESDAY"]
    days_of_week = Column(JSON, nullable=True)
    
    # NEW PHASE 3: Store per-day times mapping
    # Example format: {"0": {"start_time": "18:00:00", "end_time": "19:00:00"}, "2": {...}}
    # 0 = Monday, 6 = Sunday
    custom_times = Column(JSON, nullable=True)
    
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    count = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    activity = relationship("Activity", back_populates="recurrence_rule")
