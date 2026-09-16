import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.models.availability import DoctorSlot
from app.models.doctor import Doctor
from app.models.encounter import Encounter
from app.models.patient import Patient


def get_appointment_for_encounter_start(
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


def get_encounter_by_appointment(
    db: Session,
    appointment_id: uuid.UUID,
):
    return db.scalar(
        select(Encounter)
        .where(
            Encounter.appointment_id
            == appointment_id
        )
    )


def get_encounter_for_update(
    db: Session,
    encounter_id: uuid.UUID,
):
    return db.scalar(
        select(Encounter)
        .where(
            Encounter.id
            == encounter_id
        )
        .with_for_update()
    )


def get_encounter_detail_row(
    db: Session,
    encounter_id: uuid.UUID,
):
    return db.execute(
        select(
            Encounter,
            Appointment,
            Patient,
            Doctor,
            DoctorSlot,
        )
        .join(
            Appointment,
            Appointment.id
            == Encounter.appointment_id,
        )
        .join(
            Patient,
            Patient.id
            == Encounter.patient_id,
        )
        .join(
            Doctor,
            Doctor.id
            == Encounter.doctor_id,
        )
        .join(
            DoctorSlot,
            DoctorSlot.id
            == Appointment.slot_id,
        )
        .where(
            Encounter.id
            == encounter_id
        )
    ).first()


def list_doctor_encounters(
    db: Session,
    doctor_id: uuid.UUID,
):
    return db.execute(
        select(
            Encounter,
            Appointment,
            Patient,
            Doctor,
            DoctorSlot,
        )
        .join(
            Appointment,
            Appointment.id
            == Encounter.appointment_id,
        )
        .join(
            Patient,
            Patient.id
            == Encounter.patient_id,
        )
        .join(
            Doctor,
            Doctor.id
            == Encounter.doctor_id,
        )
        .join(
            DoctorSlot,
            DoctorSlot.id
            == Appointment.slot_id,
        )
        .where(
            Encounter.doctor_id
            == doctor_id
        )
        .order_by(
            Encounter.started_at.desc()
        )
    ).all()