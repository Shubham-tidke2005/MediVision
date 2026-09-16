import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile,
    status,
)

from fastapi.responses import (
    FileResponse,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_patient,
)

from app.core.database import (
    get_db,
)

from app.models.enums import (
    DocumentType,
)

from app.models.patient import (
    Patient,
)

from app.schemas.medical_document import (
    MedicalDocumentResponse,
)

from app.services.medical_document import (
    get_patient_document_download,
    get_patient_documents,
    upload_patient_document,
)


router = APIRouter(
    prefix="/patients/me/documents",
    tags=["Medical Documents"],
)


# =========================================================
# UPLOAD
# =========================================================


@router.post(
    "",
    response_model=MedicalDocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    document_type: DocumentType = Form(
        ...
    ),

    file: UploadFile = File(
        ...
    ),

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return await upload_patient_document(
        db,
        patient,
        document_type,
        file,
    )


# =========================================================
# LIST
# =========================================================


@router.get(
    "",
    response_model=list[
        MedicalDocumentResponse
    ],
)
def list_documents(
    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_patient_documents(
        db,
        patient,
    )


# =========================================================
# DOWNLOAD
# =========================================================


@router.get(
    "/{document_id}/download",
)
def download_document(
    document_id: uuid.UUID,

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    (
        document,
        path,
    ) = get_patient_document_download(
        db,
        patient,
        document_id,
    )


    return FileResponse(
        path=str(
            path
        ),

        media_type=(
            document.mime_type
        ),

        filename=(
            document.original_filename
        ),
    )