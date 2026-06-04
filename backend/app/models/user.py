from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="employee")  # admin, manager, employee
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    created_questions = relationship("Question", back_populates="creator", foreign_keys="[Question.created_by]")
    assigned_questions = relationship("Question", back_populates="assignee", foreign_keys="[Question.assigned_to]")
    comments = relationship("Comment", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
