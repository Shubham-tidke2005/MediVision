from datetime import datetime
from typing import Any, Literal

from pydantic import (
    BaseModel,
    Field,
)


DoctorVerificationStatus = Literal[
    "PENDING",
    "VERIFIED",
    "REJECTED",
    "SUSPENDED",
]

FacilityType = Literal[
    "HOSPITAL",
    "CLINIC",
    "PHARMACY",
    "DIAGNOSTIC_CENTER",
]

HealthArticleStatus = Literal[
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED",
]


class AdminDashboardResponse(BaseModel):
    total_patients: int
    total_doctors: int
    pending_doctor_verifications: int
    total_appointments: int
    total_ai_assessments: int
    total_image_analyses: int
    active_sos_events: int
    published_health_articles: int


class AdminCollectionResponse(BaseModel):
    items: list[dict[str, Any]]
    total: int


class AdminMutationResponse(BaseModel):
    item: dict[str, Any]


class UserActiveUpdate(BaseModel):
    is_active: bool


class DoctorVerificationUpdate(BaseModel):
    verification_status: DoctorVerificationStatus


class SpecialtyCreate(BaseModel):
    code: str = Field(min_length=2, max_length=50)
    name: str = Field(min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=1000)
    is_active: bool = True


class SpecialtyUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=2, max_length=50)
    name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=1000)
    is_active: bool | None = None


class FacilityCreate(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    facility_type: FacilityType
    address_line_1: str | None = Field(default=None, max_length=200)
    address_line_2: str | None = Field(default=None, max_length=200)
    city: str | None = Field(default=None, max_length=100)
    district: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=24)
    country: str = Field(default="India", max_length=100)
    phone: str | None = Field(default=None, max_length=40)
    email: str | None = Field(default=None, max_length=254)
    website: str | None = Field(default=None, max_length=500)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    notes: str | None = None
    is_active: bool = True


class FacilityUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=180)
    facility_type: FacilityType | None = None
    address_line_1: str | None = Field(default=None, max_length=200)
    address_line_2: str | None = Field(default=None, max_length=200)
    city: str | None = Field(default=None, max_length=100)
    district: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=24)
    country: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=40)
    email: str | None = Field(default=None, max_length=254)
    website: str | None = Field(default=None, max_length=500)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    notes: str | None = None
    is_active: bool | None = None


class HealthArticleCreate(BaseModel):
    category: str = Field(min_length=2, max_length=80)
    slug: str = Field(min_length=2, max_length=180)
    title: str = Field(min_length=2, max_length=220)
    summary: str = Field(min_length=2, max_length=1000)
    content: str = Field(min_length=2)
    key_points: list[str] = Field(default_factory=list)
    professional_advice_note: str = Field(min_length=2, max_length=1000)
    source_name: str | None = Field(default=None, max_length=200)
    source_url: str | None = Field(default=None, max_length=1000)
    status: HealthArticleStatus = "DRAFT"
    featured: bool = False
    published_at: datetime | None = None


class HealthArticleUpdate(BaseModel):
    category: str | None = Field(default=None, min_length=2, max_length=80)
    slug: str | None = Field(default=None, min_length=2, max_length=180)
    title: str | None = Field(default=None, min_length=2, max_length=220)
    summary: str | None = Field(default=None, min_length=2, max_length=1000)
    content: str | None = None
    key_points: list[str] | None = None
    professional_advice_note: str | None = Field(default=None, min_length=2, max_length=1000)
    source_name: str | None = Field(default=None, max_length=200)
    source_url: str | None = Field(default=None, max_length=1000)
    status: HealthArticleStatus | None = None
    featured: bool | None = None
    published_at: datetime | None = None
