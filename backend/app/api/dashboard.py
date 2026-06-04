from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.schemas.question import DashboardStats
from app.services import question_service
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(tags=["Dashboard"])

@router.get("/dashboard-stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return question_service.get_dashboard_stats(db)
