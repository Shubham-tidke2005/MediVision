import uuid

from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
)


class HealthMetricTypeResponse(BaseModel):
    id: int

    code: str

    name: str

    primary_label: str

    primary_unit: str

    secondary_label: str | None = None

    secondary_unit: str | None = None


class HealthMeasurementCreate(BaseModel):
    metric_code: str = Field(
        min_length=1,
        max_length=50,
    )

    value_primary: float = Field(
        ge=0
    )

    value_secondary: float | None = Field(
        default=None,
        ge=0,
    )

    measured_at: datetime | None = None

    notes: str | None = Field(
        default=None,
        max_length=1000,
    )


class HealthMeasurementResponse(BaseModel):
    id: uuid.UUID

    metric_code: str

    metric_name: str

    value_primary: float

    value_secondary: float | None = None

    primary_unit: str

    secondary_unit: str | None = None

    measured_at: datetime

    source: str

    notes: str | None = None