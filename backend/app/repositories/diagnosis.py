import uuid

from sqlalchemy import (
    func,
    or_,
    select,
)

from sqlalchemy.orm import Session

from app.models.diagnosis import (
    Diagnosis,
    EncounterDiagnosis,
)

from app.models.encounter import Encounter


def search_diagnoses(
    db: Session,
    search: str | None = None,
    limit: int = 30,
):
    stmt = (
        select(Diagnosis)
        .where(
            Diagnosis.is_active.is_(True)
        )
        .order_by(
            Diagnosis.name.asc()
        )
        .limit(limit)
    )

    if search:
        term = f"%{search.strip()}%"

        stmt = (
            select(Diagnosis)
            .where(
                Diagnosis.is_active.is_(True),

                or_(
                    Diagnosis.name.ilike(
                        term
                    ),

                    Diagnosis.code.ilike(
                        term
                    ),
                ),
            )
            .order_by(
                Diagnosis.name.asc()
            )
            .limit(limit)
        )

    return db.scalars(
        stmt
    ).all()


def get_diagnosis(
    db: Session,
    diagnosis_id: uuid.UUID,
):
    return db.scalar(
        select(Diagnosis)
        .where(
            Diagnosis.id
            == diagnosis_id
        )
    )


def get_diagnosis_by_name(
    db: Session,
    name: str,
):
    return db.scalar(
        select(Diagnosis)
        .where(
            func.lower(
                Diagnosis.name
            )
            == name.strip().lower()
        )
    )


def get_encounter_for_diagnosis(
    db: Session,
    encounter_id: uuid.UUID,
):
    return db.scalar(
        select(Encounter)
        .where(
            Encounter.id
            == encounter_id
        )
    )


def get_encounter_diagnosis(
    db: Session,
    encounter_diagnosis_id: uuid.UUID,
):
    return db.scalar(
        select(EncounterDiagnosis)
        .where(
            EncounterDiagnosis.id
            == encounter_diagnosis_id
        )
    )


def list_encounter_diagnoses(
    db: Session,
    encounter_id: uuid.UUID,
):
    return db.execute(
        select(
            EncounterDiagnosis,
            Diagnosis,
        )
        .join(
            Diagnosis,
            Diagnosis.id
            == EncounterDiagnosis.diagnosis_id,
        )
        .where(
            EncounterDiagnosis.encounter_id
            == encounter_id
        )
        .order_by(
            EncounterDiagnosis.created_at.asc()
        )
    ).all()