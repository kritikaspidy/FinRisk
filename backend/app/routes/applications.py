# app/routes/applications.py

import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.orm_models import Application, User
from app.models.ml_model import predict_risk
from app.schemas.user_schema import UserData, ApplicationResponse
from app.services.riskcalculator import calculate_dti
from app.services.decisionengine import evaluate_decision
from app.utils.deps import get_current_user, require_admin

router = APIRouter(tags=["Applications"])


# ── POST /predict — authenticated users submit a loan application ─────────────
@router.post("/predict", response_model=ApplicationResponse)
def predict(
    user_data: UserData,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dti         = calculate_dti(user_data.income, user_data.debt)
    probability = float(predict_risk(user_data.dict()))
    result      = evaluate_decision(probability, dti, user_data.past_default)

    # Persist to DB
    app_record = Application(
        user_id            = current_user["user_id"],
        income             = user_data.income,
        debt               = user_data.debt,
        credit_utilization = user_data.credit_utilization,
        past_default       = user_data.past_default,
        dti                = dti,
        probability_of_default = probability,
        credit_score       = result["credit_score"],
        risk               = result["risk"],
        decision           = result["decision"],
        reasons            = json.dumps(result["reasons"]),
    )
    db.add(app_record)
    db.commit()
    db.refresh(app_record)

    # Attach decoded reasons list for the response
    app_record.reasons = result["reasons"]
    return app_record


# ── GET /my-applications — user sees only their own applications ──────────────
@router.get("/my-applications", response_model=List[ApplicationResponse])
def my_applications(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(Application)
        .filter(Application.user_id == current_user["user_id"])
        .order_by(Application.created_at.desc())
        .all()
    )
    for r in records:
        r.reasons = json.loads(r.reasons or "[]")
    return records


# ── GET /applications — admin sees all applications ───────────────────────────
@router.get("/applications", response_model=List[ApplicationResponse])
def all_applications(
    risk: str = None,       # optional filter: Low | Medium | High
    decision: str = None,   # optional filter: Approve | Review | Reject
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Application).order_by(Application.created_at.desc())
    if risk:
        query = query.filter(Application.risk == risk)
    if decision:
        query = query.filter(Application.decision == decision)

    records = query.all()
    for r in records:
        r.reasons = json.loads(r.reasons or "[]")
    return records


# ── GET /applications/{id} — admin fetches a single application ───────────────
@router.get("/applications/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    record = db.query(Application).filter(Application.id == app_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    record.reasons = json.loads(record.reasons or "[]")
    return record


# ── PATCH /applications/{id}/override — admin overrides a decision ────────────
@router.patch("/applications/{app_id}/override")
def override_decision(
    app_id: int,
    body: dict,             # expects {"decision": "Approve" | "Reject"}
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    record = db.query(Application).filter(Application.id == app_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    new_decision = body.get("decision")
    if new_decision not in ("Approve", "Reject", "Review"):
        raise HTTPException(status_code=400, detail="decision must be Approve, Reject, or Review")

    record.decision = new_decision
    db.commit()
    return {"msg": f"Decision updated to {new_decision}", "app_id": app_id}
