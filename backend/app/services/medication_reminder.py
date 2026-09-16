import uuid

from datetime import (
    date,
    datetime,
    time,
    timedelta,
    timezone,
)

from zoneinfo import (
    ZoneInfo,
    ZoneInfoNotFoundError,
)

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.models.enums import (
    AdherenceStatus,
    MedicationSource,
    MedicationStatus,
)

from app.models.medication_reminder import (
    MedicationAdherenceLog,
    MedicationSchedule,
    PatientMedication,
)

from app.models.patient import Patient

from app.repositories.medication_reminder import (
    get_adherence_log,
    get_medication_schedules,
    get_patient_medication,
    get_schedule,
    list_patient_medications,
)

from app.schemas.medication_reminder import (
    ManualMedicationCreate,
    MedicationScheduleCreate,
)


# =========================================================
# TIMEZONE
# =========================================================


def validate_timezone(
    timezone_name: str,
):
    try:
        return ZoneInfo(
            timezone_name
        )

    except ZoneInfoNotFoundError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail="Invalid timezone.",
        ) from exc


# =========================================================
# SERIALIZE MEDICATION
# =========================================================


def serialize_medication(
    medication: PatientMedication,
):
    return {
        "id":
            medication.id,

        "medicine_name":
            medication.medicine_name,

        "source":
            medication.source,

        "status":
            medication.status,

        "strength":
            medication.strength,

        "dose":
            medication.dose,

        "route":
            medication.route,

        "instructions":
            medication.instructions,

        "start_date":
            medication.start_date,

        "end_date":
            medication.end_date,
    }


# =========================================================
# LIST
# =========================================================


def get_patient_medications(
    db: Session,
    patient: Patient,
):
    return [
        serialize_medication(
            medication
        )

        for medication
        in list_patient_medications(
            db,
            patient.id,
        )
    ]


# =========================================================
# MANUAL MEDICATION
# =========================================================


def create_manual_medication(
    db: Session,
    patient: Patient,
    payload: ManualMedicationCreate,
):
    if (
        payload.end_date
        and payload.end_date
        < payload.start_date
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Medication end date cannot "
                "be before start date."
            ),
        )


    medication = PatientMedication(
        patient_id=(
            patient.id
        ),

        medicine_id=None,

        medicine_name=(
            payload.medicine_name.strip()
        ),

        prescription_item_id=None,

        source=(
            MedicationSource.MANUAL
        ),

        status=(
            MedicationStatus.ACTIVE
        ),

        strength=(
            payload.strength
        ),

        dose=(
            payload.dose
        ),

        route=(
            payload.route
        ),

        instructions=(
            payload.instructions
        ),

        start_date=(
            payload.start_date
        ),

        end_date=(
            payload.end_date
        ),
    )


    db.add(
        medication
    )

    db.commit()

    db.refresh(
        medication
    )


    return serialize_medication(
        medication
    )


# =========================================================
# CREATE SCHEDULE
# =========================================================


def create_schedule(
    db: Session,
    patient: Patient,
    medication_id: uuid.UUID,
    payload: MedicationScheduleCreate,
):
    medication = (
        get_patient_medication(
            db,
            patient.id,
            medication_id,
        )
    )


    if medication is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Medication not found.",
        )


    if (
        medication.status
        != MedicationStatus.ACTIVE
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "Schedules can be added only "
                "to active medications."
            ),
        )


    validate_timezone(
        payload.timezone
    )


    existing = (
        get_medication_schedules(
            db,
            medication.id,
        )
    )


    for schedule in existing:
        if (
            schedule.time_of_day
            == payload.time_of_day
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_409_CONFLICT
                ),
                detail=(
                    "A reminder already exists "
                    "at this time."
                ),
            )


    schedule = MedicationSchedule(
        patient_medication_id=(
            medication.id
        ),

        time_of_day=(
            payload.time_of_day
        ),

        timezone=(
            payload.timezone
        ),

        is_active=True,
    )


    db.add(
        schedule
    )

    db.commit()

    db.refresh(
        schedule
    )


    return schedule


# =========================================================
# CREATE ONE SCHEDULED DATETIME
# =========================================================


def get_scheduled_datetime(
    schedule: MedicationSchedule,
    target_date: date,
):
    tz = validate_timezone(
        schedule.timezone
    )


    local_datetime = datetime.combine(
        target_date,
        schedule.time_of_day,
        tzinfo=tz,
    )


    return local_datetime.astimezone(
        timezone.utc
    )


# =========================================================
# TODAY'S / DATE'S DOSES
# =========================================================


def get_patient_doses_for_date(
    db: Session,
    patient: Patient,
    target_date: date,
):
    medications = (
        list_patient_medications(
            db,
            patient.id,
        )
    )


    now = datetime.now(
        timezone.utc
    )


    result = []


    for medication in medications:
        if (
            medication.status
            != MedicationStatus.ACTIVE
        ):
            continue


        if (
            target_date
            < medication.start_date
        ):
            continue


        if (
            medication.end_date
            and target_date
            > medication.end_date
        ):
            continue


        schedules = (
            get_medication_schedules(
                db,
                medication.id,
            )
        )


        for schedule in schedules:
            scheduled_for = (
                get_scheduled_datetime(
                    schedule,
                    target_date,
                )
            )


            log = get_adherence_log(
                db,
                schedule.id,
                scheduled_for,
            )


            # ---------------------------------------------
            # Automatically persist a missed dose when:
            #
            # - the scheduled time already passed
            # - no Patient status was recorded
            #
            # We use a one-hour grace window.
            # ---------------------------------------------

            if (
                log is None
                and now
                > scheduled_for
                + timedelta(
                    hours=1
                )
            ):
                log = MedicationAdherenceLog(
                    patient_medication_id=(
                        medication.id
                    ),

                    medication_schedule_id=(
                        schedule.id
                    ),

                    scheduled_for=(
                        scheduled_for
                    ),

                    status=(
                        AdherenceStatus.MISSED
                    ),
                )

                db.add(
                    log
                )

                db.flush()


            result.append(
                {
                    "schedule_id":
                        schedule.id,

                    "patient_medication_id":
                        medication.id,

                    "medicine_name":
                        medication.medicine_name,

                    "scheduled_for":
                        scheduled_for,

                    "status": (
                        log.status
                        if log
                        else None
                    ),

                    "taken_at": (
                        log.taken_at
                        if log
                        else None
                    ),
                }
            )


    db.commit()


    result.sort(
        key=lambda item:
            item["scheduled_for"]
    )


    return result


# =========================================================
# UPDATE DOSE STATUS
# =========================================================


def update_dose_status(
    db: Session,
    patient: Patient,
    schedule_id: uuid.UUID,
    scheduled_for: datetime,
    new_status: AdherenceStatus,
    notes: str | None = None,
):
    schedule = get_schedule(
        db,
        schedule_id,
    )


    if schedule is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Medication schedule not found.",
        )


    medication = (
        get_patient_medication(
            db,
            patient.id,
            schedule.patient_medication_id,
        )
    )


    if medication is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Medication schedule not found.",
        )


    if (
        scheduled_for.tzinfo
        is None
    ):
        scheduled_for = (
            scheduled_for.replace(
                tzinfo=timezone.utc
            )
        )


    scheduled_for = (
        scheduled_for.astimezone(
            timezone.utc
        )
    )


    log = get_adherence_log(
        db,
        schedule.id,
        scheduled_for,
    )


    now = datetime.now(
        timezone.utc
    )


    final_status = (
        new_status
    )


    taken_at = None


    # If Patient marks TAKEN after one-hour grace,
    # store it as LATE automatically.
    if (
        new_status
        == AdherenceStatus.TAKEN
    ):
        taken_at = now

        if (
            now
            > scheduled_for
            + timedelta(
                hours=1
            )
        ):
            final_status = (
                AdherenceStatus.LATE
            )


    elif (
        new_status
        == AdherenceStatus.LATE
    ):
        taken_at = now


    if log is None:
        log = MedicationAdherenceLog(
            patient_medication_id=(
                medication.id
            ),

            medication_schedule_id=(
                schedule.id
            ),

            scheduled_for=(
                scheduled_for
            ),

            status=(
                final_status
            ),

            taken_at=(
                taken_at
            ),

            notes=(
                notes
            ),
        )

        db.add(
            log
        )

    else:
        log.status = (
            final_status
        )

        log.taken_at = (
            taken_at
        )

        log.notes = (
            notes
        )


    db.commit()

    db.refresh(
        log
    )


    return log


# =========================================================
# ADHERENCE SUMMARY
# =========================================================


def calculate_adherence(
    db: Session,
    patient: Patient,
    days: int = 30,
):
    if (
        days < 1
        or days > 365
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=(
                "Days must be between 1 and 365."
            ),
        )


    today = date.today()


    # Generate/persist missed occurrences
    # before calculating adherence.
    for offset in range(
        days
    ):
        target_date = (
            today
            - timedelta(
                days=offset
            )
        )

        get_patient_doses_for_date(
            db,
            patient,
            target_date,
        )


    start_at = datetime.combine(
        today
        - timedelta(
            days=days - 1
        ),
        time.min,
        tzinfo=timezone.utc,
    )


    end_at = (
        datetime.now(
            timezone.utc
        )
        + timedelta(
            seconds=1
        )
    )


    from app.repositories.medication_reminder import (
        get_logs_between,
    )


    logs = get_logs_between(
        db,
        patient.id,
        start_at,
        end_at,
    )


    taken = 0
    late = 0
    missed = 0
    skipped = 0


    for log in logs:
        if (
            log.status
            == AdherenceStatus.TAKEN
        ):
            taken += 1

        elif (
            log.status
            == AdherenceStatus.LATE
        ):
            late += 1

        elif (
            log.status
            == AdherenceStatus.MISSED
        ):
            missed += 1

        elif (
            log.status
            == AdherenceStatus.SKIPPED
        ):
            skipped += 1


    total = (
        taken
        + late
        + missed
        + skipped
    )


    adherence_percentage = (
        round(
            (
                (
                    taken
                    + late
                )
                / total
            )
            * 100,
            2,
        )

        if total
        else None
    )


    return {
        "days":
            days,

        "total_doses":
            total,

        "taken":
            taken,

        "late":
            late,

        "missed":
            missed,

        "skipped":
            skipped,

        "adherence_percentage":
            adherence_percentage,
    }
    
def create_medication_from_prescription_item(
    db: Session,
    patient_id,
    prescription_item,
    medicine,
):
    from sqlalchemy import select

    existing = db.scalar(
        select(
            PatientMedication
        )
        .where(
            PatientMedication.prescription_item_id
            == prescription_item.id
        )
    )


    if existing is not None:
        return existing


    medication = PatientMedication(
        patient_id=(
            patient_id
        ),

        medicine_id=(
            medicine.id
        ),

        medicine_name=(
            medicine.name
        ),

        prescription_item_id=(
            prescription_item.id
        ),

        source=(
            MedicationSource.PRESCRIPTION
        ),

        status=(
            MedicationStatus.ACTIVE
        ),

        strength=(
            prescription_item.strength
        ),

        dose=(
            prescription_item.dose
        ),

        route=(
            prescription_item.route
        ),

        instructions=(
            prescription_item.instructions
        ),

        start_date=(
            date.today()
        ),
    )


    db.add(
        medication
    )

    db.flush()


    return medication