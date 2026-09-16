import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.enums import (
    AppointmentStatus,
    AppointmentType,
)


class PatientDashboardStats(BaseModel):
    pending_requests: int
    upcoming_approved: int
    completed_total: int
    available_doctors: int


class PatientDashboardAppointment(BaseModel):
    id: uuid.UUID

    doctor_id: uuid.UUID
    doctor_code: str

    doctor_first_name: str
    doctor_last_name: str

    qualification: str

    appointment_type: AppointmentType
    status: AppointmentStatus

    start_at: datetime
    end_at: datetime

    reason: str | None = None


class PatientDashboardResponse(BaseModel):
    patient_id: uuid.UUID
    patient_code: str

    patient_first_name: str
    patient_last_name: str

    stats: PatientDashboardStats

    appointment_status_counts: dict[str, int]

    upcoming_appointments: list[
        PatientDashboardAppointment
    ]