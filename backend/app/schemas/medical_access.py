import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.enums import AccessScope


class MedicalAccessGrantRequest(BaseModel):
    scope: AccessScope

    expires_at: datetime | None = None


class AccessDoctorResponse(BaseModel):
    id: uuid.UUID

    doctor_code: str

    first_name: str

    last_name: str

    qualification: str | None = None


class MedicalAccessGrantResponse(BaseModel):
    id: uuid.UUID

    doctor: AccessDoctorResponse

    scope: AccessScope

    is_active: bool

    granted_at: datetime

    expires_at: datetime | None = None


class SharedPatientResponse(BaseModel):
    patient_id: uuid.UUID

    patient_code: str

    first_name: str

    last_name: str

    scope: AccessScope

    expires_at: datetime | None = None