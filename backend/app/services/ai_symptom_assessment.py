import json

from sqlalchemy.orm import Session

from app.ai.prompts import (
    SYMPTOM_ASSESSMENT_TASK_PROMPT,
)

from app.ai.provider import (
    generate_structured_response,
)

from app.ai.safety import (
    SYMPTOM_ASSESSMENT_SAFETY_MESSAGE,
    build_medical_system_prompt,
)

from app.ai.schemas import (
    SymptomAssessmentAIResponse,
)

from app.schemas.symptom_assessment import (
    SymptomAssessmentCreate,
    SymptomAssessmentResponse,
)

from app.services.symptom import (
    validate_symptom_ids,
)


def create_symptom_assessment(
    db: Session,
    payload: SymptomAssessmentCreate,
) -> SymptomAssessmentResponse:

    # -----------------------------------------------------
    # Remove duplicate IDs while preserving order
    # -----------------------------------------------------

    unique_ids = list(
        dict.fromkeys(
            payload.symptom_ids
        )
    )


    # -----------------------------------------------------
    # Validate against PostgreSQL symptom catalog
    # -----------------------------------------------------

    symptoms = validate_symptom_ids(
        db,
        unique_ids,
    )


    # -----------------------------------------------------
    # Restore frontend-selected order
    # -----------------------------------------------------

    symptoms_by_id = {
        symptom.id: symptom
        for symptom in symptoms
    }


    ordered_symptoms = [
        symptoms_by_id[
            symptom_id
        ]
        for symptom_id in unique_ids
    ]


    symptom_codes = [
        symptom.code
        for symptom in ordered_symptoms
    ]


    # -----------------------------------------------------
    # Minimal standardized context sent to AI
    # -----------------------------------------------------

    ai_context = {
        "symptoms":
            symptom_codes,

        "duration":
            payload.duration,
    }


    user_prompt = (
        "Assess the following standardized "
        "symptom information:\n\n"
        + json.dumps(
            ai_context,
            indent=2,
        )
    )


    # -----------------------------------------------------
    # Structured OpenAI response
    # -----------------------------------------------------

    ai_result = (
        generate_structured_response(
            system_prompt=(
                build_medical_system_prompt(
                    SYMPTOM_ASSESSMENT_TASK_PROMPT
                )
            ),
            user_prompt=user_prompt,
            response_model=(
                SymptomAssessmentAIResponse
            ),
        )
    )


    # -----------------------------------------------------
    # Safety disclaimer is controlled by backend.
    #
    # Do not depend on AI-generated wording for this.
    # -----------------------------------------------------

    ai_result = (
        ai_result.model_copy(
            update={
                "safety_message": (
                    SYMPTOM_ASSESSMENT_SAFETY_MESSAGE
                )
            }
        )
    )


    return SymptomAssessmentResponse(
        symptom_codes=(
            symptom_codes
        ),

        possible_conditions=(
            ai_result.possible_conditions
        ),

        recommended_specialty=(
            ai_result.recommended_specialty
        ),

        urgency=(
            ai_result.urgency
        ),

        red_flags=(
            ai_result.red_flags
        ),

        safety_message=(
            ai_result.safety_message
        ),
    )