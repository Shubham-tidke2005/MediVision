import uuid

from datetime import datetime

from enum import Enum

from pydantic import (
    BaseModel,
    Field,
)


class NotificationType(
    str,
    Enum,
):
    APPOINTMENT_APPROVED = (
        "APPOINTMENT_APPROVED"
    )

    APPOINTMENT_REJECTED = (
        "APPOINTMENT_REJECTED"
    )

    APPOINTMENT_REMINDER = (
        "APPOINTMENT_REMINDER"
    )

    MEDICINE_REMINDER = (
        "MEDICINE_REMINDER"
    )

    NEW_PRESCRIPTION = (
        "NEW_PRESCRIPTION"
    )

    MEDICAL_ACCESS_SHARED = (
        "MEDICAL_ACCESS_SHARED"
    )


class NotificationResponse(
    BaseModel
):
    id: uuid.UUID

    notification_type: (
        NotificationType
    )

    title: str

    message: str

    related_entity_type: (
        str
        | None
    )

    related_entity_id: (
        uuid.UUID
        | None
    )

    data_json: dict = Field(
        default_factory=dict
    )

    available_at: datetime

    read_at: (
        datetime
        | None
    )

    is_read: bool

    created_at: datetime


class NotificationCenterResponse(
    BaseModel
):
    unread_count: int

    items: list[
        NotificationResponse
    ]


class UnreadCountResponse(
    BaseModel
):
    unread_count: int


class MarkAllReadResponse(
    BaseModel
):
    updated_count: int