import uuid
from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
)


class MedicineCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=255,
    )

    generic_name: str | None = Field(
        default=None,
        max_length=255,
    )

    dosage_form: str | None = Field(
        default=None,
        max_length=100,
    )

    description: str | None = Field(
        default=None,
        max_length=3000,
    )


class MedicineResponse(BaseModel):
    id: uuid.UUID

    name: str
    generic_name: str | None
    dosage_form: str | None
    description: str | None

    is_active: bool


class PrescriptionCreate(BaseModel):
    general_instructions: str | None = Field(
        default=None,
        max_length=5000,
    )


class PrescriptionUpdate(BaseModel):
    general_instructions: str | None = Field(
        default=None,
        max_length=5000,
    )


class PrescriptionItemCreate(BaseModel):
    medicine_id: uuid.UUID

    strength: str | None = Field(
        default=None,
        max_length=100,
    )

    dose: str = Field(
        min_length=1,
        max_length=100,
    )

    frequency: str = Field(
        min_length=1,
        max_length=150,
    )

    route: str | None = Field(
        default=None,
        max_length=100,
    )

    duration_days: int | None = Field(
        default=None,
        ge=1,
        le=365,
    )

    quantity: str | None = Field(
        default=None,
        max_length=100,
    )

    instructions: str | None = Field(
        default=None,
        max_length=3000,
    )

    sort_order: int = Field(
        default=0,
        ge=0,
        le=1000,
    )


class PrescriptionItemUpdate(BaseModel):
    medicine_id: uuid.UUID | None = None

    strength: str | None = Field(
        default=None,
        max_length=100,
    )

    dose: str | None = Field(
        default=None,
        max_length=100,
    )

    frequency: str | None = Field(
        default=None,
        max_length=150,
    )

    route: str | None = Field(
        default=None,
        max_length=100,
    )

    duration_days: int | None = Field(
        default=None,
        ge=1,
        le=365,
    )

    quantity: str | None = Field(
        default=None,
        max_length=100,
    )

    instructions: str | None = Field(
        default=None,
        max_length=3000,
    )

    sort_order: int | None = Field(
        default=None,
        ge=0,
        le=1000,
    )


class PrescriptionItemResponse(BaseModel):
    id: uuid.UUID

    medicine: MedicineResponse

    strength: str | None

    dose: str
    frequency: str

    route: str | None

    duration_days: int | None

    quantity: str | None

    instructions: str | None

    sort_order: int

    created_at: datetime
    updated_at: datetime


class PrescriptionResponse(BaseModel):
    id: uuid.UUID

    encounter_id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: uuid.UUID

    general_instructions: str | None

    prescribed_at: datetime

    items: list[
        PrescriptionItemResponse
    ]

    created_at: datetime
    updated_at: datetime