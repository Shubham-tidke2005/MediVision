from fastapi import (
    APIRouter,
    Depends,
    status,
)
from sqlalchemy.orm import Session

from app.api.dependencies import (
    require_patient,
)
from app.core.database import get_db
from app.models.user import User

from app.schemas.patient import (
    PatientProfileCreate,
    PatientProfileResponse,
    PatientProfileUpdate,
)

from app.services.patient import (
    create_my_patient_profile,
    get_my_patient_profile,
    update_my_patient_profile,
)


router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
)


@router.get(
    "/me",
    response_model=PatientProfileResponse,
)
def get_my_profile(
    current_user: User = Depends(
        require_patient
    ),
    db: Session = Depends(get_db),
):
    return get_my_patient_profile(
        db,
        current_user,
    )


@router.post(
    "/me",
    response_model=PatientProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_my_profile(
    payload: PatientProfileCreate,
    current_user: User = Depends(
        require_patient
    ),
    db: Session = Depends(get_db),
):
    return create_my_patient_profile(
        db,
        current_user,
        payload,
    )


@router.patch(
    "/me",
    response_model=PatientProfileResponse,
)
def update_my_profile(
    payload: PatientProfileUpdate,
    current_user: User = Depends(
        require_patient
    ),
    db: Session = Depends(get_db),
):
    return update_my_patient_profile(
        db,
        current_user,
        payload,
    )