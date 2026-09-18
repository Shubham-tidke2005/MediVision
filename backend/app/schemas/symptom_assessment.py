from pydantic import (
    BaseModel,
    Field,
    field_validator,
)

from app.ai.schemas import (
    SymptomAssessmentAIResponse,
)


class SymptomAssessmentCreate(
    BaseModel
):
    symptom_ids: list[int] = Field(
        min_length=1,
        max_length=15,
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
        value,
    ):
        if any(
            symptom_id <= 0
            for symptom_id in value
        ):
            raise ValueError(
                "Symptom IDs must be positive."
            )

        return value

    @field_validator(
        "duration"
    )
    @classmethod
    def clean_duration(
        cls,
        value: str,
    ):
        value = value.strip()

        if not value:
            raise ValueError(
                "Duration is required."
            )

        return value


class SymptomAssessmentResponse(
    SymptomAssessmentAIResponse
):
    symptom_codes: list[str]