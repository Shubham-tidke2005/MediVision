import uuid

from sqlalchemy import (
    select,
)

from sqlalchemy.orm import Session

from app.models.appointment import (
    Appointment,
)

from app.models.availability import (
    DoctorSlot,
)

from app.models.doctor import (
    Doctor,
)

from app.models.encounter import (
    Encounter,
)

from app.models.diagnosis import (
    Diagnosis,
    EncounterDiagnosis,
)

from app.models.prescription import (
    Medicine,
    Prescription,
    PrescriptionItem,
)


# =========================================================
# CONSULTATIONS
# =========================================================


def get_patient_consultations(
    db: Session,
    patient_id: uuid.UUID,
    doctor_id: uuid.UUID | None = None,
):
    """
    Get consultation history for a Patient.

    If doctor_id is supplied, only appointments
    involving that Doctor are returned.

    This is used by Phase 28 APPOINTMENT_ONLY access.
    """

    stmt = (
        select(
            Appointment,
            Doctor,
            DoctorSlot,
            Encounter,
        )
        .join(
            Doctor,
            Doctor.id
            == Appointment.doctor_id,
        )
        .outerjoin(
            DoctorSlot,
            DoctorSlot.id
            == Appointment.slot_id,
        )
        .outerjoin(
            Encounter,
            Encounter.appointment_id
            == Appointment.id,
        )
        .where(
            Appointment.patient_id
            == patient_id
        )
    )

    if doctor_id is not None:
        stmt = stmt.where(
            Appointment.doctor_id
            == doctor_id
        )

    stmt = stmt.order_by(
        DoctorSlot.start_at.desc()
    )

    return db.execute(
        stmt
    ).all()
# =========================================================
# DIAGNOSES
# =========================================================


def get_encounter_diagnoses_for_history(
    db: Session,
    encounter_id: uuid.UUID,
):
    return db.execute(
        select(
            EncounterDiagnosis,
            Diagnosis,
        )
        .join(
            Diagnosis,
            Diagnosis.id
            == EncounterDiagnosis.diagnosis_id,
        )
        .where(
            EncounterDiagnosis.encounter_id
            == encounter_id
        )
        .order_by(
            EncounterDiagnosis.created_at.asc()
        )
    ).all()


# =========================================================
# PRESCRIPTION
# =========================================================


def get_encounter_prescription_for_history(
    db: Session,
    encounter_id: uuid.UUID,
):
    return db.scalar(
        select(
            Prescription
        )
        .where(
            Prescription.encounter_id
            == encounter_id
        )
    )


def get_prescription_items_for_history(
    db: Session,
    prescription_id: uuid.UUID,
):
    return db.execute(
        select(
            PrescriptionItem,
            Medicine,
        )
        .join(
            Medicine,
            Medicine.id
            == PrescriptionItem.medicine_id,
        )
        .where(
            PrescriptionItem.prescription_id
            == prescription_id
        )
        .order_by(
            PrescriptionItem.sort_order.asc(),
            PrescriptionItem.created_at.asc(),
        )
    ).all()