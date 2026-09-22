import uuid

from datetime import datetime

from enum import Enum

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


class SOSStatus(
    str,
    Enum,
):
    TRIGGERED = "TRIGGERED"

    ACKNOWLEDGED = (
        "ACKNOWLEDGED"
    )

    RESOLVED = "RESOLVED"

    CANCELLED = "CANCELLED"


class SOSActionType(
    str,
    Enum,
):
    SOS_TRIGGERED = (
        "SOS_TRIGGERED"
    )

    EMERGENCY_NUMBER_OPENED = (
        "EMERGENCY_NUMBER_OPENED"
    )

    EMERGENCY_CONTACT_OPENED = (
        "EMERGENCY_CONTACT_OPENED"
    )

    NEARBY_HOSPITALS_OPENED = (
        "NEARBY_HOSPITALS_OPENED"
    )

    LOCATION_SHARED = (
        "LOCATION_SHARED"
    )

    LOCATION_REFRESHED = (
        "LOCATION_REFRESHED"
    )

    STATUS_CHANGED = (
        "STATUS_CHANGED"
    )


class SOSUserActionType(
    str,
    Enum,
):
    EMERGENCY_NUMBER_OPENED = (
        "EMERGENCY_NUMBER_OPENED"
    )

    EMERGENCY_CONTACT_OPENED = (
        "EMERGENCY_CONTACT_OPENED"
    )

    NEARBY_HOSPITALS_OPENED = (
        "NEARBY_HOSPITALS_OPENED"
    )


class SOSEventCreate(
    BaseModel
):
    share_location: bool = False

    latitude: (
        float
        | None
    ) = Field(
        default=None,
        ge=-90,
        le=90,
    )

    longitude: (
        float
        | None
    ) = Field(
        default=None,
        ge=-180,
        le=180,
    )

    location_accuracy_m: (
        float
        | None
    ) = Field(
        default=None,
        ge=0,
        le=100000,
    )

    emergency_contact_name: (
        str
        | None
    ) = Field(
        default=None,
        max_length=120,
    )

    emergency_contact_phone: (
        str
        | None
    ) = Field(
        default=None,
        max_length=32,
    )

    message: (
        str
        | None
    ) = Field(
        default=None,
        max_length=500,
    )

    @model_validator(
        mode="after"
    )
    def validate_location(
        self
    ):
        if self.share_location:
            if (
                self.latitude
                is None
                or self.longitude
                is None
            ):
                raise ValueError(
                    "Latitude and longitude "
                    "are required when "
                    "location sharing is enabled."
                )

        return self


class SOSStatusUpdate(
    BaseModel
):
    status: SOSStatus


class SOSLocationUpdate(
    BaseModel
):
    latitude: float = Field(
        ge=-90,
        le=90,
    )

    longitude: float = Field(
        ge=-180,
        le=180,
    )

    accuracy_m: (
        float
        | None
    ) = Field(
        default=None,
        ge=0,
        le=100000,
    )


class SOSActionCreate(
    BaseModel
):
    action_type: (
        SOSUserActionType
    )

    description: (
        str
        | None
    ) = Field(
        default=None,
        max_length=500,
    )


class SOSActionResponse(
    BaseModel
):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: uuid.UUID

    action_type: str

    description: (
        str
        | None
    )

    metadata_json: dict

    created_at: datetime


class SOSEventResponse(
    BaseModel
):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: uuid.UUID

    status: SOSStatus

    share_location: bool

    latitude: (
        float
        | None
    )

    longitude: (
        float
        | None
    )

    location_accuracy_m: (
        float
        | None
    )

    emergency_contact_name: (
        str
        | None
    )

    emergency_contact_phone: (
        str
        | None
    )

    message: (
        str
        | None
    )

    triggered_at: datetime

    acknowledged_at: (
        datetime
        | None
    )

    resolved_at: (
        datetime
        | None
    )

    cancelled_at: (
        datetime
        | None
    )

    created_at: datetime

    updated_at: datetime


class SOSEventDetailResponse(
    SOSEventResponse
):
    actions: list[
        SOSActionResponse
    ] = Field(
        default_factory=list
    )


class SOSConfigResponse(
    BaseModel
):
    emergency_phone_number: str

    emergency_service_label: str

    disclaimer: str