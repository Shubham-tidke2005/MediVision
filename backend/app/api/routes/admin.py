from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_user,
)

from app.core.database import (
    get_db,
)

from app.schemas.admin import (
    AdminCollectionResponse,
    AdminDashboardResponse,
    AdminMutationResponse,
    DoctorVerificationUpdate,
    FacilityCreate,
    FacilityUpdate,
    HealthArticleCreate,
    HealthArticleUpdate,
    SpecialtyCreate,
    SpecialtyUpdate,
    UserActiveUpdate,
)

from app.services import admin as service


router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Admin"],
)


def get_current_admin(
    current_user=Depends(
        get_current_user
    ),
):
    role = getattr(
        current_user,
        "role",
        None,
    )

    role_value = getattr(
        role,
        "value",
        role,
    )

    if (
        str(role_value).upper()
        != "ADMIN"
    ):
        raise HTTPException(
            status_code=(
                status
                .HTTP_403_FORBIDDEN
            ),
            detail=(
                "Admin access required."
            ),
        )

    if not getattr(
        current_user,
        "is_active",
        True,
    ):
        raise HTTPException(
            status_code=(
                status
                .HTTP_403_FORBIDDEN
            ),
            detail=(
                "Inactive account."
            ),
        )

    return current_user


@router.get(
    "/dashboard",
    response_model=AdminDashboardResponse,
)
def dashboard(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.get_dashboard(db)


@router.get(
    "/users",
    response_model=AdminCollectionResponse,
)
def users(
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.list_users(
        db,
        limit=limit,
        offset=offset,
    )


@router.patch(
    "/users/{user_id}/active",
    response_model=AdminMutationResponse,
)
def update_user_active(
    user_id: str,
    payload: UserActiveUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    return service.set_user_active(
        db,
        user_id=user_id,
        is_active=payload.is_active,
        current_admin_id=admin.id,
    )


@router.get(
    "/patients",
    response_model=AdminCollectionResponse,
)
def patients(
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.list_patients(
        db,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/doctors",
    response_model=AdminCollectionResponse,
)
def doctors(
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.list_doctors(
        db,
        limit=limit,
        offset=offset,
    )


@router.patch(
    "/doctors/{doctor_id}/verification",
    response_model=AdminMutationResponse,
)
def verify_doctor(
    doctor_id: str,
    payload: DoctorVerificationUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.update_doctor_verification(
        db,
        doctor_id=doctor_id,
        verification_status=(
            payload.verification_status
        ),
    )


@router.get(
    "/specialties",
    response_model=AdminCollectionResponse,
)
def specialties(
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.list_specialties(
        db,
        limit=limit,
        offset=offset,
    )


@router.post(
    "/specialties",
    response_model=AdminMutationResponse,
    status_code=201,
)
def create_specialty(
    payload: SpecialtyCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.create_specialty(
        db,
        payload=payload.model_dump(),
    )


@router.put(
    "/specialties/{specialty_id}",
    response_model=AdminMutationResponse,
)
def update_specialty(
    specialty_id: str,
    payload: SpecialtyUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.update_specialty(
        db,
        specialty_id=specialty_id,
        payload=payload.model_dump(
            exclude_unset=True
        ),
    )


@router.get(
    "/facilities",
    response_model=AdminCollectionResponse,
)
def facilities(
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.list_facilities(
        db,
        limit=limit,
        offset=offset,
    )


@router.post(
    "/facilities",
    response_model=AdminMutationResponse,
    status_code=201,
)
def create_facility(
    payload: FacilityCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.create_facility(
        db,
        payload=payload.model_dump(),
    )


@router.put(
    "/facilities/{facility_id}",
    response_model=AdminMutationResponse,
)
def update_facility(
    facility_id: str,
    payload: FacilityUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.update_facility(
        db,
        facility_id=facility_id,
        payload=payload.model_dump(
            exclude_unset=True
        ),
    )


@router.get(
    "/appointments",
    response_model=AdminCollectionResponse,
)
def appointments(
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.list_appointments(
        db,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/health-articles",
    response_model=AdminCollectionResponse,
)
def health_articles(
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.list_health_articles(
        db,
        limit=limit,
        offset=offset,
    )


@router.post(
    "/health-articles",
    response_model=AdminMutationResponse,
    status_code=201,
)
def create_health_article(
    payload: HealthArticleCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.create_health_article(
        db,
        payload=payload.model_dump(),
    )


@router.put(
    "/health-articles/{article_id}",
    response_model=AdminMutationResponse,
)
def update_health_article(
    article_id: str,
    payload: HealthArticleUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.update_health_article(
        db,
        article_id=article_id,
        payload=payload.model_dump(
            exclude_unset=True
        ),
    )


@router.get(
    "/ai-assessments",
    response_model=AdminCollectionResponse,
)
def ai_assessments(
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.list_ai_assessments(
        db,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/sos",
    response_model=AdminCollectionResponse,
)
def sos_events(
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.list_sos_events(
        db,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/sos/{event_id}",
    response_model=AdminMutationResponse,
)
def sos_event_detail(
    event_id: str,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return service.get_sos_event(
        db,
        event_id=event_id,
    )
