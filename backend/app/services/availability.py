from datetime import (
    date,
    datetime,
    timedelta,
    timezone,
)
import uuid

from zoneinfo import (
    ZoneInfo,
    ZoneInfoNotFoundError,
)

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.exc import (
    IntegrityError,
)

from sqlalchemy.orm import Session

from app.models.availability import (
    DoctorAvailabilityRule,
    DoctorSlot,
    DoctorTimeOff,
)

from app.models.doctor import Doctor
from app.models.enums import SlotStatus

from app.repositories.availability import (
    delete_future_available_slots,
    get_rule,
    get_rules,
    get_slots,
    get_time_off,
    get_time_off_by_id,
)

from app.schemas.availability import (
    AvailabilityRuleCreate,
    AvailabilityRuleUpdate,
    TimeOffCreate,
)


def validate_timezone(
    timezone_name: str,
):
    try:
        return ZoneInfo(
            timezone_name
        )

    except ZoneInfoNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid timezone.",
        ) from exc


def rules_overlap(
    first: DoctorAvailabilityRule,
    start_time,
    end_time,
    day_of_week: int,
    ignore_rule_id=None,
):
    if (
        ignore_rule_id is not None
        and first.id == ignore_rule_id
    ):
        return False

    if not first.is_active:
        return False

    if first.day_of_week != day_of_week:
        return False

    return (
        start_time < first.end_time
        and end_time > first.start_time
    )


def create_rule(
    db: Session,
    doctor: Doctor,
    payload: AvailabilityRuleCreate,
):
    validate_timezone(
        payload.timezone
    )

    existing_rules = get_rules(
        db,
        doctor.id,
    )

    for existing in existing_rules:
        if rules_overlap(
            existing,
            payload.start_time,
            payload.end_time,
            payload.day_of_week,
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This availability overlaps "
                    "an existing rule."
                ),
            )

    rule = DoctorAvailabilityRule(
        doctor_id=doctor.id,
        day_of_week=payload.day_of_week,
        start_time=payload.start_time,
        end_time=payload.end_time,
        slot_duration_minutes=(
            payload.slot_duration_minutes
        ),
        valid_from=payload.valid_from,
        valid_until=payload.valid_until,
        timezone=payload.timezone,
        is_active=True,
    )

    db.add(rule)
    db.commit()
    db.refresh(rule)

    return rule


def update_rule(
    db: Session,
    doctor: Doctor,
    rule_id: uuid.UUID,
    payload: AvailabilityRuleUpdate,
):
    rule = get_rule(
        db,
        doctor.id,
        rule_id,
    )

    if rule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability rule not found.",
        )

    data = payload.model_dump(
        exclude_unset=True
    )

    new_start = data.get(
        "start_time",
        rule.start_time,
    )

    new_end = data.get(
        "end_time",
        rule.end_time,
    )

    if new_end <= new_start:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="End time must be after start time.",
        )

    new_valid_from = data.get(
        "valid_from",
        rule.valid_from,
    )

    new_valid_until = data.get(
        "valid_until",
        rule.valid_until,
    )

    if (
        new_valid_from
        and new_valid_until
        and new_valid_until
        < new_valid_from
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Valid until cannot be "
                "before valid from."
            ),
        )

    if "timezone" in data:
        validate_timezone(
            data["timezone"]
        )

    existing_rules = get_rules(
        db,
        doctor.id,
    )

    for existing in existing_rules:
        if rules_overlap(
            existing,
            new_start,
            new_end,
            rule.day_of_week,
            ignore_rule_id=rule.id,
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This availability overlaps "
                    "an existing rule."
                ),
            )

    for field, value in data.items():
        setattr(
            rule,
            field,
            value,
        )

    db.commit()
    db.refresh(rule)

    return rule


def delete_rule(
    db: Session,
    doctor: Doctor,
    rule_id: uuid.UUID,
):
    rule = get_rule(
        db,
        doctor.id,
        rule_id,
    )

    if rule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability rule not found.",
        )

    db.delete(rule)
    db.commit()


def create_time_off(
    db: Session,
    doctor: Doctor,
    payload: TimeOffCreate,
):
    time_off = DoctorTimeOff(
        doctor_id=doctor.id,
        start_at=payload.start_at,
        end_at=payload.end_at,
        reason=payload.reason,
    )

    db.add(time_off)
    db.commit()
    db.refresh(time_off)

    return time_off


def delete_time_off(
    db: Session,
    doctor: Doctor,
    time_off_id: uuid.UUID,
):
    item = get_time_off_by_id(
        db,
        doctor.id,
        time_off_id,
    )

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time-off entry not found.",
        )

    db.delete(item)
    db.commit()


def overlaps_time_off(
    start_at: datetime,
    end_at: datetime,
    time_off_items,
):
    for item in time_off_items:
        if (
            start_at < item.end_at
            and end_at > item.start_at
        ):
            return True

    return False


def generate_slots(
    db: Session,
    doctor: Doctor,
    days: int,
):
    today = date.today()

    final_date = (
        today
        + timedelta(
            days=days
        )
    )

    window_start = datetime.now(
        timezone.utc
    )

    window_end = (
        window_start
        + timedelta(
            days=days + 1
        )
    )

    rules = [
        rule
        for rule in get_rules(
            db,
            doctor.id,
        )
        if rule.is_active
    ]

    time_off_items = get_time_off(
        db,
        doctor.id,
    )

    # Rebuild only AVAILABLE future slots.
    # BOOKED / HELD / BLOCKED are preserved.
    delete_future_available_slots(
        db,
        doctor.id,
        window_start,
        window_end,
    )

    db.flush()

    generated = 0
    skipped = 0

    current_date = today

    while current_date <= final_date:
        for rule in rules:
            if (
                current_date.weekday()
                != rule.day_of_week
            ):
                continue

            if (
                rule.valid_from
                and current_date
                < rule.valid_from
            ):
                continue

            if (
                rule.valid_until
                and current_date
                > rule.valid_until
            ):
                continue

            tz = validate_timezone(
                rule.timezone
            )

            local_start = datetime.combine(
                current_date,
                rule.start_time,
                tzinfo=tz,
            )

            local_end = datetime.combine(
                current_date,
                rule.end_time,
                tzinfo=tz,
            )

            cursor = local_start

            duration = timedelta(
                minutes=(
                    rule.slot_duration_minutes
                )
            )

            while (
                cursor + duration
                <= local_end
            ):
                slot_local_end = (
                    cursor + duration
                )

                slot_start = (
                    cursor.astimezone(
                        timezone.utc
                    )
                )

                slot_end = (
                    slot_local_end.astimezone(
                        timezone.utc
                    )
                )

                if slot_start <= window_start:
                    skipped += 1
                    cursor = slot_local_end
                    continue

                if overlaps_time_off(
                    slot_start,
                    slot_end,
                    time_off_items,
                ):
                    skipped += 1
                    cursor = slot_local_end
                    continue

                slot = DoctorSlot(
                    doctor_id=doctor.id,
                    start_at=slot_start,
                    end_at=slot_end,
                    status=(
                        SlotStatus.AVAILABLE
                    ),
                )

                db.add(slot)

                try:
                    db.flush()
                    generated += 1

                except IntegrityError:
                    db.rollback()

                    # Re-enter clean transaction.
                    skipped += 1

                cursor = slot_local_end

        current_date += timedelta(
            days=1
        )

    db.commit()

    return {
        "generated": generated,
        "skipped": skipped,
    }