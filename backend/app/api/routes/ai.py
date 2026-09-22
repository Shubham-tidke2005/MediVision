from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import (
    Session,
)

from app.ai.provider import (
    AIProviderConfigurationError,
    AIProviderError,
    AIProviderRateLimitError,
    AIProviderUnavailableError,
    run_provider_check,
)

from app.ai.schemas import (
    AIProviderCheckResponse,
)

from app.api.dependencies import (
    get_current_patient,
    require_admin,
)

from app.core.database import (
    get_db,
)

from app.models.patient import (
    Patient,
)

from app.models.user import (
    User,
)

from app.schemas.symptom_assessment import (
    SymptomAssessmentCreate,
    SymptomAssessmentResponse,
)

from app.services.ai_symptom_assessment import (
    create_symptom_assessment,
)


router = APIRouter(
    prefix="/ai",
    tags=[
        "AI",
    ],
)


# =========================================================
# AI ERROR TRANSLATION
# =========================================================


def raise_ai_http_error(
    exc: AIProviderError,
):
    if isinstance(
        exc,
        AIProviderConfigurationError,
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "AI provider is not configured "
                "correctly."
            ),
        ) from exc

    if isinstance(
        exc,
        AIProviderRateLimitError,
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "AI service is temporarily busy. "
                "Please try again later."
            ),
        ) from exc

    if isinstance(
        exc,
        AIProviderUnavailableError,
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "AI service is temporarily unavailable."
            ),
        ) from exc

    raise HTTPException(
        status_code=(
            status.HTTP_502_BAD_GATEWAY
        ),
        detail=(
            "AI service returned an invalid response."
        ),
    ) from exc


# =========================================================
# PROVIDER CHECK
# =========================================================


@router.get(
    "/provider-check",
    response_model=(
        AIProviderCheckResponse
    ),
)
def provider_check(
    current_user: User = Depends(
        require_admin
    ),
):
    try:
        return run_provider_check()

    except AIProviderError as exc:
        raise_ai_http_error(
            exc
        )


# =========================================================
# SYMPTOM ASSESSMENT
# =========================================================


@router.post(
    "/symptom-assessments",
    response_model=(
        SymptomAssessmentResponse
    ),
)
def assess_symptoms(
    payload: SymptomAssessmentCreate,

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    """
    Create an AI-assisted symptom assessment
    for the currently authenticated Patient.

    The Patient dependency ensures:
    - the user is authenticated
    - the user has the PATIENT role
    - the Patient profile exists

    The whole Patient record is not automatically
    sent to the AI provider.
    """

    try:
        return create_symptom_assessment(
            db=db,
            payload=payload,
            patient=patient,
        )

    except AIProviderError as exc:
        raise_ai_http_error(
            exc
        )