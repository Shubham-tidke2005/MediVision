import uuid
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class DoctorPatientSummary(BaseModel):
    id: uuid.UUID
    patient_code: str
    first_name: str
    last_name: str
    date_of_birth: date | None = None
    gender: str | None = None
    blood_group: str | None = None
    appointment_count: int = Field(ge=0)
    active_grant_scope: str | None = None
    access_sources: list[str]
    last_related_at: datetime | None = None


class DoctorPatientDirectoryResponse(BaseModel):
    total: int
    appointment_linked_count: int
    active_grant_count: int
    items: list[DoctorPatientSummary]


class DoctorPatientRecordResponse(BaseModel):
    patient: DoctorPatientSummary
    access_mode: str
    access_notice: str
    history: dict[str, Any]
