import uuid
from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
)

from app.models.enums import (
    AppointmentStatus,
    AppointmentType,
    EncounterType,
)


class EncounterStartRequest(BaseModel):
    chief_complaint: str | None = Field(
        default=None,
        max_length=3000,
    )


class EncounterUpdateRequest(BaseModel):
    chief_complaint: str | None = Field(
        default=None,
        max_length=3000,
    )

    subjective_notes: str | None = Field(
        default=None,
        max_length=10000,
    )

    objective_notes: str | None = Field(
        default=None,
        max_length=10000,
    )

    assessment_notes: str | None = Field(
        default=None,
        max_length=10000,
    )

    plan_notes: str | None = Field(
        default=None,
        max_length=10000,
    )


class EncounterPatientResponse(BaseModel):
    id: uuid.UUID
    patient_code: str

    first_name: str
    last_name: str


class EncounterDoctorResponse(BaseModel):
    id: uuid.UUID
    doctor_code: str

    first_name: str
    last_name: str

    qualification: str


class EncounterAppointmentResponse(BaseModel):
    id: uuid.UUID

    appointment_type: AppointmentType
    status: AppointmentStatus

    reason: str | None

    start_at: datetime
    end_at: datetime


class EncounterResponse(BaseModel):
    id: uuid.UUID

    appointment_id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: uuid.UUID

    encounter_type: EncounterType

    chief_complaint: str | None

    subjective_notes: str | None
    objective_notes: str | None
    assessment_notes: str | None
    plan_notes: str | None

    started_at: datetime
    ended_at: datetime | None

    is_completed: bool

    patient: EncounterPatientResponse
    doctor: EncounterDoctorResponse
    appointment: EncounterAppointmentResponse

    created_at: datetime
    updated_at: datetime