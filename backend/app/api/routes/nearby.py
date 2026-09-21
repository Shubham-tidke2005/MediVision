from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from app.api.dependencies import (
    get_current_patient,
)

from app.models.patient import (
    Patient,
)

from app.schemas.nearby import (
    FacilityType,
    NearbyHealthcareResponse,
)

from app.services.nearby import (
    search_nearby_healthcare,
)


router = APIRouter(
    prefix="/api/v1/nearby",
    tags=[
        "Nearby Healthcare"
    ],
)


@router.get(
    "/healthcare",
    response_model=(
        NearbyHealthcareResponse
    ),
)
async def nearby_healthcare(
    latitude: float = Query(
        ...,
        ge=-90,
        le=90,
    ),

    longitude: float = Query(
        ...,
        ge=-180,
        le=180,
    ),

    radius_km: float = Query(
        default=5,
        ge=0.5,
        le=25,
    ),

    facility_type: (
        FacilityType
        | None
    ) = Query(
        default=None
    ),

    open_now: bool = Query(
        default=False
    ),

    timezone: str = Query(
        default="UTC",
        min_length=1,
        max_length=64,
    ),

    _patient: Patient = Depends(
        get_current_patient
    ),
):
    return await (
        search_nearby_healthcare(
            latitude=latitude,

            longitude=longitude,

            radius_km=radius_km,

            facility_type=(
                facility_type
            ),

            open_now=(
                open_now
            ),

            timezone_name=(
                timezone
            ),
        )
    )