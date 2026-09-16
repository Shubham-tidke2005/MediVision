from datetime import (
    datetime,
    timezone,
)

from sqlalchemy.orm import Session

from app.models.enums import (
    AppointmentStatus,
)

from app.models.patient import Patient

from app.repositories.patient_dashboard import (
    count_available_doctors,
    count_completed_appointments,
    count_pending_requests,
    count_upcoming_approved,
    get_appointment_status_counts,
    get_upcoming_appointments,
)


def get_patient_dashboard(
    db: Session,
    patient: Patient,
):
    now = datetime.now(
        timezone.utc
    )


    # ==================================================
    # DASHBOARD COUNTS
    # ==================================================

    pending_requests = (
        count_pending_requests(
            db,
            patient.id,
        )
    )

    upcoming_approved = (
        count_upcoming_approved(
            db,
            patient.id,
            now,
        )
    )

    completed_total = (
        count_completed_appointments(
            db,
            patient.id,
        )
    )

    available_doctors = (
        count_available_doctors(
            db
        )
    )


    # ==================================================
    # APPOINTMENT STATUS COUNTS
    # ==================================================

    raw_status_counts = (
        get_appointment_status_counts(
            db,
            patient.id,
        )
    )

    appointment_status_counts = {
        status.value: 0
        for status in AppointmentStatus
    }

    for (
        appointment_status,
        count,
    ) in raw_status_counts.items():

        key = (
            appointment_status.value
            if hasattr(
                appointment_status,
                "value",
            )
            else str(
                appointment_status
            )
        )

        appointment_status_counts[
            key
        ] = count


    # ==================================================
    # UPCOMING APPOINTMENTS
    # ==================================================

    rows = get_upcoming_appointments(
        db,
        patient.id,
        now,
        limit=6,
    )

    upcoming_appointments = []

    for (
        appointment,
        doctor,
        slot,
    ) in rows:

        upcoming_appointments.append(
            {
                "id":
                    appointment.id,

                "doctor_id":
                    doctor.id,

                "doctor_code":
                    doctor.doctor_code,

                "doctor_first_name":
                    doctor.first_name,

                "doctor_last_name":
                    doctor.last_name,

                "qualification":
                    doctor.qualification,

                "appointment_type":
                    appointment.appointment_type,

                "status":
                    appointment.status,

                "start_at":
                    slot.start_at,

                "end_at":
                    slot.end_at,

                "reason":
                    appointment.reason,
            }
        )


    return {
        "patient_id":
            patient.id,

        "patient_code":
            patient.patient_code,

        "patient_first_name":
            patient.first_name,

        "patient_last_name":
            patient.last_name,

        "stats": {
            "pending_requests":
                pending_requests,

            "upcoming_approved":
                upcoming_approved,

            "completed_total":
                completed_total,

            "available_doctors":
                available_doctors,
        },

        "appointment_status_counts":
            appointment_status_counts,

        "upcoming_appointments":
            upcoming_appointments,
    }