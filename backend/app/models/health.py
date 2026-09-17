import uuid

from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.core.database import Base
from app.models.enums import MetricSource


# =========================================================
# HEALTH METRIC TYPE
# =========================================================


class HealthMetricType(Base):
    __tablename__ = "health_metric_types"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    primary_label: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    primary_unit: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    secondary_label: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )

    secondary_unit: Mapped[
        str | None
    ] = mapped_column(
        String(50),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


# =========================================================
# HEALTH MEASUREMENT
# =========================================================


class HealthMeasurement(Base):
    __tablename__ = "health_measurements"

    __table_args__ = (
        CheckConstraint(
            "value_primary >= 0",
            name="ck_health_measurement_primary_positive",
        ),

        CheckConstraint(
            "value_secondary IS NULL OR value_secondary >= 0",
            name="ck_health_measurement_secondary_positive",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "patients.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    metric_type_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "health_metric_types.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    value_primary: Mapped[Decimal] = mapped_column(
        Numeric(
            12,
            3,
        ),
        nullable=False,
    )

    value_secondary: Mapped[
        Decimal | None
    ] = mapped_column(
        Numeric(
            12,
            3,
        ),
        nullable=True,
    )

    measured_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    source: Mapped[MetricSource] = mapped_column(
        SQLEnum(
            MetricSource,
            name="metric_source",
        ),
        nullable=False,
        default=MetricSource.MANUAL,
        server_default="MANUAL",
    )

    notes: Mapped[
        str | None
    ] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )