import uuid

from datetime import (
    date,
    datetime,
)

from enum import Enum

from pydantic import (
    BaseModel,
    Field,
)


# =========================================================
# ENUMS
# =========================================================


class ActivityGoal(
    str,
    Enum,
):
    GENERAL_WELLNESS = (
        "GENERAL_WELLNESS"
    )

    IMPROVE_FITNESS = (
        "IMPROVE_FITNESS"
    )

    INCREASE_ACTIVITY = (
        "INCREASE_ACTIVITY"
    )

    IMPROVE_SLEEP = (
        "IMPROVE_SLEEP"
    )


class RoutineActivityLevel(
    str,
    Enum,
):
    SEDENTARY = "SEDENTARY"
    LIGHT = "LIGHT"
    MODERATE = "MODERATE"
    ACTIVE = "ACTIVE"


class ActivityLogStatus(
    str,
    Enum,
):
    COMPLETED = "COMPLETED"
    PARTIAL = "PARTIAL"
    SKIPPED = "SKIPPED"


# =========================================================
# CREATE PLAN
# =========================================================


class ActivityPlanCreate(
    BaseModel
):
    goal: ActivityGoal

    activity_level: RoutineActivityLevel

    available_minutes_per_day: int = Field(
        ge=10,
        le=180,
    )

    sleep_hours: float = Field(
        ge=3,
        le=12,
    )


# =========================================================
# PLAN ITEM RESPONSE
# =========================================================


class ActivityPlanItemResponse(
    BaseModel
):
    id: uuid.UUID

    activity_type: str

    title: str

    description: str | None = None

    target_value: float

    target_unit: str

    duration_minutes: int | None = None

    sort_order: int


# =========================================================
# PLAN RESPONSE
# =========================================================


class ActivityPlanResponse(
    BaseModel
):
    id: uuid.UUID

    patient_id: uuid.UUID

    goal: ActivityGoal

    activity_level: RoutineActivityLevel

    available_minutes_per_day: int

    sleep_hours_snapshot: float

    title: str

    source: str

    safety_message: str

    is_active: bool

    created_at: datetime

    updated_at: datetime

    items: list[
        ActivityPlanItemResponse
    ] = Field(
        default_factory=list
    )


# =========================================================
# LOG REQUEST / RESPONSE
# =========================================================


class ActivityLogUpdate(
    BaseModel
):
    status: ActivityLogStatus

    actual_value: float | None = Field(
        default=None,
        ge=0,
    )

    notes: str | None = Field(
        default=None,
        max_length=500,
    )


class ActivityLogResponse(
    BaseModel
):
    id: uuid.UUID

    patient_id: uuid.UUID

    activity_plan_item_id: uuid.UUID

    log_date: date

    status: ActivityLogStatus

    actual_value: float | None = None

    notes: str | None = None

    created_at: datetime

    updated_at: datetime


# =========================================================
# TODAY
# =========================================================


class TodayActivityItem(
    ActivityPlanItemResponse
):
    log_id: uuid.UUID | None = None

    log_status: ActivityLogStatus | None = None

    actual_value: float | None = None

    notes: str | None = None


class ActivityProgressResponse(
    BaseModel
):
    total_items: int

    completed: int

    partial: int

    skipped: int

    not_logged: int

    progress_percent: float


class TodayRoutineResponse(
    BaseModel
):
    plan_id: uuid.UUID

    title: str

    target_date: date

    items: list[
        TodayActivityItem
    ]

    progress: ActivityProgressResponse

    safety_message: str