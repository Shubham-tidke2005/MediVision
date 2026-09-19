import uuid

from datetime import (
    date,
)

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.exc import (
    IntegrityError,
)

from sqlalchemy.orm import (
    Session,
)

from app.models.patient import (
    Patient,
)

from app.repositories.activity import (
    create_activity_plan_item,
    create_activity_plan_record,
    deactivate_current_activity_plans,
    get_activity_logs_for_plan_date,
    get_activity_plan_items,
    get_current_activity_plan,
    get_patient_activity_item,
    get_patient_activity_plan_by_id,
    get_patient_activity_plans,
    upsert_activity_log,
)

from app.repositories.diet import (
    get_current_diet_plan,
)

from app.schemas.activity import (
    ActivityGoal,
    ActivityLogResponse,
    ActivityLogStatus,
    ActivityLogUpdate,
    ActivityPlanCreate,
    ActivityPlanItemResponse,
    ActivityPlanResponse,
    ActivityProgressResponse,
    TodayActivityItem,
    TodayRoutineResponse,
)


# =========================================================
# CONSTANTS
# =========================================================


SAFETY_MESSAGE = (
    "This is a general wellness routine, not a medical "
    "exercise prescription. Choose comfortable activity "
    "levels and stop an activity if you develop significant "
    "pain, dizziness, breathing difficulty, or other "
    "concerning symptoms."
)


# =========================================================
# TITLE
# =========================================================


def build_plan_title(
    goal: ActivityGoal,
) -> str:

    titles = {
        ActivityGoal.GENERAL_WELLNESS:
            "Daily Wellness Routine",

        ActivityGoal.IMPROVE_FITNESS:
            "General Fitness Routine",

        ActivityGoal.INCREASE_ACTIVITY:
            "Daily Activity Routine",

        ActivityGoal.IMPROVE_SLEEP:
            "Activity & Sleep Wellness Routine",
    }


    return titles[
        goal
    ]


# =========================================================
# MOVEMENT DISTRIBUTION
# =========================================================


def build_movement_minutes(
    *,
    available_minutes: int,
    goal: ActivityGoal,
):
    """
    Movement suggestions are deliberately capped at
    60 minutes in this basic wellness module.

    Hydration and sleep are tracked separately.
    """

    total = min(
        available_minutes,
        60,
    )


    if (
        goal
        == ActivityGoal.IMPROVE_FITNESS
    ):
        walk_ratio = 0.60
        stretch_ratio = 0.20

    elif (
        goal
        == ActivityGoal.INCREASE_ACTIVITY
    ):
        walk_ratio = 0.55
        stretch_ratio = 0.20

    elif (
        goal
        == ActivityGoal.IMPROVE_SLEEP
    ):
        walk_ratio = 0.40
        stretch_ratio = 0.25

    else:
        walk_ratio = 0.50
        stretch_ratio = 0.20


    walking = max(
        5,
        round(
            total
            * walk_ratio
        ),
    )


    stretching = max(
        3,
        round(
            total
            * stretch_ratio
        ),
    )


    yoga = max(
        2,
        total
        - walking
        - stretching,
    )


    current_total = (
        walking
        + stretching
        + yoga
    )


    if (
        current_total
        > total
    ):
        difference = (
            current_total
            - total
        )

        walking = max(
            5,
            walking
            - difference,
        )


    return {
        "walking":
            walking,

        "stretching":
            stretching,

        "yoga":
            yoga,
    }


# =========================================================
# HYDRATION TARGET
# =========================================================


def get_hydration_target(
    db: Session,
    patient: Patient,
) -> int:
    """
    Reuse Phase 41's current Diet Plan hydration target
    where available.

    Otherwise use a simple 2 L general fallback.
    """

    diet_plan = (
        get_current_diet_plan(
            db,
            patient.id,
        )
    )


    if (
        diet_plan is not None
        and diet_plan.water_target_ml
    ):
        return int(
            diet_plan.water_target_ml
        )


    return 2000


# =========================================================
# ITEM DEFINITIONS
# =========================================================


def build_activity_items(
    db: Session,
    patient: Patient,
    payload: ActivityPlanCreate,
):

    movement = (
        build_movement_minutes(
            available_minutes=(
                payload
                .available_minutes_per_day
            ),

            goal=(
                payload.goal
            ),
        )
    )


    water_target = (
        get_hydration_target(
            db,
            patient,
        )
    )


    sleep_target = 8.0


    return [
        {
            "activity_type":
                "WALKING",

            "title":
                "Daily Walk",

            "description":
                (
                    "A comfortable-paced walk for general "
                    "daily movement."
                ),

            "target_value":
                movement[
                    "walking"
                ],

            "target_unit":
                "MINUTES",

            "duration_minutes":
                movement[
                    "walking"
                ],
        },

        {
            "activity_type":
                "STRETCHING",

            "title":
                "Gentle Stretching",

            "description":
                (
                    "Gentle whole-body stretching within "
                    "a comfortable range of movement."
                ),

            "target_value":
                movement[
                    "stretching"
                ],

            "target_unit":
                "MINUTES",

            "duration_minutes":
                movement[
                    "stretching"
                ],
        },

        {
            "activity_type":
                "YOGA",

            "title":
                "Light Yoga",

            "description":
                (
                    "Light, comfortable yoga or breathing "
                    "and mobility practice."
                ),

            "target_value":
                movement[
                    "yoga"
                ],

            "target_unit":
                "MINUTES",

            "duration_minutes":
                movement[
                    "yoga"
                ],
        },

        {
            "activity_type":
                "HYDRATION",

            "title":
                "Hydration Target",

            "description":
                (
                    "General daily hydration target. "
                    "Individual needs can vary."
                ),

            "target_value":
                water_target,

            "target_unit":
                "ML",

            "duration_minutes":
                None,
        },

        {
            "activity_type":
                "SLEEP",

            "title":
                "Sleep Target",

            "description":
                (
                    "General adult wellness target of "
                    "approximately eight hours."
                ),

            "target_value":
                sleep_target,

            "target_unit":
                "HOURS",

            "duration_minutes":
                None,
        },
    ]


# =========================================================
# SERIALIZE PLAN
# =========================================================


def serialize_activity_plan(
    db: Session,
    plan,
):

    items = (
        get_activity_plan_items(
            db,
            plan.id,
        )
    )


    return ActivityPlanResponse(
        id=(
            plan.id
        ),

        patient_id=(
            plan.patient_id
        ),

        goal=(
            plan.goal
        ),

        activity_level=(
            plan.activity_level
        ),

        available_minutes_per_day=(
            plan
            .available_minutes_per_day
        ),

        sleep_hours_snapshot=float(
            plan
            .sleep_hours_snapshot
        ),

        title=(
            plan.title
        ),

        source=(
            plan.source
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
            ActivityPlanItemResponse(
                id=(
                    item.id
                ),

                activity_type=(
                    item.activity_type
                ),

                title=(
                    item.title
                ),

                description=(
                    item.description
                ),

                target_value=float(
                    item.target_value
                ),

                target_unit=(
                    item.target_unit
                ),

                duration_minutes=(
                    item.duration_minutes
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
# CREATE PLAN
# =========================================================


def create_activity_plan(
    db: Session,
    patient: Patient,
    payload: ActivityPlanCreate,
):

    definitions = (
        build_activity_items(
            db,
            patient,
            payload,
        )
    )


    try:
        deactivate_current_activity_plans(
            db,
            patient.id,
        )


        plan = (
            create_activity_plan_record(
                db,

                patient_id=(
                    patient.id
                ),

                goal=(
                    payload
                    .goal
                    .value
                ),

                activity_level=(
                    payload
                    .activity_level
                    .value
                ),

                available_minutes_per_day=(
                    payload
                    .available_minutes_per_day
                ),

                sleep_hours_snapshot=(
                    payload
                    .sleep_hours
                ),

                title=(
                    build_plan_title(
                        payload.goal
                    )
                ),

                safety_message=(
                    SAFETY_MESSAGE
                ),
            )
        )


        for (
            index,
            definition,
        ) in enumerate(
            definitions,
            start=1,
        ):

            create_activity_plan_item(
                db,

                activity_plan_id=(
                    plan.id
                ),

                activity_type=(
                    definition[
                        "activity_type"
                    ]
                ),

                title=(
                    definition[
                        "title"
                    ]
                ),

                description=(
                    definition[
                        "description"
                    ]
                ),

                target_value=(
                    definition[
                        "target_value"
                    ]
                ),

                target_unit=(
                    definition[
                        "target_unit"
                    ]
                ),

                duration_minutes=(
                    definition[
                        "duration_minutes"
                    ]
                ),

                sort_order=(
                    index
                ),
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
                "The routine could not be created "
                "because another active routine was "
                "created at the same time. Please retry."
            ),
        ) from exc


    except Exception:
        db.rollback()
        raise


    return serialize_activity_plan(
        db,
        plan,
    )


# =========================================================
# CURRENT PLAN
# =========================================================


def read_current_activity_plan(
    db: Session,
    patient: Patient,
):

    plan = (
        get_current_activity_plan(
            db,
            patient.id,
        )
    )


    if plan is None:
        return None


    return serialize_activity_plan(
        db,
        plan,
    )


# =========================================================
# ALL PLANS
# =========================================================


def read_activity_plans(
    db: Session,
    patient: Patient,
):

    plans = (
        get_patient_activity_plans(
            db,
            patient.id,
        )
    )


    return [
        serialize_activity_plan(
            db,
            plan,
        )

        for plan
        in plans
    ]


# =========================================================
# ONE PLAN
# =========================================================


def read_activity_plan(
    db: Session,
    patient: Patient,
    plan_id: uuid.UUID,
):

    plan = (
        get_patient_activity_plan_by_id(
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
                "Activity plan not found."
            ),
        )


    return serialize_activity_plan(
        db,
        plan,
    )


# =========================================================
# PROGRESS
# =========================================================


def calculate_progress(
    items,
    logs,
):

    log_map = {
        log.activity_plan_item_id:
            log

        for log
        in logs
    }


    completed = 0
    partial = 0
    skipped = 0


    for item in items:
        log = log_map.get(
            item.id
        )


        if log is None:
            continue


        if (
            log.status
            == ActivityLogStatus.COMPLETED.value
        ):
            completed += 1


        elif (
            log.status
            == ActivityLogStatus.PARTIAL.value
        ):
            partial += 1


        elif (
            log.status
            == ActivityLogStatus.SKIPPED.value
        ):
            skipped += 1


    total = len(
        items
    )


    not_logged = max(
        0,
        total
        - completed
        - partial
        - skipped,
    )


    if total == 0:
        percentage = 0.0

    else:
        score = (
            completed
            + (
                partial
                * 0.5
            )
        )


        percentage = round(
            (
                score
                / total
            )
            * 100,
            1,
        )


    return ActivityProgressResponse(
        total_items=(
            total
        ),

        completed=(
            completed
        ),

        partial=(
            partial
        ),

        skipped=(
            skipped
        ),

        not_logged=(
            not_logged
        ),

        progress_percent=(
            percentage
        ),
    )


# =========================================================
# TODAY ROUTINE
# =========================================================


def read_today_routine(
    db: Session,
    patient: Patient,
    target_date: date,
):

    plan = (
        get_current_activity_plan(
            db,
            patient.id,
        )
    )


    if plan is None:
        return None


    items = (
        get_activity_plan_items(
            db,
            plan.id,
        )
    )


    logs = (
        get_activity_logs_for_plan_date(
            db,

            patient_id=(
                patient.id
            ),

            plan_id=(
                plan.id
            ),

            log_date=(
                target_date
            ),
        )
    )


    log_map = {
        log.activity_plan_item_id:
            log

        for log
        in logs
    }


    today_items = []


    for item in items:
        log = log_map.get(
            item.id
        )


        today_items.append(
            TodayActivityItem(
                id=(
                    item.id
                ),

                activity_type=(
                    item.activity_type
                ),

                title=(
                    item.title
                ),

                description=(
                    item.description
                ),

                target_value=float(
                    item.target_value
                ),

                target_unit=(
                    item.target_unit
                ),

                duration_minutes=(
                    item.duration_minutes
                ),

                sort_order=(
                    item.sort_order
                ),

                log_id=(
                    log.id
                    if log
                    else None
                ),

                log_status=(
                    log.status
                    if log
                    else None
                ),

                actual_value=(
                    float(
                        log.actual_value
                    )
                    if (
                        log
                        and log.actual_value
                        is not None
                    )
                    else None
                ),

                notes=(
                    log.notes
                    if log
                    else None
                ),
            )
        )


    return TodayRoutineResponse(
        plan_id=(
            plan.id
        ),

        title=(
            plan.title
        ),

        target_date=(
            target_date
        ),

        items=(
            today_items
        ),

        progress=(
            calculate_progress(
                items,
                logs,
            )
        ),

        safety_message=(
            plan.safety_message
        ),
    )


# =========================================================
# UPDATE LOG
# =========================================================


def save_activity_log(
    db: Session,
    patient: Patient,
    item_id: uuid.UUID,
    log_date: date,
    payload: ActivityLogUpdate,
):

    item = (
        get_patient_activity_item(
            db,

            patient_id=(
                patient.id
            ),

            item_id=(
                item_id
            ),
        )
    )


    if item is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Activity item not found."
            ),
        )


    actual_value = (
        payload.actual_value
    )


    if actual_value is None:

        if (
            payload.status
            == ActivityLogStatus.COMPLETED
        ):
            actual_value = float(
                item.target_value
            )


        elif (
            payload.status
            == ActivityLogStatus.PARTIAL
        ):
            actual_value = round(
                float(
                    item.target_value
                )
                * 0.5,
                2,
            )


        else:
            actual_value = 0


    try:
        log = (
            upsert_activity_log(
                db,

                patient_id=(
                    patient.id
                ),

                item_id=(
                    item.id
                ),

                log_date=(
                    log_date
                ),

                status=(
                    payload
                    .status
                    .value
                ),

                actual_value=(
                    actual_value
                ),

                notes=(
                    payload.notes
                ),
            )
        )


        db.commit()

        db.refresh(
            log
        )


    except Exception:
        db.rollback()
        raise


    return ActivityLogResponse(
        id=(
            log.id
        ),

        patient_id=(
            log.patient_id
        ),

        activity_plan_item_id=(
            log.activity_plan_item_id
        ),

        log_date=(
            log.log_date
        ),

        status=(
            log.status
        ),

        actual_value=(
            float(
                log.actual_value
            )
            if (
                log.actual_value
                is not None
            )
            else None
        ),

        notes=(
            log.notes
        ),

        created_at=(
            log.created_at
        ),

        updated_at=(
            log.updated_at
        ),
    )