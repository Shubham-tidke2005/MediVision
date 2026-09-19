import uuid

from datetime import datetime

from enum import Enum

from pydantic import (
    BaseModel,
    Field,
)


# =========================================================
# ENUMS
# =========================================================


class ActivityLevel(
    str,
    Enum,
):
    SEDENTARY = "SEDENTARY"
    LIGHT = "LIGHT"
    MODERATE = "MODERATE"
    ACTIVE = "ACTIVE"
    VERY_ACTIVE = "VERY_ACTIVE"


class DietPreference(
    str,
    Enum,
):
    VEGETARIAN = "VEGETARIAN"
    NON_VEGETARIAN = "NON_VEGETARIAN"
    VEGAN = "VEGAN"


class DietGoal(
    str,
    Enum,
):
    WEIGHT_LOSS = "WEIGHT_LOSS"
    MAINTENANCE = "MAINTENANCE"
    WEIGHT_GAIN = "WEIGHT_GAIN"


# =========================================================
# REQUEST
# =========================================================


class DietPlanCreate(
    BaseModel
):
    age: int = Field(
        ge=18,
        le=100,
    )

    height_cm: float = Field(
        ge=120,
        le=230,
    )

    weight_kg: float = Field(
        ge=30,
        le=300,
    )

    activity_level: ActivityLevel

    diet_preference: DietPreference

    goal: DietGoal


# =========================================================
# PLAN ITEM
# =========================================================


class DietPlanItemResponse(
    BaseModel
):
    id: uuid.UUID

    meal_type: str

    food_name: str

    quantity: str | None = None

    instructions: str | None = None

    sort_order: int


# =========================================================
# PLAN RESPONSE
# =========================================================


class DietPlanResponse(
    BaseModel
):
    id: uuid.UUID

    patient_id: uuid.UUID

    age: int

    height_cm: float

    weight_kg: float

    activity_level: ActivityLevel

    diet_preference: DietPreference

    goal: DietGoal

    bmi: float

    estimated_daily_calories: int

    water_target_ml: int

    source: str

    title: str

    calculation_note: str

    safety_message: str

    is_active: bool

    created_at: datetime

    updated_at: datetime

    items: list[
        DietPlanItemResponse
    ] = Field(
        default_factory=list
    )