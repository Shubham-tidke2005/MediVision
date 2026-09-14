from fastapi import APIRouter, Depends

from app.api.dependencies import (
    require_admin,
    require_doctor,
    require_patient,
)
from app.models.user import User


router = APIRouter(
    prefix="/access-test",
    tags=["Authorization Test"],
)


@router.get("/patient")
def patient_access(
    user: User = Depends(
        require_patient
    ),
):
    return {
        "message": "Patient access granted",
        "role": user.role,
    }


@router.get("/doctor")
def doctor_access(
    user: User = Depends(
        require_doctor
    ),
):
    return {
        "message": "Doctor access granted",
        "role": user.role,
    }


@router.get("/admin")
def admin_access(
    user: User = Depends(
        require_admin
    ),
):
    return {
        "message": "Admin access granted",
        "role": user.role,
    }