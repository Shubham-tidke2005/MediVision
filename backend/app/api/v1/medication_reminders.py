import uuid

from datetime import (
    date,
    datetime,
)

from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_patient,
)

from app.core.database import (
    get_db,
)

from app.models.patient import (
    Patient,
)

from app.schemas.medication_reminder import (
    AdherenceSummaryResponse,
    DoseStatusUpdate,
    ManualMedicationCreate,
    MedicationDoseResponse,
    MedicationResponse,
    MedicationScheduleCreate,
    MedicationScheduleResponse,
)

from app.services.medication_reminder import (
    calculate_adherence,
    create_manual_medication,
    create_schedule,
    get_patient_doses_for_date,
    get_patient_medications,
    update_dose_status,
)


router = APIRouter(
    prefix="/patients/me/medications",
    tags=["Medication Reminders"],
)


# =========================================================
# MEDICATIONS
# =========================================================


@router.get(
    "",
    response_model=list[
        MedicationResponse
    ],
)
def list_medications(
    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_patient_medications(
        db,
        patient,
    )


@router.post(
    "/manual",
    response_model=MedicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_manual_medication(
    payload: ManualMedicationCreate,

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return create_manual_medication(
        db,
        patient,
        payload,
    )


# =========================================================
# SCHEDULE
# =========================================================


@router.post(
    "/{medication_id}/schedules",
    response_model=MedicationScheduleResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_schedule(
    medication_id: uuid.UUID,

    payload: MedicationScheduleCreate,

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return create_schedule(
        db,
        patient,
        medication_id,
        payload,
    )


# =========================================================
# DAILY DOSES
# =========================================================


@router.get(
    "/doses",
    response_model=list[
        MedicationDoseResponse
    ],
)
def list_doses(
    target_date: date = Query(
        default_factory=date.today
    ),

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_patient_doses_for_date(
        db,
        patient,
        target_date,
    )


# =========================================================
# RECORD STATUS
# =========================================================


@router.put(
    "/schedules/{schedule_id}/dose",
)
def record_dose_status(
    schedule_id: uuid.UUID,

    scheduled_for: datetime,

    payload: DoseStatusUpdate,

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return update_dose_status(
        db,
        patient,
        schedule_id,
        scheduled_for,
        payload.status,
        payload.notes,
    )


# =========================================================
# ADHERENCE
# =========================================================


@router.get(
    "/adherence",
    response_model=AdherenceSummaryResponse,
)
def adherence_summary(
    days: int = Query(
        default=30,
        ge=1,
        le=365,
    ),

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return calculate_adherence(
        db,
        patient,
        days,
    )