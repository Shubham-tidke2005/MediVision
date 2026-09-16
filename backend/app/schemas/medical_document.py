import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.enums import DocumentType


class MedicalDocumentResponse(BaseModel):
    id: uuid.UUID

    document_type: DocumentType

    filename: str

    mime_type: str

    size_bytes: int

    created_at: datetime