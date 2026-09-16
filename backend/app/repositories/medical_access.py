import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.doctor import Doctor
from app.models.medical_access import MedicalAccessGrant
from app.models.patient import Patient


def get_doctor(
    db: Session,
    doctor_id: uuid.UUID,
):
    return db.scalar(
        select(
            Doctor
        )
        .where(
            Doctor.id
            == doctor_id
        )
    )


def get_patient(
    db: Session,
    patient_id: uuid.UUID,
):
    return db.scalar(
        select(
            Patient
        )
        .where(
            Patient.id
            == patient_id
        )
    )


def get_access_grant(
    db: Session,
    patient_id: uuid.UUID,
    doctor_id: uuid.UUID,
):
    return db.scalar(
        select(
            MedicalAccessGrant
        )
        .where(
            MedicalAccessGrant.patient_id
            == patient_id,

            MedicalAccessGrant.doctor_id
            == doctor_id,
        )
    )


def get_access_grant_for_update(
    db: Session,
    patient_id: uuid.UUID,
    doctor_id: uuid.UUID,
):
    return db.scalar(
        select(
            MedicalAccessGrant
        )
        .where(
            MedicalAccessGrant.patient_id
            == patient_id,

            MedicalAccessGrant.doctor_id
            == doctor_id,
        )
        .with_for_update()
    )


def list_patient_access_grants(
    db: Session,
    patient_id: uuid.UUID,
):
    return db.execute(
        select(
            MedicalAccessGrant,
            Doctor,
        )
        .join(
            Doctor,
            Doctor.id
            == MedicalAccessGrant.doctor_id,
        )
        .where(
            MedicalAccessGrant.patient_id
            == patient_id,

            MedicalAccessGrant.is_active
            .is_(True),
        )
        .order_by(
            MedicalAccessGrant.updated_at.desc()
        )
    ).all()


def list_doctor_access_grants(
    db: Session,
    doctor_id: uuid.UUID,
):
    return db.execute(
        select(
            MedicalAccessGrant,
            Patient,
        )
        .join(
            Patient,
            Patient.id
            == MedicalAccessGrant.patient_id,
        )
        .where(
            MedicalAccessGrant.doctor_id
            == doctor_id,

            MedicalAccessGrant.is_active
            .is_(True),
        )
        .order_by(
            Patient.first_name,
            Patient.last_name,
        )
    ).all()