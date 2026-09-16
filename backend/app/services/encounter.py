import uuid
from datetime import (
    datetime,
    timezone,
)

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.appointment import (
    AppointmentStatusHistory,
)

from app.models.doctor import Doctor
from app.models.encounter import Encounter

from app.models.enums import (
    AppointmentStatus,
    AppointmentType,
    EncounterType,
)

from app.repositories.encounter import (
    get_appointment_for_encounter_start,
    get_encounter_by_appointment,
    get_encounter_detail_row,
    get_encounter_for_update,
    list_doctor_encounters,
)

from app.schemas.encounter import (
    EncounterStartRequest,
    EncounterUpdateRequest,
)


def appointment_type_to_encounter_type(
    appointment_type,
):
    if (
        appointment_type
        == AppointmentType.IN_PERSON
    ):
        return EncounterType.IN_PERSON

    return EncounterType.ONLINE


def serialize_encounter_row(
    row,
):
    (
        encounter,
        appointment,
        patient,
        doctor,
        slot,
    ) = row

    return {
        "id":
            encounter.id,

        "appointment_id":
            encounter.appointment_id,

        "patient_id":
            encounter.patient_id,

        "doctor_id":
            encounter.doctor_id,

        "encounter_type":
            encounter.encounter_type,

        "chief_complaint":
            encounter.chief_complaint,

        "subjective_notes":
            encounter.subjective_notes,

        "objective_notes":
            encounter.objective_notes,

        "assessment_notes":
            encounter.assessment_notes,

        "plan_notes":
            encounter.plan_notes,

        "started_at":
            encounter.started_at,

        "ended_at":
            encounter.ended_at,

        "is_completed":
            encounter.ended_at
            is not None,

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

        "appointment": {
            "id":
                appointment.id,

            "appointment_type":
                appointment.appointment_type,

            "status":
                appointment.status,

            "reason":
                appointment.reason,

            "start_at":
                slot.start_at,

            "end_at":
                slot.end_at,
        },

        "created_at":
            encounter.created_at,

        "updated_at":
            encounter.updated_at,
    }


def get_serialized_encounter(
    db: Session,
    encounter_id: uuid.UUID,
):
    row = get_encounter_detail_row(
        db,
        encounter_id,
    )

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encounter not found.",
        )

    return serialize_encounter_row(
        row
    )


def start_encounter(
    db: Session,
    doctor: Doctor,
    appointment_id: uuid.UUID,
    payload: EncounterStartRequest,
):
    try:
        appointment = (
            get_appointment_for_encounter_start(
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
            != AppointmentStatus.APPROVED
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Only approved appointments "
                    "can start a consultation."
                ),
            )

        existing = (
            get_encounter_by_appointment(
                db,
                appointment.id,
            )
        )

        # Idempotent behavior:
        # if Doctor clicks Start twice,
        # return existing Encounter.
        if existing is not None:
            db.rollback()

            return get_serialized_encounter(
                db,
                existing.id,
            )

        encounter = Encounter(
            appointment_id=(
                appointment.id
            ),
            patient_id=(
                appointment.patient_id
            ),
            doctor_id=(
                appointment.doctor_id
            ),
            encounter_type=(
                appointment_type_to_encounter_type(
                    appointment.appointment_type
                )
            ),
            chief_complaint=(
                payload.chief_complaint
            ),
        )

        db.add(encounter)

        db.flush()

        encounter_id = (
            encounter.id
        )

        db.commit()

    except HTTPException:
        db.rollback()
        raise

    except IntegrityError:
        db.rollback()

        # Another request may have created it
        # concurrently.
        existing = (
            get_encounter_by_appointment(
                db,
                appointment_id,
            )
        )

        if existing is not None:
            return get_serialized_encounter(
                db,
                existing.id,
            )

        raise

    except Exception:
        db.rollback()
        raise

    return get_serialized_encounter(
        db,
        encounter_id,
    )


def update_encounter(
    db: Session,
    doctor: Doctor,
    encounter_id: uuid.UUID,
    payload: EncounterUpdateRequest,
):
    encounter = (
        get_encounter_for_update(
            db,
            encounter_id,
        )
    )

    if (
        encounter is None
        or encounter.doctor_id
        != doctor.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encounter not found.",
        )

    if encounter.ended_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Completed encounters "
                "cannot be edited."
            ),
        )

    update_data = (
        payload.model_dump(
            exclude_unset=True
        )
    )

    for (
        field,
        value,
    ) in update_data.items():
        setattr(
            encounter,
            field,
            value,
        )

    db.commit()

    return get_serialized_encounter(
        db,
        encounter.id,
    )


def complete_encounter(
    db: Session,
    doctor: Doctor,
    encounter_id: uuid.UUID,
):
    try:
        encounter = (
            get_encounter_for_update(
                db,
                encounter_id,
            )
        )

        if (
            encounter is None
            or encounter.doctor_id
            != doctor.id
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Encounter not found.",
            )

        if encounter.ended_at is not None:
            return get_serialized_encounter(
                db,
                encounter.id,
            )

        appointment = (
            get_appointment_for_encounter_start(
                db,
                encounter.appointment_id,
            )
        )

        if appointment is None:
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
                    "The appointment is not "
                    "in an approvable consultation state."
                ),
            )

        old_status = (
            appointment.status
        )

        encounter.ended_at = (
            datetime.now(
                timezone.utc
            )
        )

        appointment.status = (
            AppointmentStatus.COMPLETED
        )

        db.add(
            AppointmentStatusHistory(
                appointment_id=(
                    appointment.id
                ),
                old_status=(
                    old_status
                ),
                new_status=(
                    AppointmentStatus.COMPLETED
                ),
                changed_by_user_id=(
                    doctor.user_id
                ),
                reason=(
                    "Consultation encounter completed."
                ),
            )
        )

        db.commit()

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise

    return get_serialized_encounter(
        db,
        encounter.id,
    )


def get_doctor_encounters(
    db: Session,
    doctor: Doctor,
):
    rows = list_doctor_encounters(
        db,
        doctor.id,
    )

    return [
        serialize_encounter_row(
            row
        )
        for row in rows
    ]


def get_doctor_encounter(
    db: Session,
    doctor: Doctor,
    encounter_id: uuid.UUID,
):
    row = get_encounter_detail_row(
        db,
        encounter_id,
    )

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encounter not found.",
        )

    encounter = row[0]

    if (
        encounter.doctor_id
        != doctor.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encounter not found.",
        )

    return serialize_encounter_row(
        row
    )