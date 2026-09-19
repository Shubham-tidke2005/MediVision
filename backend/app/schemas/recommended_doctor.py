import uuid
from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
)


class RecommendedDoctorSlotResponse(
    BaseModel
):
    id: uuid.UUID

    start_at: datetime

    end_at: datetime


class RecommendedDoctorResponse(
    BaseModel
):
    id: uuid.UUID

    doctor_code: str

    first_name: str

    last_name: str

    qualification: (
        str | None
    ) = None

    next_available_slots: list[
        RecommendedDoctorSlotResponse
    ] = Field(
        default_factory=list
    )


class RecommendedDoctorSearchResponse(
    BaseModel
):
    specialty_id: int

    specialty_code: str

    specialty_name: str

    search_window_days: int

    total: int

    doctors: list[
        RecommendedDoctorResponse
    ] = Field(
        default_factory=list
    )