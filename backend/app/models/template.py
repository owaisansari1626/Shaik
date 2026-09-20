from sqlalchemy import Column, String, DateTime, func, Integer, ForeignKey, Time
from sqlalchemy.orm import relationship
from app.db.base import Base

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    owner = relationship("User")
    activities = relationship("TemplateActivity", back_populates="template", cascade="all, delete")

class TemplateActivity(Base):
    __tablename__ = "template_activities"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String, nullable=False)
    activity_type = Column(String, default="GENERAL")
    
    # 0 = Monday, 6 = Sunday
    day_of_week = Column(Integer, nullable=False)
    
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Relationships
    template = relationship("Template", back_populates="activities")
    category = relationship("Category")
