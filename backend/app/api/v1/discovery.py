import uuid

from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    require_patient,
)

from app.core.database import (
    get_db,
)

from app.models.user import User

from app.schemas.discovery import (
    AvailableSlotResponse,
    DiscoverySpecialtyResponse,
    DoctorDiscoveryDetailResponse,
    DoctorDiscoveryPageResponse,
)

from app.services.discovery import (
    discover_doctors,
    get_doctor_available_slots,
    get_doctor_details,
    list_specialties,
)


router = APIRouter(
    prefix="/discovery",
    tags=["Doctor Discovery"],
)


@router.get(
    "/specialties",
    response_model=list[
        DiscoverySpecialtyResponse
    ],
)
def specialties(
    current_user: User = Depends(
        require_patient
    ),
    db: Session = Depends(
        get_db
    ),
):
    return list_specialties(
        db
    )


@router.get(
    "/doctors",
    response_model=DoctorDiscoveryPageResponse,
)
def doctors(
    search: str | None = Query(
        default=None,
        max_length=100,
    ),

    specialty_id: int | None = Query(
        default=None,
        ge=1,
    ),

    city: str | None = Query(
        default=None,
        max_length=100,
    ),

    page: int = Query(
        default=1,
        ge=1,
    ),

    page_size: int = Query(
        default=12,
        ge=1,
        le=50,
    ),

    current_user: User = Depends(
        require_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return discover_doctors(
        db,
        search=search,
        specialty_id=(
            specialty_id
        ),
        city=city,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/doctors/{doctor_id}",
    response_model=DoctorDiscoveryDetailResponse,
)
def doctor_details(
    doctor_id: uuid.UUID,

    current_user: User = Depends(
        require_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_doctor_details(
        db,
        doctor_id,
    )


@router.get(
    "/doctors/{doctor_id}/slots",
    response_model=list[
        AvailableSlotResponse
    ],
)
def doctor_slots(
    doctor_id: uuid.UUID,

    days: int = Query(
        default=7,
        ge=1,
        le=30,
    ),

    current_user: User = Depends(
        require_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_doctor_available_slots(
        db,
        doctor_id,
        days,
    )