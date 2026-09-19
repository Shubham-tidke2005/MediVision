from typing import Literal

from pydantic import (
    BaseModel,
    Field,
)


# =========================================================
# PROVIDER CHECK
# =========================================================


class AIProviderCheckResponse(BaseModel):
    status: Literal["ok"]

    provider: Literal["openai"]

    message: str = Field(
        min_length=1,
        max_length=200,
    )


# =========================================================
# POSSIBLE CONDITION
# =========================================================


class PossibleCondition(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=150,
    )

    reason: str = Field(
        min_length=1,
        max_length=500,
    )

    # Phase 35:
    # Only canonical symptom codes actually reported
    # by the Patient should be returned here.
    #
    # Example:
    #
    # [
    #     "HEADACHE",
    #     "NAUSEA"
    # ]
    relevant_symptom_codes: list[str] = Field(
        min_length=1,
        max_length=10,
    )


# =========================================================
# SPECIALTY
# =========================================================


RecommendedSpecialty = Literal[
    "GENERAL_MEDICINE",
    "CARDIOLOGY",
    "NEUROLOGY",
    "DERMATOLOGY",
    "ORTHOPEDICS",
    "PSYCHIATRY",
    "ENT",
    "OPHTHALMOLOGY",
    "PEDIATRICS",
    "GYNECOLOGY",
    "PULMONOLOGY",
    "GASTROENTEROLOGY",
    "UROLOGY",
    "EMERGENCY_MEDICINE",
]


# =========================================================
# URGENCY.
# =========================================================


AssessmentUrgency = Literal[
    "ROUTINE",
    "URGENT",
    "EMERGENCY",
]


# =========================================================
# AI SYMPTOM ASSESSMENT
# =========================================================

class SymptomAssessmentAIResponse(BaseModel):
    possible_conditions: list[
        PossibleCondition
    ] = Field(
        min_length=1,
        max_length=5,
    )

    recommended_specialty: (
        RecommendedSpecialty
    )

    # Phase 35
    specialty_reason: str = Field(
        min_length=1,
        max_length=500,
    )

    urgency: AssessmentUrgency

    red_flags: list[str] = Field(
        default_factory=list,
        max_length=5,
    )

    safety_message: str = Field(
        min_length=1,
        max_length=500,
    )