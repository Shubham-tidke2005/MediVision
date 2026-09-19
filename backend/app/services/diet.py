import uuid

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.exc import (
    IntegrityError,
)

from sqlalchemy.orm import Session

from app.models.patient import (
    Patient,
)

from app.repositories.diet import (
    create_diet_plan_item,
    create_diet_plan_record,
    deactivate_current_diet_plans,
    get_current_diet_plan,
    get_diet_plan_items,
    get_patient_diet_plan_by_id,
    get_patient_diet_plans,
)

from app.schemas.diet import (
    ActivityLevel,
    DietGoal,
    DietPlanCreate,
    DietPlanItemResponse,
    DietPlanResponse,
    DietPreference,
)


# =========================================================
# SAFETY
# =========================================================


SAFETY_MESSAGE = (
    "This is a general wellness meal suggestion based on "
    "simple calculations and predefined food rules. "
    "It is not a medical diet prescription. People with "
    "medical conditions, pregnancy, significant food "
    "allergies, or other clinical nutrition needs should "
    "seek individualized guidance from a qualified "
    "healthcare professional or registered dietitian."
)


CALCULATION_NOTE = (
    "The calorie value is a rough educational estimate "
    "using body weight, activity level and goal. "
    "It is not a clinical BMR or nutrition prescription."
)


# =========================================================
# ACTIVITY FACTORS
# kcal / kg
# =========================================================


ACTIVITY_FACTORS = {
    ActivityLevel.SEDENTARY:
        25,

    ActivityLevel.LIGHT:
        28,

    ActivityLevel.MODERATE:
        30,

    ActivityLevel.ACTIVE:
        33,

    ActivityLevel.VERY_ACTIVE:
        35,
}


# =========================================================
# GOAL ADJUSTMENTS
#
# Keep deliberately modest.
# =========================================================


GOAL_ADJUSTMENTS = {
    DietGoal.WEIGHT_LOSS:
        -200,

    DietGoal.MAINTENANCE:
        0,

    DietGoal.WEIGHT_GAIN:
        200,
}


# =========================================================
# BMI
# =========================================================


def calculate_bmi(
    weight_kg: float,
    height_cm: float,
) -> float:

    height_m = (
        height_cm
        / 100
    )


    bmi = (
        weight_kg
        / (
            height_m
            ** 2
        )
    )


    return round(
        bmi,
        2,
    )


# =========================================================
# SIMPLE SAFETY GUARDS
# =========================================================

def validate_wellness_context(
    *,
    bmi: float,
    goal: DietGoal,
):
    """
    Safety rules for the simple rule-based wellness planner.

    BMI is used only as a basic screening value here.
    It is not treated as a diagnosis.

    We avoid generating clearly incompatible goal plans,
    while still allowing general wellness suggestions.
    """

    # -----------------------------------------------------
    # LOW BMI + WEIGHT LOSS
    # -----------------------------------------------------

    if (
        bmi < 18.5
        and goal
        == DietGoal.WEIGHT_LOSS
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "A weight-loss plan is not generated "
                "for these measurements by this "
                "general wellness module. Please choose "
                "maintenance or higher-energy guidance, "
                "or seek individualized nutrition advice."
            ),
        )


    # -----------------------------------------------------
    # HIGH BMI + WEIGHT GAIN
    # -----------------------------------------------------

    if (
        bmi > 35
        and goal
        == DietGoal.WEIGHT_GAIN
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "A weight-gain plan is not generated "
                "for these measurements by this "
                "general wellness module. Please choose "
                "maintenance guidance or seek "
                "individualized nutrition advice."
            ),
        )

# =========================================================
# CALORIE ESTIMATE
# =========================================================


def calculate_daily_calories(
    *,
    weight_kg: float,
    activity_level: ActivityLevel,
    goal: DietGoal,
) -> int:

    base = (
        weight_kg
        * ACTIVITY_FACTORS[
            activity_level
        ]
    )


    adjusted = (
        base
        + GOAL_ADJUSTMENTS[
            goal
        ]
    )


    # Application guardrails.
    # These are not clinical thresholds.

    adjusted = max(
        1500,
        min(
            adjusted,
            4000,
        ),
    )


    return int(
        round(
            adjusted
        )
    )


# =========================================================
# WATER ESTIMATE
# =========================================================


def calculate_water_target(
    weight_kg: float,
) -> int:

    estimate = (
        weight_kg
        * 30
    )


    estimate = max(
        1500,
        min(
            estimate,
            4000,
        ),
    )


    # Round to nearest 50 mL.

    return int(
        round(
            estimate
            / 50
        )
        * 50
    )


# =========================================================
# PLAN TITLE
# =========================================================


def build_plan_title(
    goal: DietGoal,
) -> str:

    titles = {
        DietGoal.WEIGHT_LOSS:
            "Suggested Weight Management Meal Plan",

        DietGoal.MAINTENANCE:
            "Suggested Balanced Meal Plan",

        DietGoal.WEIGHT_GAIN:
            "Suggested Higher-Energy Meal Plan",
    }


    return titles[
        goal
    ]


# =========================================================
# VEGETARIAN
# =========================================================


def vegetarian_items(
    goal: DietGoal,
):
    items = [
        (
            "BREAKFAST",
            "Vegetable oats",
            "1 medium bowl",
            "Use vegetables and minimal added sugar.",
        ),

        (
            "BREAKFAST",
            "Plain curd or yogurt",
            "1 small bowl",
            None,
        ),

        (
            "BREAKFAST",
            "Seasonal fruit",
            "1 serving",
            None,
        ),

        (
            "LUNCH",
            "Whole-wheat roti",
            "2 medium",
            None,
        ),

        (
            "LUNCH",
            "Dal",
            "1 bowl",
            None,
        ),

        (
            "LUNCH",
            "Mixed vegetable sabzi",
            "1 bowl",
            None,
        ),

        (
            "LUNCH",
            "Salad",
            "1 serving",
            None,
        ),

        (
            "SNACK",
            "Roasted chana",
            "1 small handful",
            None,
        ),

        (
            "SNACK",
            "Seasonal fruit",
            "1 serving",
            None,
        ),

        (
            "DINNER",
            "Paneer or tofu",
            "1 serving",
            "Prefer grilled, lightly cooked or minimally fried preparation.",
        ),

        (
            "DINNER",
            "Cooked vegetables",
            "1 bowl",
            None,
        ),

        (
            "DINNER",
            "Roti or rice",
            "1 moderate serving",
            None,
        ),
    ]


    if (
        goal
        == DietGoal.WEIGHT_GAIN
    ):
        items.append(
            (
                "SNACK",
                "Nuts and seeds",
                "1 small handful",
                "Use as an additional energy-dense snack.",
            )
        )


    return items


# =========================================================
# NON VEGETARIAN
# =========================================================


def non_vegetarian_items(
    goal: DietGoal,
):
    items = [
        (
            "BREAKFAST",
            "Vegetable oats or poha",
            "1 medium bowl",
            None,
        ),

        (
            "BREAKFAST",
            "Eggs",
            "1-2",
            "Boiled or lightly cooked.",
        ),

        (
            "BREAKFAST",
            "Seasonal fruit",
            "1 serving",
            None,
        ),

        (
            "LUNCH",
            "Whole-wheat roti",
            "2 medium",
            None,
        ),

        (
            "LUNCH",
            "Dal",
            "1 small bowl",
            None,
        ),

        (
            "LUNCH",
            "Chicken or fish",
            "1 moderate serving",
            "Prefer grilled, baked or lightly cooked preparation.",
        ),

        (
            "LUNCH",
            "Vegetables and salad",
            "1-2 servings",
            None,
        ),

        (
            "SNACK",
            "Fruit",
            "1 serving",
            None,
        ),

        (
            "SNACK",
            "Roasted chana or nuts",
            "1 small handful",
            None,
        ),

        (
            "DINNER",
            "Egg, chicken or fish",
            "1 moderate serving",
            None,
        ),

        (
            "DINNER",
            "Cooked vegetables",
            "1 bowl",
            None,
        ),

        (
            "DINNER",
            "Roti or rice",
            "1 moderate serving",
            None,
        ),
    ]


    if (
        goal
        == DietGoal.WEIGHT_GAIN
    ):
        items.append(
            (
                "SNACK",
                "Milk or plain yogurt",
                "1 serving",
                "Optional additional snack if tolerated.",
            )
        )


    return items


# =========================================================
# VEGAN
# =========================================================


def vegan_items(
    goal: DietGoal,
):
    items = [
        (
            "BREAKFAST",
            "Oats with fortified plant beverage",
            "1 medium bowl",
            None,
        ),

        (
            "BREAKFAST",
            "Seasonal fruit",
            "1 serving",
            None,
        ),

        (
            "BREAKFAST",
            "Seeds",
            "1 small portion",
            None,
        ),

        (
            "LUNCH",
            "Whole-wheat roti",
            "2 medium",
            None,
        ),

        (
            "LUNCH",
            "Dal or chickpeas",
            "1 bowl",
            None,
        ),

        (
            "LUNCH",
            "Mixed vegetable sabzi",
            "1 bowl",
            None,
        ),

        (
            "LUNCH",
            "Salad",
            "1 serving",
            None,
        ),

        (
            "SNACK",
            "Fruit",
            "1 serving",
            None,
        ),

        (
            "SNACK",
            "Roasted chickpeas",
            "1 small handful",
            None,
        ),

        (
            "DINNER",
            "Tofu or beans",
            "1 serving",
            None,
        ),

        (
            "DINNER",
            "Cooked vegetables",
            "1 bowl",
            None,
        ),

        (
            "DINNER",
            "Roti or brown rice",
            "1 moderate serving",
            None,
        ),
    ]


    if (
        goal
        == DietGoal.WEIGHT_GAIN
    ):
        items.append(
            (
                "SNACK",
                "Peanut butter with whole-grain toast",
                "1 serving",
                "Optional higher-energy snack.",
            )
        )


    return items


# =========================================================
# BUILD MEAL ITEMS
# =========================================================


def build_meal_items(
    *,
    diet_preference: DietPreference,
    goal: DietGoal,
):

    if (
        diet_preference
        == DietPreference.VEGETARIAN
    ):
        return vegetarian_items(
            goal
        )


    if (
        diet_preference
        == DietPreference.NON_VEGETARIAN
    ):
        return non_vegetarian_items(
            goal
        )


    return vegan_items(
        goal
    )


# =========================================================
# SERIALIZATION
# =========================================================


def serialize_plan(
    db: Session,
    plan,
) -> DietPlanResponse:

    items = (
        get_diet_plan_items(
            db,
            plan.id,
        )
    )


    return DietPlanResponse(
        id=plan.id,

        patient_id=plan.patient_id,

        age=plan.age,

        height_cm=float(
            plan.height_cm
        ),

        weight_kg=float(
            plan.weight_kg
        ),

        activity_level=(
            plan.activity_level
        ),

        diet_preference=(
            plan.diet_preference
        ),

        goal=plan.goal,

        bmi=float(
            plan.bmi
        ),

        estimated_daily_calories=(
            plan
            .estimated_daily_calories
        ),

        water_target_ml=(
            plan.water_target_ml
        ),

        source=plan.source,

        title=plan.title,

        calculation_note=(
            plan.calculation_note
        ),

        safety_message=(
            plan.safety_message
        ),

        is_active=(
            plan.is_active
        ),

        created_at=(
            plan.created_at
        ),

        updated_at=(
            plan.updated_at
        ),

        items=[
            DietPlanItemResponse(
                id=item.id,

                meal_type=(
                    item.meal_type
                ),

                food_name=(
                    item.food_name
                ),

                quantity=(
                    item.quantity
                ),

                instructions=(
                    item.instructions
                ),

                sort_order=(
                    item.sort_order
                ),
            )

            for item
            in items
        ],
    )


# =========================================================
# CREATE DIET PLAN
# =========================================================


def create_diet_plan(
    db: Session,
    patient: Patient,
    payload: DietPlanCreate,
) -> DietPlanResponse:

    bmi = calculate_bmi(
        weight_kg=(
            payload.weight_kg
        ),

        height_cm=(
            payload.height_cm
        ),
    )


    validate_wellness_context(
        bmi=bmi,
        goal=payload.goal,
    )


    calories = (
        calculate_daily_calories(
            weight_kg=(
                payload.weight_kg
            ),

            activity_level=(
                payload.activity_level
            ),

            goal=(
                payload.goal
            ),
        )
    )


    water_target = (
        calculate_water_target(
            payload.weight_kg
        )
    )


    meal_items = (
        build_meal_items(
            diet_preference=(
                payload
                .diet_preference
            ),

            goal=(
                payload.goal
            ),
        )
    )


    try:
        deactivate_current_diet_plans(
            db,
            patient.id,
        )


        plan = (
            create_diet_plan_record(
                db,

                patient_id=(
                    patient.id
                ),

                age=(
                    payload.age
                ),

                height_cm=(
                    payload.height_cm
                ),

                weight_kg=(
                    payload.weight_kg
                ),

                activity_level=(
                    payload
                    .activity_level
                    .value
                ),

                diet_preference=(
                    payload
                    .diet_preference
                    .value
                ),

                goal=(
                    payload
                    .goal
                    .value
                ),

                bmi=bmi,

                estimated_daily_calories=(
                    calories
                ),

                water_target_ml=(
                    water_target
                ),

                title=(
                    build_plan_title(
                        payload.goal
                    )
                ),

                calculation_note=(
                    CALCULATION_NOTE
                ),

                safety_message=(
                    SAFETY_MESSAGE
                ),
            )
        )


        for (
            index,
            meal,
        ) in enumerate(
            meal_items,
            start=1,
        ):
            (
                meal_type,
                food_name,
                quantity,
                instructions,
            ) = meal


            create_diet_plan_item(
                db,

                diet_plan_id=(
                    plan.id
                ),

                meal_type=(
                    meal_type
                ),

                food_name=(
                    food_name
                ),

                quantity=(
                    quantity
                ),

                instructions=(
                    instructions
                ),

                sort_order=index,
            )


        db.commit()

        db.refresh(
            plan
        )


    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "The diet plan could not be created "
                "because another active plan was created "
                "at the same time. Please try again."
            ),
        ) from exc


    except Exception:
        db.rollback()

        raise


    return serialize_plan(
        db,
        plan,
    )


# =========================================================
# CURRENT PLAN
# =========================================================


def read_current_diet_plan(
    db: Session,
    patient: Patient,
) -> DietPlanResponse | None:

    plan = (
        get_current_diet_plan(
            db,
            patient.id,
        )
    )


    if plan is None:
        return None


    return serialize_plan(
        db,
        plan,
    )


# =========================================================
# LIST PLANS
# =========================================================


def read_patient_diet_plans(
    db: Session,
    patient: Patient,
) -> list[
    DietPlanResponse
]:

    plans = (
        get_patient_diet_plans(
            db,
            patient.id,
        )
    )


    return [
        serialize_plan(
            db,
            plan,
        )

        for plan
        in plans
    ]


# =========================================================
# READ ONE PLAN
# =========================================================


def read_patient_diet_plan(
    db: Session,
    patient: Patient,
    plan_id: uuid.UUID,
) -> DietPlanResponse:

    plan = (
        get_patient_diet_plan_by_id(
            db,

            patient_id=(
                patient.id
            ),

            plan_id=(
                plan_id
            ),
        )
    )


    if plan is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Diet plan not found."
            ),
        )


    return serialize_plan(
        db,
        plan,
    )