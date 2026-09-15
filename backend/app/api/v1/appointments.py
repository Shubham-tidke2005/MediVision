import uuid

from fastapi import (
    APIRouter,
    Depends,
    status,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_patient,
    require_verified_doctor,
)

from app.core.database import (
    get_db,
)

from app.models.doctor import Doctor
from app.models.patient import Patient

from app.schemas.appointment import (
    AppointmentActionRequest,
    AppointmentRequestCreate,
    AppointmentResponse,
)

from app.services.appointment import (
    approve_appointment,
    cancel_patient_appointment,
    complete_appointment,
    get_doctor_appointments,
    get_patient_appointments,
    mark_no_show,
    reject_appointment,
    request_appointment,
)


router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"],
)


# ======================================================
# PATIENT
# ======================================================


@router.post(
    "",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_appointment_request(
    payload: AppointmentRequestCreate,

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return request_appointment(
        db,
        patient,
        payload,
    )


@router.get(
    "/patient",
    response_model=list[
        AppointmentResponse
    ],
)
def patient_appointments(
    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_patient_appointments(
        db,
        patient,
    )


@router.patch(
    "/{appointment_id}/cancel",
    response_model=AppointmentResponse,
)
def cancel_appointment(
    appointment_id: uuid.UUID,

    payload: AppointmentActionRequest,

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return cancel_patient_appointment(
        db,
        patient,
        appointment_id,
        payload.reason,
    )


# ======================================================
# DOCTOR
# ======================================================


@router.get(
    "/doctor",
    response_model=list[
        AppointmentResponse
    ],
)
def doctor_appointments(
    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_doctor_appointments(
        db,
        doctor,
    )


@router.patch(
    "/{appointment_id}/approve",
    response_model=AppointmentResponse,
)
def approve(
    appointment_id: uuid.UUID,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return approve_appointment(
        db,
        doctor,
        appointment_id,
    )


@router.patch(
    "/{appointment_id}/reject",
    response_model=AppointmentResponse,
)
def reject(
    appointment_id: uuid.UUID,

    payload: AppointmentActionRequest,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return reject_appointment(
        db,
        doctor,
        appointment_id,
        payload.reason,
    )


@router.patch(
    "/{appointment_id}/complete",
    response_model=AppointmentResponse,
)
def complete(
    appointment_id: uuid.UUID,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return complete_appointment(
        db,
        doctor,
        appointment_id,
    )


@router.patch(
    "/{appointment_id}/no-show",
    response_model=AppointmentResponse,
)
def no_show(
    appointment_id: uuid.UUID,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return mark_no_show(
        db,
        doctor,
        appointment_id,
    )