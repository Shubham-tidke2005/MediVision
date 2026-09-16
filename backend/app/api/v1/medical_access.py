import uuid

from fastapi import (
    APIRouter,
    Depends,
    Response,
    status,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_patient,
    require_verified_doctor,
)

from app.core.database import (
    get_db,
)

from app.models.doctor import Doctor
from app.models.patient import Patient

from app.schemas.medical_access import (
    MedicalAccessGrantRequest,
    MedicalAccessGrantResponse,
    SharedPatientResponse,
)

from app.services.medical_access import (
    get_patient_access_grants,
    get_shared_patients,
    revoke_medical_access,
    share_medical_records,
)


from app.schemas.medical_history import (
    MedicalHistoryResponse,
)

from app.services.medical_access import (
    require_patient_access,
)

from app.services.medical_history import (
    get_patient_medical_history,
    get_patient_medical_history_for_doctor,
)

router = APIRouter(
    tags=["Medical Access"],
)


# =========================================================
# PATIENT — LIST SHARED DOCTORS
# =========================================================


@router.get(
    "/patients/me/access-grants",
    response_model=list[
        MedicalAccessGrantResponse
    ],
)
def list_my_access_grants(
    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_patient_access_grants(
        db,
        patient,
    )


# =========================================================
# PATIENT — SHARE / CHANGE ACCESS
# =========================================================


@router.put(
    "/patients/me/access-grants/{doctor_id}",
    response_model=MedicalAccessGrantResponse,
)
def share_records(
    doctor_id: uuid.UUID,

    payload: MedicalAccessGrantRequest,

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return share_medical_records(
        db,
        patient,
        doctor_id,
        payload,
    )


# =========================================================
# PATIENT — REVOKE ACCESS
# =========================================================


@router.delete(
    "/patients/me/access-grants/{doctor_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def revoke_records(
    doctor_id: uuid.UUID,

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    revoke_medical_access(
        db,
        patient,
        doctor_id,
    )

    return Response(
        status_code=(
            status.HTTP_204_NO_CONTENT
        )
    )


# =========================================================
# DOCTOR — PATIENTS WHO SHARED RECORDS
# =========================================================


@router.get(
    "/doctors/me/shared-patients",
    response_model=list[
        SharedPatientResponse
    ],
)
def shared_patients(
    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_shared_patients(
        db,
        doctor,
    )
    
@router.get(
    "/doctors/me/patients/{patient_id}/history",
    response_model=MedicalHistoryResponse,
)
def doctor_patient_history(
    patient_id: uuid.UUID,

    doctor: Doctor = Depends(
        require_verified_doctor
    ),

    db: Session = Depends(
        get_db
    ),
):
    patient, grant = (
        require_patient_access(
            db,
            doctor,
            patient_id,
        )
    )


    if (
        grant.scope.value
        == "FULL_HISTORY"
    ):
        return get_patient_medical_history(
            db,
            patient,
        )


    return (
        get_patient_medical_history_for_doctor(
            db,
            patient,
            doctor,
        )
    )