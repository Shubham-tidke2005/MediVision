import uuid

from sqlalchemy import (
    select,
    update,
)

from sqlalchemy.orm import Session

from app.models.diet import (
    DietPlan,
    DietPlanItem,
)


# =========================================================
# DEACTIVATE OLD PLAN
# =========================================================


def deactivate_current_diet_plans(
    db: Session,
    patient_id: uuid.UUID,
):
    db.execute(
        update(
            DietPlan
        )
        .where(
            DietPlan.patient_id
            == patient_id,

            DietPlan.is_active.is_(
                True
            ),
        )
        .values(
            is_active=False
        )
    )


# =========================================================
# CREATE PLAN
# =========================================================


def create_diet_plan_record(
    db: Session,
    *,
    patient_id: uuid.UUID,
    age: int,
    height_cm: float,
    weight_kg: float,
    activity_level: str,
    diet_preference: str,
    goal: str,
    bmi: float,
    estimated_daily_calories: int,
    water_target_ml: int,
    title: str,
    calculation_note: str,
    safety_message: str,
) -> DietPlan:

    plan = DietPlan(
        patient_id=patient_id,

        age=age,

        height_cm=height_cm,

        weight_kg=weight_kg,

        activity_level=activity_level,

        diet_preference=diet_preference,

        goal=goal,

        bmi=bmi,

        estimated_daily_calories=(
            estimated_daily_calories
        ),

        water_target_ml=(
            water_target_ml
        ),

        source="RULE_BASED",

        title=title,

        calculation_note=(
            calculation_note
        ),

        safety_message=(
            safety_message
        ),

        is_active=True,
    )


    db.add(
        plan
    )

    db.flush()

    return plan


# =========================================================
# CREATE ITEM
# =========================================================


def create_diet_plan_item(
    db: Session,
    *,
    diet_plan_id: uuid.UUID,
    meal_type: str,
    food_name: str,
    quantity: str | None,
    instructions: str | None,
    sort_order: int,
) -> DietPlanItem:

    item = DietPlanItem(
        diet_plan_id=diet_plan_id,

        meal_type=meal_type,

        food_name=food_name,

        quantity=quantity,

        instructions=instructions,

        sort_order=sort_order,
    )


    db.add(
        item
    )

    return item


# =========================================================
# PLAN ITEMS
# =========================================================


def get_diet_plan_items(
    db: Session,
    diet_plan_id: uuid.UUID,
):
    return list(
        db.scalars(
            select(
                DietPlanItem
            )
            .where(
                DietPlanItem.diet_plan_id
                == diet_plan_id
            )
            .order_by(
                DietPlanItem.sort_order,
                DietPlanItem.created_at,
            )
        ).all()
    )


# =========================================================
# CURRENT PLAN
# =========================================================


def get_current_diet_plan(
    db: Session,
    patient_id: uuid.UUID,
):
    return db.scalar(
        select(
            DietPlan
        )
        .where(
            DietPlan.patient_id
            == patient_id,

            DietPlan.is_active.is_(
                True
            ),
        )
        .order_by(
            DietPlan.created_at.desc()
        )
    )


# =========================================================
# ALL PATIENT PLANS
# =========================================================


def get_patient_diet_plans(
    db: Session,
    patient_id: uuid.UUID,
):
    return list(
        db.scalars(
            select(
                DietPlan
            )
            .where(
                DietPlan.patient_id
                == patient_id
            )
            .order_by(
                DietPlan.created_at.desc()
            )
        ).all()
    )


# =========================================================
# ONE PLAN
# =========================================================


def get_patient_diet_plan_by_id(
    db: Session,
    *,
    patient_id: uuid.UUID,
    plan_id: uuid.UUID,
):
    return db.scalar(
        select(
            DietPlan
        )
        .where(
            DietPlan.id
            == plan_id,

            DietPlan.patient_id
            == patient_id,
        )
    )