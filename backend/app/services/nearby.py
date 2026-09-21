from math import (
    asin,
    cos,
    radians,
    sin,
    sqrt,
)

from fastapi import (
    HTTPException,
    status,
)

from app.providers.nearby.base import (
    NearbyProviderError,
)

from app.providers.nearby.osm import (
    OpenStreetMapNearbyProvider,
)

from app.schemas.nearby import (
    Coordinates,
    FacilityOpenStatus,
    FacilityType,
    NearbyFacilityResponse,
    NearbyHealthcareResponse,
)


provider = (
    OpenStreetMapNearbyProvider()
)


# =========================================================
# DISTANCE
# =========================================================


def calculate_distance_km(
    latitude_1: float,
    longitude_1: float,
    latitude_2: float,
    longitude_2: float,
) -> float:
    earth_radius_km = (
        6371.0088
    )

    lat1 = radians(
        latitude_1
    )

    lon1 = radians(
        longitude_1
    )

    lat2 = radians(
        latitude_2
    )

    lon2 = radians(
        longitude_2
    )

    delta_latitude = (
        lat2
        - lat1
    )

    delta_longitude = (
        lon2
        - lon1
    )

    haversine = (
        sin(
            delta_latitude
            / 2
        )
        ** 2
        + cos(lat1)
        * cos(lat2)
        * sin(
            delta_longitude
            / 2
        )
        ** 2
    )

    central_angle = (
        2
        * asin(
            sqrt(
                haversine
            )
        )
    )

    return (
        earth_radius_km
        * central_angle
    )


# =========================================================
# SEARCH
# =========================================================


async def search_nearby_healthcare(
    *,
    latitude: float,
    longitude: float,
    radius_km: float,
    facility_type: (
        FacilityType
        | None
    ),
    open_now: bool,
    timezone_name: str,
):
    try:
        provider_results = (
            await provider.search(
                latitude=latitude,

                longitude=longitude,

                radius_km=radius_km,

                facility_type=(
                    facility_type
                ),

                timezone_name=(
                    timezone_name
                ),
            )
        )

    except NearbyProviderError as exc:
        raise HTTPException(
            status_code=(
                status
                .HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=str(
                exc
            ),
        ) from exc

    facilities = []

    for item in provider_results:
        distance_km = (
            calculate_distance_km(
                latitude,
                longitude,
                item.latitude,
                item.longitude,
            )
        )

        # Extra safety because provider radius
        # results may occasionally be slightly
        # outside the requested circle.

        if (
            distance_km
            > radius_km
            + 0.1
        ):
            continue

        if (
            open_now
            and item.open_status
            != FacilityOpenStatus.OPEN
        ):
            continue

        facilities.append(
            NearbyFacilityResponse(
                provider_id=(
                    item.provider_id
                ),

                name=(
                    item.name
                ),

                facility_type=(
                    item.facility_type
                ),

                address=(
                    item.address
                ),

                latitude=(
                    item.latitude
                ),

                longitude=(
                    item.longitude
                ),

                distance_km=round(
                    distance_km,
                    2,
                ),

                open_status=(
                    item.open_status
                ),

                opening_hours=(
                    item.opening_hours
                ),

                phone=(
                    item.phone
                ),

                website=(
                    item.website
                ),
            )
        )

    facilities.sort(
        key=lambda item:
            item.distance_km
    )

    # Keep the frontend manageable.
    facilities = (
        facilities[
            :100
        ]
    )

    return (
        NearbyHealthcareResponse(
            center=Coordinates(
                latitude=latitude,
                longitude=longitude,
            ),

            radius_km=(
                radius_km
            ),

            facility_type=(
                facility_type
            ),

            open_now=(
                open_now
            ),

            provider=(
                "OpenStreetMap / Overpass"
            ),

            total=len(
                facilities
            ),

            facilities=(
                facilities
            ),
        )
    )