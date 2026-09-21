import os

from datetime import (
    datetime,
    time,
)

from zoneinfo import (
    ZoneInfo,
    ZoneInfoNotFoundError,
)

import httpx

from app.providers.nearby.base import (
    NearbyHealthcareProvider,
    NearbyProviderError,
    ProviderFacility,
)

from app.schemas.nearby import (
    FacilityOpenStatus,
    FacilityType,
)


OVERPASS_API_URL = os.getenv(
    "OVERPASS_API_URL",
    (
        "https://overpass-api.de/"
        "api/interpreter"
    ),
)


DAY_CODES = [
    "Mo",
    "Tu",
    "We",
    "Th",
    "Fr",
    "Sa",
    "Su",
]


FACILITY_SELECTORS = {
    FacilityType.HOSPITAL: [
        '["amenity"="hospital"]',
    ],

    FacilityType.CLINIC: [
        '["amenity"="clinic"]',
    ],

    FacilityType.PHARMACY: [
        '["amenity"="pharmacy"]',
    ],

    FacilityType.DIAGNOSTIC_CENTER: [
        '["healthcare"="laboratory"]',
        '["healthcare"="diagnostic_centre"]',
        '["healthcare"="diagnostics"]',
    ],
}


class OpenStreetMapNearbyProvider(
    NearbyHealthcareProvider
):
    # =====================================================
    # PUBLIC SEARCH
    # =====================================================

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
        query = self._build_query(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            facility_type=(
                facility_type
            ),
        )

        try:
            timeout = httpx.Timeout(
                20.0,
                connect=5.0,
            )

            headers = {
                "User-Agent": (
                    "MediVisionAI/1.0 "
                    "academic-project"
                ),
            }

            async with (
                httpx.AsyncClient(
                    timeout=timeout,
                    headers=headers,
                )
            ) as client:

                response = (
                    await client.post(
                        OVERPASS_API_URL,
                        data={
                            "data": query
                        },
                    )
                )

                response.raise_for_status()

                payload = (
                    response.json()
                )

        except (
            httpx.HTTPError,
            ValueError,
        ) as exc:
            raise NearbyProviderError(
                "Nearby healthcare provider "
                "is temporarily unavailable."
            ) from exc

        elements = payload.get(
            "elements",
            [],
        )

        facilities = {}

        for element in elements:
            facility = (
                self._parse_element(
                    element,
                    timezone_name,
                )
            )

            if facility is None:
                continue

            facilities[
                facility.provider_id
            ] = facility

        return list(
            facilities.values()
        )


    # =====================================================
    # OVERPASS QUERY
    # =====================================================

    def _build_query(
        self,
        *,
        latitude: float,
        longitude: float,
        radius_km: float,
        facility_type: (
            FacilityType
            | None
        ),
    ) -> str:
        radius_meters = int(
            radius_km
            * 1000
        )

        if facility_type:
            selectors = (
                FACILITY_SELECTORS[
                    facility_type
                ]
            )

        else:
            selectors = []

            for values in (
                FACILITY_SELECTORS
                .values()
            ):
                selectors.extend(
                    values
                )

        lines = []

        for selector in selectors:
            lines.append(
                (
                    f"  nwr{selector}"
                    f"(around:{radius_meters},"
                    f"{latitude},"
                    f"{longitude});"
                )
            )

        query_body = "\n".join(
            lines
        )

        return (
            "[out:json][timeout:20];\n"
            "(\n"
            f"{query_body}\n"
            ");\n"
            "out center tags;"
        )


    # =====================================================
    # PARSE OSM RESULT
    # =====================================================

    def _parse_element(
        self,
        element: dict,
        timezone_name: str,
    ) -> (
        ProviderFacility
        | None
    ):
        tags = element.get(
            "tags",
            {},
        )

        facility_type = (
            self
            ._detect_facility_type(
                tags
            )
        )

        if facility_type is None:
            return None

        coordinates = (
            self
            ._extract_coordinates(
                element
            )
        )

        if coordinates is None:
            return None

        latitude, longitude = (
            coordinates
        )

        osm_type = element.get(
            "type",
            "unknown",
        )

        osm_id = element.get(
            "id"
        )

        if osm_id is None:
            return None

        provider_id = (
            f"osm:{osm_type}:{osm_id}"
        )

        name = (
            tags.get(
                "name"
            )
            or tags.get(
                "brand"
            )
            or self
            ._default_name(
                facility_type
            )
        )

        opening_hours = (
            tags.get(
                "opening_hours"
            )
        )

        open_status = (
            self
            ._get_open_status(
                opening_hours,
                timezone_name,
            )
        )

        phone = (
            tags.get(
                "contact:phone"
            )
            or tags.get(
                "phone"
            )
        )

        website = (
            tags.get(
                "contact:website"
            )
            or tags.get(
                "website"
            )
        )

        return ProviderFacility(
            provider_id=provider_id,

            name=name,

            facility_type=(
                facility_type
            ),

            address=(
                self._build_address(
                    tags
                )
            ),

            latitude=latitude,

            longitude=longitude,

            open_status=(
                open_status
            ),

            opening_hours=(
                opening_hours
            ),

            phone=phone,

            website=website,
        )


    # =====================================================
    # FACILITY TYPE
    # =====================================================

    def _detect_facility_type(
        self,
        tags: dict,
    ) -> (
        FacilityType
        | None
    ):
        amenity = tags.get(
            "amenity"
        )

        healthcare = tags.get(
            "healthcare"
        )

        if healthcare in {
            "laboratory",
            "diagnostic_centre",
            "diagnostics",
        }:
            return (
                FacilityType
                .DIAGNOSTIC_CENTER
            )

        if amenity == "hospital":
            return (
                FacilityType
                .HOSPITAL
            )

        if amenity == "pharmacy":
            return (
                FacilityType
                .PHARMACY
            )

        if amenity == "clinic":
            return (
                FacilityType
                .CLINIC
            )

        return None


    # =====================================================
    # COORDINATES
    # =====================================================

    def _extract_coordinates(
        self,
        element: dict,
    ):
        if (
            "lat" in element
            and "lon" in element
        ):
            return (
                float(
                    element["lat"]
                ),
                float(
                    element["lon"]
                ),
            )

        center = element.get(
            "center"
        )

        if (
            center
            and "lat" in center
            and "lon" in center
        ):
            return (
                float(
                    center["lat"]
                ),
                float(
                    center["lon"]
                ),
            )

        return None


    # =====================================================
    # ADDRESS
    # =====================================================

    def _build_address(
        self,
        tags: dict,
    ) -> (
        str
        | None
    ):
        full_address = (
            tags.get(
                "addr:full"
            )
        )

        if full_address:
            return full_address

        house_number = (
            tags.get(
                "addr:housenumber"
            )
        )

        street = (
            tags.get(
                "addr:street"
            )
            or tags.get(
                "addr:place"
            )
        )

        first_line_parts = [
            value

            for value in [
                house_number,
                street,
            ]

            if value
        ]

        first_line = " ".join(
            first_line_parts
        )

        remaining_parts = [
            value

            for value in [
                tags.get(
                    "addr:suburb"
                ),

                tags.get(
                    "addr:city"
                ),

                tags.get(
                    "addr:district"
                ),

                tags.get(
                    "addr:state"
                ),

                tags.get(
                    "addr:postcode"
                ),
            ]

            if value
        ]

        parts = []

        if first_line:
            parts.append(
                first_line
            )

        parts.extend(
            remaining_parts
        )

        if not parts:
            return None

        return ", ".join(
            parts
        )


    # =====================================================
    # DEFAULT NAME
    # =====================================================

    def _default_name(
        self,
        facility_type: FacilityType,
    ) -> str:
        labels = {
            FacilityType.HOSPITAL:
                "Hospital",

            FacilityType.CLINIC:
                "Clinic",

            FacilityType.PHARMACY:
                "Pharmacy",

            FacilityType
            .DIAGNOSTIC_CENTER:
                "Diagnostic Center",
        }

        return labels[
            facility_type
        ]


    # =====================================================
    # OPENING HOURS
    #
    # Supports common OSM formats such as:
    #
    # 24/7
    # Mo-Fr 09:00-17:00
    # Mo-Fr 09:00-17:00; Sa 09:00-13:00
    #
    # Complex OSM expressions safely return UNKNOWN.
    # =====================================================

    def _get_open_status(
        self,
        opening_hours: (
            str
            | None
        ),
        timezone_name: str,
    ) -> FacilityOpenStatus:
        if not opening_hours:
            return (
                FacilityOpenStatus
                .UNKNOWN
            )

        value = (
            opening_hours
            .strip()
        )

        if value == "24/7":
            return (
                FacilityOpenStatus
                .OPEN
            )

        try:
            timezone = ZoneInfo(
                timezone_name
            )

        except (
            ZoneInfoNotFoundError,
            ValueError,
        ):
            timezone = ZoneInfo(
                "UTC"
            )

        now = datetime.now(
            timezone
        )

        today_code = (
            DAY_CODES[
                now.weekday()
            ]
        )

        current_time = (
            now
            .timetz()
            .replace(
                tzinfo=None
            )
        )

        segments = [
            segment.strip()

            for segment in (
                value.split(";")
            )

            if segment.strip()
        ]

        matching_day_found = (
            False
        )

        unparsed_found = (
            False
        )

        for segment in segments:
            parsed = (
                self._parse_segment(
                    segment
                )
            )

            if parsed is None:
                unparsed_found = (
                    True
                )
                continue

            days, body = parsed

            if (
                today_code
                not in days
            ):
                continue

            matching_day_found = (
                True
            )

            if body.lower() in {
                "off",
                "closed",
            }:
                continue

            intervals = (
                body.split(",")
            )

            parsed_interval = (
                False
            )

            for interval in intervals:
                interval = (
                    interval.strip()
                )

                if "-" not in interval:
                    unparsed_found = (
                        True
                    )
                    continue

                start_text, end_text = (
                    interval.split(
                        "-",
                        1,
                    )
                )

                start_time = (
                    self._parse_time(
                        start_text
                    )
                )

                end_time = (
                    self._parse_time(
                        end_text
                    )
                )

                if (
                    start_time is None
                    or end_time is None
                ):
                    unparsed_found = (
                        True
                    )
                    continue

                parsed_interval = (
                    True
                )

                if (
                    self
                    ._time_is_inside(
                        current_time,
                        start_time,
                        end_time,
                    )
                ):
                    return (
                        FacilityOpenStatus
                        .OPEN
                    )

            if (
                not parsed_interval
                and body.lower()
                not in {
                    "off",
                    "closed",
                }
            ):
                unparsed_found = (
                    True
                )

        if unparsed_found:
            return (
                FacilityOpenStatus
                .UNKNOWN
            )

        if matching_day_found:
            return (
                FacilityOpenStatus
                .CLOSED
            )

        return (
            FacilityOpenStatus
            .CLOSED
        )


    def _parse_segment(
        self,
        segment: str,
    ):
        parts = (
            segment
            .strip()
            .split(
                maxsplit=1
            )
        )

        if len(parts) == 1:
            body = parts[0]

            if (
                ":" in body
                or body.lower()
                in {
                    "off",
                    "closed",
                }
            ):
                return (
                    set(
                        DAY_CODES
                    ),
                    body,
                )

            return None

        possible_days = (
            parts[0]
        )

        body = parts[1]

        days = (
            self._expand_days(
                possible_days
            )
        )

        if days is None:
            return None

        return (
            days,
            body,
        )


    def _expand_days(
        self,
        day_expression: str,
    ):
        result = set()

        pieces = (
            day_expression
            .split(",")
        )

        for piece in pieces:
            piece = piece.strip()

            if "-" in piece:
                start, end = (
                    piece.split(
                        "-",
                        1,
                    )
                )

                if (
                    start
                    not in DAY_CODES
                    or end
                    not in DAY_CODES
                ):
                    return None

                start_index = (
                    DAY_CODES.index(
                        start
                    )
                )

                end_index = (
                    DAY_CODES.index(
                        end
                    )
                )

                index = start_index

                while True:
                    result.add(
                        DAY_CODES[
                            index
                        ]
                    )

                    if index == end_index:
                        break

                    index = (
                        index + 1
                    ) % 7

            else:
                if (
                    piece
                    not in DAY_CODES
                ):
                    return None

                result.add(
                    piece
                )

        return result


    def _parse_time(
        self,
        value: str,
    ) -> (
        time
        | None
    ):
        value = value.strip()

        if value == "24:00":
            return time(
                23,
                59,
                59,
            )

        try:
            return (
                datetime.strptime(
                    value,
                    "%H:%M",
                )
                .time()
            )

        except ValueError:
            return None


    def _time_is_inside(
        self,
        current: time,
        start: time,
        end: time,
    ) -> bool:
        if start <= end:
            return (
                start
                <= current
                <= end
            )

        # Overnight:
        # 22:00 -> 02:00

        return (
            current >= start
            or current <= end
        )