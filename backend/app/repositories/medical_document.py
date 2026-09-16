import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.medical_document import MedicalDocument


def list_patient_documents(
    db: Session,
    patient_id: uuid.UUID,
):
    return list(
        db.scalars(
            select(
                MedicalDocument
            )
            .where(
                MedicalDocument.patient_id
                == patient_id
            )
            .order_by(
                MedicalDocument.created_at.desc()
            )
        ).all()
    )


def get_patient_document(
    db: Session,
    patient_id: uuid.UUID,
    document_id: uuid.UUID,
):
    return db.scalar(
        select(
            MedicalDocument
        )
        .where(
            MedicalDocument.id
            == document_id,

            MedicalDocument.patient_id
            == patient_id,
        )
    )