import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
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


class AISymptomAssessment(Base):
    """
    Stores a successful AI-assisted symptom assessment.

    This record represents clinical decision-support output,
    not a confirmed medical diagnosis.
    """

    __tablename__ = "ai_symptom_assessments"


    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


    # =====================================================
    # PATIENT
    #
    # IMPORTANT:
    # Actual MediVision table name is "patients".
    # =====================================================

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "patients.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )


    # =====================================================
    # REPORTED SYMPTOMS SNAPSHOT
    #
    # Example:
    #
    # [
    #   {
    #       "id": 3,
    #       "code": "HEADACHE",
    #       "name": "Headache"
    #   }
    # ]
    # =====================================================

    symptoms_json: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
    )


    # =====================================================
    # DURATION
    # =====================================================

    duration: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )


    # =====================================================
    # POSSIBLE CONDITIONS SNAPSHOT
    #
    # Example:
    #
    # [
    #   {
    #       "name": "Migraine",
    #       "reason": "...",
    #       "relevant_reported_factors": [
    #           "Headache",
    #           "Nausea"
    #       ]
    #   }
    # ]
    # =====================================================

    possible_conditions_json: Mapped[
        list
    ] = mapped_column(
        JSONB,
        nullable=False,
    )


    # =====================================================
    # RECOMMENDED SPECIALTY
    # =====================================================

    recommended_specialty_id: Mapped[
        int
    ] = mapped_column(
        ForeignKey(
            "specialties.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )


    # Store a snapshot too so old history remains readable.

    recommended_specialty_code: Mapped[
        str
    ] = mapped_column(
        String(100),
        nullable=False,
    )


    # =====================================================
    # PHASE 35 EXPLANATION
    # =====================================================

    specialty_reason: Mapped[
        str
    ] = mapped_column(
        Text,
        nullable=False,
    )


    # =====================================================
    # URGENCY
    # =====================================================

    urgency: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )


    # =====================================================
    # RED FLAGS
    # =====================================================

    red_flags_json: Mapped[
        list
    ] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )


    # =====================================================
    # SAFETY MESSAGE
    # =====================================================

    safety_message: Mapped[
        str
    ] = mapped_column(
        Text,
        nullable=False,
    )


    # =====================================================
    # AI PROVIDER INFORMATION
    # =====================================================

    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )


    model_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )


    # =====================================================
    # CREATED AT
    # =====================================================

    created_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


    # =====================================================
    # INDEXES
    # =====================================================

    __table_args__ = (
        Index(
            "ix_ai_symptom_assessments_patient_id",
            "patient_id",
        ),

        Index(
            "ix_ai_symptom_assessments_created_at",
            "created_at",
        ),

        Index(
            "ix_ai_symptom_assessments_specialty_id",
            "recommended_specialty_id",
        ),
    )