from datetime import datetime
from decimal import Decimal
import uuid

from pydantic import BaseModel


class DiscoverySpecialtyResponse(BaseModel):
    id: int
    name: str
    description: str | None = None


class DoctorDiscoverySpecialtyResponse(BaseModel):
    id: int
    name: str
    is_primary: bool


class DoctorDiscoveryLocationResponse(BaseModel):
    city: str | None = None
    district: str | None = None
    state: str | None = None
    country: str | None = None


class DoctorDiscoverySummaryResponse(BaseModel):
    id: uuid.UUID

    doctor_code: str

    first_name: str
    last_name: str

    qualification: str

    experience_years: int

    default_consultation_fee: Decimal | None

    specialties: list[
        DoctorDiscoverySpecialtyResponse
    ]

    location: DoctorDiscoveryLocationResponse | None

    verified: bool = True


class DoctorDiscoveryPageResponse(BaseModel):
    items: list[
        DoctorDiscoverySummaryResponse
    ]

    total: int

    page: int
    page_size: int

    total_pages: int


class DoctorDiscoveryDetailResponse(
    DoctorDiscoverySummaryResponse
):
    registration_number: str

    bio: str | None


class AvailableSlotResponse(BaseModel):
    id: uuid.UUID

    start_at: datetime
    end_at: datetime

    status: str