import uuid

from datetime import (
    date,
    datetime,
    time,
)

from pydantic import (
    BaseModel,
    Field,
)

from app.models.enums import (
    AdherenceStatus,
    MedicationSource,
    MedicationStatus,
)


class ManualMedicationCreate(BaseModel):
    medicine_name: str = Field(
        min_length=1,
        max_length=255,
    )

    strength: str | None = None

    dose: str | None = None

    route: str | None = None

    instructions: str | None = None

    start_date: date

    end_date: date | None = None


class MedicationScheduleCreate(BaseModel):
    time_of_day: time

    timezone: str = "Asia/Kolkata"


class MedicationResponse(BaseModel):
    id: uuid.UUID

    medicine_name: str

    source: MedicationSource

    status: MedicationStatus

    strength: str | None = None

    dose: str | None = None

    route: str | None = None

    instructions: str | None = None

    start_date: date

    end_date: date | None = None


class MedicationScheduleResponse(BaseModel):
    id: uuid.UUID

    patient_medication_id: uuid.UUID

    time_of_day: time

    timezone: str

    is_active: bool


class DoseStatusUpdate(BaseModel):
    status: AdherenceStatus

    notes: str | None = Field(
        default=None,
        max_length=500,
    )


class MedicationDoseResponse(BaseModel):
    schedule_id: uuid.UUID

    patient_medication_id: uuid.UUID

    medicine_name: str

    scheduled_for: datetime

    status: AdherenceStatus | None = None

    taken_at: datetime | None = None


class AdherenceSummaryResponse(BaseModel):
    days: int

    total_doses: int

    taken: int

    late: int

    missed: int

    skipped: int

    adherence_percentage: float | None