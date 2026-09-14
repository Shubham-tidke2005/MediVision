import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

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
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import DoctorVerificationStatus


if TYPE_CHECKING:
    from app.models.address import Address
    from app.models.user import User


class Doctor(Base):
    __tablename__ = "doctors"

    __table_args__ = (
        CheckConstraint(
            "experience_years >= 0",
            name="ck_doctors_experience_years_non_negative",
        ),
        CheckConstraint(
            "default_consultation_fee IS NULL "
            "OR default_consultation_fee >= 0",
            name="ck_doctors_consultation_fee_non_negative",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        unique=True,
        index=True,
    )

    doctor_code: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        unique=True,
        index=True,
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    registration_number: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    qualification: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    experience_years: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    bio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    default_consultation_fee: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    verification_status: Mapped[
        DoctorVerificationStatus
    ] = mapped_column(
        SQLEnum(
            DoctorVerificationStatus,
            name="doctor_verification_status",
        ),
        nullable=False,
        default=DoctorVerificationStatus.PENDING,
        server_default="PENDING",
        index=True,
    )

    is_accepting_patients: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    address_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "addresses.id",
            ondelete="SET NULL",
        ),
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

    user: Mapped["User"] = relationship(
        back_populates="doctor",
    )

    address: Mapped["Address | None"] = relationship(
        back_populates="doctors",
    )

    specialties: Mapped[list["DoctorSpecialty"]] = relationship(
        back_populates="doctor",
        cascade="all, delete-orphan",
    )


class Specialty(Base):
    __tablename__ = "specialties"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        unique=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    doctors: Mapped[list["DoctorSpecialty"]] = relationship(
        back_populates="specialty",
        cascade="all, delete-orphan",
    )


class DoctorSpecialty(Base):
    __tablename__ = "doctor_specialties"

    doctor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "doctors.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    )

    specialty_id: Mapped[int] = mapped_column(
        ForeignKey(
            "specialties.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
        index=True,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    doctor: Mapped["Doctor"] = relationship(
        back_populates="specialties",
    )

    specialty: Mapped["Specialty"] = relationship(
        back_populates="doctors",
    )