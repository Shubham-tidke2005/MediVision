import uuid

from datetime import (
    date,
)

from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
)

from sqlalchemy.orm import (
    Session,
)

from app.core.database import (
    get_db,
)

from app.models.patient import (
    Patient,
)

from app.api.dependencies import (
    get_current_patient,
)

from app.schemas.activity import (
    ActivityLogResponse,
    ActivityLogUpdate,
    ActivityPlanCreate,
    ActivityPlanResponse,
    TodayRoutineResponse,
)

from app.services.activity import (
    create_activity_plan,
    read_activity_plan,
    read_activity_plans,
    read_current_activity_plan,
    read_today_routine,
    save_activity_log,
)


router = APIRouter(
    prefix="/api/v1/activity",
    tags=[
        "Activity & Routine"
    ],
)


# =========================================================
# CREATE PLAN
# =========================================================


@router.post(
    "/plans",
    response_model=(
        ActivityPlanResponse
    ),
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def create_plan(
    payload: ActivityPlanCreate,

    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return create_activity_plan(
        db,
        patient,
        payload,
    )


# =========================================================
# CURRENT PLAN
# =========================================================


@router.get(
    "/plans/current",
    response_model=(
        ActivityPlanResponse
        | None
    ),
)
def current_plan(
    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return read_current_activity_plan(
        db,
        patient,
    )


# =========================================================
# ALL PLANS
# =========================================================


@router.get(
    "/plans",
    response_model=list[
        ActivityPlanResponse
    ],
)
def all_plans(
    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return read_activity_plans(
        db,
        patient,
    )


# =========================================================
# ONE PLAN
# =========================================================


@router.get(
    "/plans/{plan_id}",
    response_model=(
        ActivityPlanResponse
    ),
)
def one_plan(
    plan_id: uuid.UUID,

    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return read_activity_plan(
        db,
        patient,
        plan_id,
    )


# =========================================================
# TODAY / SPECIFIC DATE
# =========================================================


@router.get(
    "/today",
    response_model=(
        TodayRoutineResponse
        | None
    ),
)
def today(
    target_date: date | None = Query(
        default=None
    ),

    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    effective_date = (
        target_date
        or date.today()
    )


    return read_today_routine(
        db,
        patient,
        effective_date,
    )


# =========================================================
# MARK ACTIVITY
# =========================================================


@router.put(
    "/items/{item_id}/log",
    response_model=(
        ActivityLogResponse
    ),
)
def update_log(
    item_id: uuid.UUID,

    payload: ActivityLogUpdate,

    log_date: date | None = Query(
        default=None
    ),

    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    effective_date = (
        log_date
        or date.today()
    )


    return save_activity_log(
        db,
        patient,
        item_id,
        effective_date,
        payload,
    )