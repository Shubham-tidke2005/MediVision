import uuid

from sqlalchemy import (
    select,
)

from sqlalchemy.orm import (
    Session,
)

from app.models.sos import (
    SOSEvent,
    SOSEventAction,
)


ACTIVE_STATUSES = [
    "TRIGGERED",
    "ACKNOWLEDGED",
]


def get_active_sos_event(
    db: Session,
    patient_id: uuid.UUID,
):
    return db.scalar(
        select(
            SOSEvent
        )
        .where(
            SOSEvent.patient_id
            == patient_id,

            SOSEvent.status.in_(
                ACTIVE_STATUSES
            ),
        )
        .order_by(
            SOSEvent
                .triggered_at
                .desc()
        )
        .limit(1)
    )


def get_sos_event(
    db: Session,
    *,
    event_id: uuid.UUID,
    patient_id: uuid.UUID,
    for_update: bool = False,
):
    statement = (
        select(
            SOSEvent
        )
        .where(
            SOSEvent.id
            == event_id,

            SOSEvent.patient_id
            == patient_id,
        )
    )

    if for_update:
        statement = (
            statement
            .with_for_update()
        )

    return db.scalar(
        statement
    )


def list_sos_events(
    db: Session,
    patient_id: uuid.UUID,
):
    return list(
        db.scalars(
            select(
                SOSEvent
            )
            .where(
                SOSEvent.patient_id
                == patient_id
            )
            .order_by(
                SOSEvent
                    .triggered_at
                    .desc()
            )
        ).all()
    )


def list_sos_actions(
    db: Session,
    event_id: uuid.UUID,
):
    return list(
        db.scalars(
            select(
                SOSEventAction
            )
            .where(
                SOSEventAction
                    .sos_event_id
                    == event_id
            )
            .order_by(
                SOSEventAction
                    .created_at
                    .asc()
            )
        ).all()
    )