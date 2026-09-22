import uuid

from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Numeric,
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


class HealthcareFacility(Base):
    __tablename__ = "healthcare_facilities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    facility_type: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
    )

    address_line_1: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    address_line_2: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    city: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    district: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    state: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )

    postal_code: Mapped[str | None] = mapped_column(
        String(24),
        nullable=True,
    )

    country: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="India",
        server_default=text("'India'"),
    )

    phone: Mapped[str | None] = mapped_column(
        String(40),
        nullable=True,
    )

    email: Mapped[str | None] = mapped_column(
        String(254),
        nullable=True,
    )

    website: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    latitude: Mapped[float | None] = mapped_column(
        Numeric(9, 6),
        nullable=True,
    )

    longitude: Mapped[float | None] = mapped_column(
        Numeric(9, 6),
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
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
        CheckConstraint(
            (
                "facility_type IN ("
                "'HOSPITAL', "
                "'CLINIC', "
                "'PHARMACY', "
                "'DIAGNOSTIC_CENTER'"
                ")"
            ),
            name="ck_healthcare_facilities_type",
        ),
    )
