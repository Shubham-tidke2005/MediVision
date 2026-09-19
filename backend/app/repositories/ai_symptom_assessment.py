import uuid

from sqlalchemy import (
    select,
)

from sqlalchemy.orm import Session

from app.models.ai_symptom_assessment import (
    AISymptomAssessment,
)


# =========================================================
# CREATE
# =========================================================


def create_ai_symptom_assessment_record(
    db: Session,
    *,
    patient_id: uuid.UUID,
    symptoms_json: list,
    duration: str,
    possible_conditions_json: list,
    recommended_specialty_id: int,
    recommended_specialty_code: str,
    specialty_reason: str,
    urgency: str,
    red_flags_json: list,
    safety_message: str,
    provider: str,
    model_name: str,
) -> AISymptomAssessment:
    """
    Add a successful AI symptom assessment to the current
    database transaction.

    Important:
    This function flushes but does not commit.

    The service controls the transaction.
    """

    assessment = (
        AISymptomAssessment(
            patient_id=(
                patient_id
            ),

            symptoms_json=(
                symptoms_json
            ),

            duration=(
                duration
            ),

            possible_conditions_json=(
                possible_conditions_json
            ),

            recommended_specialty_id=(
                recommended_specialty_id
            ),

            recommended_specialty_code=(
                recommended_specialty_code
            ),

            specialty_reason=(
                specialty_reason
            ),

            urgency=(
                urgency
            ),

            red_flags_json=(
                red_flags_json
            ),

            safety_message=(
                safety_message
            ),

            provider=(
                provider
            ),

            model_name=(
                model_name
            ),
        )
    )


    db.add(
        assessment
    )

    db.flush()

    return assessment


# =========================================================
# PATIENT HISTORY QUERY
# =========================================================


def get_ai_assessments_for_patient(
    db: Session,
    patient_id: uuid.UUID,
):
    """
    Used later by the Phase 26 medical-history aggregator.
    """

    return list(
        db.scalars(
            select(
                AISymptomAssessment
            )
            .where(
                AISymptomAssessment.patient_id
                == patient_id
            )
            .order_by(
                AISymptomAssessment.created_at.desc()
            )
        ).all()
    )


# =========================================================
# GET ONE PATIENT ASSESSMENT
# =========================================================


def get_patient_ai_assessment(
    db: Session,
    *,
    patient_id: uuid.UUID,
    assessment_id: uuid.UUID,
):
    return db.scalar(
        select(
            AISymptomAssessment
        )
        .where(
            AISymptomAssessment.id
            == assessment_id,

            AISymptomAssessment.patient_id
            == patient_id,
        )
    )