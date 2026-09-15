import uuid

from sqlalchemy import (
    select,
)

from sqlalchemy.orm import Session

from app.models.appointment import (
    Appointment,
)

from app.models.availability import (
    DoctorSlot,
)

from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.enums import AppointmentStatus

def get_active_appointment_for_slot(
    db: Session,
    slot_id: uuid.UUID,
) -> Appointment | None:
    return db.scalar(
        select(Appointment)
        .where(
            Appointment.slot_id == slot_id,
            Appointment.status.in_(
                [
                    AppointmentStatus.REQUESTED,
                    AppointmentStatus.APPROVED,
                ]
            ),
        )
    )
    
    
def get_slot_for_update(
    db: Session,
    slot_id: uuid.UUID,
) -> DoctorSlot | None:
    return db.scalar(
        select(DoctorSlot)
        .where(
            DoctorSlot.id == slot_id
        )
        .with_for_update()
    )


def get_appointment_for_update(
    db: Session,
    appointment_id: uuid.UUID,
):
    return db.scalar(
        select(Appointment)
        .where(
            Appointment.id
            == appointment_id
        )
        .with_for_update()
    )


def get_appointment_row(
    db: Session,
    appointment_id: uuid.UUID,
):
    return db.execute(
        select(
            Appointment,
            Patient,
            Doctor,
            DoctorSlot,
        )
        .join(
            Patient,
            Patient.id
            == Appointment.patient_id,
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
            Appointment.id
            == appointment_id
        )
    ).first()


def list_patient_appointments(
    db: Session,
    patient_id: uuid.UUID,
):
    return db.execute(
        select(
            Appointment,
            Patient,
            Doctor,
            DoctorSlot,
        )
        .join(
            Patient,
            Patient.id
            == Appointment.patient_id,
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
            == patient_id
        )
        .order_by(
            DoctorSlot.start_at.desc()
        )
    ).all()


def list_doctor_appointments(
    db: Session,
    doctor_id: uuid.UUID,
):
    return db.execute(
        select(
            Appointment,
            Patient,
            Doctor,
            DoctorSlot,
        )
        .join(
            Patient,
            Patient.id
            == Appointment.patient_id,
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
            Appointment.doctor_id
            == doctor_id
        )
        .order_by(
            DoctorSlot.start_at.desc()
        )
    ).all()