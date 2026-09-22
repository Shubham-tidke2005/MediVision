from decimal import Decimal

from sqlalchemy import (
    func,
    select,
)
from sqlalchemy.orm import Session

from app.models.medical_image_analysis import (
    MedicalImageAnalysis,
)


def create_medical_image_analysis(
    db: Session,
    *,
    patient_id,
    original_filename: str,
    mime_type: str,
    file_size_bytes: int,
    predicted_class: str,
    display_label: str,
    model_score: float,
    class_scores: dict,
    suggested_specialty: str,
    model_name: str,
    model_version: str,
    gradcam_target_layer: str,
    disclaimer_accepted: bool,
) -> MedicalImageAnalysis:
    record = MedicalImageAnalysis(
        patient_id=patient_id,
        original_filename=(
            original_filename
        ),
        mime_type=mime_type,
        file_size_bytes=(
            file_size_bytes
        ),
        predicted_class=(
            predicted_class
        ),
        display_label=display_label,
        model_score=Decimal(
            str(model_score)
        ),
        class_scores=class_scores,
        suggested_specialty=(
            suggested_specialty
        ),
        model_name=model_name,
        model_version=(
            model_version
        ),
        gradcam_target_layer=(
            gradcam_target_layer
        ),
        disclaimer_accepted=(
            disclaimer_accepted
        ),
    )

    db.add(
        record
    )

    db.flush()

    db.refresh(
        record
    )

    return record


def list_medical_image_analyses(
    db: Session,
    *,
    patient_id,
    limit: int = 20,
    offset: int = 0,
):
    statement = (
        select(
            MedicalImageAnalysis
        )
        .where(
            MedicalImageAnalysis
            .patient_id
            == patient_id
        )
        .order_by(
            MedicalImageAnalysis
            .created_at
            .desc()
        )
        .limit(
            limit
        )
        .offset(
            offset
        )
    )

    return list(
        db.scalars(
            statement
        ).all()
    )


def count_medical_image_analyses(
    db: Session,
    *,
    patient_id,
) -> int:
    statement = (
        select(
            func.count()
        )
        .select_from(
            MedicalImageAnalysis
        )
        .where(
            MedicalImageAnalysis
            .patient_id
            == patient_id
        )
    )

    return int(
        db.scalar(
            statement
        )
        or 0
    )
