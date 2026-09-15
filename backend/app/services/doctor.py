import uuid

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy import (
    delete,
    select,
)

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.address import Address

from app.models.doctor import (
    Doctor,
    DoctorSpecialty,
)

from app.models.enums import (
    DoctorVerificationStatus,
)

from app.models.user import User

from app.repositories.doctor import (
    get_active_specialties,
    get_doctor_by_registration_number,
    get_doctor_by_user_id,
    get_doctor_specialties,
    get_specialties_by_ids,
)

from app.schemas.doctor import (
    DoctorAddressInput,
    DoctorProfileCreate,
    DoctorProfileUpdate,
    DoctorSpecialtyInput,
)


def generate_doctor_code() -> str:
    return (
        "DOC-"
        + uuid.uuid4()
        .hex[:12]
        .upper()
    )


def get_address(
    db: Session,
    address_id,
) -> Address | None:
    if address_id is None:
        return None

    return db.scalar(
        select(Address)
        .where(
            Address.id == address_id
        )
    )


def create_address(
    db: Session,
    payload: DoctorAddressInput,
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


def update_address(
    db: Session,
    doctor: Doctor,
    payload: DoctorAddressInput,
) -> None:
    address = get_address(
        db,
        doctor.address_id,
    )

    if address is None:
        address = Address()

        db.add(address)
        db.flush()

        doctor.address_id = address.id

    field_mapping = {
        "address_line1":
            "address_line_1",

        "address_line2":
            "address_line_2",

        "city":
            "city",

        "district":
            "district",

        "state":
            "state",

        "postal_code":
            "postal_code",

        "country":
            "country",
    }

    address_data = payload.model_dump(
        exclude_unset=True
    )

    for api_field, value in (
        address_data.items()
    ):
        setattr(
            address,
            field_mapping[api_field],
            value,
        )


def validate_specialties(
    db: Session,
    specialties: list[
        DoctorSpecialtyInput
    ],
) -> None:
    specialty_ids = [
        item.specialty_id
        for item in specialties
    ]

    database_specialties = (
        get_specialties_by_ids(
            db,
            specialty_ids,
        )
    )

    found_ids = {
        specialty.id
        for specialty
        in database_specialties
    }

    missing_ids = (
        set(specialty_ids)
        - found_ids
    )

    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "One or more specialties "
                "are invalid or inactive."
            ),
        )


def replace_doctor_specialties(
    db: Session,
    doctor: Doctor,
    specialties: list[
        DoctorSpecialtyInput
    ],
) -> None:
    validate_specialties(
        db,
        specialties,
    )

    db.execute(
        delete(DoctorSpecialty)
        .where(
            DoctorSpecialty.doctor_id
            == doctor.id
        )
    )

    for item in specialties:
        db.add(
            DoctorSpecialty(
                doctor_id=doctor.id,
                specialty_id=(
                    item.specialty_id
                ),
                is_primary=(
                    item.is_primary
                ),
            )
        )

    db.flush()


def serialize_doctor_profile(
    db: Session,
    doctor: Doctor,
):
    address = get_address(
        db,
        doctor.address_id,
    )

    specialty_rows = (
        get_doctor_specialties(
            db,
            doctor.id,
        )
    )

    address_data = None

    if address is not None:
        address_data = {
            "id":
                address.id,

            "address_line1":
                address.address_line_1,

            "address_line2":
                address.address_line_2,

            "city":
                address.city,

            "district":
                address.district,

            "state":
                address.state,

            "postal_code":
                address.postal_code,

            "country":
                address.country,
        }

    specialty_data = [
        {
            "id":
                specialty.id,

            "name":
                specialty.name,

            "description":
                specialty.description,

            "is_primary":
                is_primary,
        }
        for specialty, is_primary
        in specialty_rows
    ]

    return {
        "id":
            doctor.id,

        "user_id":
            doctor.user_id,

        "doctor_code":
            doctor.doctor_code,

        "first_name":
            doctor.first_name,

        "last_name":
            doctor.last_name,

        "registration_number":
            doctor.registration_number,

        "qualification":
            doctor.qualification,

        "experience_years":
            doctor.experience_years,

        "bio":
            doctor.bio,

        "default_consultation_fee":
            doctor.default_consultation_fee,

        "verification_status":
            doctor.verification_status,

        "is_accepting_patients":
            doctor.is_accepting_patients,

        "is_active":
            doctor.is_active,

        "address":
            address_data,

        "specialties":
            specialty_data,

        "created_at":
            doctor.created_at,

        "updated_at":
            doctor.updated_at,
    }


def get_my_doctor_profile(
    db: Session,
    current_user: User,
):
    doctor = get_doctor_by_user_id(
        db,
        current_user.id,
    )

    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found.",
        )

    if not doctor.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor profile is inactive.",
        )

    return serialize_doctor_profile(
        db,
        doctor,
    )


def create_my_doctor_profile(
    db: Session,
    current_user: User,
    payload: DoctorProfileCreate,
):
    existing = get_doctor_by_user_id(
        db,
        current_user.id,
    )

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Doctor profile already exists.",
        )

    existing_registration = (
        get_doctor_by_registration_number(
            db,
            payload.registration_number,
        )
    )

    if existing_registration is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A doctor with this "
                "registration number "
                "already exists."
            ),
        )

    validate_specialties(
        db,
        payload.specialties,
    )

    doctor = Doctor(
        user_id=current_user.id,
        doctor_code=generate_doctor_code(),
        first_name=payload.first_name,
        last_name=payload.last_name,
        registration_number=(
            payload.registration_number
        ),
        qualification=(
            payload.qualification
        ),
        experience_years=(
            payload.experience_years
        ),
        bio=payload.bio,
        default_consultation_fee=(
            payload.default_consultation_fee
        ),

        verification_status=(
            DoctorVerificationStatus.PENDING
        ),

        is_accepting_patients=False,
        is_active=True,
    )

    if payload.address is not None:
        address = create_address(
            db,
            payload.address,
        )

        doctor.address_id = address.id

    db.add(doctor)
    db.flush()

    replace_doctor_specialties(
        db,
        doctor,
        payload.specialties,
    )

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Unable to create "
                "doctor profile."
            ),
        ) from exc

    doctor = get_doctor_by_user_id(
        db,
        current_user.id,
    )

    return serialize_doctor_profile(
        db,
        doctor,
    )


def update_my_doctor_profile(
    db: Session,
    current_user: User,
    payload: DoctorProfileUpdate,
):
    doctor = get_doctor_by_user_id(
        db,
        current_user.id,
    )

    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found.",
        )

    if not doctor.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor profile is inactive.",
        )

    if (
        payload.is_accepting_patients is True
        and doctor.verification_status
        != DoctorVerificationStatus.VERIFIED
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Doctor must be verified "
                "before accepting patients."
            ),
        )

    verification_sensitive_change = False

    if (
        payload.registration_number
        is not None
        and payload.registration_number
        != doctor.registration_number
    ):
        existing = (
            get_doctor_by_registration_number(
                db,
                payload.registration_number,
            )
        )

        if (
            existing is not None
            and existing.id != doctor.id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A doctor with this "
                    "registration number "
                    "already exists."
                ),
            )

        verification_sensitive_change = True

    if (
        payload.qualification is not None
        and payload.qualification
        != doctor.qualification
    ):
        verification_sensitive_change = True

    if payload.specialties is not None:
        validate_specialties(
            db,
            payload.specialties,
        )

        verification_sensitive_change = True

    update_data = payload.model_dump(
        exclude_unset=True,
        exclude={
            "address",
            "specialties",
        },
    )

    required_fields = {
        "first_name",
        "last_name",
        "registration_number",
        "qualification",
        "experience_years",
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
                detail=(
                    f"{field} cannot be null."
                ),
            )

        setattr(
            doctor,
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
            doctor,
            payload.address,
        )

    if payload.specialties is not None:
        replace_doctor_specialties(
            db,
            doctor,
            payload.specialties,
        )

    if (
        verification_sensitive_change
        and doctor.verification_status
        == DoctorVerificationStatus.VERIFIED
    ):
        doctor.verification_status = (
            DoctorVerificationStatus.PENDING
        )

        doctor.is_accepting_patients = False

    try:
        db.commit()

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Unable to update "
                "doctor profile."
            ),
        ) from exc

    doctor = get_doctor_by_user_id(
        db,
        current_user.id,
    )

    return serialize_doctor_profile(
        db,
        doctor,
    )


def list_active_specialties(
    db: Session,
):
    specialties = (
        get_active_specialties(db)
    )

    return [
        {
            "id":
                specialty.id,

            "name":
                specialty.name,

            "description":
                specialty.description,
        }
        for specialty in specialties
    ]