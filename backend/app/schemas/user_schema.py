from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime


class SignupRequest(BaseModel):
    name:     str = Field(..., min_length=2, max_length=100)
    email:    EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"


class UserData(BaseModel):
    income:             float = Field(..., gt=0)
    debt:               float = Field(..., ge=0)
    credit_utilization: float = Field(..., ge=0, le=100)
    past_default:       int   = Field(..., ge=0, le=1)
    employment_years: float = Field(..., ge=0)
    num_loans: int = Field(..., ge=0)
    late_payments: int = Field(..., ge=0)


class ApplicationResponse(BaseModel):
    id:                     int
    income:                 float
    debt:                   float
    credit_utilization:     float
    past_default:           int
    dti:                    Optional[float]
    probability_of_default: Optional[float]
    credit_score:           Optional[int]
    risk:                   Optional[str]
    decision:               Optional[str]
    reasons:                Optional[List[str]]
    created_at:             datetime

    class Config:
        from_attributes = True
