from datetime import date, datetime, time
import uuid

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)

from app.models.enums import SlotStatus


class AvailabilityRuleCreate(BaseModel):
    day_of_week: int = Field(
        ge=0,
        le=6,
    )

    start_time: time

    end_time: time

    slot_duration_minutes: int = Field(
        default=30,
        ge=5,
        le=240,
    )

    valid_from: date | None = None
    valid_until: date | None = None

    timezone: str = Field(
        default="Asia/Kolkata",
        max_length=64,
    )

    @model_validator(mode="after")
    def validate_rule(self):
        if self.end_time <= self.start_time:
            raise ValueError(
                "End time must be after start time."
            )

        if (
            self.valid_from is not None
            and self.valid_until is not None
            and self.valid_until < self.valid_from
        ):
            raise ValueError(
                "Valid until cannot be before valid from."
            )

        return self


class AvailabilityRuleUpdate(BaseModel):
    start_time: time | None = None
    end_time: time | None = None

    slot_duration_minutes: int | None = Field(
        default=None,
        ge=5,
        le=240,
    )

    valid_from: date | None = None
    valid_until: date | None = None

    timezone: str | None = Field(
        default=None,
        max_length=64,
    )

    is_active: bool | None = None


class AvailabilityRuleResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID
    doctor_id: uuid.UUID

    day_of_week: int

    start_time: time
    end_time: time

    slot_duration_minutes: int

    valid_from: date | None
    valid_until: date | None

    timezone: str

    is_active: bool

    created_at: datetime
    updated_at: datetime


class TimeOffCreate(BaseModel):
    start_at: datetime
    end_at: datetime

    reason: str | None = Field(
        default=None,
        max_length=500,
    )

    @model_validator(mode="after")
    def validate_time_off(self):
        if self.end_at <= self.start_at:
            raise ValueError(
                "Time off end must be after start."
            )

        return self


class TimeOffResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID
    doctor_id: uuid.UUID

    start_at: datetime
    end_at: datetime

    reason: str | None

    created_at: datetime


class SlotResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID

    doctor_id: uuid.UUID

    start_at: datetime
    end_at: datetime

    status: SlotStatus


class GenerateSlotsRequest(BaseModel):
    days: int = Field(
        default=30,
        ge=1,
        le=90,
    )


class GenerateSlotsResponse(BaseModel):
    generated: int
    skipped: int