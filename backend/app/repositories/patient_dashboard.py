import uuid
from datetime import datetime

from sqlalchemy import (
    func,
    select,
)

from sqlalchemy.orm import Session

from app.models.appointment import Appointment

from app.models.availability import (
    DoctorSlot,
)

from app.models.doctor import Doctor

from app.models.enums import (
    AppointmentStatus,
    DoctorVerificationStatus,
)


def get_appointment_status_counts(
    db: Session,
    patient_id: uuid.UUID,
):
    rows = db.execute(
        select(
            Appointment.status,
            func.count(
                Appointment.id
            ),
        )
        .where(
            Appointment.patient_id
            == patient_id
        )
        .group_by(
            Appointment.status
        )
    ).all()

    return {
        status: count
        for status, count in rows
    }


def count_pending_requests(
    db: Session,
    patient_id: uuid.UUID,
):
    value = db.scalar(
        select(
            func.count(
                Appointment.id
            )
        )
        .where(
            Appointment.patient_id
            == patient_id,

            Appointment.status
            == AppointmentStatus.REQUESTED,
        )
    )

    return value or 0


def count_upcoming_approved(
    db: Session,
    patient_id: uuid.UUID,
    now: datetime,
):
    value = db.scalar(
        select(
            func.count(
                Appointment.id
            )
        )
        .join(
            DoctorSlot,
            DoctorSlot.id
            == Appointment.slot_id,
        )
        .where(
            Appointment.patient_id
            == patient_id,

            Appointment.status
            == AppointmentStatus.APPROVED,

            DoctorSlot.start_at
            >= now,
        )
    )

    return value or 0


def count_completed_appointments(
    db: Session,
    patient_id: uuid.UUID,
):
    value = db.scalar(
        select(
            func.count(
                Appointment.id
            )
        )
        .where(
            Appointment.patient_id
            == patient_id,

            Appointment.status
            == AppointmentStatus.COMPLETED,
        )
    )

    return value or 0


def count_available_doctors(
    db: Session,
):
    value = db.scalar(
        select(
            func.count(
                Doctor.id
            )
        )
        .where(
            Doctor.verification_status
            == DoctorVerificationStatus.VERIFIED,

            Doctor.is_active.is_(True),

            Doctor.is_accepting_patients.is_(True),
        )
    )

    return value or 0


def get_upcoming_appointments(
    db: Session,
    patient_id: uuid.UUID,
    now: datetime,
    limit: int = 6,
):
    return db.execute(
        select(
            Appointment,
            Doctor,
            DoctorSlot,
        )
        .join(
            Doctor,
            Doctor.id
            == Appointment.doctor_id,
        )
        .join(
            DoctorSlot,
            DoctorSlot.id
            == Appointment.slot_id,
        )
        .where(
            Appointment.patient_id
            == patient_id,

            Appointment.status.in_(
                [
                    AppointmentStatus.REQUESTED,
                    AppointmentStatus.APPROVED,
                ]
            ),

            DoctorSlot.start_at
            >= now,
        )
        .order_by(
            DoctorSlot.start_at.asc()
        )
        .limit(limit)
    ).all()