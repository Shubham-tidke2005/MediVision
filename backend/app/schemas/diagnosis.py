import uuid
from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
)

from app.models.enums import (
    DiagnosisType,
)


class DiagnosisCatalogCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=255,
    )

    code: str | None = Field(
        default=None,
        max_length=50,
    )

    description: str | None = Field(
        default=None,
        max_length=3000,
    )


class DiagnosisCatalogResponse(BaseModel):
    id: uuid.UUID

    name: str
    code: str | None
    description: str | None

    is_active: bool


class EncounterDiagnosisCreate(BaseModel):
    diagnosis_id: uuid.UUID

    diagnosis_type: DiagnosisType

    notes: str | None = Field(
        default=None,
        max_length=5000,
    )


class EncounterDiagnosisUpdate(BaseModel):
    diagnosis_type: DiagnosisType | None = None

    notes: str | None = Field(
        default=None,
        max_length=5000,
    )


class EncounterDiagnosisResponse(BaseModel):
    id: uuid.UUID

    encounter_id: uuid.UUID

    diagnosis_type: DiagnosisType

    notes: str | None

    diagnosis: DiagnosisCatalogResponse

    created_at: datetime
    updated_at: datetime