import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    func,
    text,
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.core.database import Base


# =========================================================
# DIET PLAN
# =========================================================


class DietPlan(Base):
    """
    Rule-based wellness meal plan.

    This is a general wellness suggestion and must not
    be presented as a medical diet prescription.
    """

    __tablename__ = "diet_plans"


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


    # -----------------------------------------------------
    # INPUT SNAPSHOT
    # -----------------------------------------------------

    age: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )


    height_cm: Mapped[float] = mapped_column(
        Numeric(
            6,
            2,
        ),
        nullable=False,
    )


    weight_kg: Mapped[float] = mapped_column(
        Numeric(
            6,
            2,
        ),
        nullable=False,
    )


    activity_level: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )


    diet_preference: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )


    goal: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )


    # -----------------------------------------------------
    # CALCULATED VALUES
    # -----------------------------------------------------

    bmi: Mapped[float] = mapped_column(
        Numeric(
            5,
            2,
        ),
        nullable=False,
    )


    estimated_daily_calories: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )


    water_target_ml: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )


    # -----------------------------------------------------
    # PLAN INFORMATION
    # -----------------------------------------------------

    source: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="RULE_BASED",
        server_default="RULE_BASED",
    )


    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )


    calculation_note: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )


    safety_message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )


    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=text("true"),
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
            "ix_diet_plans_patient_id",
            "patient_id",
        ),

        Index(
            "ix_diet_plans_created_at",
            "created_at",
        ),

        Index(
            "uq_diet_plans_one_active_per_patient",
            "patient_id",
            unique=True,
            postgresql_where=text(
                "is_active = true"
            ),
        ),
    )


# =========================================================
# DIET PLAN ITEM
# =========================================================


class DietPlanItem(Base):
    __tablename__ = "diet_plan_items"


    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


    diet_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "diet_plans.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )


    meal_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )


    food_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )


    quantity: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )


    instructions: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


    sort_order: Mapped[int] = mapped_column(
        SmallInteger,
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
            "ix_diet_plan_items_diet_plan_id",
            "diet_plan_id",
        ),
    )