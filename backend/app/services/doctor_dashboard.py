from datetime import (
    datetime,
    timedelta,
    timezone,
)

from sqlalchemy.orm import Session

from app.models.doctor import Doctor

from app.models.enums import (
    AppointmentStatus,
)

from app.repositories.doctor_dashboard import (
    count_available_slots,
    count_completed_appointments,
    count_pending_requests,
    count_upcoming_approved,
    get_appointment_status_counts,
    get_upcoming_appointments,
)


def get_doctor_dashboard(
    db: Session,
    doctor: Doctor,
):
    now = datetime.now(
        timezone.utc
    )

    seven_days_later = (
        now
        + timedelta(
            days=7
        )
    )


    # --------------------------------------------------
    # DASHBOARD COUNTS
    # --------------------------------------------------

    pending_requests = (
        count_pending_requests(
            db,
            doctor.id,
        )
    )

    upcoming_approved = (
        count_upcoming_approved(
            db,
            doctor.id,
            now,
        )
    )

    completed_total = (
        count_completed_appointments(
            db,
            doctor.id,
        )
    )

    available_slots = (
        count_available_slots(
            db,
            doctor.id,
            now,
            seven_days_later,
        )
    )


    # --------------------------------------------------
    # STATUS BREAKDOWN
    # --------------------------------------------------

    raw_status_counts = (
        get_appointment_status_counts(
            db,
            doctor.id,
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


    # --------------------------------------------------
    # UPCOMING APPOINTMENTS
    # --------------------------------------------------

    rows = (
        get_upcoming_appointments(
            db,
            doctor.id,
            now,
            limit=6,
        )
    )

    upcoming_appointments = []

    for (
        appointment,
        patient,
        slot,
    ) in rows:

        upcoming_appointments.append(
            {
                "id":
                    appointment.id,

                "patient_id":
                    patient.id,

                "patient_code":
                    patient.patient_code,

                "patient_first_name":
                    patient.first_name,

                "patient_last_name":
                    patient.last_name,

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
        "doctor_id":
            doctor.id,

        "doctor_code":
            doctor.doctor_code,

        "doctor_first_name":
            doctor.first_name,

        "doctor_last_name":
            doctor.last_name,

        "verification_status":
            doctor.verification_status,

        "is_accepting_patients":
            doctor.is_accepting_patients,

        "stats": {
            "pending_requests":
                pending_requests,

            "upcoming_approved":
                upcoming_approved,

            "completed_total":
                completed_total,

            "available_slots_next_7_days":
                available_slots,
        },

        "appointment_status_counts":
            appointment_status_counts,

        "upcoming_appointments":
            upcoming_appointments,
    }