from sqlalchemy.orm import Session
import uuid
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.repositories.medical_history import (
    get_encounter_diagnoses_for_history,
    get_encounter_prescription_for_history,
    get_patient_consultations,
    get_prescription_items_for_history,
)


def enum_value(value):
    if value is None:
        return None

    return getattr(
        value,
        "value",
        str(value),
    )


def serialize_diagnoses(
    db: Session,
    encounter_id,
):
    rows = (
        get_encounter_diagnoses_for_history(
            db,
            encounter_id,
        )
    )

    return [
        {
            "id":
                encounter_diagnosis.id,

            "name":
                diagnosis.name,

            "code":
                diagnosis.code,

            "diagnosis_type":
                enum_value(
                    encounter_diagnosis
                    .diagnosis_type
                ),

            "notes":
                encounter_diagnosis.notes,
        }

        for (
            encounter_diagnosis,
            diagnosis,
        ) in rows
    ]


def serialize_prescription(
    db: Session,
    encounter_id,
):
    prescription = (
        get_encounter_prescription_for_history(
            db,
            encounter_id,
        )
    )

    if prescription is None:
        return None


    rows = (
        get_prescription_items_for_history(
            db,
            prescription.id,
        )
    )


    items = []

    for (
        item,
        medicine,
    ) in rows:

        items.append(
            {
                "id":
                    item.id,

                "medicine": {
                    "id":
                        medicine.id,

                    "name":
                        medicine.name,

                    "generic_name":
                        medicine.generic_name,

                    "dosage_form":
                        medicine.dosage_form,
                },

                "strength":
                    item.strength,

                "dose":
                    item.dose,

                "frequency":
                    item.frequency,

                "route":
                    item.route,

                "duration_days":
                    item.duration_days,

                "quantity":
                    item.quantity,

                "instructions":
                    item.instructions,
            }
        )


    return {
        "id":
            prescription.id,

        "general_instructions":
            prescription.general_instructions,

        "prescribed_at":
            prescription.prescribed_at,

        "items":
            items,
    }


def build_consultation_events(
    db: Session,
    patient: Patient,
    doctor_id: uuid.UUID | None = None,
):
    rows = get_patient_consultations(
    db,
    patient.id,
    doctor_id=doctor_id,
    )

    events = []


    for (
        appointment,
        doctor,
        slot,
        encounter,
    ) in rows:

        # Medical History should use an actual
        # historical timestamp.
        occurred_at = (
            slot.start_at
            if slot is not None
            else (
                encounter.started_at
                if encounter is not None
                else appointment.created_at
            )
        )


        # Skip future appointments.
        from datetime import (
            datetime,
            timezone,
        )

        if (
            occurred_at
            and occurred_at
            > datetime.now(
                timezone.utc
            )
        ):
            continue


        diagnoses = []

        prescription = None


        if encounter is not None:
            diagnoses = (
                serialize_diagnoses(
                    db,
                    encounter.id,
                )
            )

            prescription = (
                serialize_prescription(
                    db,
                    encounter.id,
                )
            )


        events.append(
            {
                "id":
                    f"consultation-{appointment.id}",

                "event_type":
                    "CONSULTATION",

                "occurred_at":
                    occurred_at,

                "consultation": {
                    "appointment": {
                        "id":
                            appointment.id,

                        "appointment_type":
                            enum_value(
                                appointment
                                .appointment_type
                            ),

                        "status":
                            enum_value(
                                appointment.status
                            ),

                        "reason":
                            appointment.reason,

                        "start_at":
                            (
                                slot.start_at
                                if slot
                                else occurred_at
                            ),

                        "end_at":
                            (
                                slot.end_at
                                if slot
                                else None
                            ),
                    },

                    "encounter": (
                        {
                            "id":
                                encounter.id,

                            "encounter_type":
                                enum_value(
                                    encounter
                                    .encounter_type
                                ),

                            "chief_complaint":
                                encounter
                                .chief_complaint,

                            "subjective_notes":
                                encounter
                                .subjective_notes,

                            "objective_notes":
                                encounter
                                .objective_notes,

                            "assessment_notes":
                                encounter
                                .assessment_notes,

                            "plan_notes":
                                encounter
                                .plan_notes,

                            "started_at":
                                encounter
                                .started_at,

                            "ended_at":
                                encounter
                                .ended_at,
                        }

                        if encounter
                        else None
                    ),

                    "doctor": {
                        "id":
                            doctor.id,

                        "doctor_code":
                            doctor.doctor_code,

                        "first_name":
                            doctor.first_name,

                        "last_name":
                            doctor.last_name,

                        "qualification":
                            doctor.qualification,
                    },

                    "diagnoses":
                        diagnoses,

                    "prescription":
                        prescription,
                },

                "document":
                    None,

                "assessment":
                    None,
            }
        )


    return events


def get_patient_medical_history(
    db: Session,
    patient: Patient,
):
    """
    Build one unified, reverse-chronological
    medical history timeline for the current Patient.

    Phase 26 currently includes:
    - appointments
    - encounters
    - diagnoses
    - prescriptions

    Documents and AI symptom assessments can be
    plugged into the same timeline after their
    exact database models are verified.
    """

    events = []


    # =====================================================
    # CONSULTATIONS
    # =====================================================

    consultation_events = (
        build_consultation_events(
            db,
            patient,
        )
    )

    events.extend(
        consultation_events
    )


    # =====================================================
    # MEDICAL DOCUMENTS
    #
    # We will enable this after confirming the exact
    # MedicalDocument model/columns.
    # =====================================================

    # document_events = (
    #     build_document_events(
    #         db,
    #         patient,
    #     )
    # )
    #
    # events.extend(
    #     document_events
    # )


    # =====================================================
    # AI SYMPTOM ASSESSMENTS
    #
    # We will enable this after confirming the exact
    # SymptomAssessment model/columns.
    # =====================================================

    # assessment_events = (
    #     build_assessment_events(
    #         db,
    #         patient,
    #     )
    # )
    #
    # events.extend(
    #     assessment_events
    # )


    # =====================================================
    # SORT NEWEST -> OLDEST
    # =====================================================

    events.sort(
        key=lambda item:
            item["occurred_at"],
        reverse=True,
    )


    # =====================================================
    # RESPONSE
    # =====================================================

    return {
        "patient_id":
            patient.id,

        "total_events":
            len(events),

        "events":
            events,
    }
    
    
def get_patient_medical_history_for_doctor(
    db: Session,
    patient: Patient,
    doctor: Doctor,
):
    """
    Build APPOINTMENT_ONLY medical history.

    The Doctor can see only clinical records associated
    with appointments between this Patient and this Doctor.

    Included:
    - appointments with this Doctor
    - encounters from those appointments
    - diagnoses from those encounters
    - prescriptions from those encounters

    Not included:
    - consultations with other Doctors
    - unrelated Patient-uploaded documents
    - unrelated AI-assisted symptom assessments
    """

    events = build_consultation_events(
        db,
        patient,
        doctor_id=doctor.id,
    )

    events.sort(
        key=lambda item:
            item["occurred_at"],
        reverse=True,
    )

    return {
        "patient_id":
            patient.id,

        "total_events":
            len(events),

        "events":
            events,
    }