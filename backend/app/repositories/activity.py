import uuid

from datetime import (
    date,
)

from decimal import Decimal

from sqlalchemy import (
    select,
    update,
)

from sqlalchemy.orm import (
    Session,
)

from app.models.activity import (
    ActivityLog,
    ActivityPlan,
    ActivityPlanItem,
)


# =========================================================
# DEACTIVATE OLD PLAN
# =========================================================


def deactivate_current_activity_plans(
    db: Session,
    patient_id: uuid.UUID,
):
    db.execute(
        update(
            ActivityPlan
        )
        .where(
            ActivityPlan.patient_id
            == patient_id,

            ActivityPlan.is_active.is_(
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


def create_activity_plan_record(
    db: Session,
    *,
    patient_id: uuid.UUID,
    goal: str,
    activity_level: str,
    available_minutes_per_day: int,
    sleep_hours_snapshot: float,
    title: str,
    safety_message: str,
):

    plan = ActivityPlan(
        patient_id=(
            patient_id
        ),

        goal=(
            goal
        ),

        activity_level=(
            activity_level
        ),

        available_minutes_per_day=(
            available_minutes_per_day
        ),

        sleep_hours_snapshot=(
            sleep_hours_snapshot
        ),

        title=(
            title
        ),

        source=(
            "RULE_BASED"
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


def create_activity_plan_item(
    db: Session,
    *,
    activity_plan_id: uuid.UUID,
    activity_type: str,
    title: str,
    description: str | None,
    target_value: float,
    target_unit: str,
    duration_minutes: int | None,
    sort_order: int,
):

    item = ActivityPlanItem(
        activity_plan_id=(
            activity_plan_id
        ),

        activity_type=(
            activity_type
        ),

        title=(
            title
        ),

        description=(
            description
        ),

        target_value=(
            target_value
        ),

        target_unit=(
            target_unit
        ),

        duration_minutes=(
            duration_minutes
        ),

        sort_order=(
            sort_order
        ),
    )


    db.add(
        item
    )

    db.flush()


    return item


# =========================================================
# PLAN ITEMS
# =========================================================


def get_activity_plan_items(
    db: Session,
    plan_id: uuid.UUID,
):

    statement = (
        select(
            ActivityPlanItem
        )
        .where(
            ActivityPlanItem.activity_plan_id
            == plan_id
        )
        .order_by(
            ActivityPlanItem.sort_order.asc()
        )
    )


    return list(
        db.scalars(
            statement
        ).all()
    )


# =========================================================
# CURRENT PLAN
# =========================================================


def get_current_activity_plan(
    db: Session,
    patient_id: uuid.UUID,
):

    statement = (
        select(
            ActivityPlan
        )
        .where(
            ActivityPlan.patient_id
            == patient_id,

            ActivityPlan.is_active.is_(
                True
            ),
        )
        .order_by(
            ActivityPlan.created_at.desc()
        )
    )


    return db.scalar(
        statement
    )


# =========================================================
# ALL PLANS
# =========================================================


def get_patient_activity_plans(
    db: Session,
    patient_id: uuid.UUID,
):

    statement = (
        select(
            ActivityPlan
        )
        .where(
            ActivityPlan.patient_id
            == patient_id
        )
        .order_by(
            ActivityPlan.created_at.desc()
        )
    )


    return list(
        db.scalars(
            statement
        ).all()
    )


# =========================================================
# ONE PLAN
# =========================================================


def get_patient_activity_plan_by_id(
    db: Session,
    *,
    patient_id: uuid.UUID,
    plan_id: uuid.UUID,
):

    return db.scalar(
        select(
            ActivityPlan
        )
        .where(
            ActivityPlan.id
            == plan_id,

            ActivityPlan.patient_id
            == patient_id,
        )
    )


# =========================================================
# ITEM OWNERSHIP
# =========================================================


def get_patient_activity_item(
    db: Session,
    *,
    patient_id: uuid.UUID,
    item_id: uuid.UUID,
):

    statement = (
        select(
            ActivityPlanItem
        )
        .join(
            ActivityPlan,

            ActivityPlan.id
            == ActivityPlanItem.activity_plan_id,
        )
        .where(
            ActivityPlanItem.id
            == item_id,

            ActivityPlan.patient_id
            == patient_id,
        )
    )


    return db.scalar(
        statement
    )


# =========================================================
# ONE LOG
# =========================================================


def get_activity_log(
    db: Session,
    *,
    item_id: uuid.UUID,
    log_date: date,
):

    return db.scalar(
        select(
            ActivityLog
        )
        .where(
            ActivityLog.activity_plan_item_id
            == item_id,

            ActivityLog.log_date
            == log_date,
        )
    )


# =========================================================
# UPSERT LOG
# =========================================================


def upsert_activity_log(
    db: Session,
    *,
    patient_id: uuid.UUID,
    item_id: uuid.UUID,
    log_date: date,
    status: str,
    actual_value: float | Decimal | None,
    notes: str | None,
):

    existing = (
        get_activity_log(
            db,

            item_id=item_id,

            log_date=log_date,
        )
    )


    if existing is not None:
        existing.status = (
            status
        )

        existing.actual_value = (
            actual_value
        )

        existing.notes = (
            notes
        )

        db.flush()

        return existing


    log = ActivityLog(
        patient_id=(
            patient_id
        ),

        activity_plan_item_id=(
            item_id
        ),

        log_date=(
            log_date
        ),

        status=(
            status
        ),

        actual_value=(
            actual_value
        ),

        notes=(
            notes
        ),
    )


    db.add(
        log
    )

    db.flush()


    return log


# =========================================================
# LOGS FOR PLAN + DATE
# =========================================================


def get_activity_logs_for_plan_date(
    db: Session,
    *,
    patient_id: uuid.UUID,
    plan_id: uuid.UUID,
    log_date: date,
):

    statement = (
        select(
            ActivityLog
        )
        .join(
            ActivityPlanItem,

            ActivityPlanItem.id
            == ActivityLog.activity_plan_item_id,
        )
        .where(
            ActivityLog.patient_id
            == patient_id,

            ActivityPlanItem.activity_plan_id
            == plan_id,

            ActivityLog.log_date
            == log_date,
        )
    )


    return list(
        db.scalars(
            statement
        ).all()
    )