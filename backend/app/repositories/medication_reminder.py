import uuid

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.medication_reminder import (
    MedicationAdherenceLog,
    MedicationSchedule,
    PatientMedication,
)


def list_patient_medications(
    db: Session,
    patient_id: uuid.UUID,
):
    return list(
        db.scalars(
            select(
                PatientMedication
            )
            .where(
                PatientMedication.patient_id
                == patient_id
            )
            .order_by(
                PatientMedication.created_at.desc()
            )
        ).all()
    )


def get_patient_medication(
    db: Session,
    patient_id: uuid.UUID,
    medication_id: uuid.UUID,
):
    return db.scalar(
        select(
            PatientMedication
        )
        .where(
            PatientMedication.id
            == medication_id,

            PatientMedication.patient_id
            == patient_id,
        )
    )


def get_medication_schedules(
    db: Session,
    medication_id: uuid.UUID,
):
    return list(
        db.scalars(
            select(
                MedicationSchedule
            )
            .where(
                MedicationSchedule.patient_medication_id
                == medication_id,

                MedicationSchedule.is_active
                .is_(True),
            )
            .order_by(
                MedicationSchedule.time_of_day
            )
        ).all()
    )


def get_schedule(
    db: Session,
    schedule_id: uuid.UUID,
):
    return db.scalar(
        select(
            MedicationSchedule
        )
        .where(
            MedicationSchedule.id
            == schedule_id
        )
    )


def get_adherence_log(
    db: Session,
    schedule_id: uuid.UUID,
    scheduled_for: datetime,
):
    return db.scalar(
        select(
            MedicationAdherenceLog
        )
        .where(
            MedicationAdherenceLog.medication_schedule_id
            == schedule_id,

            MedicationAdherenceLog.scheduled_for
            == scheduled_for,
        )
    )


def get_logs_between(
    db: Session,
    patient_id: uuid.UUID,
    start_at: datetime,
    end_at: datetime,
):
    return list(
        db.scalars(
            select(
                MedicationAdherenceLog
            )
            .join(
                PatientMedication,
                PatientMedication.id
                == MedicationAdherenceLog.patient_medication_id,
            )
            .where(
                PatientMedication.patient_id
                == patient_id,

                MedicationAdherenceLog.scheduled_for
                >= start_at,

                MedicationAdherenceLog.scheduled_for
                < end_at,
            )
        ).all()
    )