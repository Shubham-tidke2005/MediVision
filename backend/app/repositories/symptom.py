from sqlalchemy import (
    select,
)

from sqlalchemy.orm import Session

from app.models.symptom import Symptom


def list_active_symptoms(
    db: Session,
):
    return list(
        db.scalars(
            select(
                Symptom
            )
            .where(
                Symptom.is_active.is_(True)
            )
            .order_by(
                Symptom.name
            )
        ).all()
    )


def get_symptom_by_id(
    db: Session,
    symptom_id: int,
):
    return db.scalar(
        select(
            Symptom
        )
        .where(
            Symptom.id == symptom_id
        )
    )


def get_symptoms_by_ids(
    db: Session,
    symptom_ids: list[int],
):
    if not symptom_ids:
        return []

    return list(
        db.scalars(
            select(
                Symptom
            )
            .where(
                Symptom.id.in_(
                    symptom_ids
                ),
                Symptom.is_active.is_(True),
            )
        ).all()
    )