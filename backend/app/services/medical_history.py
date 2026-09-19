from datetime import (
    datetime,
    timezone,
)

import uuid

from sqlalchemy.orm import Session

from app.models.patient import (
    Patient,
)

from app.models.doctor import (
    Doctor,
)

from app.repositories.medical_history import (
    get_encounter_diagnoses_for_history,
    get_encounter_prescription_for_history,
    get_patient_consultations,
    get_prescription_items_for_history,
)

from app.repositories.ai_symptom_assessment import (
    get_ai_assessments_for_patient,
)


# =========================================================
# HELPERS
# =========================================================


def enum_value(
    value,
):
    if value is None:
        return None

    return getattr(
        value,
        "value",
        str(value),
    )


def specialty_display_name(
    code: str | None,
) -> str | None:
    """
    Convert stable specialty code into readable text.

    Example:

    NEUROLOGY
        ->
    Neurology

    GENERAL_MEDICINE
        ->
    General Medicine
    """

    if not code:
        return None


    normalized = (
        code
        .strip()
        .upper()
    )


    if normalized == "ENT":
        return "ENT"


    return (
        normalized
        .replace(
            "_",
            " ",
        )
        .title()
    )


def safe_list(
    value,
) -> list:
    """
    JSONB should contain lists, but this keeps history
    serialization defensive if older/corrupt data exists.
    """

    if isinstance(
        value,
        list,
    ):
        return value

    return []


# =========================================================
# DIAGNOSES
# =========================================================


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


# =========================================================
# PRESCRIPTION
# =========================================================


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


# =========================================================
# CONSULTATION EVENTS
# =========================================================


def build_consultation_events(
    db: Session,
    patient: Patient,
    doctor_id: uuid.UUID | None = None,
):
    rows = (
        get_patient_consultations(
            db,
            patient.id,
            doctor_id=doctor_id,
        )
    )


    events = []


    for (
        appointment,
        doctor,
        slot,
        encounter,
    ) in rows:

        # -------------------------------------------------
        # Use a real historical timestamp.
        # -------------------------------------------------

        occurred_at = (
            slot.start_at

            if slot is not None

            else (
                encounter.started_at

                if encounter is not None

                else appointment.created_at
            )
        )


        # -------------------------------------------------
        # Do not show future appointments in medical
        # history.
        # -------------------------------------------------

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
                    (
                        f"consultation-"
                        f"{appointment.id}"
                    ),

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


# =========================================================
# PHASE 36
# AI-ASSESSMENT SERIALIZATION
# =========================================================


def serialize_assessment_symptoms(
    assessment,
) -> list[dict]:
    """
    Convert saved JSON snapshot into history API format.
    """

    symptoms = []


    for item in safe_list(
        assessment.symptoms_json
    ):
        if not isinstance(
            item,
            dict,
        ):
            continue


        symptom_id = (
            item.get(
                "id"
            )
        )

        code = (
            item.get(
                "code"
            )
        )

        name = (
            item.get(
                "name"
            )
        )


        if (
            symptom_id is None
            or not code
            or not name
        ):
            continue


        symptoms.append(
            {
                "id":
                    symptom_id,

                "code":
                    code,

                "name":
                    name,
            }
        )


    return symptoms


def serialize_assessment_conditions(
    assessment,
) -> list[dict]:
    """
    Convert saved possible-condition snapshots into
    Patient-facing medical-history data.
    """

    conditions = []


    for item in safe_list(
        assessment
        .possible_conditions_json
    ):
        if not isinstance(
            item,
            dict,
        ):
            continue


        name = (
            item.get(
                "name"
            )
        )


        if not name:
            continue


        factors = (
            item.get(
                "relevant_reported_factors"
            )
        )


        if not isinstance(
            factors,
            list,
        ):
            factors = []


        conditions.append(
            {
                "name":
                    name,

                "reason":
                    item.get(
                        "reason"
                    ),

                "relevant_reported_factors":
                    factors,
            }
        )


    return conditions


def build_assessment_summary(
    *,
    symptoms: list[dict],
    conditions: list[dict],
    specialty_name: str | None,
    urgency: str | None,
) -> str:
    """
    Compatibility summary for an existing frontend.

    This does not call the AI again.
    It uses only persisted assessment data.
    """

    parts = []


    symptom_names = [
        item["name"]

        for item
        in symptoms

        if item.get(
            "name"
        )
    ]


    condition_names = [
        item["name"]

        for item
        in conditions

        if item.get(
            "name"
        )
    ]


    if symptom_names:
        parts.append(
            "Reported symptoms: "
            + ", ".join(
                symptom_names
            )
        )


    if condition_names:
        parts.append(
            "Possible conditions: "
            + ", ".join(
                condition_names
            )
        )


    if specialty_name:
        parts.append(
            "Suggested specialty: "
            + specialty_name
        )


    if urgency:
        parts.append(
            "Urgency: "
            + urgency.title()
        )


    return ". ".join(
        parts
    ) + (
        "."
        if parts
        else ""
    )


# =========================================================
# PHASE 36
# AI-ASSESSMENT TIMELINE EVENTS
# =========================================================


def build_assessment_events(
    db: Session,
    patient: Patient,
):
    """
    Convert persisted AI-assisted symptom assessments
    into Phase 26 medical-history events.

    These events belong only to this Patient.

    Important:
    possible conditions are not Doctor diagnoses.
    """

    assessments = (
        get_ai_assessments_for_patient(
            db,
            patient.id,
        )
    )


    events = []


    for assessment in assessments:

        symptoms = (
            serialize_assessment_symptoms(
                assessment
            )
        )


        conditions = (
            serialize_assessment_conditions(
                assessment
            )
        )


        specialty_name = (
            specialty_display_name(
                assessment
                .recommended_specialty_code
            )
        )


        summary = (
            build_assessment_summary(
                symptoms=(
                    symptoms
                ),

                conditions=(
                    conditions
                ),

                specialty_name=(
                    specialty_name
                ),

                urgency=(
                    assessment.urgency
                ),
            )
        )


        # ---------------------------------------------
        # Compatibility with old "predictions" schema.
        #
        # We intentionally DO NOT create fake
        # confidence/probability values.
        # ---------------------------------------------

        predictions = [
            {
                "condition_name":
                    condition["name"],

                "probability":
                    None,
            }

            for condition
            in conditions
        ]


        events.append(
            {
                "id":
                    (
                        "ai-assessment-"
                        f"{assessment.id}"
                    ),

                "event_type":
                    "AI_ASSESSMENT",

                "occurred_at":
                    assessment.created_at,

                "consultation":
                    None,

                "document":
                    None,

                "assessment": {
                    "assessment_id":
                        assessment.id,

                    "created_at":
                        assessment.created_at,


                    # -----------------------------
                    # Compatibility fields
                    # -----------------------------

                    "status":
                        "COMPLETED",

                    "summary":
                        summary,

                    "predictions":
                        predictions,


                    # -----------------------------
                    # Phase 36 detailed fields
                    # -----------------------------

                    "duration":
                        assessment.duration,

                    "reported_symptoms":
                        symptoms,

                    "possible_conditions":
                        conditions,

                    "recommended_specialty_code":
                        (
                            assessment
                            .recommended_specialty_code
                        ),

                    "recommended_specialty_name":
                        specialty_name,

                    "specialty_reason":
                        (
                            assessment
                            .specialty_reason
                        ),

                    "urgency":
                        assessment.urgency,

                    "red_flags":
                        safe_list(
                            assessment
                            .red_flags_json
                        ),

                    "safety_message":
                        (
                            assessment
                            .safety_message
                        ),

                    "provider":
                        assessment.provider,

                    "model_name":
                        assessment.model_name,
                },
            }
        )


    return events


# =========================================================
# PATIENT FULL MEDICAL HISTORY
# =========================================================


def get_patient_medical_history(
    db: Session,
    patient: Patient,
):
    """
    Build one unified reverse-chronological medical
    history timeline for the current Patient.

    Included:

    - consultations
    - appointments represented by consultation events
    - encounters
    - diagnoses
    - prescriptions
    - AI-assisted symptom assessments

    Medical documents can be added to this same
    aggregation separately.
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
    # Leave unchanged until your exact document-history
    # integration is enabled.
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
    # PHASE 36
    # AI-ASSISTED SYMPTOM ASSESSMENTS
    # =====================================================

    assessment_events = (
        build_assessment_events(
            db,
            patient,
        )
    )


    events.extend(
        assessment_events
    )


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


# =========================================================
# DOCTOR APPOINTMENT-ONLY HISTORY
# =========================================================


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

    Phase 36 intentionally does NOT expose Patient AI
    assessments through APPOINTMENT_ONLY access.
    """

    events = (
        build_consultation_events(
            db,
            patient,
            doctor_id=(
                doctor.id
            ),
        )
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