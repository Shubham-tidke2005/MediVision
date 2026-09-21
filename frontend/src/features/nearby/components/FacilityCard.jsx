import {
  Building2,
  Clock3,
  ExternalLink,
  FlaskConical,
  Hospital,
  MapPin,
  Navigation,
  Phone,
  Pill,
} from "lucide-react";


function getFacilityIcon(
  type
) {
  switch (
    type
  ) {
    case "HOSPITAL":
      return Hospital;

    case "PHARMACY":
      return Pill;

    case "DIAGNOSTIC_CENTER":
      return FlaskConical;

    default:
      return Building2;
  }
}


function getFacilityLabel(
  type
) {
  const labels = {
    HOSPITAL:
      "Hospital",

    CLINIC:
      "Clinic",

    PHARMACY:
      "Pharmacy",

    DIAGNOSTIC_CENTER:
      "Diagnostic Center",
  };

  return (
    labels[
      type
    ]
    ?? type
  );
}


function getStatusClass(
  status
) {
  if (
    status
    === "OPEN"
  ) {
    return (
      "bg-emerald-50 text-emerald-700"
    );
  }

  if (
    status
    === "CLOSED"
  ) {
    return (
      "bg-rose-50 text-rose-700"
    );
  }

  return (
    "bg-slate-100 text-slate-600"
  );
}


function getStatusLabel(
  status
) {
  if (
    status
    === "OPEN"
  ) {
    return "Open now";
  }

  if (
    status
    === "CLOSED"
  ) {
    return "Closed";
  }

  return (
    "Hours unavailable"
  );
}


export default function FacilityCard({
  facility,
}) {
  const Icon =
    getFacilityIcon(
      facility.facility_type
    );


  const mapUrl =
    (
      "https://www.openstreetmap.org/"
      + `?mlat=${facility.latitude}`
      + `&mlon=${facility.longitude}`
      + "#map=17/"
      + `${facility.latitude}/`
      + `${facility.longitude}`
    );


  const directionsUrl =
    (
      "https://www.google.com/maps/"
      + "dir/?api=1"
      + "&destination="
      + encodeURIComponent(
        `${facility.latitude},${facility.longitude}`
      )
    );


  return (
    <article
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-blue-50
            text-blue-600
          "
        >
          <Icon
            className="h-5 w-5"
          />
        </div>


        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-start
              justify-between
              gap-2
            "
          >
            <div>
              <h3
                className="
                  font-bold
                  leading-6
                  text-slate-900
                "
              >
                {
                  facility.name
                }
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-blue-600
                "
              >
                {
                  getFacilityLabel(
                    facility.facility_type
                  )
                }
              </p>
            </div>


            <span
              className={`
                rounded-full
                px-2.5
                py-1
                text-xs
                font-semibold

                ${getStatusClass(
                  facility.open_status
                )}
              `}
            >
              {
                getStatusLabel(
                  facility.open_status
                )
              }
            </span>
          </div>


          <div
            className="
              mt-4
              space-y-2
              text-sm
              text-slate-600
            "
          >
            <div
              className="
                flex
                items-start
                gap-2
              "
            >
              <Navigation
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-slate-400
                "
              />

              <span>
                {
                  facility.distance_km
                }{" "}
                km away
              </span>
            </div>


            <div
              className="
                flex
                items-start
                gap-2
              "
            >
              <MapPin
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-slate-400
                "
              />

              <span>
                {
                  facility.address
                  || "Address unavailable"
                }
              </span>
            </div>


            {facility.opening_hours
              && (
                <div
                  className="
                    flex
                    items-start
                    gap-2
                  "
                >
                  <Clock3
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                      text-slate-400
                    "
                  />

                  <span>
                    {
                      facility.opening_hours
                    }
                  </span>
                </div>
              )}


            {facility.phone
              && (
                <div
                  className="
                    flex
                    items-start
                    gap-2
                  "
                >
                  <Phone
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                      text-slate-400
                    "
                  />

                  <span>
                    {
                      facility.phone
                    }
                  </span>
                </div>
              )}
          </div>


          <div
            className="
              mt-5
              flex
              flex-wrap
              gap-2
            "
          >
            <a
              href={
                mapUrl
              }
              target="_blank"
              rel="noreferrer"
              className="
                inline-flex
                min-h-[38px]
                items-center
                gap-2
                rounded-lg
                border
                border-slate-200
                px-3
                text-sm
                font-semibold
                text-slate-700

                hover:bg-slate-50
              "
            >
              <ExternalLink
                className="h-4 w-4"
              />

              View Map
            </a>


            <a
              href={
                directionsUrl
              }
              target="_blank"
              rel="noreferrer"
              className="
                inline-flex
                min-h-[38px]
                items-center
                gap-2
                rounded-lg
                bg-blue-600
                px-3
                text-sm
                font-semibold
                text-white

                hover:bg-blue-700
              "
            >
              <Navigation
                className="h-4 w-4"
              />

              Directions
            </a>


            {facility.website
              && (
                <a
                  href={
                    facility.website
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                    inline-flex
                    min-h-[38px]
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-slate-200
                    px-3
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Website

                  <ExternalLink
                    className="h-4 w-4"
                  />
                </a>
              )}
          </div>
        </div>
      </div>
    </article>
  );
}