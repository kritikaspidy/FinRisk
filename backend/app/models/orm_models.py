# app/models/orm_models.py

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(255), unique=True, index=True, nullable=False)
    password   = Column(String(255), nullable=False)          # bcrypt hash
    role       = Column(String(20), nullable=False, default="user")  # "user" | "admin"
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="user")


class Application(Base):
    __tablename__ = "applications"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Raw inputs stored for audit / explainability
    income             = Column(Float, nullable=False)
    debt               = Column(Float, nullable=False)
    credit_utilization = Column(Float, nullable=False)
    past_default       = Column(Integer, nullable=False)   # 0 or 1

    # Computed outputs
    dti                    = Column(Float)
    probability_of_default = Column(Float)
    credit_score           = Column(Integer)
    risk                   = Column(String(10))    # Low | Medium | High
    decision               = Column(String(10))    # Approve | Review | Reject
    reasons                = Column(Text)          # JSON-encoded list

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="applications")
