import uuid

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.diagnosis import (
    Diagnosis,
    EncounterDiagnosis,
)

from app.models.doctor import Doctor

from app.repositories.diagnosis import (
    get_diagnosis,
    get_diagnosis_by_name,
    get_encounter_diagnosis,
    get_encounter_for_diagnosis,
    list_encounter_diagnoses,
    search_diagnoses,
)

from app.schemas.diagnosis import (
    DiagnosisCatalogCreate,
    EncounterDiagnosisCreate,
    EncounterDiagnosisUpdate,
)


def serialize_catalog_diagnosis(
    diagnosis: Diagnosis,
):
    return {
        "id":
            diagnosis.id,

        "name":
            diagnosis.name,

        "code":
            diagnosis.code,

        "description":
            diagnosis.description,

        "is_active":
            diagnosis.is_active,
    }


def serialize_encounter_diagnosis(
    encounter_diagnosis,
    diagnosis,
):
    return {
        "id":
            encounter_diagnosis.id,

        "encounter_id":
            encounter_diagnosis.encounter_id,

        "diagnosis_type":
            encounter_diagnosis.diagnosis_type,

        "notes":
            encounter_diagnosis.notes,

        "diagnosis":
            serialize_catalog_diagnosis(
                diagnosis
            ),

        "created_at":
            encounter_diagnosis.created_at,

        "updated_at":
            encounter_diagnosis.updated_at,
    }


def ensure_editable_encounter(
    db: Session,
    doctor: Doctor,
    encounter_id: uuid.UUID,
):
    encounter = (
        get_encounter_for_diagnosis(
            db,
            encounter_id,
        )
    )

    if (
        encounter is None
        or encounter.doctor_id
        != doctor.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encounter not found.",
        )

    if encounter.ended_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Completed encounters "
                "cannot be modified."
            ),
        )

    return encounter


def get_catalog(
    db: Session,
    search: str | None,
):
    diagnoses = search_diagnoses(
        db,
        search,
    )

    return [
        serialize_catalog_diagnosis(
            diagnosis
        )
        for diagnosis in diagnoses
    ]


def create_catalog_diagnosis(
    db: Session,
    doctor: Doctor,
    payload: DiagnosisCatalogCreate,
):
    normalized_name = (
        payload.name.strip()
    )

    existing = (
        get_diagnosis_by_name(
            db,
            normalized_name,
        )
    )

    if existing is not None:
        return serialize_catalog_diagnosis(
            existing
        )

    diagnosis = Diagnosis(
        name=normalized_name,

        code=(
            payload.code.strip()
            if payload.code
            else None
        ),

        description=(
            payload.description.strip()
            if payload.description
            else None
        ),
    )

    db.add(
        diagnosis
    )

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        existing = (
            get_diagnosis_by_name(
                db,
                normalized_name,
            )
        )

        if existing is not None:
            return serialize_catalog_diagnosis(
                existing
            )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Diagnosis already exists."
            ),
        ) from exc

    db.refresh(
        diagnosis
    )

    return serialize_catalog_diagnosis(
        diagnosis
    )


def add_encounter_diagnosis(
    db: Session,
    doctor: Doctor,
    encounter_id: uuid.UUID,
    payload: EncounterDiagnosisCreate,
):
    ensure_editable_encounter(
        db,
        doctor,
        encounter_id,
    )

    diagnosis = get_diagnosis(
        db,
        payload.diagnosis_id,
    )

    if (
        diagnosis is None
        or not diagnosis.is_active
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagnosis not found.",
        )

    encounter_diagnosis = (
        EncounterDiagnosis(
            encounter_id=(
                encounter_id
            ),

            diagnosis_id=(
                diagnosis.id
            ),

            diagnosis_type=(
                payload.diagnosis_type
            ),

            notes=(
                payload.notes
            ),

            created_by_user_id=(
                doctor.user_id
            ),
        )
    )

    db.add(
        encounter_diagnosis
    )

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This diagnosis is already "
                "recorded for the encounter "
                "with this diagnosis type."
            ),
        ) from exc

    db.refresh(
        encounter_diagnosis
    )

    return serialize_encounter_diagnosis(
        encounter_diagnosis,
        diagnosis,
    )


def update_encounter_diagnosis(
    db: Session,
    doctor: Doctor,
    encounter_diagnosis_id: uuid.UUID,
    payload: EncounterDiagnosisUpdate,
):
    encounter_diagnosis = (
        get_encounter_diagnosis(
            db,
            encounter_diagnosis_id,
        )
    )

    if encounter_diagnosis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encounter diagnosis not found.",
        )

    ensure_editable_encounter(
        db,
        doctor,
        encounter_diagnosis.encounter_id,
    )

    update_data = (
        payload.model_dump(
            exclude_unset=True
        )
    )

    for (
        field,
        value,
    ) in update_data.items():

        setattr(
            encounter_diagnosis,
            field,
            value,
        )

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Duplicate encounter diagnosis."
            ),
        ) from exc

    diagnosis = get_diagnosis(
        db,
        encounter_diagnosis.diagnosis_id,
    )

    return serialize_encounter_diagnosis(
        encounter_diagnosis,
        diagnosis,
    )


def delete_encounter_diagnosis(
    db: Session,
    doctor: Doctor,
    encounter_diagnosis_id: uuid.UUID,
):
    encounter_diagnosis = (
        get_encounter_diagnosis(
            db,
            encounter_diagnosis_id,
        )
    )

    if encounter_diagnosis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encounter diagnosis not found.",
        )

    ensure_editable_encounter(
        db,
        doctor,
        encounter_diagnosis.encounter_id,
    )

    db.delete(
        encounter_diagnosis
    )

    db.commit()


def get_encounter_diagnoses(
    db: Session,
    doctor: Doctor,
    encounter_id: uuid.UUID,
):
    encounter = (
        get_encounter_for_diagnosis(
            db,
            encounter_id,
        )
    )

    if (
        encounter is None
        or encounter.doctor_id
        != doctor.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encounter not found.",
        )

    rows = list_encounter_diagnoses(
        db,
        encounter_id,
    )

    return [
        serialize_encounter_diagnosis(
            encounter_diagnosis,
            diagnosis,
        )
        for (
            encounter_diagnosis,
            diagnosis,
        ) in rows
    ]