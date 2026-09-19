import uuid
from datetime import datetime

from sqlalchemy import (
    func,
    or_,
    select,
)

from sqlalchemy.orm import Session

from app.models.address import Address

from app.models.availability import (
    DoctorSlot,
)

from app.models.doctor import (
    Doctor,
    DoctorSpecialty,
    Specialty,
)

from app.models.enums import (
    DoctorVerificationStatus,
    SlotStatus,
)


# =========================================================
# SPECIALTIES
# =========================================================


def get_active_specialties(
    db: Session,
):
    return list(
        db.scalars(
            select(Specialty)
            .where(
                Specialty.is_active.is_(
                    True
                )
            )
            .order_by(
                Specialty.name
            )
        ).all()
    )


def get_active_specialty_by_code(
    db: Session,
    specialty_code: str,
):
    """
    Find an active specialty using the stable
    machine-readable specialty code.

    Examples:

    DERMATOLOGY
    NEUROLOGY
    CARDIOLOGY
    """

    return db.scalar(
        select(Specialty)
        .where(
            Specialty.code
            == specialty_code,

            Specialty.is_active.is_(
                True
            ),
        )
    )


# =========================================================
# DOCTOR SEARCH
# =========================================================


def search_verified_doctors(
    db: Session,
    *,
    search: str | None,
    specialty_id: int | None,
    city: str | None,
    page: int,
    page_size: int,
):
    """
    Existing normal Doctor discovery.

    Important:
    Phase 34 reuses this function instead of allowing
    the AI to invent or select Doctors.
    """

    stmt = (
        select(Doctor)
        .where(
            Doctor.verification_status
            == DoctorVerificationStatus.VERIFIED,

            Doctor.is_active.is_(
                True
            ),

            Doctor.is_accepting_patients.is_(
                True
            ),
        )
    )


    # =====================================================
    # TEXT SEARCH
    # =====================================================

    if search:
        search_value = (
            f"%{search.strip()}%"
        )

        stmt = stmt.where(
            or_(
                Doctor.first_name.ilike(
                    search_value
                ),

                Doctor.last_name.ilike(
                    search_value
                ),

                Doctor.qualification.ilike(
                    search_value
                ),

                Doctor.doctor_code.ilike(
                    search_value
                ),
            )
        )


    # =====================================================
    # SPECIALTY FILTER
    # =====================================================

    if specialty_id is not None:
        specialty_exists = (
            select(
                DoctorSpecialty.doctor_id
            )
            .where(
                DoctorSpecialty.doctor_id
                == Doctor.id,

                DoctorSpecialty.specialty_id
                == specialty_id,
            )
            .exists()
        )

        stmt = stmt.where(
            specialty_exists
        )


    # =====================================================
    # CITY FILTER
    # =====================================================

    if city:
        stmt = (
            stmt
            .join(
                Address,
                Address.id
                == Doctor.address_id,
            )
            .where(
                func.lower(
                    Address.city
                )
                == city.strip().lower()
            )
        )


    # =====================================================
    # COUNT
    # =====================================================

    count_stmt = (
        select(
            func.count()
        )
        .select_from(
            stmt
            .order_by(None)
            .subquery()
        )
    )


    total = (
        db.scalar(
            count_stmt
        )
        or 0
    )


    # =====================================================
    # PAGINATION
    # =====================================================

    offset = (
        page - 1
    ) * page_size


    doctors = list(
        db.scalars(
            stmt
            .order_by(
                Doctor.first_name,
                Doctor.last_name,
            )
            .offset(
                offset
            )
            .limit(
                page_size
            )
        ).all()
    )


    return (
        doctors,
        total,
    )


# =========================================================
# ONE DISCOVERABLE DOCTOR
# =========================================================


def get_discoverable_doctor(
    db: Session,
    doctor_id: uuid.UUID,
):
    return db.scalar(
        select(Doctor)
        .where(
            Doctor.id
            == doctor_id,

            Doctor.verification_status
            == DoctorVerificationStatus.VERIFIED,

            Doctor.is_active.is_(
                True
            ),

            Doctor.is_accepting_patients.is_(
                True
            ),
        )
    )


# =========================================================
# SPECIALTIES FOR DOCTORS
# =========================================================


def get_specialties_for_doctors(
    db: Session,
    doctor_ids: list[
        uuid.UUID
    ],
):
    if not doctor_ids:
        return {}


    rows = db.execute(
        select(
            DoctorSpecialty.doctor_id,
            Specialty.id,
            Specialty.code,
            Specialty.name,
            DoctorSpecialty.is_primary,
        )
        .join(
            Specialty,
            Specialty.id
            == DoctorSpecialty.specialty_id,
        )
        .where(
            DoctorSpecialty.doctor_id.in_(
                doctor_ids
            )
        )
        .order_by(
            DoctorSpecialty.is_primary.desc(),
            Specialty.name,
        )
    ).all()


    result = {}


    for (
        doctor_id,
        specialty_id,
        specialty_code,
        specialty_name,
        is_primary,
    ) in rows:

        result.setdefault(
            doctor_id,
            [],
        ).append(
            {
                "id":
                    specialty_id,

                "code":
                    specialty_code,

                "name":
                    specialty_name,

                "is_primary":
                    is_primary,
            }
        )


    return result


# =========================================================
# ADDRESSES FOR DOCTORS
# =========================================================


def get_addresses_for_doctors(
    db: Session,
    doctors: list[
        Doctor
    ],
):
    address_ids = [
        doctor.address_id

        for doctor in doctors

        if doctor.address_id
        is not None
    ]


    if not address_ids:
        return {}


    addresses = list(
        db.scalars(
            select(Address)
            .where(
                Address.id.in_(
                    address_ids
                )
            )
        ).all()
    )


    return {
        address.id:
            address

        for address
        in addresses
    }


# =========================================================
# AVAILABLE SLOTS
# =========================================================


def get_available_slots(
    db: Session,
    doctor_id: uuid.UUID,
    start_at: datetime,
    end_at: datetime,
):
    """
    Real slots from PostgreSQL.

    AI never creates slot times.
    """

    return list(
        db.scalars(
            select(
                DoctorSlot
            )
            .where(
                DoctorSlot.doctor_id
                == doctor_id,

                DoctorSlot.status
                == SlotStatus.AVAILABLE,

                DoctorSlot.start_at
                >= start_at,

                DoctorSlot.start_at
                < end_at,
            )
            .order_by(
                DoctorSlot.start_at
            )
        ).all()
    )