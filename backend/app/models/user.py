from sqlalchemy import Column, String, DateTime, func, Integer
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    
    # Preferences
    timezone = Column(String, default="UTC")
    week_start = Column(Integer, default=0) # 0 = Monday, 6 = Sunday
    time_format = Column(String, default="24h") # 12h or 24h

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    categories = relationship("Category", back_populates="owner", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="owner", cascade="all, delete-orphan")
    occurrences = relationship("ActivityOccurrence", back_populates="owner", cascade="all, delete-orphan")
    workouts = relationship("WorkoutSession", back_populates="user", cascade="all, delete-orphan")
    exercises = relationship("Exercise", back_populates="user", cascade="all, delete-orphan")
    workout_templates = relationship("WorkoutTemplate", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
