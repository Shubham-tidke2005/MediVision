from abc import (
    ABC,
    abstractmethod,
)

from dataclasses import (
    dataclass,
)

from app.schemas.nearby import (
    FacilityOpenStatus,
    FacilityType,
)


class NearbyProviderError(
    Exception
):
    pass


@dataclass(
    slots=True
)
class ProviderFacility:
    provider_id: str

    name: str

    facility_type: FacilityType

    address: str | None

    latitude: float

    longitude: float

    open_status: (
        FacilityOpenStatus
    )

    opening_hours: (
        str
        | None
    ) = None

    phone: (
        str
        | None
    ) = None

    website: (
        str
        | None
    ) = None


class NearbyHealthcareProvider(
    ABC
):
    @abstractmethod
    async def search(
        self,
        *,
        latitude: float,
        longitude: float,
        radius_km: float,
        facility_type: (
            FacilityType
            | None
        ),
        timezone_name: str,
    ) -> list[
        ProviderFacility
    ]:
        raise NotImplementedError