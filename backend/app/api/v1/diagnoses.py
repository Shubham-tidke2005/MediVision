import uuid

from fastapi import (
    APIRouter,
    Depends,
    Query,
    Response,
    status,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    require_verified_doctor,
)

from app.core.database import (
    get_db,
)

from app.models.doctor import Doctor

from app.schemas.diagnosis import (
    DiagnosisCatalogCreate,
    DiagnosisCatalogResponse,
    EncounterDiagnosisCreate,
    EncounterDiagnosisResponse,
    EncounterDiagnosisUpdate,
)

from app.services.diagnosis import (
    add_encounter_diagnosis,
    create_catalog_diagnosis,
    delete_encounter_diagnosis,
    get_catalog,
    get_encounter_diagnoses,
    update_encounter_diagnosis,
)


router = APIRouter(
    prefix="/diagnoses",
    tags=["Diagnoses"],
)


@router.get(
    "",
    response_model=list[
        DiagnosisCatalogResponse
    ],
)
def diagnosis_catalog(
    search: str | None = Query(
        default=None,
        max_length=100,
    ),

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_catalog(
        db,
        search,
    )


@router.post(
    "",
    response_model=DiagnosisCatalogResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_diagnosis(
    payload: DiagnosisCatalogCreate,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return create_catalog_diagnosis(
        db,
        doctor,
        payload,
    )


@router.get(
    "/encounters/{encounter_id}",
    response_model=list[
        EncounterDiagnosisResponse
    ],
)
def encounter_diagnoses(
    encounter_id: uuid.UUID,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_encounter_diagnoses(
        db,
        doctor,
        encounter_id,
    )


@router.post(
    "/encounters/{encounter_id}",
    response_model=EncounterDiagnosisResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_diagnosis_to_encounter(
    encounter_id: uuid.UUID,

    payload: EncounterDiagnosisCreate,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return add_encounter_diagnosis(
        db,
        doctor,
        encounter_id,
        payload,
    )


@router.patch(
    "/encounter-diagnoses/{encounter_diagnosis_id}",
    response_model=EncounterDiagnosisResponse,
)
def edit_encounter_diagnosis(
    encounter_diagnosis_id: uuid.UUID,

    payload: EncounterDiagnosisUpdate,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return update_encounter_diagnosis(
        db,
        doctor,
        encounter_diagnosis_id,
        payload,
    )


@router.delete(
    "/encounter-diagnoses/{encounter_diagnosis_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_encounter_diagnosis(
    encounter_diagnosis_id: uuid.UUID,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    delete_encounter_diagnosis(
        db,
        doctor,
        encounter_diagnosis_id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )