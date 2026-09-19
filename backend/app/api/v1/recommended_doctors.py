from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_patient,
)

from app.core.database import (
    get_db,
)

from app.models.patient import (
    Patient,
)

from app.schemas.recommended_doctor import (
    RecommendedDoctorSearchResponse,
)

from app.services.recommended_doctor import (
    get_recommended_doctors,
)


router = APIRouter(
    prefix="/discovery",
    tags=[
        "Doctor Discovery",
    ],
)


# =========================================================
# AI SPECIALTY -> REAL DOCTOR SEARCH
# =========================================================


@router.get(
    "/recommended-doctors",
    response_model=(
        RecommendedDoctorSearchResponse
    ),
)
def recommended_doctors(
    specialty_code: str = Query(
        ...,
        min_length=1,
        max_length=100,
        description=(
            "Stable specialty code returned "
            "by the AI assessment."
        ),
    ),

    days: int = Query(
        default=30,
        ge=1,
        le=90,
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

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    # `patient` intentionally protects this as
    # a Patient-only healthcare workflow.

    return get_recommended_doctors(
        db,
        specialty_code=(
            specialty_code
        ),
        days=days,
        page=page,
        page_size=page_size,
    )