import uuid

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
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


class HealthArticle(Base):
    __tablename__ = "health_articles"


    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


    category: Mapped[str] = mapped_column(
        String(60),
        nullable=False,
    )


    slug: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
        unique=True,
    )


    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )


    summary: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )


    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )


    key_points_json: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        server_default=text(
            "'[]'::jsonb"
        ),
    )


    professional_advice_note: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )


    source_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )


    source_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )


    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="PUBLISHED",
        server_default="PUBLISHED",
    )


    is_featured: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text(
            "false"
        ),
    )


    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
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
        Index(
            "ix_health_articles_category",
            "category",
        ),

        Index(
            "ix_health_articles_status",
            "status",
        ),

        Index(
            "ix_health_articles_published_at",
            "published_at",
        ),
    )