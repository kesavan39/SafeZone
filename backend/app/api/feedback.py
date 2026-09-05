from fastapi import APIRouter
from typing import List, Dict, Any
from app.core.supabase import db
from app.schemas.domain import FeedbackCreate

router = APIRouter(prefix="/api/feedback", tags=["User Validation & Feedback"])

@router.get("", response_model=List[Dict[str, Any]])
def get_all_feedback():
    return db.get_all("user_feedback")

@router.post("", response_model=Dict[str, Any])
def submit_feedback(fb: FeedbackCreate):
    return db.insert("user_feedback", fb.model_dump())
