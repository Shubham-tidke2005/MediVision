from datetime import datetime
import uuid

from pydantic import (
    BaseModel,
    Field,
)

from app.models.enums import (
    AppointmentStatus,
    AppointmentType,
    SlotStatus,
)


class AppointmentRequestCreate(BaseModel):
    slot_id: uuid.UUID

    appointment_type: AppointmentType

    reason: str | None = Field(
        default=None,
        max_length=500,
    )

    patient_notes: str | None = Field(
        default=None,
        max_length=3000,
    )


class AppointmentActionRequest(BaseModel):
    reason: str | None = Field(
        default=None,
        max_length=500,
    )


class AppointmentSlotResponse(BaseModel):
    id: uuid.UUID

    start_at: datetime
    end_at: datetime

    status: SlotStatus


class AppointmentPatientResponse(BaseModel):
    id: uuid.UUID

    patient_code: str

    first_name: str
    last_name: str


class AppointmentDoctorResponse(BaseModel):
    id: uuid.UUID

    doctor_code: str

    first_name: str
    last_name: str

    qualification: str


class AppointmentResponse(BaseModel):
    id: uuid.UUID

    appointment_type: AppointmentType
    status: AppointmentStatus

    reason: str | None
    patient_notes: str | None

    requested_at: datetime

    approved_at: datetime | None

    cancelled_at: datetime | None
    cancellation_reason: str | None

    patient: AppointmentPatientResponse
    doctor: AppointmentDoctorResponse

    slot: AppointmentSlotResponse

    created_at: datetime
    updated_at: datetime