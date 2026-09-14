from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db


router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("")
def health_check():
    return {
        "status": "ok",
        "service": "MediVision AI API",
    }


@router.get("/database")
def database_health(db: Session = Depends(get_db)):
    database_name = db.execute(
        text("SELECT current_database()")
    ).scalar_one()

    return {
        "status": "ok",
        "database": database_name,
    }