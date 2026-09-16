import uuid

from datetime import (
    datetime,
    timezone,
)

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.models.doctor import Doctor

from app.models.enums import (
    AccessScope,
)

from app.models.medical_access import (
    MedicalAccessGrant,
)

from app.models.patient import (
    Patient,
)

from app.repositories.medical_access import (
    get_access_grant,
    get_access_grant_for_update,
    get_doctor,
    get_patient,
    list_doctor_access_grants,
    list_patient_access_grants,
)

from app.schemas.medical_access import (
    MedicalAccessGrantRequest,
)


# =========================================================
# HELPERS
# =========================================================


def grant_is_valid(
    grant: MedicalAccessGrant,
):
    if not grant.is_active:
        return False

    if (
        grant.revoked_at
        is not None
    ):
        return False

    if (
        grant.expires_at
        is not None
        and grant.expires_at
        <= datetime.now(
            timezone.utc
        )
    ):
        return False

    return True


def serialize_doctor(
    doctor: Doctor,
):
    return {
        "id":
            doctor.id,

        "doctor_code":
            doctor.doctor_code,

        "first_name":
            doctor.first_name,

        "last_name":
            doctor.last_name,

        "qualification":
            doctor.qualification,
    }


# =========================================================
# PATIENT CREATES / UPDATES ACCESS
# =========================================================


def share_medical_records(
    db: Session,
    patient: Patient,
    doctor_id: uuid.UUID,
    payload: MedicalAccessGrantRequest,
):
    doctor = get_doctor(
        db,
        doctor_id,
    )

    if (
        doctor is None
        or not doctor.is_active
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Doctor not found.",
        )


    if (
        payload.expires_at
        is not None
        and payload.expires_at
        <= datetime.now(
            timezone.utc
        )
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Access expiration must "
                "be in the future."
            ),
        )


    grant = (
        get_access_grant_for_update(
            db,
            patient.id,
            doctor.id,
        )
    )


    if grant is None:
        grant = MedicalAccessGrant(
            patient_id=(
                patient.id
            ),

            doctor_id=(
                doctor.id
            ),

            scope=(
                payload.scope
            ),

            expires_at=(
                payload.expires_at
            ),

            is_active=True,
        )

        db.add(
            grant
        )

    else:
        grant.scope = (
            payload.scope
        )

        grant.expires_at = (
            payload.expires_at
        )

        grant.is_active = True

        grant.revoked_at = None

        grant.granted_at = (
            datetime.now(
                timezone.utc
            )
        )


    db.commit()

    db.refresh(
        grant
    )


    return {
        "id":
            grant.id,

        "doctor":
            serialize_doctor(
                doctor
            ),

        "scope":
            grant.scope,

        "is_active":
            grant.is_active,

        "granted_at":
            grant.granted_at,

        "expires_at":
            grant.expires_at,
    }


# =========================================================
# PATIENT REVOKES ACCESS
# =========================================================


def revoke_medical_access(
    db: Session,
    patient: Patient,
    doctor_id: uuid.UUID,
):
    grant = (
        get_access_grant_for_update(
            db,
            patient.id,
            doctor_id,
        )
    )


    if grant is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Access grant not found.",
        )


    grant.is_active = False

    grant.revoked_at = (
        datetime.now(
            timezone.utc
        )
    )


    db.commit()


# =========================================================
# PATIENT LIST
# =========================================================


def get_patient_access_grants(
    db: Session,
    patient: Patient,
):
    rows = (
        list_patient_access_grants(
            db,
            patient.id,
        )
    )


    results = []


    for (
        grant,
        doctor,
    ) in rows:

        if not grant_is_valid(
            grant
        ):
            continue


        results.append(
            {
                "id":
                    grant.id,

                "doctor":
                    serialize_doctor(
                        doctor
                    ),

                "scope":
                    grant.scope,

                "is_active":
                    grant.is_active,

                "granted_at":
                    grant.granted_at,

                "expires_at":
                    grant.expires_at,
            }
        )


    return results


# =========================================================
# DOCTOR ACCESS CHECK
# =========================================================


def require_patient_access(
    db: Session,
    doctor: Doctor,
    patient_id: uuid.UUID,
):
    """
    This function MUST be called before returning
    Patient medical records to a Doctor.
    """

    patient = get_patient(
        db,
        patient_id,
    )


    if patient is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Patient record not available.",
        )


    grant = get_access_grant(
        db,
        patient.id,
        doctor.id,
    )


    # Generic error intentionally does not reveal
    # whether a Patient exists or simply did not
    # grant this Doctor access.
    if (
        grant is None
        or not grant_is_valid(
            grant
        )
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Patient record not available.",
        )


    return (
        patient,
        grant,
    )


# =========================================================
# SHARED PATIENTS FOR DOCTOR
# =========================================================


def get_shared_patients(
    db: Session,
    doctor: Doctor,
):
    rows = (
        list_doctor_access_grants(
            db,
            doctor.id,
        )
    )


    results = []


    for (
        grant,
        patient,
    ) in rows:

        if not grant_is_valid(
            grant
        ):
            continue


        results.append(
            {
                "patient_id":
                    patient.id,

                "patient_code":
                    patient.patient_code,

                "first_name":
                    patient.first_name,

                "last_name":
                    patient.last_name,

                "scope":
                    grant.scope,

                "expires_at":
                    grant.expires_at,
            }
        )


    return results