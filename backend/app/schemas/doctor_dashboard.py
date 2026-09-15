import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.enums import (
    AppointmentStatus,
    AppointmentType,
    DoctorVerificationStatus,
)


class DoctorDashboardStats(BaseModel):
    pending_requests: int
    upcoming_approved: int
    completed_total: int
    available_slots_next_7_days: int


class DoctorDashboardAppointment(BaseModel):
    id: uuid.UUID

    patient_id: uuid.UUID
    patient_code: str

    patient_first_name: str
    patient_last_name: str

    appointment_type: AppointmentType
    status: AppointmentStatus

    start_at: datetime
    end_at: datetime

    reason: str | None = None


class DoctorDashboardResponse(BaseModel):
    doctor_id: uuid.UUID

    doctor_code: str

    doctor_first_name: str
    doctor_last_name: str

    verification_status: DoctorVerificationStatus

    is_accepting_patients: bool

    stats: DoctorDashboardStats

    appointment_status_counts: dict[str, int]

    upcoming_appointments: list[
        DoctorDashboardAppointment
    ]