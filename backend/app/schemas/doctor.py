from datetime import datetime
from decimal import Decimal
import uuid

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)

from app.models.enums import DoctorVerificationStatus


class DoctorAddressInput(BaseModel):
    address_line1: str | None = Field(
        default=None,
        max_length=255,
    )

    address_line2: str | None = Field(
        default=None,
        max_length=255,
    )

    city: str | None = Field(
        default=None,
        max_length=100,
    )

    district: str | None = Field(
        default=None,
        max_length=100,
    )

    state: str | None = Field(
        default=None,
        max_length=100,
    )

    postal_code: str | None = Field(
        default=None,
        max_length=20,
    )

    country: str | None = Field(
        default="India",
        max_length=100,
    )


class DoctorAddressResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID

    address_line1: str | None
    address_line2: str | None

    city: str | None
    district: str | None
    state: str | None

    postal_code: str | None
    country: str | None


class DoctorSpecialtyInput(BaseModel):
    specialty_id: int

    is_primary: bool = False


class SpecialtyResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    is_primary: bool = False


class SpecialtyListResponse(BaseModel):
    id: int
    name: str
    description: str | None = None


class DoctorProfileCreate(BaseModel):
    first_name: str = Field(
        min_length=1,
        max_length=100,
    )

    last_name: str = Field(
        min_length=1,
        max_length=100,
    )

    registration_number: str = Field(
        min_length=2,
        max_length=100,
    )

    qualification: str = Field(
        min_length=2,
        max_length=255,
    )

    experience_years: int = Field(
        ge=0,
        le=80,
    )

    bio: str | None = Field(
        default=None,
        max_length=3000,
    )

    default_consultation_fee: Decimal | None = Field(
        default=None,
        ge=0,
    )

    specialties: list[DoctorSpecialtyInput] = Field(
        min_length=1,
    )

    address: DoctorAddressInput | None = None

    @field_validator(
        "first_name",
        "last_name",
        "qualification",
    )
    @classmethod
    def strip_text(
        cls,
        value: str,
    ) -> str:
        return value.strip()

    @field_validator("registration_number")
    @classmethod
    def normalize_registration_number(
        cls,
        value: str,
    ) -> str:
        return value.strip().upper()

    @model_validator(mode="after")
    def validate_specialties(self):
        ids = [
            item.specialty_id
            for item in self.specialties
        ]

        if len(ids) != len(set(ids)):
            raise ValueError(
                "Duplicate specialties are not allowed."
            )

        primary_count = sum(
            1
            for item in self.specialties
            if item.is_primary
        )

        if primary_count != 1:
            raise ValueError(
                "Exactly one primary specialty is required."
            )

        return self


class DoctorProfileUpdate(BaseModel):
    first_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    last_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    registration_number: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    qualification: str | None = Field(
        default=None,
        min_length=2,
        max_length=255,
    )

    experience_years: int | None = Field(
        default=None,
        ge=0,
        le=80,
    )

    bio: str | None = Field(
        default=None,
        max_length=3000,
    )

    default_consultation_fee: Decimal | None = Field(
        default=None,
        ge=0,
    )

    is_accepting_patients: bool | None = None

    specialties: list[DoctorSpecialtyInput] | None = None

    address: DoctorAddressInput | None = None

    @field_validator(
        "first_name",
        "last_name",
        "qualification",
    )
    @classmethod
    def strip_optional_text(
        cls,
        value: str | None,
    ):
        if value is None:
            return None

        return value.strip()

    @field_validator("registration_number")
    @classmethod
    def normalize_optional_registration_number(
        cls,
        value: str | None,
    ):
        if value is None:
            return None

        return value.strip().upper()

    @model_validator(mode="after")
    def validate_specialties(self):
        if self.specialties is None:
            return self

        if not self.specialties:
            raise ValueError(
                "At least one specialty is required."
            )

        ids = [
            item.specialty_id
            for item in self.specialties
        ]

        if len(ids) != len(set(ids)):
            raise ValueError(
                "Duplicate specialties are not allowed."
            )

        primary_count = sum(
            1
            for item in self.specialties
            if item.is_primary
        )

        if primary_count != 1:
            raise ValueError(
                "Exactly one primary specialty is required."
            )

        return self


class DoctorProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID

    doctor_code: str

    first_name: str
    last_name: str

    registration_number: str

    qualification: str

    experience_years: int

    bio: str | None

    default_consultation_fee: Decimal | None

    verification_status: DoctorVerificationStatus

    is_accepting_patients: bool
    is_active: bool

    address: DoctorAddressResponse | None

    specialties: list[SpecialtyResponse]

    created_at: datetime
    updated_at: datetime