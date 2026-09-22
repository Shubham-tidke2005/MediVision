import uuid

from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    func,
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


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    action: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    resource_type: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    resource_id: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )

    metadata_json: Mapped[dict] = mapped_column(
        "metadata",
        JSONB,
        nullable=False,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        Index(
            "ix_audit_logs_user_created_at",
            "user_id",
            "created_at",
        ),
        Index(
            "ix_audit_logs_action_created_at",
            "action",
            "created_at",
        ),
        Index(
            "ix_audit_logs_resource",
            "resource_type",
            "resource_id",
        ),
        Index(
            "ix_audit_logs_created_at",
            "created_at",
        ),
    )
