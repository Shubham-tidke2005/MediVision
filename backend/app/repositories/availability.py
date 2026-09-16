from datetime import datetime
import uuid

from sqlalchemy import (
    delete,
    select,
)

from sqlalchemy.orm import Session

from app.models.availability import (
    DoctorAvailabilityRule,
    DoctorSlot,
    DoctorTimeOff,
)

from app.models.enums import (
    SlotStatus,
)


# =========================================================
# AVAILABILITY RULES
# =========================================================


def get_rules(
    db: Session,
    doctor_id: uuid.UUID,
):
    """
    Return availability rules belonging ONLY
    to the supplied Doctor.

    Important:
    Rules from other Doctors are never returned.
    """

    return list(
        db.scalars(
            select(
                DoctorAvailabilityRule
            )
            .where(
                DoctorAvailabilityRule.doctor_id
                == doctor_id
            )
            .order_by(
                DoctorAvailabilityRule.day_of_week,
                DoctorAvailabilityRule.start_time,
            )
        ).all()
    )


def get_rule(
    db: Session,
    doctor_id: uuid.UUID,
    rule_id: uuid.UUID,
):
    """
    Get a single availability rule.

    Both rule ID and Doctor ID are checked so
    one Doctor cannot access another Doctor's rule.
    """

    return db.scalar(
        select(
            DoctorAvailabilityRule
        )
        .where(
            DoctorAvailabilityRule.id
            == rule_id,

            DoctorAvailabilityRule.doctor_id
            == doctor_id,
        )
    )


# =========================================================
# TIME OFF
# =========================================================


def get_time_off(
    db: Session,
    doctor_id: uuid.UUID,
):
    """
    Return all time-off entries belonging
    to the supplied Doctor.
    """

    return list(
        db.scalars(
            select(
                DoctorTimeOff
            )
            .where(
                DoctorTimeOff.doctor_id
                == doctor_id
            )
            .order_by(
                DoctorTimeOff.start_at
            )
        ).all()
    )


def get_time_off_by_id(
    db: Session,
    doctor_id: uuid.UUID,
    time_off_id: uuid.UUID,
):
    """
    Return a specific time-off entry
    belonging to the supplied Doctor.
    """

    return db.scalar(
        select(
            DoctorTimeOff
        )
        .where(
            DoctorTimeOff.id
            == time_off_id,

            DoctorTimeOff.doctor_id
            == doctor_id,
        )
    )


# =========================================================
# DOCTOR SLOTS
# =========================================================


def get_slots(
    db: Session,
    doctor_id: uuid.UUID,
    start_at: datetime,
    end_at: datetime,
):
    """
    Return slots belonging ONLY to one Doctor
    within the requested date/time range.
    """

    return list(
        db.scalars(
            select(
                DoctorSlot
            )
            .where(
                DoctorSlot.doctor_id
                == doctor_id,

                DoctorSlot.start_at
                >= start_at,

                DoctorSlot.start_at
                < end_at,
            )
            .order_by(
                DoctorSlot.start_at
            )
        ).all()
    )


def get_existing_slot(
    db: Session,
    doctor_id: uuid.UUID,
    start_at: datetime,
):
    """
    Check whether THIS Doctor already has
    a slot beginning at the supplied time.

    Critical:

    Doctor A at 09:00
    and
    Doctor B at 09:00

    are two completely different slots.

    Therefore doctor_id MUST always be part
    of this lookup.
    """

    return db.scalar(
        select(
            DoctorSlot
        )
        .where(
            DoctorSlot.doctor_id
            == doctor_id,

            DoctorSlot.start_at
            == start_at,
        )
    )


def get_existing_slot_for_update(
    db: Session,
    doctor_id: uuid.UUID,
    slot_id: uuid.UUID,
):
    """
    Retrieve and lock one Doctor slot.

    Useful for future slot state operations
    such as booking / blocking.
    """

    return db.scalar(
        select(
            DoctorSlot
        )
        .where(
            DoctorSlot.id
            == slot_id,

            DoctorSlot.doctor_id
            == doctor_id,
        )
        .with_for_update()
    )


def delete_future_available_slots(
    db: Session,
    doctor_id: uuid.UUID,
    start_at: datetime,
    end_at: datetime,
):
    """
    Delete ONLY AVAILABLE slots belonging
    to this Doctor inside the regeneration window.

    HELD / BOOKED / BLOCKED slots are preserved.
    """

    result = db.execute(
        delete(
            DoctorSlot
        )
        .where(
            DoctorSlot.doctor_id
            == doctor_id,

            DoctorSlot.start_at
            >= start_at,

            DoctorSlot.start_at
            < end_at,

            DoctorSlot.status
            == SlotStatus.AVAILABLE,
        )
    )

    return result