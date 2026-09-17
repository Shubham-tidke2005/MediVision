from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_patient,
)

from app.core.database import (
    get_db,
)

from app.models.patient import (
    Patient,
)

from app.schemas.health import (
    HealthMeasurementCreate,
    HealthMeasurementResponse,
    HealthMetricTypeResponse,
)

from app.services.health import (
    create_health_measurement,
    get_health_measurements,
    get_health_metric_types,
)


router = APIRouter(
    prefix="/health",
    tags=["Health Tracking"],
)


# =========================================================
# METRIC TYPES
# =========================================================


@router.get(
    "/metric-types",
    response_model=list[
        HealthMetricTypeResponse
    ],
)
def metric_types(
    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_health_metric_types(
        db
    )


# =========================================================
# GET MEASUREMENTS
# =========================================================


@router.get(
    "/measurements",
    response_model=list[
        HealthMeasurementResponse
    ],
)
def measurements(
    days: int = Query(
        default=90,
        ge=1,
        le=365,
    ),

    metric_code: str | None = Query(
        default=None
    ),

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return get_health_measurements(
        db,
        patient,
        days,
        metric_code,
    )


# =========================================================
# CREATE MEASUREMENT
# =========================================================


@router.post(
    "/measurements",
    response_model=HealthMeasurementResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_measurement(
    payload: HealthMeasurementCreate,

    patient: Patient = Depends(
        get_current_patient
    ),

    db: Session = Depends(
        get_db
    ),
):
    return create_health_measurement(
        db,
        patient,
        payload,
    )