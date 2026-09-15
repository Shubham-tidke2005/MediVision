import uuid

from fastapi import (
    HTTPException,
    status,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.address import Address
from app.models.patient import Patient
from app.models.user import User

from app.repositories.patient import (
    get_patient_by_user_id,
)

from app.schemas.patient import (
    AddressInput,
    PatientProfileCreate,
    PatientProfileUpdate,
)


def generate_patient_code() -> str:
    return (
        "PAT-"
        + uuid.uuid4()
        .hex[:12]
        .upper()
    )


def get_my_patient_profile(
    db: Session,
    current_user: User,
) -> Patient:
    patient = get_patient_by_user_id(
        db,
        current_user.id,
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found.",
        )

    if not patient.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patient profile is inactive.",
        )

    return patient


def create_address(
    db: Session,
    payload: AddressInput,
) -> Address:
    address = Address(
        address_line_1=payload.address_line1,
        address_line_2=payload.address_line2,
        city=payload.city,
        district=payload.district,
        state=payload.state,
        postal_code=payload.postal_code,
        country=payload.country,
    )

    db.add(address)
    db.flush()

    return address


def create_my_patient_profile(
    db: Session,
    current_user: User,
    payload: PatientProfileCreate,
) -> Patient:
    existing_patient = (
        get_patient_by_user_id(
            db,
            current_user.id,
        )
    )

    if existing_patient is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Patient profile already exists.",
        )

    patient = Patient(
        user_id=current_user.id,
        patient_code=generate_patient_code(),
        first_name=payload.first_name,
        last_name=payload.last_name,
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        blood_group=payload.blood_group,
        height_cm=payload.height_cm,
        emergency_notes=payload.emergency_notes,
        is_active=True,
    )

    if payload.address is not None:
        patient.address = create_address(
            db,
            payload.address,
        )

    db.add(patient)

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to create patient profile.",
        ) from exc

    created_patient = (
        get_patient_by_user_id(
            db,
            current_user.id,
        )
    )

    return created_patient


def update_address(
    db: Session,
    patient: Patient,
    payload: AddressInput,
) -> None:
    address_data = payload.model_dump(
        exclude_unset=True
    )

    field_mapping = {
        "address_line1": "address_line_1",
        "address_line2": "address_line_2",
        "city": "city",
        "district": "district",
        "state": "state",
        "postal_code": "postal_code",
        "country": "country",
    }

    if patient.address is None:
        patient.address = Address()

        db.add(patient.address)

    for api_field, value in address_data.items():
        model_field = field_mapping[
            api_field
        ]

        setattr(
            patient.address,
            model_field,
            value,
        )

def update_my_patient_profile(
    db: Session,
    current_user: User,
    payload: PatientProfileUpdate,
) -> Patient:
    patient = get_my_patient_profile(
        db,
        current_user,
    )

    update_data = payload.model_dump(
        exclude_unset=True,
        exclude={"address"},
    )

    required_fields = {
        "first_name",
        "last_name",
        "date_of_birth",
    }

    for field, value in (
        update_data.items()
    ):
        if (
            field in required_fields
            and value is None
        ):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"{field} cannot be null.",
            )

        setattr(
            patient,
            field,
            value,
        )

    if (
        "address"
        in payload.model_fields_set
        and payload.address is not None
    ):
        update_address(
            db,
            patient,
            payload.address,
        )

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to update patient profile.",
        ) from exc

    updated_patient = (
        get_patient_by_user_id(
            db,
            current_user.id,
        )
    )

    return updated_patient