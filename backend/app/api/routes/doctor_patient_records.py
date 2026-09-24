import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import require_verified_doctor
from app.core.database import get_db
from app.schemas.doctor_patient_records import (
    DoctorPatientDirectoryResponse,
    DoctorPatientRecordResponse,
)
from app.services.doctor_patient_records import (
    get_authorized_patient_record,
    list_authorized_patients,
)


router = APIRouter(
    prefix="/api/v1/doctor/patient-records",
    tags=["Doctor Patient Records"],
)


@router.get("", response_model=DoctorPatientDirectoryResponse)
def authorized_patient_directory(
    search: str | None = Query(default=None, max_length=120),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    doctor=Depends(require_verified_doctor),
):
    return list_authorized_patients(
        db,
        doctor=doctor,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.get("/{patient_id}", response_model=DoctorPatientRecordResponse)
def authorized_patient_record(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    doctor=Depends(require_verified_doctor),
):
    return get_authorized_patient_record(
        db,
        doctor=doctor,
        patient_id=patient_id,
    )
