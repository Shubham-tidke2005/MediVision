import uuid

from sqlalchemy import (
    func,
    or_,
    select,
)

from sqlalchemy.orm import Session

from app.models.encounter import Encounter

from app.models.prescription import (
    Medicine,
    Prescription,
    PrescriptionItem,
)


def search_medicines(
    db: Session,
    search: str | None = None,
    limit: int = 30,
):
    stmt = (
        select(Medicine)
        .where(
            Medicine.is_active.is_(True)
        )
        .order_by(
            Medicine.name.asc()
        )
        .limit(limit)
    )

    if search:
        term = (
            f"%{search.strip()}%"
        )

        stmt = (
            select(Medicine)
            .where(
                Medicine.is_active.is_(True),

                or_(
                    Medicine.name.ilike(
                        term
                    ),

                    Medicine.generic_name.ilike(
                        term
                    ),
                ),
            )
            .order_by(
                Medicine.name.asc()
            )
            .limit(limit)
        )

    return db.scalars(
        stmt
    ).all()


def get_medicine(
    db: Session,
    medicine_id: uuid.UUID,
):
    return db.scalar(
        select(Medicine)
        .where(
            Medicine.id
            == medicine_id
        )
    )


def get_medicine_by_name(
    db: Session,
    name: str,
):
    return db.scalar(
        select(Medicine)
        .where(
            func.lower(
                Medicine.name
            )
            == name.strip().lower()
        )
    )


def get_encounter(
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


def get_prescription_by_encounter(
    db: Session,
    encounter_id: uuid.UUID,
):
    return db.scalar(
        select(Prescription)
        .where(
            Prescription.encounter_id
            == encounter_id
        )
    )


def get_prescription(
    db: Session,
    prescription_id: uuid.UUID,
):
    return db.scalar(
        select(Prescription)
        .where(
            Prescription.id
            == prescription_id
        )
    )


def get_prescription_for_update(
    db: Session,
    prescription_id: uuid.UUID,
):
    return db.scalar(
        select(Prescription)
        .where(
            Prescription.id
            == prescription_id
        )
        .with_for_update()
    )


def get_prescription_item(
    db: Session,
    item_id: uuid.UUID,
):
    return db.scalar(
        select(PrescriptionItem)
        .where(
            PrescriptionItem.id
            == item_id
        )
    )


def get_prescription_item_for_update(
    db: Session,
    item_id: uuid.UUID,
):
    return db.scalar(
        select(PrescriptionItem)
        .where(
            PrescriptionItem.id
            == item_id
        )
        .with_for_update()
    )


def list_prescription_items(
    db: Session,
    prescription_id: uuid.UUID,
):
    return db.execute(
        select(
            PrescriptionItem,
            Medicine,
        )
        .join(
            Medicine,
            Medicine.id
            == PrescriptionItem.medicine_id,
        )
        .where(
            PrescriptionItem.prescription_id
            == prescription_id
        )
        .order_by(
            PrescriptionItem.sort_order.asc(),
            PrescriptionItem.created_at.asc(),
        )
    ).all()