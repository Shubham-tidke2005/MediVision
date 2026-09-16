import uuid

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    require_verified_doctor,
)

from app.core.database import (
    get_db,
)

from app.models.doctor import Doctor

from app.schemas.encounter import (
    EncounterResponse,
    EncounterStartRequest,
    EncounterUpdateRequest,
)

from app.services.encounter import (
    complete_encounter,
    get_doctor_encounter,
    get_doctor_encounters,
    start_encounter,
    update_encounter,
)


router = APIRouter(
    prefix="/encounters",
    tags=["Clinical Encounters"],
)


@router.post(
    "/appointments/{appointment_id}/start",
    response_model=EncounterResponse,
)
def start_consultation(
    appointment_id: uuid.UUID,

    payload: EncounterStartRequest,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return start_encounter(
        db,
        doctor,
        appointment_id,
        payload,
    )


@router.get(
    "/doctor",
    response_model=list[
        EncounterResponse
    ],
)
def doctor_encounters(
    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_doctor_encounters(
        db,
        doctor,
    )


@router.get(
    "/{encounter_id}",
    response_model=EncounterResponse,
)
def encounter_detail(
    encounter_id: uuid.UUID,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_doctor_encounter(
        db,
        doctor,
        encounter_id,
    )


@router.patch(
    "/{encounter_id}",
    response_model=EncounterResponse,
)
def edit_encounter(
    encounter_id: uuid.UUID,

    payload: EncounterUpdateRequest,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return update_encounter(
        db,
        doctor,
        encounter_id,
        payload,
    )


@router.post(
    "/{encounter_id}/complete",
    response_model=EncounterResponse,
)
def finish_encounter(
    encounter_id: uuid.UUID,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return complete_encounter(
        db,
        doctor,
        encounter_id,
    )