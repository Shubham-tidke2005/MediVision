import {
  useEffect,
} from "react";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


function RecenterMap({
  latitude,
  longitude,
  zoom,
}) {
  const map =
    useMap();

  useEffect(
    () => {
      map.setView(
        [
          latitude,
          longitude,
        ],
        zoom
      );
    },
    [
      latitude,
      longitude,
      zoom,
      map,
    ]
  );

  return null;
}


function getZoom(
  radiusKm
) {
  if (
    radiusKm <= 2
  ) {
    return 14;
  }

  if (
    radiusKm <= 5
  ) {
    return 13;
  }

  if (
    radiusKm <= 10
  ) {
    return 12;
  }

  return 11;
}


function getFacilityColor(
  type
) {
  switch (
    type
  ) {
    case "HOSPITAL":
      return "#dc2626";

    case "PHARMACY":
      return "#16a34a";

    case "DIAGNOSTIC_CENTER":
      return "#7c3aed";

    case "CLINIC":
      return "#0284c7";

    default:
      return "#475569";
  }
}


export default function HealthcareMap({
  center,
  facilities = [],
  radiusKm = 5,
}) {
  if (!center) {
    return null;
  }

  const zoom =
    getZoom(
      radiusKm
    );

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      <MapContainer
        center={[
          center.latitude,
          center.longitude,
        ]}
        zoom={zoom}
        scrollWheelZoom={
          false
        }
        className="
          h-[440px]
          w-full
        "
      >
        <RecenterMap
          latitude={
            center.latitude
          }
          longitude={
            center.longitude
          }
          zoom={zoom}
        />


        <TileLayer
          attribution={
            '&copy; OpenStreetMap contributors'
          }
          url={
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />


        {/* USER LOCATION */}

        <CircleMarker
          center={[
            center.latitude,
            center.longitude,
          ]}
          radius={9}
          pathOptions={{
            color:
              "#1d4ed8",

            fillColor:
              "#2563eb",

            fillOpacity:
              0.9,
          }}
        >
          <Popup>
            Your location
          </Popup>
        </CircleMarker>


        {/* FACILITIES */}

        {facilities.map(
          (
            facility
          ) => (
            <CircleMarker
              key={
                facility.provider_id
              }
              center={[
                facility.latitude,
                facility.longitude,
              ]}
              radius={7}
              pathOptions={{
                color:
                  getFacilityColor(
                    facility.facility_type
                  ),

                fillColor:
                  getFacilityColor(
                    facility.facility_type
                  ),

                fillOpacity:
                  0.85,
              }}
            >
              <Popup>
                <div>
                  <strong>
                    {
                      facility.name
                    }
                  </strong>

                  <br />

                  {
                    facility.distance_km
                  }{" "}
                  km away

                  <br />

                  {
                    facility.address
                    || "Address unavailable"
                  }
                </div>
              </Popup>
            </CircleMarker>
          )
        )}
      </MapContainer>
    </div>
  );
}