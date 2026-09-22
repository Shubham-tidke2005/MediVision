import uuid

from fastapi import (
    APIRouter,
    Depends,
    status,
)

from sqlalchemy.orm import (
    Session,
)

from app.api.dependencies import (
    get_current_patient,
)

from app.core.database import (
    get_db,
)

from app.models.patient import (
    Patient,
)

from app.schemas.sos import (
    SOSActionCreate,
    SOSActionResponse,
    SOSConfigResponse,
    SOSEventCreate,
    SOSEventDetailResponse,
    SOSEventResponse,
    SOSLocationUpdate,
    SOSStatusUpdate,
)

from app.services.sos import (
    create_sos_event,
    get_current_sos_event,
    get_sos_config,
    get_sos_event_detail,
    get_sos_history,
    record_user_action,
    share_sos_location,
    update_sos_status,
)


router = APIRouter(
    prefix="/api/v1/sos",
    tags=[
        "Emergency SOS"
    ],
)


@router.get(
    "/config",
    response_model=(
        SOSConfigResponse
    ),
)
def sos_config(
    _patient: Patient = Depends(
        get_current_patient
    ),
):
    return get_sos_config()


@router.post(
    "/events",
    response_model=(
        SOSEventDetailResponse
    ),
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def trigger_sos(
    payload: SOSEventCreate,

    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return create_sos_event(
        db,
        patient,
        payload,
    )


@router.get(
    "/events/current",
    response_model=(
        SOSEventDetailResponse
        | None
    ),
)
def current_sos(
    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return get_current_sos_event(
        db,
        patient,
    )


@router.get(
    "/events",
    response_model=list[
        SOSEventResponse
    ],
)
def sos_history(
    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return get_sos_history(
        db,
        patient,
    )


@router.get(
    "/events/{event_id}",
    response_model=(
        SOSEventDetailResponse
    ),
)
def sos_event_detail(
    event_id: uuid.UUID,

    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return get_sos_event_detail(
        db,
        patient,
        event_id,
    )


@router.patch(
    "/events/{event_id}/status",
    response_model=(
        SOSEventDetailResponse
    ),
)
def change_sos_status(
    event_id: uuid.UUID,

    payload: SOSStatusUpdate,

    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return update_sos_status(
        db,
        patient,
        event_id,
        payload,
    )


@router.put(
    "/events/{event_id}/location",
    response_model=(
        SOSEventDetailResponse
    ),
)
def update_sos_location(
    event_id: uuid.UUID,

    payload: SOSLocationUpdate,

    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return share_sos_location(
        db,
        patient,
        event_id,
        payload,
    )


@router.post(
    "/events/{event_id}/actions",
    response_model=(
        SOSActionResponse
    ),
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def create_sos_action(
    event_id: uuid.UUID,

    payload: SOSActionCreate,

    db: Session = Depends(
        get_db
    ),

    patient: Patient = Depends(
        get_current_patient
    ),
):
    return record_user_action(
        db,
        patient,
        event_id,
        payload,
    )