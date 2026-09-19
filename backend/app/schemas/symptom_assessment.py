import uuid
from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    Field,
    field_validator,
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
# URGENCY
# =========================================================


AssessmentUrgency = Literal[
    "ROUTINE",
    "URGENT",
    "EMERGENCY",
]


# =========================================================
# REQUEST
# =========================================================


class SymptomAssessmentCreate(
    BaseModel
):
    symptom_ids: list[int] = Field(
        min_length=1,
        max_length=20,
    )


    duration: str = Field(
        min_length=1,
        max_length=100,
    )


    @field_validator(
        "symptom_ids"
    )
    @classmethod
    def validate_symptom_ids(
        cls,
        value: list[int],
    ) -> list[int]:

        if any(
            symptom_id <= 0
            for symptom_id
            in value
        ):
            raise ValueError(
                "Symptom IDs must be positive integers."
            )


        # Remove duplicates while preserving order.
        return list(
            dict.fromkeys(
                value
            )
        )


    @field_validator(
        "duration"
    )
    @classmethod
    def validate_duration(
        cls,
        value: str,
    ) -> str:

        cleaned = (
            value.strip()
        )


        if not cleaned:
            raise ValueError(
                "Symptom duration is required."
            )


        return cleaned


# =========================================================
# PHASE 35 — EXPLANATION
# =========================================================


class ExplainedPossibleCondition(
    BaseModel
):
    name: str = Field(
        min_length=1,
        max_length=150,
    )


    reason: str = Field(
        min_length=1,
        max_length=500,
    )


    relevant_reported_factors: list[
        str
    ] = Field(
        default_factory=list,
        max_length=20,
    )


# =========================================================
# PHASE 36 — FINAL RESPONSE
# =========================================================


class SymptomAssessmentResponse(
    BaseModel
):
    # ---------------------------------------------
    # Persistence identity
    # ---------------------------------------------

    assessment_id: uuid.UUID

    created_at: datetime


    # ---------------------------------------------
    # Assessment
    # ---------------------------------------------

    possible_conditions: list[
        ExplainedPossibleCondition
    ] = Field(
        min_length=1,
        max_length=5,
    )


    recommended_specialty: (
        RecommendedSpecialty
    )


    specialty_reason: str = Field(
        min_length=1,
        max_length=500,
    )


    urgency: AssessmentUrgency


    red_flags: list[
        str
    ] = Field(
        default_factory=list,
        max_length=10,
    )


    safety_message: str = Field(
        min_length=1,
        max_length=1000,
    )


    symptom_codes: list[
        str
    ] = Field(
        default_factory=list,
    )