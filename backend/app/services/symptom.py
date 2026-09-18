from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.repositories.symptom import (
    get_symptoms_by_ids,
    list_active_symptoms,
)


def get_symptom_catalog(
    db: Session,
):
    return list_active_symptoms(
        db
    )


def validate_symptom_ids(
    db: Session,
    symptom_ids: list[int],
):
    # Remove duplicates while retaining
    # the logical set of selected symptoms.
    unique_ids = list(
        dict.fromkeys(
            symptom_ids
        )
    )

    if not unique_ids:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "At least one symptom must be selected."
            ),
        )

    symptoms = get_symptoms_by_ids(
        db,
        unique_ids,
    )

    found_ids = {
        symptom.id
        for symptom in symptoms
    }

    missing_ids = [
        symptom_id
        for symptom_id in unique_ids
        if symptom_id not in found_ids
    ]

    if missing_ids:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "One or more selected symptoms "
                "are invalid or inactive."
            ),
        )

    return symptoms