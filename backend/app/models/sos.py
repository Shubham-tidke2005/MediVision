import uuid

from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    func,
    text,
)

from sqlalchemy.dialects.postgresql import (
    JSONB,
    UUID,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.core.database import Base


class SOSEvent(Base):
    __tablename__ = "sos_events"

    id: Mapped[
        uuid.UUID
    ] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    patient_id: Mapped[
        uuid.UUID
    ] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "patients.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="TRIGGERED",
        server_default="TRIGGERED",
    )

    share_location: Mapped[
        bool
    ] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    latitude: Mapped[
        float | None
    ] = mapped_column(
        Numeric(
            9,
            6,
        ),
        nullable=True,
    )

    longitude: Mapped[
        float | None
    ] = mapped_column(
        Numeric(
            9,
            6,
        ),
        nullable=True,
    )

    location_accuracy_m: Mapped[
        float | None
    ] = mapped_column(
        Numeric(
            10,
            2,
        ),
        nullable=True,
    )

    emergency_contact_name: Mapped[
        str | None
    ] = mapped_column(
        String(120),
        nullable=True,
    )

    emergency_contact_phone: Mapped[
        str | None
    ] = mapped_column(
        String(32),
        nullable=True,
    )

    message: Mapped[
        str | None
    ] = mapped_column(
        Text,
        nullable=True,
    )

    triggered_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        server_default=func.now(),
    )

    acknowledged_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=True,
    )

    resolved_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=True,
    )

    cancelled_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=True,
    )

    created_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        CheckConstraint(
            (
                "status IN "
                "('TRIGGERED', "
                "'ACKNOWLEDGED', "
                "'RESOLVED', "
                "'CANCELLED')"
            ),
            name=(
                "ck_sos_events_status"
            ),
        ),

        Index(
            "ix_sos_events_patient_status",
            "patient_id",
            "status",
        ),

        Index(
            "ix_sos_events_triggered_at",
            "triggered_at",
        ),

        # Only one active SOS per patient.
        Index(
            "uq_sos_events_patient_active",
            "patient_id",
            unique=True,
            postgresql_where=text(
                "status IN "
                "('TRIGGERED', "
                "'ACKNOWLEDGED')"
            ),
        ),
    )


class SOSEventAction(Base):
    __tablename__ = (
        "sos_event_actions"
    )

    id: Mapped[
        uuid.UUID
    ] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    sos_event_id: Mapped[
        uuid.UUID
    ] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "sos_events.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    action_type: Mapped[
        str
    ] = mapped_column(
        String(50),
        nullable=False,
    )

    description: Mapped[
        str | None
    ] = mapped_column(
        Text,
        nullable=True,
    )

    metadata_json: Mapped[
        dict
    ] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text(
            "'{}'::jsonb"
        ),
    )

    created_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        Index(
            "ix_sos_event_actions_event_created",
            "sos_event_id",
            "created_at",
        ),
    )