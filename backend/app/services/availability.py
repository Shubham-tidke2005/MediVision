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

from sqlalchemy.orm import Session

from app.models.availability import (
    DoctorAvailabilityRule,
    DoctorSlot,
    DoctorTimeOff,
)

from app.models.doctor import Doctor

from app.models.enums import (
    SlotStatus,
)

from app.repositories.availability import (
    delete_future_available_slots,
    get_existing_slot,
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


# =========================================================
# TIMEZONE
# =========================================================


def validate_timezone(
    timezone_name: str,
):
    """
    Validate an IANA timezone such as:

    Asia/Kolkata
    America/New_York

    Returns the ZoneInfo object when valid.
    """

    try:
        return ZoneInfo(
            timezone_name
        )

    except ZoneInfoNotFoundError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail="Invalid timezone.",
        ) from exc


# =========================================================
# RULE VALIDATION
# =========================================================


def validate_rule_values(
    start_time,
    end_time,
    slot_duration_minutes: int,
    valid_from=None,
    valid_until=None,
):
    """
    Validate the basic availability rule fields.
    """

    if (
        end_time
        <= start_time
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "End time must be after start time."
            ),
        )


    if (
        slot_duration_minutes
        <= 0
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Slot duration must be greater than zero."
            ),
        )


    if (
        valid_from
        and valid_until
        and valid_until
        < valid_from
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Valid until cannot be before "
                "valid from."
            ),
        )


    # -----------------------------------------------------
    # Check whether at least one complete slot can fit
    # inside the availability period.
    # -----------------------------------------------------

    start_seconds = (
        start_time.hour * 3600
        + start_time.minute * 60
        + start_time.second
    )

    end_seconds = (
        end_time.hour * 3600
        + end_time.minute * 60
        + end_time.second
    )

    availability_seconds = (
        end_seconds
        - start_seconds
    )

    slot_seconds = (
        slot_duration_minutes
        * 60
    )


    if (
        slot_seconds
        > availability_seconds
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Slot duration cannot be longer "
                "than the availability period."
            ),
        )


# =========================================================
# DATE RANGE OVERLAP
# =========================================================


def date_ranges_overlap(
    first_start,
    first_end,
    second_start,
    second_end,
):
    """
    Check whether two optional date ranges overlap.

    None means open-ended.

    Examples:

    None -> None
    overlaps everything.

    2026-09-01 -> 2026-09-30
    does not overlap
    2026-10-01 -> 2026-10-31.
    """

    first_start_value = (
        first_start
        or date.min
    )

    first_end_value = (
        first_end
        or date.max
    )

    second_start_value = (
        second_start
        or date.min
    )

    second_end_value = (
        second_end
        or date.max
    )

    return (
        first_start_value
        <= second_end_value
        and second_start_value
        <= first_end_value
    )


# =========================================================
# AVAILABILITY RULE OVERLAP
# =========================================================


def rules_overlap(
    existing_rule: DoctorAvailabilityRule,
    start_time,
    end_time,
    day_of_week: int,
    valid_from=None,
    valid_until=None,
    ignore_rule_id=None,
):
    """
    Determine whether a proposed rule overlaps
    an existing rule belonging to the SAME Doctor.

    Important:
    The Doctor filtering happens before this function,
    through get_rules(db, doctor.id).
    """

    # -----------------------------------------------------
    # Ignore current rule while updating
    # -----------------------------------------------------

    if (
        ignore_rule_id is not None
        and existing_rule.id
        == ignore_rule_id
    ):
        return False


    # -----------------------------------------------------
    # Inactive rules do not create conflicts
    # -----------------------------------------------------

    if (
        not existing_rule.is_active
    ):
        return False


    # -----------------------------------------------------
    # Different weekday = no conflict
    # -----------------------------------------------------

    if (
        existing_rule.day_of_week
        != day_of_week
    ):
        return False


    # -----------------------------------------------------
    # Date ranges must overlap
    # -----------------------------------------------------

    if not date_ranges_overlap(
        existing_rule.valid_from,
        existing_rule.valid_until,
        valid_from,
        valid_until,
    ):
        return False


    # -----------------------------------------------------
    # Time ranges must overlap
    #
    # Existing: 09:00 -> 13:00
    # New:      11:00 -> 15:00
    #
    # Conflict.
    #
    # Existing: 09:00 -> 13:00
    # New:      13:00 -> 16:00
    #
    # No conflict.
    # -----------------------------------------------------

    return (
        start_time
        < existing_rule.end_time
        and end_time
        > existing_rule.start_time
    )


# =========================================================
# CREATE AVAILABILITY RULE
# =========================================================


def create_rule(
    db: Session,
    doctor: Doctor,
    payload: AvailabilityRuleCreate,
):
    """
    Create an availability rule for one Doctor.

    Two DIFFERENT Doctors are allowed to have:

    Monday
    09:00 -> 13:00

    at exactly the same time.
    """

    validate_timezone(
        payload.timezone
    )


    validate_rule_values(
        start_time=(
            payload.start_time
        ),
        end_time=(
            payload.end_time
        ),
        slot_duration_minutes=(
            payload.slot_duration_minutes
        ),
        valid_from=(
            payload.valid_from
        ),
        valid_until=(
            payload.valid_until
        ),
    )


    # -----------------------------------------------------
    # CRITICAL:
    #
    # get_rules() filters using:
    #
    # DoctorAvailabilityRule.doctor_id == doctor.id
    #
    # Therefore rules belonging to another Doctor are
    # NOT considered conflicts.
    # -----------------------------------------------------

    existing_rules = get_rules(
        db,
        doctor.id,
    )


    for existing in existing_rules:
        if rules_overlap(
            existing_rule=existing,
            start_time=(
                payload.start_time
            ),
            end_time=(
                payload.end_time
            ),
            day_of_week=(
                payload.day_of_week
            ),
            valid_from=(
                payload.valid_from
            ),
            valid_until=(
                payload.valid_until
            ),
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_409_CONFLICT
                ),
                detail=(
                    "This availability overlaps "
                    "one of your existing rules."
                ),
            )


    rule = DoctorAvailabilityRule(
        doctor_id=(
            doctor.id
        ),

        day_of_week=(
            payload.day_of_week
        ),

        start_time=(
            payload.start_time
        ),

        end_time=(
            payload.end_time
        ),

        slot_duration_minutes=(
            payload.slot_duration_minutes
        ),

        valid_from=(
            payload.valid_from
        ),

        valid_until=(
            payload.valid_until
        ),

        timezone=(
            payload.timezone
        ),

        is_active=True,
    )


    db.add(
        rule
    )

    db.commit()

    db.refresh(
        rule
    )


    return rule


# =========================================================
# UPDATE AVAILABILITY RULE
# =========================================================


def update_rule(
    db: Session,
    doctor: Doctor,
    rule_id: uuid.UUID,
    payload: AvailabilityRuleUpdate,
):
    """
    Update one Doctor's availability rule.
    """

    rule = get_rule(
        db,
        doctor.id,
        rule_id,
    )


    if (
        rule is None
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Availability rule not found."
            ),
        )


    data = payload.model_dump(
        exclude_unset=True
    )


    # -----------------------------------------------------
    # Calculate resulting values before modifying model
    # -----------------------------------------------------

    new_day_of_week = data.get(
        "day_of_week",
        rule.day_of_week,
    )


    new_start = data.get(
        "start_time",
        rule.start_time,
    )


    new_end = data.get(
        "end_time",
        rule.end_time,
    )


    new_slot_duration = data.get(
        "slot_duration_minutes",
        rule.slot_duration_minutes,
    )


    new_valid_from = data.get(
        "valid_from",
        rule.valid_from,
    )


    new_valid_until = data.get(
        "valid_until",
        rule.valid_until,
    )


    new_timezone = data.get(
        "timezone",
        rule.timezone,
    )


    # -----------------------------------------------------
    # Validate updated values
    # -----------------------------------------------------

    validate_timezone(
        new_timezone
    )


    validate_rule_values(
        start_time=(
            new_start
        ),
        end_time=(
            new_end
        ),
        slot_duration_minutes=(
            new_slot_duration
        ),
        valid_from=(
            new_valid_from
        ),
        valid_until=(
            new_valid_until
        ),
    )


    # -----------------------------------------------------
    # Get only THIS Doctor's rules
    # -----------------------------------------------------

    existing_rules = get_rules(
        db,
        doctor.id,
    )


    for existing in existing_rules:
        if rules_overlap(
            existing_rule=(
                existing
            ),
            start_time=(
                new_start
            ),
            end_time=(
                new_end
            ),
            day_of_week=(
                new_day_of_week
            ),
            valid_from=(
                new_valid_from
            ),
            valid_until=(
                new_valid_until
            ),
            ignore_rule_id=(
                rule.id
            ),
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_409_CONFLICT
                ),
                detail=(
                    "This availability overlaps "
                    "one of your existing rules."
                ),
            )


    # -----------------------------------------------------
    # Apply update
    # -----------------------------------------------------

    for (
        field,
        value,
    ) in data.items():

        setattr(
            rule,
            field,
            value,
        )


    db.commit()

    db.refresh(
        rule
    )


    return rule


# =========================================================
# DELETE AVAILABILITY RULE
# =========================================================


def delete_rule(
    db: Session,
    doctor: Doctor,
    rule_id: uuid.UUID,
):
    """
    Delete only a rule belonging to the current Doctor.
    """

    rule = get_rule(
        db,
        doctor.id,
        rule_id,
    )


    if (
        rule is None
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Availability rule not found."
            ),
        )


    db.delete(
        rule
    )

    db.commit()


# =========================================================
# CREATE TIME OFF
# =========================================================


def create_time_off(
    db: Session,
    doctor: Doctor,
    payload: TimeOffCreate,
):
    """
    Create a time-off period for one Doctor.
    """

    if (
        payload.end_at
        <= payload.start_at
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Time-off end must be after start."
            ),
        )


    time_off = DoctorTimeOff(
        doctor_id=(
            doctor.id
        ),

        start_at=(
            payload.start_at
        ),

        end_at=(
            payload.end_at
        ),

        reason=(
            payload.reason
        ),
    )


    db.add(
        time_off
    )

    db.commit()

    db.refresh(
        time_off
    )


    return time_off


# =========================================================
# DELETE TIME OFF
# =========================================================


def delete_time_off(
    db: Session,
    doctor: Doctor,
    time_off_id: uuid.UUID,
):
    """
    Delete a time-off entry belonging only
    to the current Doctor.
    """

    item = get_time_off_by_id(
        db,
        doctor.id,
        time_off_id,
    )


    if (
        item is None
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Time-off entry not found."
            ),
        )


    db.delete(
        item
    )

    db.commit()


# =========================================================
# TIME OFF OVERLAP
# =========================================================


def overlaps_time_off(
    start_at: datetime,
    end_at: datetime,
    time_off_items,
):
    """
    Return True when a proposed slot overlaps
    one of THIS Doctor's time-off entries.
    """

    for item in time_off_items:
        if (
            start_at
            < item.end_at
            and end_at
            > item.start_at
        ):
            return True


    return False


# =========================================================
# GENERATE DOCTOR SLOTS
# =========================================================


def generate_slots(
    db: Session,
    doctor: Doctor,
    days: int,
):
    """
    Generate appointment slots for one Doctor.

    Different Doctors can have slots with exactly
    the same start/end times.

    Example:

    Doctor A -> Monday 09:00
    Doctor B -> Monday 09:00

    Both are valid because doctor_id is different.
    """

    if (
        days < 1
        or days > 365
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Days must be between 1 and 365."
            ),
        )


    # -----------------------------------------------------
    # Current UTC generation window
    # -----------------------------------------------------

    window_start = datetime.now(
        timezone.utc
    )


    window_end = (
        window_start
        + timedelta(
            days=(
                days + 1
            )
        )
    )


    # -----------------------------------------------------
    # We use the local calendar date as the beginning
    # of slot generation.
    # -----------------------------------------------------

    today = date.today()


    final_date = (
        today
        + timedelta(
            days=days
        )
    )


    # -----------------------------------------------------
    # Get ONLY the current Doctor's active rules
    # -----------------------------------------------------

    rules = [
        rule

        for rule in get_rules(
            db,
            doctor.id,
        )

        if rule.is_active
    ]


    # -----------------------------------------------------
    # Get ONLY this Doctor's time-off records
    # -----------------------------------------------------

    time_off_items = get_time_off(
        db,
        doctor.id,
    )


    # -----------------------------------------------------
    # Rebuild AVAILABLE slots.
    #
    # Important:
    #
    # BOOKED
    # HELD
    # BLOCKED
    #
    # are preserved.
    # -----------------------------------------------------

    delete_future_available_slots(
        db,
        doctor.id,
        window_start,
        window_end,
    )


    db.flush()


    generated = 0

    skipped = 0


    current_date = (
        today
    )


    # =====================================================
    # LOOP THROUGH CALENDAR DAYS
    # =====================================================

    while (
        current_date
        <= final_date
    ):

        # =================================================
        # LOOP THROUGH CURRENT DOCTOR'S RULES
        # =================================================

        for rule in rules:

            # ---------------------------------------------
            # Rule only applies to matching weekday
            #
            # Python:
            # Monday    = 0
            # Tuesday   = 1
            # ...
            # Sunday    = 6
            # ---------------------------------------------

            if (
                current_date.weekday()
                != rule.day_of_week
            ):
                continue


            # ---------------------------------------------
            # valid_from
            # ---------------------------------------------

            if (
                rule.valid_from
                and current_date
                < rule.valid_from
            ):
                continue


            # ---------------------------------------------
            # valid_until
            # ---------------------------------------------

            if (
                rule.valid_until
                and current_date
                > rule.valid_until
            ):
                continue


            # ---------------------------------------------
            # Rule timezone
            # ---------------------------------------------

            tz = validate_timezone(
                rule.timezone
            )


            # ---------------------------------------------
            # Build local rule start/end datetime
            # ---------------------------------------------

            local_start = (
                datetime.combine(
                    current_date,
                    rule.start_time,
                    tzinfo=tz,
                )
            )


            local_end = (
                datetime.combine(
                    current_date,
                    rule.end_time,
                    tzinfo=tz,
                )
            )


            # ---------------------------------------------
            # Slot duration
            # ---------------------------------------------

            duration = timedelta(
                minutes=(
                    rule.slot_duration_minutes
                )
            )


            cursor = (
                local_start
            )


            # =============================================
            # BUILD INDIVIDUAL SLOTS
            # =============================================

            while (
                cursor + duration
                <= local_end
            ):

                slot_local_end = (
                    cursor
                    + duration
                )


                # -----------------------------------------
                # Convert local timezone -> UTC
                # -----------------------------------------

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


                # -----------------------------------------
                # Do not create slots in the past
                # -----------------------------------------

                if (
                    slot_start
                    <= window_start
                ):
                    skipped += 1

                    cursor = (
                        slot_local_end
                    )

                    continue


                # -----------------------------------------
                # Do not create slots during this Doctor's
                # time-off periods
                # -----------------------------------------

                if overlaps_time_off(
                    slot_start,
                    slot_end,
                    time_off_items,
                ):
                    skipped += 1

                    cursor = (
                        slot_local_end
                    )

                    continue


                # -----------------------------------------
                # CRITICAL FIX
                #
                # Check existing slot using BOTH:
                #
                # doctor_id
                # start_at
                #
                # Not start_at alone.
                #
                # Therefore:
                #
                # Doctor A @ 09:00
                # Doctor B @ 09:00
                #
                # are different records.
                # -----------------------------------------

                existing_slot = (
                    get_existing_slot(
                        db,
                        doctor.id,
                        slot_start,
                    )
                )


                if (
                    existing_slot
                    is not None
                ):
                    skipped += 1

                    cursor = (
                        slot_local_end
                    )

                    continue


                # -----------------------------------------
                # Create slot for THIS Doctor
                # -----------------------------------------

                slot = DoctorSlot(
                    doctor_id=(
                        doctor.id
                    ),

                    start_at=(
                        slot_start
                    ),

                    end_at=(
                        slot_end
                    ),

                    status=(
                        SlotStatus.AVAILABLE
                    ),
                )


                db.add(
                    slot
                )


                # -----------------------------------------
                # Flush WITHOUT rollback.
                #
                # Previous code:
                #
                # except IntegrityError:
                #     db.rollback()
                #
                # was dangerous because rollback could undo
                # all slot-generation work performed in the
                # current transaction.
                # -----------------------------------------

                db.flush()


                generated += 1


                cursor = (
                    slot_local_end
                )


        current_date += timedelta(
            days=1
        )


    # =====================================================
    # ONE COMMIT FOR THE WHOLE GENERATION
    # =====================================================

    db.commit()


    return {
        "generated":
            generated,

        "skipped":
            skipped,
    }


# =========================================================
# LIST GENERATED SLOTS
# =========================================================


def list_slots(
    db: Session,
    doctor: Doctor,
    start_at: datetime,
    end_at: datetime,
):
    """
    Convenience service for returning only
    the current Doctor's slots.

    Keep this function if your router/service layer
    already needs it.
    """

    if (
        end_at
        <= start_at
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "End datetime must be after "
                "start datetime."
            ),
        )


    return get_slots(
        db,
        doctor.id,
        start_at,
        end_at,
    )