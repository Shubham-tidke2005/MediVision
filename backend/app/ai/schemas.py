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


# =========================================================
# SPECIALTY
# =========================================================


RecommendedSpecialty = Literal[
    "GENERAL_MEDICINE",
    "NEUROLOGY",
    "CARDIOLOGY",
    "PULMONOLOGY",
    "GASTROENTEROLOGY",
    "DERMATOLOGY",
    "ENT",
    "ORTHOPEDICS",
    "OPHTHALMOLOGY",
    "GYNECOLOGY",
    "UROLOGY",
    "PSYCHIATRY",
    "EMERGENCY_MEDICINE",
]


# =========================================================
# URGENCY
# =========================================================


AssessmentUrgency = Literal[
    "ROUTINE",
    "URGENT",
    "EMERGENCY",
]


# =========================================================
# AI SYMPTOM ASSESSMENT
# =========================================================


class SymptomAssessmentAIResponse(
    BaseModel
):
    possible_conditions: list[
        PossibleCondition
    ] = Field(
        min_length=1,
        max_length=5,
    )

    recommended_specialty: (
        RecommendedSpecialty
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