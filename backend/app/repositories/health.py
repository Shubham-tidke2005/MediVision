import uuid

from datetime import datetime

from sqlalchemy import (
    select,
)

from sqlalchemy.orm import Session

from app.models.health import (
    HealthMeasurement,
    HealthMetricType,
)


def get_metric_type_by_code(
    db: Session,
    code: str,
):
    return db.scalar(
        select(
            HealthMetricType
        )
        .where(
            HealthMetricType.code
            == code,

            HealthMetricType.is_active
            .is_(True),
        )
    )


def list_metric_types(
    db: Session,
):
    return list(
        db.scalars(
            select(
                HealthMetricType
            )
            .where(
                HealthMetricType.is_active
                .is_(True)
            )
            .order_by(
                HealthMetricType.id
            )
        ).all()
    )


def list_patient_measurements(
    db: Session,
    patient_id: uuid.UUID,
    start_at: datetime,
    metric_code: str | None = None,
):
    stmt = (
        select(
            HealthMeasurement,
            HealthMetricType,
        )
        .join(
            HealthMetricType,
            HealthMetricType.id
            == HealthMeasurement.metric_type_id,
        )
        .where(
            HealthMeasurement.patient_id
            == patient_id,

            HealthMeasurement.measured_at
            >= start_at,
        )
    )


    if metric_code:
        stmt = stmt.where(
            HealthMetricType.code
            == metric_code
        )


    stmt = stmt.order_by(
        HealthMeasurement.measured_at.desc()
    )


    return db.execute(
        stmt
    ).all()