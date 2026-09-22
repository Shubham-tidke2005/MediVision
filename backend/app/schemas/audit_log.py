import uuid

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import (
    BaseModel,
    Field,
)


class AuditAction(str, Enum):
    LOGIN = "LOGIN"
    APPOINTMENT_CREATED = "APPOINTMENT_CREATED"
    APPOINTMENT_APPROVED = "APPOINTMENT_APPROVED"
    APPOINTMENT_REJECTED = "APPOINTMENT_REJECTED"
    APPOINTMENT_CANCELLED = "APPOINTMENT_CANCELLED"
    PATIENT_RECORD_VIEWED = "PATIENT_RECORD_VIEWED"
    MEDICAL_ACCESS_GRANTED = "MEDICAL_ACCESS_GRANTED"
    MEDICAL_ACCESS_REVOKED = "MEDICAL_ACCESS_REVOKED"
    PRESCRIPTION_CREATED = "PRESCRIPTION_CREATED"
    MEDICAL_DOCUMENT_VIEWED = "MEDICAL_DOCUMENT_VIEWED"
    AI_ASSESSMENT_CREATED = "AI_ASSESSMENT_CREATED"
    IMAGE_ANALYSIS_CREATED = "IMAGE_ANALYSIS_CREATED"


class AuditResourceType(str, Enum):
    USER = "USER"
    APPOINTMENT = "APPOINTMENT"
    PATIENT = "PATIENT"
    MEDICAL_ACCESS_GRANT = "MEDICAL_ACCESS_GRANT"
    PRESCRIPTION = "PRESCRIPTION"
    MEDICAL_DOCUMENT = "MEDICAL_DOCUMENT"
    AI_ASSESSMENT = "AI_ASSESSMENT"
    IMAGE_ANALYSIS = "IMAGE_ANALYSIS"


class AuditLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
    action: str
    resource_type: str
    resource_id: str | None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class AuditLogListResponse(BaseModel):
    items: list[AuditLogResponse]
    total: int
    limit: int
    offset: int
