from fastapi import (
    APIRouter,
    Depends,
    status,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    require_doctor,
)

from app.core.database import (
    get_db,
)

from app.models.user import User

from app.schemas.doctor import (
    DoctorProfileCreate,
    DoctorProfileResponse,
    DoctorProfileUpdate,
    SpecialtyListResponse,
)

from app.services.doctor import (
    create_my_doctor_profile,
    get_my_doctor_profile,
    list_active_specialties,
    update_my_doctor_profile,
)


router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"],
)


@router.get(
    "/specialties",
    response_model=list[
        SpecialtyListResponse
    ],
)
def get_specialties(
    current_user: User = Depends(
        require_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    return list_active_specialties(
        db
    )


@router.get(
    "/me",
    response_model=DoctorProfileResponse,
)
def get_my_profile(
    current_user: User = Depends(
        require_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    return get_my_doctor_profile(
        db,
        current_user,
    )


@router.post(
    "/me",
    response_model=DoctorProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_my_profile(
    payload: DoctorProfileCreate,
    current_user: User = Depends(
        require_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    return create_my_doctor_profile(
        db,
        current_user,
        payload,
    )


@router.patch(
    "/me",
    response_model=DoctorProfileResponse,
)
def update_my_profile(
    payload: DoctorProfileUpdate,
    current_user: User = Depends(
        require_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    return update_my_doctor_profile(
        db,
        current_user,
        payload,
    )