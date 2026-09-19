import uuid

from fastapi import (
    APIRouter,
    Depends,
    status,
)

from sqlalchemy.orm import Session

from app.core.database import (
    get_db,
)

from app.models.patient import (
    Patient,
)

from app.schemas.diet import (
    DietPlanCreate,
    DietPlanResponse,
)

from app.services.diet import (
    create_diet_plan,
    read_current_diet_plan,
    read_patient_diet_plan,
    read_patient_diet_plans,
)


# =========================================================
# AUTH DEPENDENCY
#
# Use the same get_current_patient dependency used by
# your other Patient-protected endpoints.
# =========================================================

from app.api.dependencies import (
    get_current_patient,
)


router = APIRouter(
    prefix="/api/v1/diet",
    tags=[
        "Diet & Wellness"
    ],
)


# =========================================================
# CREATE
# =========================================================


@router.post(
    "/plans",
    response_model=(
        DietPlanResponse
    ),
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def generate_diet_plan(
    payload: DietPlanCreate,

    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return create_diet_plan(
        db,
        patient,
        payload,
    )


# =========================================================
# CURRENT
# =========================================================


@router.get(
    "/plans/current",
    response_model=(
        DietPlanResponse
        | None
    ),
)
def get_current_plan(
    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return read_current_diet_plan(
        db,
        patient,
    )


# =========================================================
# ALL
# =========================================================


@router.get(
    "/plans",
    response_model=list[
        DietPlanResponse
    ],
)
def get_all_diet_plans(
    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return read_patient_diet_plans(
        db,
        patient,
    )


# =========================================================
# ONE
# =========================================================


@router.get(
    "/plans/{plan_id}",
    response_model=(
        DietPlanResponse
    ),
)
def get_diet_plan(
    plan_id: uuid.UUID,

    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return read_patient_diet_plan(
        db,
        patient,
        plan_id,
    )