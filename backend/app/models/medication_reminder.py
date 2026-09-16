import uuid

from datetime import (
    date,
    datetime,
    time,
)

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
    UniqueConstraint,
    func,
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.core.database import Base

from app.models.enums import (
    AdherenceStatus,
    MedicationSource,
    MedicationStatus,
)


# =========================================================
# PATIENT MEDICATION
# =========================================================


class PatientMedication(Base):
    __tablename__ = "patient_medications"

    __table_args__ = (
        CheckConstraint(
            "end_date IS NULL OR end_date >= start_date",
            name="ck_patient_medication_dates",
        ),

        UniqueConstraint(
            "prescription_item_id",
            name="uq_patient_medication_prescription_item",
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
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )


    # Optional global medicine catalog reference.
    medicine_id: Mapped[
        uuid.UUID | None
    ] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "medicines.id",
            ondelete="RESTRICT",
        ),
        nullable=True,
        index=True,
    )


    # Snapshot / manual medication name.
    medicine_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )


    # Present when generated from prescription.
    prescription_item_id: Mapped[
        uuid.UUID | None
    ] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "prescription_items.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )


    source: Mapped[
        MedicationSource
    ] = mapped_column(
        SQLEnum(
            MedicationSource,
            name="medication_source",
        ),
        nullable=False,
        index=True,
    )


    status: Mapped[
        MedicationStatus
    ] = mapped_column(
        SQLEnum(
            MedicationStatus,
            name="medication_status",
        ),
        nullable=False,
        default=MedicationStatus.ACTIVE,
        server_default="ACTIVE",
        index=True,
    )


    strength: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )


    dose: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )


    route: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )


    instructions: Mapped[
        str | None
    ] = mapped_column(
        Text,
        nullable=True,
    )


    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
    )


    end_date: Mapped[
        date | None
    ] = mapped_column(
        Date,
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


# =========================================================
# DAILY MEDICATION SCHEDULE
# =========================================================


class MedicationSchedule(Base):
    __tablename__ = "medication_schedules"

    __table_args__ = (
        UniqueConstraint(
            "patient_medication_id",
            "time_of_day",
            name="uq_medication_schedule_time",
        ),
    )


    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


    patient_medication_id: Mapped[
        uuid.UUID
    ] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "patient_medications.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )


    time_of_day: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )


    timezone: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="Asia/Kolkata",
        server_default="Asia/Kolkata",
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
# ADHERENCE LOG
# =========================================================


class MedicationAdherenceLog(Base):
    __tablename__ = "medication_adherence_logs"

    __table_args__ = (
        UniqueConstraint(
            "medication_schedule_id",
            "scheduled_for",
            name="uq_medication_adherence_occurrence",
        ),
    )


    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


    patient_medication_id: Mapped[
        uuid.UUID
    ] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "patient_medications.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )


    medication_schedule_id: Mapped[
        uuid.UUID
    ] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "medication_schedules.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )


    scheduled_for: Mapped[
        datetime
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )


    status: Mapped[
        AdherenceStatus
    ] = mapped_column(
        SQLEnum(
            AdherenceStatus,
            name="adherence_status",
        ),
        nullable=False,
        index=True,
    )


    taken_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )


    notes: Mapped[
        str | None
    ] = mapped_column(
        String(500),
        nullable=True,
    )


    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )