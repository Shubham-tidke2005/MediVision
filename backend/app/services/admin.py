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

from app.repositories import admin as repo


def _missing_table(
    table_name: str,
):
    raise HTTPException(
        status_code=(
            status
            .HTTP_503_SERVICE_UNAVAILABLE
        ),
        detail=(
            f"Required table "
            f"'{table_name}' "
            "is not available."
        ),
    )


def _ensure_table(
    db: Session,
    table_name: str,
):
    if not repo.table_exists(
        db,
        table_name,
    ):
        _missing_table(
            table_name
        )


def _collection(
    db: Session,
    *,
    table_name: str,
    limit: int,
    offset: int,
):
    items, total = repo.list_resource(
        db,
        table_name=table_name,
        limit=limit,
        offset=offset,
    )

    return {
        "items": items,
        "total": total,
    }


def get_dashboard(
    db: Session,
):
    image_count = 0

    for table_name in (
        "medical_image_analyses",
        "image_analyses",
    ):
        if repo.table_exists(
            db,
            table_name,
        ):
            image_count = repo.count_table(
                db,
                table_name,
            )
            break

    ai_count = repo.count_table(
        db,
        "ai_symptom_assessments",
    )

    if ai_count == 0:
        ai_count = repo.count_table(
            db,
            "symptom_assessments",
        )

    return {
        "total_patients": repo.count_table(
            db,
            "patients",
        ),
        "total_doctors": repo.count_table(
            db,
            "doctors",
        ),
        "pending_doctor_verifications": repo.count_where(
            db,
            "doctors",
            "verification_status",
            "PENDING",
        ),
        "total_appointments": repo.count_table(
            db,
            "appointments",
        ),
        "total_ai_assessments": ai_count,
        "total_image_analyses": image_count,
        "active_sos_events": repo.count_where(
            db,
            "sos_events",
            "status",
            [
                "TRIGGERED",
                "ACKNOWLEDGED",
            ],
        ),
        "published_health_articles": repo.count_where(
            db,
            "health_articles",
            "status",
            "PUBLISHED",
        ),
    }


def list_users(db, *, limit, offset):
    return _collection(
        db,
        table_name="users",
        limit=limit,
        offset=offset,
    )


def set_user_active(
    db: Session,
    *,
    user_id: str,
    is_active: bool,
    current_admin_id,
):
    if (
        str(current_admin_id)
        == str(user_id)
        and not is_active
    ):
        raise HTTPException(
            status_code=(
                status
                .HTTP_400_BAD_REQUEST
            ),
            detail=(
                "You cannot deactivate "
                "your own admin account."
            ),
        )

    _ensure_table(
        db,
        "users",
    )

    item = repo.update_resource(
        db,
        table_name="users",
        record_id=user_id,
        payload={
            "is_active": is_active,
        },
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    db.commit()

    return {"item": item}


def list_patients(db, *, limit, offset):
    return _collection(
        db,
        table_name="patients",
        limit=limit,
        offset=offset,
    )


def list_doctors(db, *, limit, offset):
    return _collection(
        db,
        table_name="doctors",
        limit=limit,
        offset=offset,
    )


def update_doctor_verification(
    db: Session,
    *,
    doctor_id: str,
    verification_status: str,
):
    _ensure_table(
        db,
        "doctors",
    )

    payload = {
        "verification_status": verification_status,
    }

    if verification_status in {
        "REJECTED",
        "SUSPENDED",
    }:
        payload[
            "is_accepting_patients"
        ] = False

    item = repo.update_resource(
        db,
        table_name="doctors",
        record_id=doctor_id,
        payload=payload,
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found.",
        )

    db.commit()

    return {"item": item}


def list_specialties(db, *, limit, offset):
    return _collection(
        db,
        table_name="specialties",
        limit=limit,
        offset=offset,
    )


def create_specialty(
    db: Session,
    payload: dict,
):
    _ensure_table(
        db,
        "specialties",
    )

    try:
        item = repo.insert_resource(
            db,
            table_name="specialties",
            payload=payload,
        )
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=(
                "Specialty code or name "
                "already exists."
            ),
        )

    return {"item": item}


def update_specialty(
    db: Session,
    *,
    specialty_id: str,
    payload: dict,
):
    _ensure_table(
        db,
        "specialties",
    )

    try:
        item = repo.update_resource(
            db,
            table_name="specialties",
            record_id=specialty_id,
            payload=payload,
        )

        if item is None:
            raise HTTPException(
                status_code=404,
                detail="Specialty not found.",
            )

        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=(
                "Specialty code or name "
                "already exists."
            ),
        )

    return {"item": item}


def list_facilities(db, *, limit, offset):
    return _collection(
        db,
        table_name="healthcare_facilities",
        limit=limit,
        offset=offset,
    )


def create_facility(
    db: Session,
    payload: dict,
):
    _ensure_table(
        db,
        "healthcare_facilities",
    )

    item = repo.insert_resource(
        db,
        table_name="healthcare_facilities",
        payload=payload,
    )

    db.commit()

    return {"item": item}


def update_facility(
    db: Session,
    *,
    facility_id: str,
    payload: dict,
):
    _ensure_table(
        db,
        "healthcare_facilities",
    )

    item = repo.update_resource(
        db,
        table_name="healthcare_facilities",
        record_id=facility_id,
        payload=payload,
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Facility not found.",
        )

    db.commit()

    return {"item": item}


def list_appointments(db, *, limit, offset):
    return _collection(
        db,
        table_name="appointments",
        limit=limit,
        offset=offset,
    )


def list_health_articles(db, *, limit, offset):
    return _collection(
        db,
        table_name="health_articles",
        limit=limit,
        offset=offset,
    )


def create_health_article(
    db: Session,
    payload: dict,
):
    _ensure_table(
        db,
        "health_articles",
    )

    if (
        payload.get("status")
        == "PUBLISHED"
        and payload.get(
            "published_at"
        ) is None
    ):
        payload[
            "published_at"
        ] = datetime.now(
            timezone.utc
        )

    try:
        item = repo.insert_resource(
            db,
            table_name="health_articles",
            payload=payload,
        )
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=(
                "Article slug already "
                "exists."
            ),
        )

    return {"item": item}


def update_health_article(
    db: Session,
    *,
    article_id: str,
    payload: dict,
):
    _ensure_table(
        db,
        "health_articles",
    )

    if (
        payload.get("status")
        == "PUBLISHED"
        and payload.get(
            "published_at"
        ) is None
    ):
        payload[
            "published_at"
        ] = datetime.now(
            timezone.utc
        )

    try:
        item = repo.update_resource(
            db,
            table_name="health_articles",
            record_id=article_id,
            payload=payload,
        )

        if item is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Health article "
                    "not found."
                ),
            )

        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=(
                "Article slug already "
                "exists."
            ),
        )

    return {"item": item}


def list_ai_assessments(db, *, limit, offset):
    table_name = "ai_symptom_assessments"

    if not repo.table_exists(
        db,
        table_name,
    ):
        table_name = "symptom_assessments"

    return _collection(
        db,
        table_name=table_name,
        limit=limit,
        offset=offset,
    )


def list_sos_events(db, *, limit, offset):
    return _collection(
        db,
        table_name="sos_events",
        limit=limit,
        offset=offset,
    )


def get_sos_event(
    db: Session,
    *,
    event_id: str,
):
    _ensure_table(
        db,
        "sos_events",
    )

    item = repo.get_resource_by_id(
        db,
        table_name="sos_events",
        record_id=event_id,
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="SOS event not found.",
        )

    return {"item": item}
