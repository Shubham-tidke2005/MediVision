import threading

from sqlalchemy import select

from app.core.database import SessionLocal

from app.models.appointment import Appointment

from app.models.availability import DoctorSlot

from app.models.enums import (
    AppointmentStatus,
    AppointmentType,
    SlotStatus,
)


SLOT_ID = "REPLACE_WITH_REAL_SLOT_UUID"
PATIENT_1_ID = "REPLACE_WITH_PATIENT_1_UUID"
PATIENT_2_ID = "REPLACE_WITH_PATIENT_2_UUID"
DOCTOR_ID = "REPLACE_WITH_DOCTOR_UUID"


def attempt_booking(
    patient_id,
):
    db = SessionLocal()

    try:
        slot = db.scalar(
            select(DoctorSlot)
            .where(
                DoctorSlot.id
                == SLOT_ID
            )
            .with_for_update()
        )

        if (
            slot is None
            or slot.status
            != SlotStatus.AVAILABLE
        ):
            print(
                patient_id,
                "FAILED - slot unavailable",
            )

            db.rollback()
            return

        appointment = Appointment(
            patient_id=patient_id,
            doctor_id=DOCTOR_ID,
            slot_id=slot.id,
            appointment_type=(
                AppointmentType.IN_PERSON
            ),
            status=(
                AppointmentStatus.REQUESTED
            ),
        )

        db.add(
            appointment
        )

        slot.status = (
            SlotStatus.HELD
        )

        db.commit()

        print(
            patient_id,
            "SUCCESS",
        )

    except Exception as exc:
        db.rollback()

        print(
            patient_id,
            "FAILED",
            type(exc).__name__,
        )

    finally:
        db.close()


thread_1 = threading.Thread(
    target=attempt_booking,
    args=(PATIENT_1_ID,),
)

thread_2 = threading.Thread(
    target=attempt_booking,
    args=(PATIENT_2_ID,),
)


thread_1.start()
thread_2.start()

thread_1.join()
thread_2.join()