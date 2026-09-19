from sqlalchemy import (
    select,
)

from sqlalchemy.orm import Session

from fastapi import (
    HTTPException,
    status,
)

from app.ai.provider import (
    generate_structured_response,
)

from app.ai.prompts import (
    SYMPTOM_ASSESSMENT_TASK_PROMPT,
)

from app.ai.safety import (
    SYMPTOM_ASSESSMENT_SAFETY_MESSAGE,
    build_medical_system_prompt,
)

from app.ai.schemas import (
    SymptomAssessmentAIResponse,
)

from app.core.config import (
    settings,
)

from app.models.symptom import (
    Symptom,
)

from app.repositories.ai_symptom_assessment import (
    create_ai_symptom_assessment_record,
)

from app.repositories.discovery import (
    get_active_specialty_by_code,
)

from app.schemas.symptom_assessment import (
    ExplainedPossibleCondition,
    SymptomAssessmentCreate,
    SymptomAssessmentResponse,
)


# =========================================================
# LOAD + VALIDATE SYMPTOMS
# =========================================================


def get_reported_symptoms(
    db: Session,
    symptom_ids: list[int],
) -> list[Symptom]:
    unique_ids = list(
        dict.fromkeys(
            symptom_ids
        )
    )


    if not unique_ids:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "At least one symptom is required."
            ),
        )


    if any(
        symptom_id <= 0
        for symptom_id
        in unique_ids
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Symptom IDs must be positive integers."
            ),
        )


    symptoms = list(
        db.scalars(
            select(
                Symptom
            )
            .where(
                Symptom.id.in_(
                    unique_ids
                ),

                Symptom.is_active.is_(
                    True
                ),
            )
        ).all()
    )


    symptoms_by_id = {
        symptom.id:
            symptom

        for symptom
        in symptoms
    }


    missing_ids = [
        symptom_id

        for symptom_id
        in unique_ids

        if symptom_id
        not in symptoms_by_id
    ]


    if missing_ids:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail={
                "message":
                    (
                        "One or more symptom IDs "
                        "are invalid or inactive."
                    ),

                "invalid_symptom_ids":
                    missing_ids,
            },
        )


    return [
        symptoms_by_id[
            symptom_id
        ]

        for symptom_id
        in unique_ids
    ]


# =========================================================
# AI USER PROMPT
# =========================================================


def build_symptom_assessment_user_prompt(
    symptoms: list[Symptom],
    duration: str,
) -> str:
    symptom_codes = [
        symptom.code

        for symptom
        in symptoms
    ]


    formatted_codes = "\n".join(
        f"- {code}"

        for code
        in symptom_codes
    )


    return f"""
Reported standardized symptom codes:

{formatted_codes}

Reported duration:

{duration}

Use only the reported information above.

For relevant_symptom_codes, return only symptom codes
that appear in the reported symptom-code list.

Do not invent symptoms that the Patient did not report.
""".strip()


# =========================================================
# PHASE 35
# VALIDATE EXPLANATION FACTORS
# =========================================================


def build_explained_conditions(
    *,
    ai_result: SymptomAssessmentAIResponse,
    symptoms: list[Symptom],
) -> list[ExplainedPossibleCondition]:

    reported_symptoms_by_code = {
        symptom.code.strip().upper():
            symptom.name

        for symptom
        in symptoms
    }


    explained_conditions = []


    for condition in (
        ai_result.possible_conditions
    ):
        factor_names = []

        seen_codes = set()


        for code in (
            condition
            .relevant_symptom_codes
        ):
            normalized_code = (
                code
                .strip()
                .upper()
            )


            if (
                normalized_code
                in seen_codes
            ):
                continue


            # AI cannot claim a symptom was reported
            # when it was not selected by the Patient.
            if (
                normalized_code
                not in reported_symptoms_by_code
            ):
                continue


            seen_codes.add(
                normalized_code
            )


            factor_names.append(
                reported_symptoms_by_code[
                    normalized_code
                ]
            )


        explained_conditions.append(
            ExplainedPossibleCondition(
                name=(
                    condition.name
                ),

                reason=(
                    condition.reason
                ),

                relevant_reported_factors=(
                    factor_names
                ),
            )
        )


    return explained_conditions


# =========================================================
# PHASE 36
# DATABASE SNAPSHOTS
# =========================================================


def build_symptom_snapshot(
    symptoms: list[Symptom],
) -> list[dict]:
    """
    Store IDs + stable codes + readable names.

    This allows historical records to remain readable
    even if catalog labels change in the future.
    """

    return [
        {
            "id":
                symptom.id,

            "code":
                symptom.code,

            "name":
                symptom.name,
        }

        for symptom
        in symptoms
    ]


def build_condition_snapshot(
    conditions: list[
        ExplainedPossibleCondition
    ],
) -> list[dict]:
    return [
        condition.model_dump()

        for condition
        in conditions
    ]


# =========================================================
# MAIN ASSESSMENT
# =========================================================


def create_symptom_assessment(
    db: Session,
    payload: SymptomAssessmentCreate,
    patient,
) -> SymptomAssessmentResponse:
    """
    Phase 33:
        AI symptom assessment

    Phase 34:
        recommended specialty can feed Doctor discovery

    Phase 35:
        understandable explanation

    Phase 36:
        persist every successful assessment

    Important:
    AI assessment != Doctor diagnosis.
    """


    # =====================================================
    # 1. VALIDATE SYMPTOMS
    # =====================================================

    symptoms = get_reported_symptoms(
        db,
        payload.symptom_ids,
    )


    duration = (
        payload.duration
        .strip()
    )


    symptom_codes = [
        symptom.code

        for symptom
        in symptoms
    ]


    # =====================================================
    # 2. PROMPTS
    # =====================================================

    system_prompt = (
        build_medical_system_prompt(
            SYMPTOM_ASSESSMENT_TASK_PROMPT
        )
    )


    user_prompt = (
        build_symptom_assessment_user_prompt(
            symptoms,
            duration,
        )
    )


    # =====================================================
    # 3. OPENAI STRUCTURED RESPONSE
    # =====================================================

    ai_result = (
        generate_structured_response(
            system_prompt=(
                system_prompt
            ),

            user_prompt=(
                user_prompt
            ),

            response_model=(
                SymptomAssessmentAIResponse
            ),
        )
    )


    # =====================================================
    # 4. PHASE 35 EXPLANATION VALIDATION
    # =====================================================

    explained_conditions = (
        build_explained_conditions(
            ai_result=(
                ai_result
            ),

            symptoms=(
                symptoms
            ),
        )
    )


    # =====================================================
    # 5. VALIDATE RECOMMENDED SPECIALTY AGAINST DATABASE
    #
    # AI returns only code.
    # PostgreSQL is source of truth.
    # =====================================================

    specialty = (
        get_active_specialty_by_code(
            db,
            (
                ai_result
                .recommended_specialty
            ),
        )
    )


    if specialty is None:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "The AI returned a specialty "
                "that is not available in MediVision."
            ),
        )


    # =====================================================
    # 6. CREATE HISTORICAL SNAPSHOTS
    # =====================================================

    symptoms_json = (
        build_symptom_snapshot(
            symptoms
        )
    )


    possible_conditions_json = (
        build_condition_snapshot(
            explained_conditions
        )
    )


    # =====================================================
    # 7. PROVIDER METADATA
    # =====================================================

    provider_name = (
        "openai"
    )


    # Using getattr prevents Phase 36 from crashing
    # if your config property uses another name.
    model_name = str(
        getattr(
            settings,
            "openai_model",
            "configured-openai-model",
        )
    )


    # =====================================================
    # 8. SAVE
    #
    # Only successful + validated AI assessments reach here.
    # =====================================================

    try:
        assessment = (
            create_ai_symptom_assessment_record(
                db,

                patient_id=(
                    patient.id
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
                    specialty.id
                ),

                recommended_specialty_code=(
                    specialty.code
                ),

                specialty_reason=(
                    ai_result
                    .specialty_reason
                ),

                urgency=(
                    ai_result.urgency
                ),

                red_flags_json=(
                    ai_result
                    .red_flags
                ),

                safety_message=(
                    SYMPTOM_ASSESSMENT_SAFETY_MESSAGE
                ),

                provider=(
                    provider_name
                ),

                model_name=(
                    model_name
                ),
            )
        )


        db.commit()


        db.refresh(
            assessment
        )


    except Exception:
        db.rollback()

        raise


    # =====================================================
    # 9. RESPONSE
    # =====================================================

    return (
        SymptomAssessmentResponse(
            assessment_id=(
                assessment.id
            ),

            created_at=(
                assessment.created_at
            ),

            possible_conditions=(
                explained_conditions
            ),

            recommended_specialty=(
                ai_result
                .recommended_specialty
            ),

            specialty_reason=(
                ai_result
                .specialty_reason
            ),

            urgency=(
                ai_result.urgency
            ),

            red_flags=(
                ai_result.red_flags
            ),

            safety_message=(
                SYMPTOM_ASSESSMENT_SAFETY_MESSAGE
            ),

            symptom_codes=(
                symptom_codes
            ),
        )
    )