import uuid

from datetime import (
    datetime,
    timezone,
)

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.appointment import (
    Appointment,
    AppointmentStatusHistory,
)

from app.models.availability import (
    DoctorSlot,
    DoctorSlotStatusHistory,
)

from app.models.doctor import Doctor

from app.models.enums import (
    AppointmentStatus,
    DoctorVerificationStatus,
    SlotStatus,
)

from app.models.patient import Patient

from app.repositories.appointment import (
    get_active_appointment_for_slot,
    get_appointment_for_update,
    get_appointment_row,
    get_slot_for_update,
    list_doctor_appointments,
    list_patient_appointments,
)

from app.schemas.appointment import (
    AppointmentRequestCreate,
)


def add_appointment_history(
    db: Session,
    *,
    appointment_id: uuid.UUID,
    old_status,
    new_status,
    changed_by_user_id: uuid.UUID,
    reason: str | None = None,
):
    db.add(
        AppointmentStatusHistory(
            appointment_id=appointment_id,
            old_status=old_status,
            new_status=new_status,
            changed_by_user_id=(
                changed_by_user_id
            ),
            reason=reason,
        )
    )


def add_slot_history(
    db: Session,
    *,
    slot_id: uuid.UUID,
    old_status,
    new_status,
    reason: str | None = None,
):
    db.add(
        DoctorSlotStatusHistory(
            slot_id=slot_id,
            old_status=old_status,
            new_status=new_status,
            reason=reason,
        )
    )


def change_slot_status(
    db: Session,
    slot: DoctorSlot,
    new_status: SlotStatus,
    reason: str,
):
    old_status = slot.status

    if old_status == new_status:
        return

    slot.status = new_status

    add_slot_history(
        db,
        slot_id=slot.id,
        old_status=old_status,
        new_status=new_status,
        reason=reason,
    )


def serialize_appointment_row(
    row,
):
    (
        appointment,
        patient,
        doctor,
        slot,
    ) = row

    return {
        "id":
            appointment.id,

        "appointment_type":
            appointment.appointment_type,

        "status":
            appointment.status,

        "reason":
            appointment.reason,

        "patient_notes":
            appointment.patient_notes,

        "requested_at":
            appointment.requested_at,

        "approved_at":
            appointment.approved_at,

        "cancelled_at":
            appointment.cancelled_at,

        "cancellation_reason":
            appointment.cancellation_reason,

        "patient": {
            "id":
                patient.id,

            "patient_code":
                patient.patient_code,

            "first_name":
                patient.first_name,

            "last_name":
                patient.last_name,
        },

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

        "slot": {
            "id":
                slot.id,

            "start_at":
                slot.start_at,

            "end_at":
                slot.end_at,

            "status":
                slot.status,
        },

        "created_at":
            appointment.created_at,

        "updated_at":
            appointment.updated_at,
    }


def get_serialized_appointment(
    db: Session,
    appointment_id: uuid.UUID,
):
    row = get_appointment_row(
        db,
        appointment_id,
    )

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )

    return serialize_appointment_row(
        row
    )
    
    

def request_appointment(
    db: Session,
    patient: Patient,
    payload: AppointmentRequestCreate,
):
    now = datetime.now(
        timezone.utc
    )

    try:
        # --------------------------------------------------
        # 1. LOCK THE SLOT ROW
        # --------------------------------------------------

        slot = get_slot_for_update(
            db,
            payload.slot_id,
        )

        if slot is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment slot not found.",
            )


        # --------------------------------------------------
        # 2. SLOT MUST STILL BE IN THE FUTURE
        # --------------------------------------------------

        if slot.start_at <= now:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This appointment slot "
                    "is no longer available."
                ),
            )


        # --------------------------------------------------
        # 3. SLOT MUST STILL BE AVAILABLE
        # --------------------------------------------------

        if slot.status != SlotStatus.AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This appointment slot "
                    "is no longer available."
                ),
            )


        # --------------------------------------------------
        # 4. DEFENSE-IN-DEPTH ACTIVE APPOINTMENT CHECK
        # --------------------------------------------------

        existing_appointment = (
            get_active_appointment_for_slot(
                db,
                slot.id,
            )
        )

        if existing_appointment is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This appointment slot "
                    "has already been requested."
                ),
            )


        # --------------------------------------------------
        # 5. LOAD DOCTOR FROM LOCKED SLOT
        # --------------------------------------------------

        doctor = db.scalar(
            select(Doctor)
            .where(
                Doctor.id
                == slot.doctor_id
            )
        )

        if doctor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found.",
            )


        # --------------------------------------------------
        # 6. DOCTOR MUST BE DISCOVERABLE / BOOKABLE
        # --------------------------------------------------

        if (
            not doctor.is_active
            or not doctor.is_accepting_patients
            or doctor.verification_status
            != DoctorVerificationStatus.VERIFIED
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This doctor is not "
                    "currently available "
                    "for appointments."
                ),
            )


        # --------------------------------------------------
        # 7. CREATE APPOINTMENT
        # --------------------------------------------------

        appointment = Appointment(
            patient_id=patient.id,
            doctor_id=doctor.id,
            slot_id=slot.id,
            appointment_type=(
                payload.appointment_type
            ),
            status=(
                AppointmentStatus.REQUESTED
            ),
            reason=payload.reason,
            patient_notes=(
                payload.patient_notes
            ),
        )

        db.add(appointment)

        # Get appointment UUID before history insert.
        db.flush()


        # --------------------------------------------------
        # 8. APPOINTMENT HISTORY
        # --------------------------------------------------

        add_appointment_history(
            db,
            appointment_id=appointment.id,
            old_status=None,
            new_status=(
                AppointmentStatus.REQUESTED
            ),
            changed_by_user_id=(
                patient.user_id
            ),
            reason="Appointment requested.",
        )


        # --------------------------------------------------
        # 9. SLOT AVAILABLE -> HELD
        # --------------------------------------------------

        change_slot_status(
            db,
            slot,
            SlotStatus.HELD,
            "Held for appointment request.",
        )


        # Flush everything before final commit.
        db.flush()


        # --------------------------------------------------
        # 10. SINGLE ATOMIC COMMIT
        # --------------------------------------------------

        db.commit()


    except HTTPException:
        db.rollback()
        raise


    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This appointment slot "
                "was already requested by "
                "another patient."
            ),
        ) from exc


    except Exception:
        db.rollback()
        raise


    return get_serialized_appointment(
        db,
        appointment.id,
    )
    
    
    

def get_patient_appointments(
    db: Session,
    patient: Patient,
):
    rows = list_patient_appointments(
        db,
        patient.id,
    )

    return [
        serialize_appointment_row(
            row
        )
        for row in rows
    ]


def get_doctor_appointments(
    db: Session,
    doctor: Doctor,
):
    rows = list_doctor_appointments(
        db,
        doctor.id,
    )

    return [
        serialize_appointment_row(
            row
        )
        for row in rows
    ]


def approve_appointment(
    db: Session,
    doctor: Doctor,
    appointment_id: uuid.UUID,
):
    appointment = (
        get_appointment_for_update(
            db,
            appointment_id,
        )
    )

    if appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )

    if (
        appointment.doctor_id
        != doctor.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )

    if (
        appointment.status
        != AppointmentStatus.REQUESTED
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Only requested appointments "
                "can be approved."
            ),
        )

    slot = get_slot_for_update(
        db,
        appointment.slot_id,
    )

    if (
        slot is None
        or slot.status
        != SlotStatus.HELD
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Appointment slot is not "
                "in the expected state."
            ),
        )

    if slot.start_at <= datetime.now(
        timezone.utc
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Past appointment slots "
                "cannot be approved."
            ),
        )

    old_status = (
        appointment.status
    )

    appointment.status = (
        AppointmentStatus.APPROVED
    )

    appointment.approved_at = (
        datetime.now(
            timezone.utc
        )
    )

    add_appointment_history(
        db,
        appointment_id=appointment.id,
        old_status=old_status,
        new_status=(
            AppointmentStatus.APPROVED
        ),
        changed_by_user_id=(
            doctor.user_id
        ),
        reason="Appointment approved.",
    )

    change_slot_status(
        db,
        slot,
        SlotStatus.BOOKED,
        "Appointment approved.",
    )

    db.commit()

    return get_serialized_appointment(
        db,
        appointment.id,
    )


def reject_appointment(
    db: Session,
    doctor: Doctor,
    appointment_id: uuid.UUID,
    reason: str | None,
):
    appointment = (
        get_appointment_for_update(
            db,
            appointment_id,
        )
    )

    if appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )

    if appointment.doctor_id != doctor.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )

    if (
        appointment.status
        != AppointmentStatus.REQUESTED
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Only requested appointments "
                "can be rejected."
            ),
        )

    slot = get_slot_for_update(
        db,
        appointment.slot_id,
    )

    old_status = (
        appointment.status
    )

    appointment.status = (
        AppointmentStatus.REJECTED
    )

    add_appointment_history(
        db,
        appointment_id=appointment.id,
        old_status=old_status,
        new_status=(
            AppointmentStatus.REJECTED
        ),
        changed_by_user_id=(
            doctor.user_id
        ),
        reason=reason
        or "Appointment rejected.",
    )

    if slot is not None:
        if (
            slot.start_at
            > datetime.now(
                timezone.utc
            )
        ):
            change_slot_status(
                db,
                slot,
                SlotStatus.AVAILABLE,
                "Appointment rejected.",
            )

    db.commit()

    return get_serialized_appointment(
        db,
        appointment.id,
    )


def cancel_patient_appointment(
    db: Session,
    patient: Patient,
    appointment_id: uuid.UUID,
    reason: str | None,
):
    appointment = (
        get_appointment_for_update(
            db,
            appointment_id,
        )
    )

    if appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )

    if (
        appointment.patient_id
        != patient.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )

    allowed_statuses = {
        AppointmentStatus.REQUESTED,
        AppointmentStatus.APPROVED,
    }

    if (
        appointment.status
        not in allowed_statuses
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This appointment "
                "cannot be cancelled."
            ),
        )

    slot = get_slot_for_update(
        db,
        appointment.slot_id,
    )

    if (
        slot is None
        or slot.start_at
        <= datetime.now(
            timezone.utc
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Past appointments "
                "cannot be cancelled."
            ),
        )

    old_status = (
        appointment.status
    )

    appointment.status = (
        AppointmentStatus.CANCELLED
    )

    appointment.cancelled_at = (
        datetime.now(
            timezone.utc
        )
    )

    appointment.cancellation_reason = (
        reason
    )

    add_appointment_history(
        db,
        appointment_id=appointment.id,
        old_status=old_status,
        new_status=(
            AppointmentStatus.CANCELLED
        ),
        changed_by_user_id=(
            patient.user_id
        ),
        reason=reason
        or "Appointment cancelled by patient.",
    )

    change_slot_status(
        db,
        slot,
        SlotStatus.AVAILABLE,
        "Appointment cancelled.",
    )

    db.commit()

    return get_serialized_appointment(
        db,
        appointment.id,
    )


def complete_appointment(
    db: Session,
    doctor: Doctor,
    appointment_id: uuid.UUID,
):
    appointment = (
        get_appointment_for_update(
            db,
            appointment_id,
        )
    )

    if (
        appointment is None
        or appointment.doctor_id
        != doctor.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )

    if (
        appointment.status
        != AppointmentStatus.APPROVED
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Only approved appointments "
                "can be completed."
            ),
        )

    slot = get_slot_for_update(
        db,
        appointment.slot_id,
    )

    if (
        slot is None
        or slot.start_at
        > datetime.now(
            timezone.utc
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Appointment cannot be marked "
                "completed before it begins."
            ),
        )

    old_status = (
        appointment.status
    )

    appointment.status = (
        AppointmentStatus.COMPLETED
    )

    add_appointment_history(
        db,
        appointment_id=appointment.id,
        old_status=old_status,
        new_status=(
            AppointmentStatus.COMPLETED
        ),
        changed_by_user_id=(
            doctor.user_id
        ),
        reason="Appointment completed.",
    )

    db.commit()

    return get_serialized_appointment(
        db,
        appointment.id,
    )


def mark_no_show(
    db: Session,
    doctor: Doctor,
    appointment_id: uuid.UUID,
):
    appointment = (
        get_appointment_for_update(
            db,
            appointment_id,
        )
    )

    if (
        appointment is None
        or appointment.doctor_id
        != doctor.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )

    if (
        appointment.status
        != AppointmentStatus.APPROVED
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Only approved appointments "
                "can be marked no-show."
            ),
        )

    slot = get_slot_for_update(
        db,
        appointment.slot_id,
    )

    if (
        slot is None
        or slot.start_at
        > datetime.now(
            timezone.utc
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Appointment cannot be marked "
                "no-show before it begins."
            ),
        )

    old_status = (
        appointment.status
    )

    appointment.status = (
        AppointmentStatus.NO_SHOW
    )

    add_appointment_history(
        db,
        appointment_id=appointment.id,
        old_status=old_status,
        new_status=(
            AppointmentStatus.NO_SHOW
        ),
        changed_by_user_id=(
            doctor.user_id
        ),
        reason="Patient marked as no-show.",
    )

    db.commit()

    return get_serialized_appointment(
        db,
        appointment.id,
    )