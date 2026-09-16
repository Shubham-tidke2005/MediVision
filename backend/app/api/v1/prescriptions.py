import uuid

from fastapi import (
    APIRouter,
    Depends,
    Query,
    Response,
    status,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    require_verified_doctor,
)

from app.core.database import (
    get_db,
)

from app.models.doctor import Doctor

from app.schemas.prescription import (
    MedicineCreate,
    MedicineResponse,
    PrescriptionCreate,
    PrescriptionItemCreate,
    PrescriptionItemUpdate,
    PrescriptionResponse,
    PrescriptionUpdate,
)

from app.services.prescription import (
    add_prescription_item,
    create_encounter_prescription,
    create_medicine,
    delete_prescription_item,
    get_encounter_prescription,
    get_medicine_catalog,
    update_prescription,
    update_prescription_item,
)


router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"],
)


@router.get(
    "/medicines",
    response_model=list[
        MedicineResponse
    ],
)
def medicine_catalog(
    search: str | None = Query(
        default=None,
        max_length=100,
    ),

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_medicine_catalog(
        db,
        search,
    )


@router.post(
    "/medicines",
    response_model=MedicineResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_medicine(
    payload: MedicineCreate,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return create_medicine(
        db,
        doctor,
        payload,
    )


@router.get(
    "/encounters/{encounter_id}",
    response_model=PrescriptionResponse | None,
)
def encounter_prescription(
    encounter_id: uuid.UUID,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_encounter_prescription(
        db,
        doctor,
        encounter_id,
    )


@router.post(
    "/encounters/{encounter_id}",
    response_model=PrescriptionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_prescription_for_encounter(
    encounter_id: uuid.UUID,

    payload: PrescriptionCreate,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return create_encounter_prescription(
        db,
        doctor,
        encounter_id,
        payload,
    )


@router.patch(
    "/{prescription_id}",
    response_model=PrescriptionResponse,
)
def edit_prescription(
    prescription_id: uuid.UUID,

    payload: PrescriptionUpdate,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return update_prescription(
        db,
        doctor,
        prescription_id,
        payload,
    )


@router.post(
    "/{prescription_id}/items",
    response_model=PrescriptionResponse,
)
def create_prescription_item(
    prescription_id: uuid.UUID,

    payload: PrescriptionItemCreate,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return add_prescription_item(
        db,
        doctor,
        prescription_id,
        payload,
    )


@router.patch(
    "/items/{item_id}",
    response_model=PrescriptionResponse,
)
def edit_prescription_item(
    item_id: uuid.UUID,

    payload: PrescriptionItemUpdate,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return update_prescription_item(
        db,
        doctor,
        item_id,
        payload,
    )


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_prescription_item(
    item_id: uuid.UUID,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    delete_prescription_item(
        db,
        doctor,
        item_id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )