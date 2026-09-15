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

from app.models.enums import SlotStatus


def get_rules(
    db: Session,
    doctor_id: uuid.UUID,
):
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


def get_time_off(
    db: Session,
    doctor_id: uuid.UUID,
):
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


def get_slots(
    db: Session,
    doctor_id: uuid.UUID,
    start_at: datetime,
    end_at: datetime,
):
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


def delete_future_available_slots(
    db: Session,
    doctor_id: uuid.UUID,
    start_at: datetime,
    end_at: datetime,
):
    db.execute(
        delete(DoctorSlot)
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