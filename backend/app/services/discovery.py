import math
import uuid
from datetime import (
    datetime,
    timedelta,
    timezone,
)

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.repositories.discovery import (
    get_active_specialties,
    get_addresses_for_doctors,
    get_available_slots,
    get_discoverable_doctor,
    get_specialties_for_doctors,
    search_verified_doctors,
)


def serialize_location(
    address,
):
    if address is None:
        return None

    return {
        "city":
            address.city,

        "district":
            address.district,

        "state":
            address.state,

        "country":
            address.country,
    }


def serialize_doctor_summary(
    doctor,
    *,
    specialties,
    address,
):
    return {
        "id":
            doctor.id,

        "doctor_code":
            doctor.doctor_code,

        "first_name":
            doctor.first_name,

        "last_name":
            doctor.last_name,

        "qualification":
            doctor.qualification,

        "experience_years":
            doctor.experience_years,

        "default_consultation_fee":
            doctor.default_consultation_fee,

        "specialties":
            specialties,

        "location":
            serialize_location(
                address
            ),

        "verified":
            True,
    }


def list_specialties(
    db: Session,
):
    specialties = (
        get_active_specialties(
            db
        )
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


def discover_doctors(
    db: Session,
    *,
    search: str | None,
    specialty_id: int | None,
    city: str | None,
    page: int,
    page_size: int,
):
    doctors, total = (
        search_verified_doctors(
            db,
            search=search,
            specialty_id=(
                specialty_id
            ),
            city=city,
            page=page,
            page_size=page_size,
        )
    )


    doctor_ids = [
        doctor.id
        for doctor in doctors
    ]


    specialties_map = (
        get_specialties_for_doctors(
            db,
            doctor_ids,
        )
    )


    addresses_map = (
        get_addresses_for_doctors(
            db,
            doctors,
        )
    )


    items = []

    for doctor in doctors:
        address = None

        if doctor.address_id:
            address = (
                addresses_map.get(
                    doctor.address_id
                )
            )

        items.append(
            serialize_doctor_summary(
                doctor,
                specialties=(
                    specialties_map.get(
                        doctor.id,
                        [],
                    )
                ),
                address=address,
            )
        )


    total_pages = (
        math.ceil(
            total / page_size
        )
        if total
        else 0
    )


    return {
        "items":
            items,

        "total":
            total,

        "page":
            page,

        "page_size":
            page_size,

        "total_pages":
            total_pages,
    }


def get_doctor_details(
    db: Session,
    doctor_id: uuid.UUID,
):
    doctor = (
        get_discoverable_doctor(
            db,
            doctor_id,
        )
    )

    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Doctor not found "
                "or unavailable."
            ),
        )


    specialties_map = (
        get_specialties_for_doctors(
            db,
            [
                doctor.id
            ],
        )
    )


    addresses_map = (
        get_addresses_for_doctors(
            db,
            [
                doctor
            ],
        )
    )


    address = None

    if doctor.address_id:
        address = (
            addresses_map.get(
                doctor.address_id
            )
        )


    result = (
        serialize_doctor_summary(
            doctor,
            specialties=(
                specialties_map.get(
                    doctor.id,
                    [],
                )
            ),
            address=address,
        )
    )


    result[
        "registration_number"
    ] = doctor.registration_number

    result[
        "bio"
    ] = doctor.bio


    return result


def get_doctor_available_slots(
    db: Session,
    doctor_id: uuid.UUID,
    days: int,
):
    doctor = (
        get_discoverable_doctor(
            db,
            doctor_id,
        )
    )

    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Doctor not found "
                "or unavailable."
            ),
        )


    start_at = datetime.now(
        timezone.utc
    )

    end_at = (
        start_at
        + timedelta(
            days=days
        )
    )


    slots = get_available_slots(
        db,
        doctor.id,
        start_at,
        end_at,
    )


    return slots