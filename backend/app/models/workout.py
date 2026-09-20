from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, Date, Time, Enum, Float, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum
from datetime import datetime

class WorkoutType(str, enum.Enum):
    GYM = "GYM"
    RUNNING = "RUNNING"
    WALKING = "WALKING"
    CYCLING = "CYCLING"
    SPORT = "SPORT"
    OTHER = "OTHER"

class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_occurrence_id = Column(Integer, ForeignKey("activity_occurrences.id"), nullable=True)
    
    workout_type = Column(Enum(WorkoutType), nullable=False, default=WorkoutType.GYM)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    # Running specific fields (nullable)
    distance_km = Column(Float, nullable=True)
    pace = Column(Float, nullable=True) # minutes per km
    calories = Column(Integer, nullable=True)
    
    notes = Column(String, nullable=True)
    status = Column(String, default="COMPLETED") # PLANNED, COMPLETED
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="workouts")
    occurrence = relationship("ActivityOccurrence", back_populates="workout_session")
    exercises = relationship("WorkoutExercise", back_populates="session", cascade="all, delete-orphan")
