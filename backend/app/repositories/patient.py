import uuid

from sqlalchemy import select
from sqlalchemy.orm import (
    Session,
    selectinload,
)

from app.models.patient import Patient


def get_patient_by_user_id(
    db: Session,
    user_id: uuid.UUID,
) -> Patient | None:
    return db.scalar(
        select(Patient)
        .options(
            selectinload(
                Patient.address
            )
        )
        .where(
            Patient.user_id == user_id
        )
    )


def get_patient_by_id(
    db: Session,
    patient_id: uuid.UUID,
) -> Patient | None:
    return db.scalar(
        select(Patient)
        .options(
            selectinload(
                Patient.address
            )
        )
        .where(
            Patient.id == patient_id
        )
    )