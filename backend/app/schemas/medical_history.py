import uuid
from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
)


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
    ] = Field(
        default_factory=list
    )


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

    encounter: (
        HistoryEncounter
        | None
    ) = None

    doctor: HistoryDoctor

    diagnoses: list[
        HistoryDiagnosis
    ] = Field(
        default_factory=list
    )

    prescription: (
        HistoryPrescription
        | None
    ) = None


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
# PHASE 36
# AI-ASSESSMENT HISTORY
# =========================================================


class HistoryAssessmentSymptom(
    BaseModel
):
    """
    Snapshot of a symptom that was actually
    reported by the Patient.
    """

    id: int

    code: str

    name: str


class HistoryAssessmentCondition(
    BaseModel
):
    """
    Possible condition returned by the AI.

    This is not a confirmed diagnosis.
    """

    name: str

    reason: str | None = None

    relevant_reported_factors: list[
        str
    ] = Field(
        default_factory=list
    )


# =========================================================
# LEGACY COMPATIBILITY
#
# Kept because an existing PatientHistoryPage may already
# read "predictions".
#
# No fake confidence is produced.
# =========================================================


class HistoryAssessmentPrediction(
    BaseModel
):
    condition_name: str

    probability: float | None = None


class AssessmentHistoryData(
    BaseModel
):
    assessment_id: uuid.UUID

    created_at: datetime


    # -----------------------------------------------------
    # Existing compatibility fields
    # -----------------------------------------------------

    status: str | None = None

    summary: str | None = None

    predictions: list[
        HistoryAssessmentPrediction
    ] = Field(
        default_factory=list
    )


    # -----------------------------------------------------
    # Phase 36 detailed history
    # -----------------------------------------------------

    duration: str | None = None

    reported_symptoms: list[
        HistoryAssessmentSymptom
    ] = Field(
        default_factory=list
    )

    possible_conditions: list[
        HistoryAssessmentCondition
    ] = Field(
        default_factory=list
    )

    recommended_specialty_code: (
        str
        | None
    ) = None

    recommended_specialty_name: (
        str
        | None
    ) = None

    specialty_reason: (
        str
        | None
    ) = None

    urgency: str | None = None

    red_flags: list[
        str
    ] = Field(
        default_factory=list
    )

    safety_message: (
        str
        | None
    ) = None

    provider: str | None = None

    model_name: str | None = None


# =========================================================
# GENERIC TIMELINE EVENT
# =========================================================


class MedicalHistoryEvent(
    BaseModel
):
    id: str

    event_type: str

    occurred_at: datetime

    consultation: (
        ConsultationHistoryData
        | None
    ) = None

    document: (
        DocumentHistoryData
        | None
    ) = None

    assessment: (
        AssessmentHistoryData
        | None
    ) = None


class MedicalHistoryResponse(
    BaseModel
):
    patient_id: uuid.UUID

    total_events: int

    events: list[
        MedicalHistoryEvent
    ] = Field(
        default_factory=list
    )