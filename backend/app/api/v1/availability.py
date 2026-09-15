from datetime import (
    datetime,
    timedelta,
    timezone,
)
import uuid

from fastapi import (
    APIRouter,
    Depends,
    Query,
    Response,
    status,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_doctor,
)

from app.core.database import get_db

from app.models.doctor import Doctor

from app.repositories.availability import (
    get_rules,
    get_slots,
    get_time_off,
)

from app.schemas.availability import (
    AvailabilityRuleCreate,
    AvailabilityRuleResponse,
    AvailabilityRuleUpdate,
    GenerateSlotsRequest,
    GenerateSlotsResponse,
    SlotResponse,
    TimeOffCreate,
    TimeOffResponse,
)

from app.services.availability import (
    create_rule,
    create_time_off,
    delete_rule,
    delete_time_off,
    generate_slots,
    update_rule,
)


router = APIRouter(
    prefix="/doctors/me/availability",
    tags=["Doctor Availability"],
)


@router.get(
    "/rules",
    response_model=list[
        AvailabilityRuleResponse
    ],
)
def list_rules(
    doctor: Doctor = Depends(
        get_current_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    return get_rules(
        db,
        doctor.id,
    )


@router.post(
    "/rules",
    response_model=AvailabilityRuleResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_rule(
    payload: AvailabilityRuleCreate,
    doctor: Doctor = Depends(
        get_current_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    return create_rule(
        db,
        doctor,
        payload,
    )


@router.patch(
    "/rules/{rule_id}",
    response_model=AvailabilityRuleResponse,
)
def edit_rule(
    rule_id: uuid.UUID,
    payload: AvailabilityRuleUpdate,
    doctor: Doctor = Depends(
        get_current_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    return update_rule(
        db,
        doctor,
        rule_id,
        payload,
    )


@router.delete(
    "/rules/{rule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_rule(
    rule_id: uuid.UUID,
    doctor: Doctor = Depends(
        get_current_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    delete_rule(
        db,
        doctor,
        rule_id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )


@router.get(
    "/time-off",
    response_model=list[
        TimeOffResponse
    ],
)
def list_time_off(
    doctor: Doctor = Depends(
        get_current_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    return get_time_off(
        db,
        doctor.id,
    )


@router.post(
    "/time-off",
    response_model=TimeOffResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_time_off(
    payload: TimeOffCreate,
    doctor: Doctor = Depends(
        get_current_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    return create_time_off(
        db,
        doctor,
        payload,
    )


@router.delete(
    "/time-off/{time_off_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_time_off(
    time_off_id: uuid.UUID,
    doctor: Doctor = Depends(
        get_current_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    delete_time_off(
        db,
        doctor,
        time_off_id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )


@router.post(
    "/slots/generate",
    response_model=GenerateSlotsResponse,
)
def generate_doctor_slots(
    payload: GenerateSlotsRequest,
    doctor: Doctor = Depends(
        get_current_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    return generate_slots(
        db,
        doctor,
        payload.days,
    )


@router.get(
    "/slots",
    response_model=list[
        SlotResponse
    ],
)
def list_doctor_slots(
    days: int = Query(
        default=30,
        ge=1,
        le=90,
    ),
    doctor: Doctor = Depends(
        get_current_doctor
    ),
    db: Session = Depends(
        get_db
    ),
):
    start_at = datetime.now(
        timezone.utc
    )

    end_at = (
        start_at
        + timedelta(days=days)
    )

    return get_slots(
        db,
        doctor.id,
        start_at,
        end_at,
    )