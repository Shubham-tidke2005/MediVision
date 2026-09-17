from datetime import (
    datetime,
    timedelta,
    timezone,
)

from decimal import Decimal

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.models.enums import (
    MetricSource,
)

from app.models.health import (
    HealthMeasurement,
    HealthMetricType,
)

from app.models.patient import (
    Patient,
)

from app.repositories.health import (
    get_metric_type_by_code,
    list_metric_types,
    list_patient_measurements,
)

from app.schemas.health import (
    HealthMeasurementCreate,
)


# =========================================================
# DEFAULT METRIC TYPES
# =========================================================


DEFAULT_METRICS = [
    {
        "code": "WEIGHT",
        "name": "Weight",
        "primary_label": "Weight",
        "primary_unit": "kg",
        "secondary_label": None,
        "secondary_unit": None,
    },

    {
        "code": "BLOOD_PRESSURE",
        "name": "Blood Pressure",
        "primary_label": "Systolic",
        "primary_unit": "mmHg",
        "secondary_label": "Diastolic",
        "secondary_unit": "mmHg",
    },

    {
        "code": "HEART_RATE",
        "name": "Heart Rate",
        "primary_label": "Heart Rate",
        "primary_unit": "bpm",
        "secondary_label": None,
        "secondary_unit": None,
    },

    {
        "code": "BLOOD_SUGAR",
        "name": "Blood Sugar",
        "primary_label": "Blood Sugar",
        "primary_unit": "mg/dL",
        "secondary_label": None,
        "secondary_unit": None,
    },

    {
        "code": "SLEEP",
        "name": "Sleep",
        "primary_label": "Sleep Duration",
        "primary_unit": "hours",
        "secondary_label": None,
        "secondary_unit": None,
    },

    {
        "code": "STEPS",
        "name": "Steps",
        "primary_label": "Steps",
        "primary_unit": "steps",
        "secondary_label": None,
        "secondary_unit": None,
    },

    {
        "code": "WATER",
        "name": "Water",
        "primary_label": "Water Intake",
        "primary_unit": "ml",
        "secondary_label": None,
        "secondary_unit": None,
    },
]


# =========================================================
# SEED
# =========================================================


def seed_health_metric_types(
    db: Session,
):
    for item in DEFAULT_METRICS:
        existing = (
            get_metric_type_by_code(
                db,
                item["code"],
            )
        )

        if existing is not None:
            continue


        metric = HealthMetricType(
            **item
        )

        db.add(
            metric
        )


    db.commit()


# =========================================================
# SERIALIZER
# =========================================================


def serialize_measurement(
    measurement: HealthMeasurement,
    metric: HealthMetricType,
):
    return {
        "id":
            measurement.id,

        "metric_code":
            metric.code,

        "metric_name":
            metric.name,

        "value_primary":
            float(
                measurement.value_primary
            ),

        "value_secondary": (
            float(
                measurement.value_secondary
            )
            if measurement.value_secondary
            is not None
            else None
        ),

        "primary_unit":
            metric.primary_unit,

        "secondary_unit":
            metric.secondary_unit,

        "measured_at":
            measurement.measured_at,

        "source":
            measurement.source.value,

        "notes":
            measurement.notes,
    }


# =========================================================
# VALIDATION
# =========================================================


def validate_measurement_values(
    code: str,
    primary: float,
    secondary: float | None,
):
    """
    These are broad input-sanity limits,
    not diagnostic ranges.
    """

    limits = {
        "WEIGHT":
            (0.5, 500),

        "HEART_RATE":
            (20, 300),

        "BLOOD_SUGAR":
            (10, 1500),

        "SLEEP":
            (0, 24),

        "STEPS":
            (0, 250000),

        "WATER":
            (0, 30000),
    }


    if code == "BLOOD_PRESSURE":
        if secondary is None:
            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail=(
                    "Blood pressure requires both "
                    "systolic and diastolic values."
                ),
            )


        if not (
            30
            <= primary
            <= 350
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail="Invalid systolic value.",
            )


        if not (
            20
            <= secondary
            <= 250
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail="Invalid diastolic value.",
            )

        return


    if secondary is not None:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "This measurement type does not "
                "use a secondary value."
            ),
        )


    if code not in limits:
        return


    minimum, maximum = (
        limits[code]
    )


    if not (
        minimum
        <= primary
        <= maximum
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Measurement value is outside "
                "the accepted input range."
            ),
        )


# =========================================================
# METRIC TYPES
# =========================================================


def get_health_metric_types(
    db: Session,
):
    metrics = list_metric_types(
        db
    )


    return [
        {
            "id":
                metric.id,

            "code":
                metric.code,

            "name":
                metric.name,

            "primary_label":
                metric.primary_label,

            "primary_unit":
                metric.primary_unit,

            "secondary_label":
                metric.secondary_label,

            "secondary_unit":
                metric.secondary_unit,
        }

        for metric
        in metrics
    ]


# =========================================================
# CREATE MEASUREMENT
# =========================================================


def create_health_measurement(
    db: Session,
    patient: Patient,
    payload: HealthMeasurementCreate,
):
    metric_code = (
        payload.metric_code
        .strip()
        .upper()
    )


    metric = get_metric_type_by_code(
        db,
        metric_code,
    )


    if metric is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Health metric type not found."
            ),
        )


    validate_measurement_values(
        metric.code,
        payload.value_primary,
        payload.value_secondary,
    )


    measured_at = (
        payload.measured_at
        or datetime.now(
            timezone.utc
        )
    )


    if (
        measured_at.tzinfo
        is None
    ):
        measured_at = (
            measured_at.replace(
                tzinfo=timezone.utc
            )
        )


    measured_at = (
        measured_at.astimezone(
            timezone.utc
        )
    )


    if (
        measured_at
        > datetime.now(
            timezone.utc
        )
        + timedelta(
            minutes=5
        )
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Measurement time cannot "
                "be in the future."
            ),
        )


    measurement = HealthMeasurement(
        patient_id=(
            patient.id
        ),

        metric_type_id=(
            metric.id
        ),

        value_primary=(
            Decimal(
                str(
                    payload.value_primary
                )
            )
        ),

        value_secondary=(
            Decimal(
                str(
                    payload.value_secondary
                )
            )
            if payload.value_secondary
            is not None
            else None
        ),

        measured_at=(
            measured_at
        ),

        source=(
            MetricSource.MANUAL
        ),

        notes=(
            payload.notes
        ),
    )


    db.add(
        measurement
    )

    db.commit()

    db.refresh(
        measurement
    )


    return serialize_measurement(
        measurement,
        metric,
    )


# =========================================================
# LIST MEASUREMENTS
# =========================================================


def get_health_measurements(
    db: Session,
    patient: Patient,
    days: int,
    metric_code: str | None = None,
):
    start_at = (
        datetime.now(
            timezone.utc
        )
        - timedelta(
            days=days
        )
    )


    normalized_code = (
        metric_code.strip().upper()
        if metric_code
        else None
    )


    rows = list_patient_measurements(
        db,
        patient.id,
        start_at,
        normalized_code,
    )


    return [
        serialize_measurement(
            measurement,
            metric,
        )

        for (
            measurement,
            metric,
        ) in rows
    ]