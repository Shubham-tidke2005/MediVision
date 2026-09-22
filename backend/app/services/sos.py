import os

from datetime import (
    datetime,
    timezone,
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

from app.models.sos import (
    SOSEvent,
    SOSEventAction,
)

from app.repositories.sos import (
    get_active_sos_event,
    get_sos_event,
    list_sos_actions,
    list_sos_events,
)

from app.schemas.sos import (
    SOSActionCreate,
    SOSActionResponse,
    SOSActionType,
    SOSConfigResponse,
    SOSEventCreate,
    SOSEventDetailResponse,
    SOSEventResponse,
    SOSLocationUpdate,
    SOSStatus,
    SOSStatusUpdate,
)


ACTIVE_STATUSES = {
    SOSStatus.TRIGGERED,
    SOSStatus.ACKNOWLEDGED,
}


TERMINAL_STATUSES = {
    SOSStatus.RESOLVED,
    SOSStatus.CANCELLED,
}


ALLOWED_TRANSITIONS = {
    SOSStatus.TRIGGERED: {
        SOSStatus.ACKNOWLEDGED,
        SOSStatus.RESOLVED,
        SOSStatus.CANCELLED,
    },

    SOSStatus.ACKNOWLEDGED: {
        SOSStatus.RESOLVED,
        SOSStatus.CANCELLED,
    },

    SOSStatus.RESOLVED:
        set(),

    SOSStatus.CANCELLED:
        set(),
}


def now_utc():
    return datetime.now(
        timezone.utc
    )


def get_sos_config():
    return SOSConfigResponse(
        emergency_phone_number=(
            os.getenv(
                "EMERGENCY_PHONE_NUMBER",
                "112",
            )
        ),

        emergency_service_label=(
            os.getenv(
                "EMERGENCY_SERVICE_LABEL",
                "Emergency Service",
            )
        ),

        disclaimer=(
            "MediVision SOS provides "
            "emergency-support shortcuts. "
            "It does not automatically "
            "contact or dispatch emergency "
            "services."
        ),
    )


def add_action(
    db: Session,
    *,
    event_id,
    action_type: str,
    description: str | None = None,
    metadata: dict | None = None,
):
    action = SOSEventAction(
        sos_event_id=event_id,

        action_type=(
            action_type
        ),

        description=(
            description
        ),

        metadata_json=(
            metadata
            or {}
        ),
    )

    db.add(
        action
    )

    db.flush()

    return action


def serialize_event(
    event: SOSEvent,
):
    return SOSEventResponse(
        id=event.id,

        status=event.status,

        share_location=(
            event.share_location
        ),

        latitude=(
            float(
                event.latitude
            )
            if event.latitude
            is not None
            else None
        ),

        longitude=(
            float(
                event.longitude
            )
            if event.longitude
            is not None
            else None
        ),

        location_accuracy_m=(
            float(
                event
                    .location_accuracy_m
            )
            if event
                .location_accuracy_m
            is not None
            else None
        ),

        emergency_contact_name=(
            event
                .emergency_contact_name
        ),

        emergency_contact_phone=(
            event
                .emergency_contact_phone
        ),

        message=event.message,

        triggered_at=(
            event.triggered_at
        ),

        acknowledged_at=(
            event.acknowledged_at
        ),

        resolved_at=(
            event.resolved_at
        ),

        cancelled_at=(
            event.cancelled_at
        ),

        created_at=(
            event.created_at
        ),

        updated_at=(
            event.updated_at
        ),
    )


def serialize_detail(
    db: Session,
    event: SOSEvent,
):
    actions = (
        list_sos_actions(
            db,
            event.id,
        )
    )

    base = serialize_event(
        event
    )

    return SOSEventDetailResponse(
        **base.model_dump(),

        actions=[
            SOSActionResponse
            .model_validate(
                action
            )

            for action
            in actions
        ],
    )


def create_sos_event(
    db: Session,
    patient: Patient,
    payload: SOSEventCreate,
):
    existing = (
        get_active_sos_event(
            db,
            patient.id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=(
                status
                .HTTP_409_CONFLICT
            ),
            detail=(
                "An active SOS event "
                "already exists."
            ),
        )

    event = SOSEvent(
        patient_id=patient.id,

        status=(
            SOSStatus
            .TRIGGERED
            .value
        ),

        share_location=(
            payload
            .share_location
        ),

        latitude=(
            payload.latitude
            if payload.share_location
            else None
        ),

        longitude=(
            payload.longitude
            if payload.share_location
            else None
        ),

        location_accuracy_m=(
            payload
            .location_accuracy_m
            if payload.share_location
            else None
        ),

        emergency_contact_name=(
            payload
            .emergency_contact_name
        ),

        emergency_contact_phone=(
            payload
            .emergency_contact_phone
        ),

        message=(
            payload.message
        ),
    )

    try:
        db.add(
            event
        )

        db.flush()

        add_action(
            db,

            event_id=event.id,

            action_type=(
                SOSActionType
                .SOS_TRIGGERED
                .value
            ),

            description=(
                "SOS event triggered."
            ),

            metadata={
                "location_shared":
                    payload
                    .share_location,
            },
        )

        db.commit()

        db.refresh(
            event
        )

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=(
                status
                .HTTP_409_CONFLICT
            ),
            detail=(
                "An active SOS event "
                "already exists."
            ),
        ) from exc

    return serialize_detail(
        db,
        event,
    )


def get_current_sos_event(
    db: Session,
    patient: Patient,
):
    event = get_active_sos_event(
        db,
        patient.id,
    )

    if event is None:
        return None

    return serialize_detail(
        db,
        event,
    )


def get_sos_event_detail(
    db: Session,
    patient: Patient,
    event_id,
):
    event = get_sos_event(
        db,

        event_id=event_id,

        patient_id=patient.id,
    )

    if event is None:
        raise HTTPException(
            status_code=(
                status
                .HTTP_404_NOT_FOUND
            ),
            detail=(
                "SOS event not found."
            ),
        )

    return serialize_detail(
        db,
        event,
    )


def get_sos_history(
    db: Session,
    patient: Patient,
):
    events = list_sos_events(
        db,
        patient.id,
    )

    return [
        serialize_event(
            event
        )

        for event
        in events
    ]


def update_sos_status(
    db: Session,
    patient: Patient,
    event_id,
    payload: SOSStatusUpdate,
):
    event = get_sos_event(
        db,

        event_id=event_id,

        patient_id=patient.id,

        for_update=True,
    )

    if event is None:
        raise HTTPException(
            status_code=(
                status
                .HTTP_404_NOT_FOUND
            ),
            detail=(
                "SOS event not found."
            ),
        )

    current_status = (
        SOSStatus(
            event.status
        )
    )

    new_status = (
        payload.status
    )

    if (
        new_status
        == current_status
    ):
        return serialize_detail(
            db,
            event,
        )

    allowed = (
        ALLOWED_TRANSITIONS[
            current_status
        ]
    )

    if (
        new_status
        not in allowed
    ):
        raise HTTPException(
            status_code=(
                status
                .HTTP_409_CONFLICT
            ),
            detail=(
                "Invalid SOS status "
                "transition from "
                f"{current_status.value} "
                "to "
                f"{new_status.value}."
            ),
        )

    timestamp = now_utc()

    event.status = (
        new_status.value
    )

    if (
        new_status
        == SOSStatus.ACKNOWLEDGED
    ):
        event.acknowledged_at = (
            timestamp
        )

    elif (
        new_status
        == SOSStatus.RESOLVED
    ):
        event.resolved_at = (
            timestamp
        )

    elif (
        new_status
        == SOSStatus.CANCELLED
    ):
        event.cancelled_at = (
            timestamp
        )

    add_action(
        db,

        event_id=event.id,

        action_type=(
            SOSActionType
            .STATUS_CHANGED
            .value
        ),

        description=(
            "SOS event status changed."
        ),

        metadata={
            "from":
                current_status.value,

            "to":
                new_status.value,
        },
    )

    db.commit()

    db.refresh(
        event
    )

    return serialize_detail(
        db,
        event,
    )


def share_sos_location(
    db: Session,
    patient: Patient,
    event_id,
    payload: SOSLocationUpdate,
):
    event = get_sos_event(
        db,

        event_id=event_id,

        patient_id=patient.id,

        for_update=True,
    )

    if event is None:
        raise HTTPException(
            status_code=(
                status
                .HTTP_404_NOT_FOUND
            ),
            detail=(
                "SOS event not found."
            ),
        )

    status_value = (
        SOSStatus(
            event.status
        )
    )

    if (
        status_value
        in TERMINAL_STATUSES
    ):
        raise HTTPException(
            status_code=(
                status
                .HTTP_409_CONFLICT
            ),
            detail=(
                "Location cannot be "
                "updated for a completed "
                "SOS event."
            ),
        )

    had_location = (
        event.share_location
        and event.latitude
        is not None
        and event.longitude
        is not None
    )

    event.share_location = True

    event.latitude = (
        payload.latitude
    )

    event.longitude = (
        payload.longitude
    )

    event.location_accuracy_m = (
        payload.accuracy_m
    )

    action_type = (
        SOSActionType
        .LOCATION_REFRESHED
        if had_location
        else SOSActionType
        .LOCATION_SHARED
    )

    add_action(
        db,

        event_id=event.id,

        action_type=(
            action_type.value
        ),

        description=(
            "SOS location updated."
        ),

        metadata={
            "accuracy_m":
                payload.accuracy_m,
        },
    )

    db.commit()

    db.refresh(
        event
    )

    return serialize_detail(
        db,
        event,
    )


def record_user_action(
    db: Session,
    patient: Patient,
    event_id,
    payload: SOSActionCreate,
):
    event = get_sos_event(
        db,

        event_id=event_id,

        patient_id=patient.id,
    )

    if event is None:
        raise HTTPException(
            status_code=(
                status
                .HTTP_404_NOT_FOUND
            ),
            detail=(
                "SOS event not found."
            ),
        )

    action = add_action(
        db,

        event_id=event.id,

        action_type=(
            payload
            .action_type
            .value
        ),

        description=(
            payload.description
        ),
    )

    db.commit()

    db.refresh(
        action
    )

    return (
        SOSActionResponse
        .model_validate(
            action
        )
    )