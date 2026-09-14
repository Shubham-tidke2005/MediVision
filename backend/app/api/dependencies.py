from collections.abc import Callable

from fastapi import (
    Depends,
    HTTPException,
    Security,
    status,
)
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.doctor import Doctor
from app.models.enums import (
    DoctorVerificationStatus,
    UserRole,
)
from app.models.patient import Patient
from app.models.user import User
from app.repositories.user import get_user_by_id


bearer_scheme = HTTPBearer(
    auto_error=False,
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Security(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    if credentials is None:
        raise credentials_exception

    try:
        user_id = decode_access_token(
            credentials.credentials
        )

    except ValueError:
        raise credentials_exception

    user = get_user_by_id(
        db,
        user_id,
    )

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive.",
        )

    return user


def require_roles(
    *allowed_roles: UserRole,
) -> Callable:

    def role_dependency(
        current_user: User = Depends(
            get_current_user
        ),
    ) -> User:

        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )

        return current_user

    return role_dependency


require_patient = require_roles(
    UserRole.PATIENT
)

require_doctor = require_roles(
    UserRole.DOCTOR
)

require_admin = require_roles(
    UserRole.ADMIN
)

require_patient_or_admin = require_roles(
    UserRole.PATIENT,
    UserRole.ADMIN,
)

require_doctor_or_admin = require_roles(
    UserRole.DOCTOR,
    UserRole.ADMIN,
)


def get_current_patient(
    current_user: User = Depends(
        require_patient
    ),
    db: Session = Depends(get_db),
) -> Patient:

    patient = db.scalar(
        select(Patient).where(
            Patient.user_id == current_user.id
        )
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found.",
        )

    if not patient.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patient profile is inactive.",
        )

    return patient


def get_current_doctor(
    current_user: User = Depends(
        require_doctor
    ),
    db: Session = Depends(get_db),
) -> Doctor:

    doctor = db.scalar(
        select(Doctor).where(
            Doctor.user_id == current_user.id
        )
    )

    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found.",
        )

    if not doctor.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor profile is inactive.",
        )

    return doctor


def require_verified_doctor(
    doctor: Doctor = Depends(
        get_current_doctor
    ),
) -> Doctor:

    if (
        doctor.verification_status
        != DoctorVerificationStatus.VERIFIED
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor account has not been professionally verified.",
        )

    return doctor