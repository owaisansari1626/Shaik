from sqlalchemy import Column, String, DateTime, func, Integer, ForeignKey, Boolean, Date, Time
from sqlalchemy.orm import relationship
from app.db.base import Base

class ActivityOccurrence(Base):
    __tablename__ = "activity_occurrences"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    
    status = Column(String, default="SCHEDULED") # SCHEDULED, COMPLETED, CANCELLED, MISSED
    notes = Column(String, nullable=True)

    original_start_time = Column(Time, nullable=True)
    original_end_time = Column(Time, nullable=True)

    is_override = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    activity = relationship("Activity", back_populates="occurrences")
    owner = relationship("User", back_populates="occurrences")
    workout_session = relationship("WorkoutSession", back_populates="occurrence", uselist=False, cascade="all, delete-orphan")
