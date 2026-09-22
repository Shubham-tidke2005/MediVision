import uuid

from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
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


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[
        uuid.UUID
    ] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[
        uuid.UUID
    ] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    notification_type: Mapped[
        str
    ] = mapped_column(
        String(50),
        nullable=False,
    )

    title: Mapped[
        str
    ] = mapped_column(
        String(160),
        nullable=False,
    )

    message: Mapped[
        str
    ] = mapped_column(
        Text,
        nullable=False,
    )

    related_entity_type: Mapped[
        str | None
    ] = mapped_column(
        String(50),
        nullable=True,
    )

    related_entity_id: Mapped[
        uuid.UUID | None
    ] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )

    data_json: Mapped[
        dict
    ] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text(
            "'{}'::jsonb"
        ),
    )

    available_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        server_default=func.now(),
    )

    read_at: Mapped[
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
                "notification_type IN ("
                "'APPOINTMENT_APPROVED', "
                "'APPOINTMENT_REJECTED', "
                "'APPOINTMENT_REMINDER', "
                "'MEDICINE_REMINDER', "
                "'NEW_PRESCRIPTION', "
                "'MEDICAL_ACCESS_SHARED'"
                ")"
            ),
            name=(
                "ck_notifications_type"
            ),
        ),

        Index(
            "ix_notifications_user_available",
            "user_id",
            "available_at",
        ),

        Index(
            "ix_notifications_user_created",
            "user_id",
            "created_at",
        ),

        Index(
            "ix_notifications_user_unread",
            "user_id",
            "created_at",
            postgresql_where=text(
                "read_at IS NULL"
            ),
        ),
    )