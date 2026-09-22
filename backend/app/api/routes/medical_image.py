from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_patient,
    get_current_user,
)

from app.core.database import (
    get_db,
)

from app.repositories.medical_image import (
    count_medical_image_analyses,
    list_medical_image_analyses,
)

from app.schemas.medical_image import (
    MedicalImageAnalysisHistoryItem,
    MedicalImageAnalysisHistoryResponse,
    MedicalImageClassScore,
    MedicalImageScreeningResponse,
)

from app.services.medical_image import (
    CLASS_NAMES,
    DISPLAY_NAMES,
    GRADCAM_NOTICE,
    GRADCAM_TARGET_LAYER,
    MAX_FILE_BYTES,
    MODEL_NAME,
    MODEL_SCORE_NOTICE,
    MODEL_VERSION,
    SAFETY_MESSAGE,
    MedicalImageModelError,
    MedicalImageValidationError,
    create_screening_analysis,
)


router = APIRouter(
    prefix="/api/v1/medical-image",
    tags=[
        "Medical Image AI",
    ],
)


@router.post(
    "/screen",
    response_model=(
        MedicalImageScreeningResponse
    ),
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def screen_medical_image(
    image: UploadFile = File(
        ...
    ),
    disclaimer_accepted: bool = Form(
        ...
    ),
    db: Session = Depends(
        get_db
    ),
    current_user=Depends(
        get_current_user
    ),
    patient=Depends(
        get_current_patient
    ),
):
    try:
        file_bytes = (
            image.file.read(
                MAX_FILE_BYTES
                + 1
            )
        )

        (
            analysis,
            inference,
        ) = create_screening_analysis(
            db,
            patient=patient,
            current_user=(
                current_user
            ),
            filename=(
                image.filename
                or "medical-image"
            ),
            mime_type=(
                image.content_type
                or ""
            ),
            file_bytes=(
                file_bytes
            ),
            disclaimer_accepted=(
                disclaimer_accepted
            ),
        )

    except MedicalImageValidationError as exc:
        db.rollback()

        raise HTTPException(
            status_code=(
                status
                .HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=str(
                exc
            ),
        ) from exc

    except MedicalImageModelError as exc:
        db.rollback()

        raise HTTPException(
            status_code=(
                status
                .HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=str(
                exc
            ),
        ) from exc

    finally:
        image.file.close()

    return MedicalImageScreeningResponse(
        analysis_id=(
            analysis.id
        ),
        possible_class=(
            inference
            .predicted_class
        ),
        possible_class_label=(
            inference
            .display_label
        ),
        model_score=(
            inference
            .model_score
        ),
        class_scores=[
            MedicalImageClassScore(
                class_name=(
                    class_name
                ),
                display_label=(
                    DISPLAY_NAMES[
                        class_name
                    ]
                ),
                score=(
                    inference
                    .class_scores[
                        class_name
                    ]
                ),
            )

            for class_name
            in CLASS_NAMES
        ],
        suggested_specialty=(
            inference
            .suggested_specialty
        ),
        gradcam_overlay_data_url=(
            inference
            .overlay_data_url
        ),
        heatmap_data_url=(
            inference
            .heatmap_data_url
        ),
        model_name=(
            MODEL_NAME
        ),
        model_version=(
            MODEL_VERSION
        ),
        gradcam_target_layer=(
            GRADCAM_TARGET_LAYER
        ),
        safety_message=(
            SAFETY_MESSAGE
        ),
        model_score_notice=(
            MODEL_SCORE_NOTICE
        ),
        gradcam_notice=(
            GRADCAM_NOTICE
        ),
        created_at=(
            analysis.created_at
        ),
    )


@router.get(
    "/analyses",
    response_model=(
        MedicalImageAnalysisHistoryResponse
    ),
)
def my_medical_image_analyses(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
    db: Session = Depends(
        get_db
    ),
    patient=Depends(
        get_current_patient
    ),
):
    records = (
        list_medical_image_analyses(
            db,
            patient_id=(
                patient.id
            ),
            limit=limit,
            offset=offset,
        )
    )

    total = (
        count_medical_image_analyses(
            db,
            patient_id=(
                patient.id
            ),
        )
    )

    return (
        MedicalImageAnalysisHistoryResponse(
            patient_id=(
                patient.id
            ),
            total=total,
            items=[
                MedicalImageAnalysisHistoryItem(
                    id=(
                        record.id
                    ),
                    original_filename=(
                        record
                        .original_filename
                    ),
                    mime_type=(
                        record
                        .mime_type
                    ),
                    file_size_bytes=(
                        record
                        .file_size_bytes
                    ),
                    predicted_class=(
                        record
                        .predicted_class
                    ),
                    display_label=(
                        record
                        .display_label
                    ),
                    model_score=float(
                        record
                        .model_score
                    ),
                    class_scores={
                        key:
                            float(
                                value
                            )

                        for (
                            key,
                            value,
                        ) in (
                            record
                            .class_scores
                            .items()
                        )
                    },
                    suggested_specialty=(
                        record
                        .suggested_specialty
                    ),
                    model_name=(
                        record
                        .model_name
                    ),
                    model_version=(
                        record
                        .model_version
                    ),
                    gradcam_target_layer=(
                        record
                        .gradcam_target_layer
                    ),
                    created_at=(
                        record
                        .created_at
                    ),
                )

                for record
                in records
            ],
        )
    )
