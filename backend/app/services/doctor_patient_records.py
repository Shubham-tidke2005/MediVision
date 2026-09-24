import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.models.appointment import Appointment
from app.models.patient import Patient
from app.schemas.audit_log import AuditAction, AuditResourceType
from app.services.audit_log import record_audit_event
from app.services.medical_history import (
    get_patient_medical_history,
    get_patient_medical_history_for_doctor,
)


def enum_value(value):
    if value is None:
        return None
    return getattr(value, "value", str(value))


def patient_dob(patient):
    return getattr(patient, "date_of_birth", None) or getattr(patient, "dob", None)


def patient_gender(patient):
    return getattr(patient, "gender", None) or getattr(patient, "sex_at_birth", None)


def active_grant_patient_ids(db: Session, doctor_id: uuid.UUID) -> set[uuid.UUID]:
    rows = db.execute(
        text(
            """
            SELECT DISTINCT patient_id
            FROM medical_access_grants
            WHERE doctor_id = :doctor_id
              AND revoked_at IS NULL
              AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
            """
        ),
        {"doctor_id": doctor_id},
    ).scalars().all()
    return set(rows)


def active_grant(db: Session, doctor_id: uuid.UUID, patient_id: uuid.UUID):
    row = (
        db.execute(
            text(
                """
                SELECT id, scope, granted_at, expires_at
                FROM medical_access_grants
                WHERE doctor_id = :doctor_id
                  AND patient_id = :patient_id
                  AND revoked_at IS NULL
                  AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                ORDER BY granted_at DESC
                LIMIT 1
                """
            ),
            {"doctor_id": doctor_id, "patient_id": patient_id},
        )
        .mappings()
        .first()
    )
    if row is None:
        return None
    return {
        "id": row["id"],
        "scope": enum_value(row["scope"]),
        "granted_at": row["granted_at"],
        "expires_at": row["expires_at"],
    }


def appointment_patient_ids(db: Session, doctor_id: uuid.UUID) -> set[uuid.UUID]:
    stmt = select(Appointment.patient_id).where(
        Appointment.doctor_id == doctor_id
    ).distinct()
    return set(db.scalars(stmt).all())


def appointment_info(db: Session, doctor_id: uuid.UUID, patient_id: uuid.UUID):
    count_stmt = select(func.count()).select_from(Appointment).where(
        Appointment.doctor_id == doctor_id,
        Appointment.patient_id == patient_id,
    )
    count = int(db.scalar(count_stmt) or 0)

    latest_stmt = (
        select(Appointment)
        .where(
            Appointment.doctor_id == doctor_id,
            Appointment.patient_id == patient_id,
        )
        .order_by(Appointment.created_at.desc())
        .limit(1)
    )
    latest = db.scalar(latest_stmt)
    return {"count": count, "latest": latest}


def patient_summary(db: Session, doctor, patient: Patient):
    appt = appointment_info(db, doctor.id, patient.id)
    grant = active_grant(db, doctor.id, patient.id)
    sources = []
    if appt["count"] > 0:
        sources.append("APPOINTMENT")
    if grant is not None:
        sources.append("PATIENT_GRANT")

    latest_at = (
        appt["latest"].created_at
        if appt["latest"] is not None
        else (grant["granted_at"] if grant else None)
    )

    return {
        "id": patient.id,
        "patient_code": patient.patient_code,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "date_of_birth": patient_dob(patient),
        "gender": patient_gender(patient),
        "blood_group": getattr(patient, "blood_group", None),
        "appointment_count": appt["count"],
        "active_grant_scope": grant["scope"] if grant else None,
        "access_sources": sources,
        "last_related_at": latest_at,
    }


def list_authorized_patients(
    db: Session,
    *,
    doctor,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    appt_ids = appointment_patient_ids(db, doctor.id)
    grant_ids = active_grant_patient_ids(db, doctor.id)
    ids = appt_ids | grant_ids

    if not ids:
        return {
            "total": 0,
            "appointment_linked_count": 0,
            "active_grant_count": 0,
            "items": [],
        }

    patients = list(
        db.scalars(
            select(Patient)
            .where(Patient.id.in_(ids))
            .order_by(Patient.first_name, Patient.last_name)
        ).all()
    )

    q = (search or "").strip().lower()
    if q:
        patients = [
            p for p in patients
            if q in f"{p.patient_code} {p.first_name} {p.last_name}".lower()
        ]

    total = len(patients)
    patients = patients[offset:offset + limit]

    return {
        "total": total,
        "appointment_linked_count": len(appt_ids),
        "active_grant_count": len(grant_ids),
        "items": [patient_summary(db, doctor, p) for p in patients],
    }


def authorized_patient(db: Session, doctor, patient_id: uuid.UUID):
    patient = db.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found.")

    appt = appointment_info(db, doctor.id, patient.id)
    grant = active_grant(db, doctor.id, patient.id)

    if appt["count"] == 0 and grant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found.")

    return patient, appt, grant


def get_authorized_patient_record(db: Session, *, doctor, patient_id: uuid.UUID):
    patient, appt, grant = authorized_patient(db, doctor, patient_id)
    scope = grant["scope"] if grant else None

    if scope == "FULL_HISTORY":
        access_mode = "FULL_HISTORY"
        history = get_patient_medical_history(db, patient)
        notice = (
            "The Patient has granted active FULL_HISTORY access. "
            "The record shown is limited to data currently included by MediVision's medical-history service."
        )
    elif appt["count"] > 0 or scope == "APPOINTMENT_ONLY":
        access_mode = "APPOINTMENT_ONLY"
        history = get_patient_medical_history_for_doctor(db, patient, doctor)
        notice = "This view is limited to consultations and clinical records associated with this Doctor."
    elif scope == "DOCUMENTS_ONLY":
        access_mode = "DOCUMENTS_ONLY"
        history = {"patient_id": patient.id, "total_events": 0, "events": []}
        notice = (
            "The active grant is DOCUMENTS_ONLY. Consultation history is not exposed by this Patient Records page."
        )
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient access is not available.")

    record_audit_event(
        db,
        user_id=doctor.user_id,
        action=AuditAction.PATIENT_RECORD_VIEWED,
        resource_type=AuditResourceType.PATIENT,
        resource_id=patient.id,
        metadata={"access_source": access_mode},
    )
    db.commit()

    return {
        "patient": patient_summary(db, doctor, patient),
        "access_mode": access_mode,
        "access_notice": notice,
        "history": history,
    }
