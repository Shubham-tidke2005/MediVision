import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.doctor import (
    Doctor,
    DoctorSpecialty,
    Specialty,
)


def get_doctor_by_user_id(
    db: Session,
    user_id: uuid.UUID,
) -> Doctor | None:
    return db.scalar(
        select(Doctor)
        .where(
            Doctor.user_id == user_id
        )
    )


def get_doctor_by_registration_number(
    db: Session,
    registration_number: str,
) -> Doctor | None:
    return db.scalar(
        select(Doctor)
        .where(
            Doctor.registration_number
            == registration_number
        )
    )


def get_active_specialties(
    db: Session,
) -> list[Specialty]:
    return list(
        db.scalars(
            select(Specialty)
            .where(
                Specialty.is_active.is_(True)
            )
            .order_by(
                Specialty.name
            )
        ).all()
    )


def get_specialties_by_ids(
    db: Session,
    specialty_ids: list[int],
) -> list[Specialty]:
    if not specialty_ids:
        return []

    return list(
        db.scalars(
            select(Specialty)
            .where(
                Specialty.id.in_(
                    specialty_ids
                ),
                Specialty.is_active.is_(
                    True
                ),
            )
        ).all()
    )


def get_doctor_specialties(
    db: Session,
    doctor_id: uuid.UUID,
):
    rows = db.execute(
        select(
            Specialty,
            DoctorSpecialty.is_primary,
        )
        .join(
            DoctorSpecialty,
            DoctorSpecialty.specialty_id
            == Specialty.id,
        )
        .where(
            DoctorSpecialty.doctor_id
            == doctor_id
        )
        .order_by(
            DoctorSpecialty.is_primary.desc(),
            Specialty.name,
        )
    ).all()

    return rows