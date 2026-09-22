import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import (
    JSONB,
    UUID as PG_UUID,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.core.database import Base


class MedicalImageAnalysis(Base):
    __tablename__ = (
        "medical_image_analyses"
    )

    id: Mapped[uuid.UUID] = (
        mapped_column(
            PG_UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
        )
    )

    patient_id: Mapped[uuid.UUID] = (
        mapped_column(
            PG_UUID(as_uuid=True),
            ForeignKey(
                "patients.id",
                ondelete="CASCADE",
            ),
            nullable=False,
            index=True,
        )
    )

    original_filename: Mapped[
        str
    ] = mapped_column(
        String(255),
        nullable=False,
    )

    mime_type: Mapped[
        str
    ] = mapped_column(
        String(80),
        nullable=False,
    )

    file_size_bytes: Mapped[
        int
    ] = mapped_column(
        Integer,
        nullable=False,
    )

    predicted_class: Mapped[
        str
    ] = mapped_column(
        String(40),
        nullable=False,
    )

    display_label: Mapped[
        str
    ] = mapped_column(
        String(80),
        nullable=False,
    )

    model_score: Mapped[
        float
    ] = mapped_column(
        Numeric(
            precision=8,
            scale=7,
        ),
        nullable=False,
    )

    class_scores: Mapped[
        dict
    ] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    suggested_specialty: Mapped[
        str
    ] = mapped_column(
        String(120),
        nullable=False,
    )

    model_name: Mapped[
        str
    ] = mapped_column(
        String(120),
        nullable=False,
    )

    model_version: Mapped[
        str
    ] = mapped_column(
        String(80),
        nullable=False,
    )

    gradcam_target_layer: Mapped[
        str
    ] = mapped_column(
        String(120),
        nullable=False,
    )

    disclaimer_accepted: Mapped[
        bool
    ] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    created_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )
