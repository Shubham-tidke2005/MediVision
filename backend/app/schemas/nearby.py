from enum import Enum

from pydantic import (
    BaseModel,
    Field,
)


class FacilityType(
    str,
    Enum,
):
    HOSPITAL = "HOSPITAL"
    CLINIC = "CLINIC"
    PHARMACY = "PHARMACY"
    DIAGNOSTIC_CENTER = (
        "DIAGNOSTIC_CENTER"
    )


class FacilityOpenStatus(
    str,
    Enum,
):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    UNKNOWN = "UNKNOWN"


class Coordinates(
    BaseModel
):
    latitude: float

    longitude: float


class NearbyFacilityResponse(
    BaseModel
):
    provider_id: str

    name: str

    facility_type: FacilityType

    address: str | None = None

    latitude: float

    longitude: float

    distance_km: float = Field(
        ge=0
    )

    open_status: (
        FacilityOpenStatus
    )

    opening_hours: (
        str
        | None
    ) = None

    phone: (
        str
        | None
    ) = None

    website: (
        str
        | None
    ) = None


class NearbyHealthcareResponse(
    BaseModel
):
    center: Coordinates

    radius_km: float

    facility_type: (
        FacilityType
        | None
    ) = None

    open_now: bool

    provider: str

    total: int

    facilities: list[
        NearbyFacilityResponse
    ]