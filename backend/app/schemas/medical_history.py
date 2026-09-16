import uuid
from datetime import datetime

from pydantic import BaseModel


# =========================================================
# DOCTOR
# =========================================================


class HistoryDoctor(BaseModel):
    id: uuid.UUID

    doctor_code: str

    first_name: str
    last_name: str

    qualification: str | None = None


# =========================================================
# DIAGNOSIS
# =========================================================


class HistoryDiagnosis(BaseModel):
    id: uuid.UUID

    name: str

    code: str | None = None

    diagnosis_type: str

    notes: str | None = None


# =========================================================
# PRESCRIPTION ITEM
# =========================================================


class HistoryMedicine(BaseModel):
    id: uuid.UUID

    name: str

    generic_name: str | None = None

    dosage_form: str | None = None


class HistoryPrescriptionItem(BaseModel):
    id: uuid.UUID

    medicine: HistoryMedicine

    strength: str | None = None

    dose: str

    frequency: str

    route: str | None = None

    duration_days: int | None = None

    quantity: str | None = None

    instructions: str | None = None


class HistoryPrescription(BaseModel):
    id: uuid.UUID

    general_instructions: str | None = None

    prescribed_at: datetime

    items: list[
        HistoryPrescriptionItem
    ]


# =========================================================
# CONSULTATION
# =========================================================


class HistoryAppointment(BaseModel):
    id: uuid.UUID

    appointment_type: str

    status: str

    reason: str | None = None

    start_at: datetime

    end_at: datetime | None = None


class HistoryEncounter(BaseModel):
    id: uuid.UUID

    encounter_type: str

    chief_complaint: str | None = None

    subjective_notes: str | None = None

    objective_notes: str | None = None

    assessment_notes: str | None = None

    plan_notes: str | None = None

    started_at: datetime

    ended_at: datetime | None = None


class ConsultationHistoryData(BaseModel):
    appointment: HistoryAppointment

    encounter: HistoryEncounter | None = None

    doctor: HistoryDoctor

    diagnoses: list[
        HistoryDiagnosis
    ] = []

    prescription: HistoryPrescription | None = None


# =========================================================
# DOCUMENT
# =========================================================


class DocumentHistoryData(BaseModel):
    document_id: uuid.UUID

    document_type: str

    title: str | None = None

    description: str | None = None

    created_at: datetime


# =========================================================
# AI ASSESSMENT
# =========================================================


class HistoryAssessmentPrediction(BaseModel):
    condition_name: str

    probability: float | None = None


class AssessmentHistoryData(BaseModel):
    assessment_id: uuid.UUID

    created_at: datetime

    status: str | None = None

    summary: str | None = None

    predictions: list[
        HistoryAssessmentPrediction
    ] = []


# =========================================================
# GENERIC TIMELINE EVENT
# =========================================================


class MedicalHistoryEvent(BaseModel):
    id: str

    event_type: str

    occurred_at: datetime

    consultation: ConsultationHistoryData | None = None

    document: DocumentHistoryData | None = None

    assessment: AssessmentHistoryData | None = None


class MedicalHistoryResponse(BaseModel):
    patient_id: uuid.UUID

    total_events: int

    events: list[
        MedicalHistoryEvent
    ]