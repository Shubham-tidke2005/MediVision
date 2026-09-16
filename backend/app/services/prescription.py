import uuid

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.doctor import Doctor

from app.models.prescription import (
    Medicine,
    Prescription,
    PrescriptionItem,
)

from app.repositories.prescription import (
    get_encounter,
    get_medicine,
    get_medicine_by_name,
    get_prescription,
    get_prescription_by_encounter,
    get_prescription_for_update,
    get_prescription_item_for_update,
    list_prescription_items,
    search_medicines,
)

from app.schemas.prescription import (
    MedicineCreate,
    PrescriptionCreate,
    PrescriptionItemCreate,
    PrescriptionItemUpdate,
    PrescriptionUpdate,
)

from app.services.medication_reminder import (
    create_medication_from_prescription_item,
)

def serialize_medicine(
    medicine: Medicine,
):
    return {
        "id":
            medicine.id,

        "name":
            medicine.name,

        "generic_name":
            medicine.generic_name,

        "dosage_form":
            medicine.dosage_form,

        "description":
            medicine.description,

        "is_active":
            medicine.is_active,
    }


def serialize_prescription(
    db: Session,
    prescription: Prescription,
):
    item_rows = (
        list_prescription_items(
            db,
            prescription.id,
        )
    )

    items = []

    for (
        item,
        medicine,
    ) in item_rows:

        items.append(
            {
                "id":
                    item.id,

                "medicine":
                    serialize_medicine(
                        medicine
                    ),

                "strength":
                    item.strength,

                "dose":
                    item.dose,

                "frequency":
                    item.frequency,

                "route":
                    item.route,

                "duration_days":
                    item.duration_days,

                "quantity":
                    item.quantity,

                "instructions":
                    item.instructions,

                "sort_order":
                    item.sort_order,

                "created_at":
                    item.created_at,

                "updated_at":
                    item.updated_at,
            }
        )

    return {
        "id":
            prescription.id,

        "encounter_id":
            prescription.encounter_id,

        "patient_id":
            prescription.patient_id,

        "doctor_id":
            prescription.doctor_id,

        "general_instructions":
            prescription.general_instructions,

        "prescribed_at":
            prescription.prescribed_at,

        "items":
            items,

        "created_at":
            prescription.created_at,

        "updated_at":
            prescription.updated_at,
    }


def ensure_doctor_encounter(
    db: Session,
    doctor: Doctor,
    encounter_id: uuid.UUID,
):
    encounter = get_encounter(
        db,
        encounter_id,
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

    return encounter


def ensure_editable_encounter(
    db: Session,
    doctor: Doctor,
    encounter_id: uuid.UUID,
):
    encounter = ensure_doctor_encounter(
        db,
        doctor,
        encounter_id,
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


def ensure_editable_prescription(
    db: Session,
    doctor: Doctor,
    prescription: Prescription,
):
    if (
        prescription.doctor_id
        != doctor.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found.",
        )

    ensure_editable_encounter(
        db,
        doctor,
        prescription.encounter_id,
    )


def get_medicine_catalog(
    db: Session,
    search: str | None,
):
    medicines = search_medicines(
        db,
        search,
    )

    return [
        serialize_medicine(
            medicine
        )
        for medicine in medicines
    ]


def create_medicine(
    db: Session,
    doctor: Doctor,
    payload: MedicineCreate,
):
    name = payload.name.strip()

    existing = (
        get_medicine_by_name(
            db,
            name,
        )
    )

    if existing is not None:
        return serialize_medicine(
            existing
        )

    medicine = Medicine(
        name=name,

        generic_name=(
            payload.generic_name.strip()
            if payload.generic_name
            else None
        ),

        dosage_form=(
            payload.dosage_form.strip()
            if payload.dosage_form
            else None
        ),

        description=(
            payload.description.strip()
            if payload.description
            else None
        ),
    )

    db.add(
        medicine
    )

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        existing = (
            get_medicine_by_name(
                db,
                name,
            )
        )

        if existing is not None:
            return serialize_medicine(
                existing
            )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Medicine already exists.",
        ) from exc

    db.refresh(
        medicine
    )

    return serialize_medicine(
        medicine
    )


def get_encounter_prescription(
    db: Session,
    doctor: Doctor,
    encounter_id: uuid.UUID,
):
    ensure_doctor_encounter(
        db,
        doctor,
        encounter_id,
    )

    prescription = (
        get_prescription_by_encounter(
            db,
            encounter_id,
        )
    )

    if prescription is None:
        return None

    return serialize_prescription(
        db,
        prescription,
    )


def create_encounter_prescription(
    db: Session,
    doctor: Doctor,
    encounter_id: uuid.UUID,
    payload: PrescriptionCreate,
):
    encounter = ensure_editable_encounter(
        db,
        doctor,
        encounter_id,
    )

    existing = (
        get_prescription_by_encounter(
            db,
            encounter_id,
        )
    )

    # Idempotent creation.
    if existing is not None:
        return serialize_prescription(
            db,
            existing,
        )

    prescription = Prescription(
        encounter_id=(
            encounter.id
        ),

        patient_id=(
            encounter.patient_id
        ),

        doctor_id=(
            encounter.doctor_id
        ),

        general_instructions=(
            payload.general_instructions
        ),
    )

    db.add(
        prescription
    )

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        existing = (
            get_prescription_by_encounter(
                db,
                encounter_id,
            )
        )

        if existing is not None:
            return serialize_prescription(
                db,
                existing,
            )

        raise

    db.refresh(
        prescription
    )

    return serialize_prescription(
        db,
        prescription,
    )


def update_prescription(
    db: Session,
    doctor: Doctor,
    prescription_id: uuid.UUID,
    payload: PrescriptionUpdate,
):
    prescription = (
        get_prescription_for_update(
            db,
            prescription_id,
        )
    )

    if prescription is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found.",
        )

    ensure_editable_prescription(
        db,
        doctor,
        prescription,
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
            prescription,
            field,
            value,
        )

    db.commit()

    return serialize_prescription(
        db,
        prescription,
    )


def add_prescription_item(
    db: Session,
    doctor: Doctor,
    prescription_id: uuid.UUID,
    payload: PrescriptionItemCreate,
):
    prescription = get_prescription(
        db,
        prescription_id,
    )

    if prescription is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found.",
        )

    ensure_editable_prescription(
        db,
        doctor,
        prescription,
    )

    medicine = get_medicine(
        db,
        payload.medicine_id,
    )

    if (
        medicine is None
        or not medicine.is_active
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found.",
        )

    item = PrescriptionItem(
        prescription_id=(
            prescription.id
        ),

        medicine_id=(
            medicine.id
        ),

        strength=(
            payload.strength
        ),

        dose=(
            payload.dose.strip()
        ),

        frequency=(
            payload.frequency.strip()
        ),

        route=(
            payload.route.strip()
            if payload.route
            else None
        ),

        duration_days=(
            payload.duration_days
        ),

        quantity=(
            payload.quantity.strip()
            if payload.quantity
            else None
        ),

        instructions=(
            payload.instructions.strip()
            if payload.instructions
            else None
        ),

        sort_order=(
            payload.sort_order
        ),
    )

    db.add(
        item
    )

    db.commit()

    return serialize_prescription(
        db,
        prescription,
    )


def update_prescription_item(
    db: Session,
    doctor: Doctor,
    item_id: uuid.UUID,
    payload: PrescriptionItemUpdate,
):
    item = (
        get_prescription_item_for_update(
            db,
            item_id,
        )
    )

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription item not found.",
        )

    prescription = get_prescription(
        db,
        item.prescription_id,
    )

    if prescription is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found.",
        )

    ensure_editable_prescription(
        db,
        doctor,
        prescription,
    )

    update_data = (
        payload.model_dump(
            exclude_unset=True
        )
    )

    if (
        "medicine_id"
        in update_data
    ):
        medicine = get_medicine(
            db,
            update_data[
                "medicine_id"
            ],
        )

        if (
            medicine is None
            or not medicine.is_active
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medicine not found.",
            )

    for (
        field,
        value,
    ) in update_data.items():

        if (
            isinstance(
                value,
                str,
            )
        ):
            value = (
                value.strip()
                or None
            )

        setattr(
            item,
            field,
            value,
        )

    if not item.dose:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Dose is required.",
        )

    if not item.frequency:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Frequency is required.",
        )

    db.commit()

    return serialize_prescription(
        db,
        prescription,
    )


def delete_prescription_item(
    db: Session,
    doctor: Doctor,
    item_id: uuid.UUID,
):
    item = (
        get_prescription_item_for_update(
            db,
            item_id,
        )
    )

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription item not found.",
        )

    prescription = get_prescription(
        db,
        item.prescription_id,
    )

    if prescription is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found.",
        )

    ensure_editable_prescription(
        db,
        doctor,
        prescription,
    )

    db.delete(
        item
    )

    db.commit()
    
