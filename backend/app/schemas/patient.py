from datetime import date, datetime
from decimal import Decimal
from typing import Literal
import uuid

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


BloodGroup = Literal[
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
]

class AddressInput(BaseModel):
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


class AddressResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )

    id: uuid.UUID

    address_line1: str | None = Field(
        validation_alias="address_line_1"
    )

    address_line2: str | None = Field(
        validation_alias="address_line_2"
    )

    city: str | None
    district: str | None
    state: str | None
    postal_code: str | None
    country: str | None

class PatientProfileCreate(BaseModel):
    first_name: str = Field(
        min_length=1,
        max_length=100,
    )

    last_name: str = Field(
        min_length=1,
        max_length=100,
    )

    date_of_birth: date

    gender: str | None = Field(
        default=None,
        max_length=30,
    )

    blood_group: BloodGroup | None = None

    height_cm: Decimal | None = Field(
        default=None,
        ge=20,
        le=300,
    )

    emergency_notes: str | None = Field(
        default=None,
        max_length=2000,
    )

    address: AddressInput | None = None

    @field_validator(
        "first_name",
        "last_name",
    )
    @classmethod
    def strip_names(
        cls,
        value: str,
    ) -> str:
        return value.strip()

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(
        cls,
        value: date,
    ) -> date:
        if value > date.today():
            raise ValueError(
                "Date of birth cannot be in the future."
            )

        return value


class PatientProfileUpdate(BaseModel):
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

    date_of_birth: date | None = None

    gender: str | None = Field(
        default=None,
        max_length=30,
    )

    blood_group: BloodGroup | None = None

    height_cm: Decimal | None = Field(
        default=None,
        ge=20,
        le=300,
    )

    emergency_notes: str | None = Field(
        default=None,
        max_length=2000,
    )

    address: AddressInput | None = None

    @field_validator(
        "first_name",
        "last_name",
    )
    @classmethod
    def strip_optional_names(
        cls,
        value: str | None,
    ):
        if value is None:
            return value

        return value.strip()

    @field_validator("date_of_birth")
    @classmethod
    def validate_optional_date_of_birth(
        cls,
        value: date | None,
    ):
        if (
            value is not None
            and value > date.today()
        ):
            raise ValueError(
                "Date of birth cannot be in the future."
            )

        return value


class PatientProfileResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID
    user_id: uuid.UUID

    patient_code: str

    first_name: str
    last_name: str

    date_of_birth: date

    gender: str | None
    blood_group: str | None

    height_cm: Decimal | None

    emergency_notes: str | None

    is_active: bool

    address: AddressResponse | None

    created_at: datetime
    updated_at: datetime