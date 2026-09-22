import uuid
from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
)


class MedicalImageClassScore(
    BaseModel
):
    class_name: str

    display_label: str

    score: float = Field(
        ge=0.0,
        le=1.0,
    )


class MedicalImageScreeningResponse(
    BaseModel
):
    analysis_id: uuid.UUID

    possible_class: str

    possible_class_label: str

    model_score: float = Field(
        ge=0.0,
        le=1.0,
    )

    class_scores: list[
        MedicalImageClassScore
    ]

    suggested_specialty: str

    gradcam_overlay_data_url: str

    heatmap_data_url: str

    model_name: str

    model_version: str

    gradcam_target_layer: str

    safety_message: str

    model_score_notice: str

    gradcam_notice: str

    created_at: datetime


class MedicalImageAnalysisHistoryItem(
    BaseModel
):
    id: uuid.UUID

    original_filename: str

    mime_type: str

    file_size_bytes: int

    predicted_class: str

    display_label: str

    model_score: float

    class_scores: dict[
        str,
        float,
    ]

    suggested_specialty: str

    model_name: str

    model_version: str

    gradcam_target_layer: str

    created_at: datetime


class MedicalImageAnalysisHistoryResponse(
    BaseModel
):
    patient_id: uuid.UUID

    total: int

    items: list[
        MedicalImageAnalysisHistoryItem
    ]
