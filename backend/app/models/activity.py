import uuid

from datetime import (
    date,
    datetime,
)

from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)

from sqlalchemy.dialects.postgresql import (
    UUID,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.core.database import (
    Base,
)


# =========================================================
# ACTIVITY PLAN
# =========================================================


class ActivityPlan(Base):
    __tablename__ = "activity_plans"


    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "patients.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )


    goal: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
    )


    activity_level: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )


    available_minutes_per_day: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )


    sleep_hours_snapshot: Mapped[Decimal] = mapped_column(
        Numeric(
            4,
            2,
        ),
        nullable=False,
    )


    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )


    source: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="RULE_BASED",
        server_default="RULE_BASED",
    )


    safety_message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )


    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=text(
            "true"
        ),
    )


    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


    __table_args__ = (
        Index(
            "ix_activity_plans_patient_id",
            "patient_id",
        ),

        Index(
            "ix_activity_plans_created_at",
            "created_at",
        ),

        Index(
            "uq_activity_plans_one_active_per_patient",
            "patient_id",
            unique=True,
            postgresql_where=text(
                "is_active = true"
            ),
        ),
    )


# =========================================================
# ACTIVITY PLAN ITEM
# =========================================================


class ActivityPlanItem(Base):
    __tablename__ = "activity_plan_items"


    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


    activity_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "activity_plans.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )


    activity_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )


    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )


    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


    target_value: Mapped[Decimal] = mapped_column(
        Numeric(
            8,
            2,
        ),
        nullable=False,
    )


    target_unit: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )


    duration_minutes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )


    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )


    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


    __table_args__ = (
        Index(
            "ix_activity_plan_items_plan_id",
            "activity_plan_id",
        ),
    )


# =========================================================
# ACTIVITY LOG
# =========================================================


class ActivityLog(Base):
    __tablename__ = "activity_logs"


    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "patients.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )


    activity_plan_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "activity_plan_items.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )


    log_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )


    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )


    actual_value: Mapped[Decimal | None] = mapped_column(
        Numeric(
            8,
            2,
        ),
        nullable=True,
    )


    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


    __table_args__ = (
        UniqueConstraint(
            "activity_plan_item_id",
            "log_date",
            name=(
                "uq_activity_log_item_date"
            ),
        ),

        Index(
            "ix_activity_logs_patient_date",
            "patient_id",
            "log_date",
        ),
    )