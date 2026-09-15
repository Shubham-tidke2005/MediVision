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

from app.models.enums import (
    AppointmentStatus,
    SlotStatus,
)

from app.models.patient import Patient


def get_appointment_status_counts(
    db: Session,
    doctor_id: uuid.UUID,
):
    rows = db.execute(
        select(
            Appointment.status,
            func.count(
                Appointment.id
            ),
        )
        .where(
            Appointment.doctor_id
            == doctor_id
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
    doctor_id: uuid.UUID,
):
    value = db.scalar(
        select(
            func.count(
                Appointment.id
            )
        )
        .where(
            Appointment.doctor_id
            == doctor_id,
            Appointment.status
            == AppointmentStatus.REQUESTED,
        )
    )

    return value or 0


def count_upcoming_approved(
    db: Session,
    doctor_id: uuid.UUID,
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
            Appointment.doctor_id
            == doctor_id,

            Appointment.status
            == AppointmentStatus.APPROVED,

            DoctorSlot.start_at
            >= now,
        )
    )

    return value or 0


def count_completed_appointments(
    db: Session,
    doctor_id: uuid.UUID,
):
    value = db.scalar(
        select(
            func.count(
                Appointment.id
            )
        )
        .where(
            Appointment.doctor_id
            == doctor_id,

            Appointment.status
            == AppointmentStatus.COMPLETED,
        )
    )

    return value or 0


def count_available_slots(
    db: Session,
    doctor_id: uuid.UUID,
    start_at: datetime,
    end_at: datetime,
):
    value = db.scalar(
        select(
            func.count(
                DoctorSlot.id
            )
        )
        .where(
            DoctorSlot.doctor_id
            == doctor_id,

            DoctorSlot.status
            == SlotStatus.AVAILABLE,

            DoctorSlot.start_at
            >= start_at,

            DoctorSlot.start_at
            < end_at,
        )
    )

    return value or 0


def get_upcoming_appointments(
    db: Session,
    doctor_id: uuid.UUID,
    now: datetime,
    limit: int = 6,
):
    return db.execute(
        select(
            Appointment,
            Patient,
            DoctorSlot,
        )
        .join(
            Patient,
            Patient.id
            == Appointment.patient_id,
        )
        .join(
            DoctorSlot,
            DoctorSlot.id
            == Appointment.slot_id,
        )
        .where(
            Appointment.doctor_id
            == doctor_id,

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