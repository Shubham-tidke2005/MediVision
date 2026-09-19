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
    get_active_specialty_by_code,
    get_available_slots,
    search_verified_doctors,
)

from app.schemas.recommended_doctor import (
    RecommendedDoctorResponse,
    RecommendedDoctorSearchResponse,
    RecommendedDoctorSlotResponse,
)


# =========================================================
# NORMALIZE SPECIALTY CODE
# =========================================================


def normalize_specialty_code(
    specialty_code: str,
) -> str:
    code = (
        specialty_code
        .strip()
        .upper()
    )

    if not code:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Specialty code is required."
            ),
        )

    return code


# =========================================================
# AI SPECIALTY -> REAL DOCTORS
# =========================================================


def get_recommended_doctors(
    db: Session,
    *,
    specialty_code: str,
    days: int,
    page: int,
    page_size: int,
):
    """
    Important architecture:

    AI returns only a specialty code.

    Example:
        DERMATOLOGY

    PostgreSQL then determines:
        - whether that specialty exists
        - which real Doctors belong to it
        - which Doctors are verified
        - which Doctors are active
        - which Doctors accept Patients
        - which real slots are available

    OpenAI does not choose or invent Doctors.
    """

    code = normalize_specialty_code(
        specialty_code
    )


    # -----------------------------------------------------
    # Resolve AI code against PostgreSQL.
    # -----------------------------------------------------

    specialty = (
        get_active_specialty_by_code(
            db,
            code,
        )
    )


    if specialty is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "The recommended specialty "
                "is not available in MediVision."
            ),
        )


    # -----------------------------------------------------
    # Reuse normal Doctor discovery.
    #
    # This guarantees:
    #
    # VERIFIED
    # active
    # accepting Patients
    # correct DoctorSpecialty relation
    # -----------------------------------------------------

    doctors, total = (
        search_verified_doctors(
            db,
            search=None,
            specialty_id=(
                specialty.id
            ),
            city=None,
            page=page,
            page_size=page_size,
        )
    )


    # -----------------------------------------------------
    # Availability window
    # -----------------------------------------------------

    now = datetime.now(
        timezone.utc
    )

    end_at = (
        now
        + timedelta(
            days=days
        )
    )


    doctor_results = []


    # -----------------------------------------------------
    # Attach real available slots
    # -----------------------------------------------------

    for doctor in doctors:
        slots = get_available_slots(
            db,
            doctor.id,
            now,
            end_at,
        )


        # Show only the first few slots in the
        # recommendation screen.
        #
        # Doctor detail page can show the full list.
        next_slots = (
            slots[:3]
        )


        doctor_results.append(
            RecommendedDoctorResponse(
                id=doctor.id,

                doctor_code=(
                    doctor.doctor_code
                ),

                first_name=(
                    doctor.first_name
                ),

                last_name=(
                    doctor.last_name
                ),

                qualification=(
                    doctor.qualification
                ),

                next_available_slots=[
                    RecommendedDoctorSlotResponse(
                        id=slot.id,
                        start_at=(
                            slot.start_at
                        ),
                        end_at=(
                            slot.end_at
                        ),
                    )

                    for slot
                    in next_slots
                ],
            )
        )


    return (
        RecommendedDoctorSearchResponse(
            specialty_id=(
                specialty.id
            ),

            specialty_code=(
                specialty.code
            ),

            specialty_name=(
                specialty.name
            ),

            search_window_days=days,

            total=total,

            doctors=doctor_results,
        )
    )