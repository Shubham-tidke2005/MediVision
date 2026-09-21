import {
  Building2,
  FlaskConical,
  Hospital,
  Pill,
} from "lucide-react";


const FACILITY_OPTIONS = [
  {
    value: "ALL",
    label: "All",
    icon: Building2,
  },
  {
    value: "HOSPITAL",
    label: "Hospitals",
    icon: Hospital,
  },
  {
    value: "CLINIC",
    label: "Clinics",
    icon: Building2,
  },
  {
    value: "PHARMACY",
    label: "Pharmacies",
    icon: Pill,
  },
  {
    value: "DIAGNOSTIC_CENTER",
    label: "Diagnostic Centers",
    icon: FlaskConical,
  },
];


const DISTANCE_OPTIONS = [
  2,
  5,
  10,
  20,
];


export default function NearbyFilters({
  facilityType,
  onFacilityTypeChange,

  radiusKm,
  onRadiusChange,

  openNow,
  onOpenNowChange,

  disabled = false,
}) {
  return (
    <section
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >
      <h2
        className="
          text-base
          font-bold
          text-slate-900
        "
      >
        Filters
      </h2>


      {/* FACILITY TYPE */}

      <div
        className="mt-5"
      >
        <p
          className="
            text-sm
            font-semibold
            text-slate-700
          "
        >
          Facility Type
        </p>

        <div
          className="
            mt-3
            flex
            flex-wrap
            gap-2
          "
        >
          {FACILITY_OPTIONS.map(
            (
              option
            ) => {
              const Icon =
                option.icon;

              const active =
                facilityType
                === option.value;

              return (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  disabled={
                    disabled
                  }
                  onClick={() =>
                    onFacilityTypeChange(
                      option.value
                    )
                  }
                  className={`
                    inline-flex
                    min-h-[40px]
                    items-center
                    gap-2
                    rounded-lg
                    border
                    px-3
                    text-sm
                    font-semibold
                    transition

                    disabled:cursor-not-allowed
                    disabled:opacity-50

                    ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  <Icon
                    className="h-4 w-4"
                  />

                  {
                    option.label
                  }
                </button>
              );
            }
          )}
        </div>
      </div>


      {/* DISTANCE */}

      <div
        className="mt-6"
      >
        <p
          className="
            text-sm
            font-semibold
            text-slate-700
          "
        >
          Distance
        </p>

        <div
          className="
            mt-3
            flex
            flex-wrap
            gap-2
          "
        >
          {DISTANCE_OPTIONS.map(
            (
              distance
            ) => {
              const active =
                radiusKm
                === distance;

              return (
                <button
                  key={
                    distance
                  }
                  type="button"
                  disabled={
                    disabled
                  }
                  onClick={() =>
                    onRadiusChange(
                      distance
                    )
                  }
                  className={`
                    min-h-[40px]
                    rounded-lg
                    border
                    px-4
                    text-sm
                    font-semibold

                    disabled:cursor-not-allowed
                    disabled:opacity-50

                    ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  {
                    distance
                  }{" "}
                  km
                </button>
              );
            }
          )}
        </div>
      </div>


      {/* OPEN NOW */}

      <label
        className="
          mt-6
          flex
          cursor-pointer
          items-center
          gap-3
          border-t
          border-slate-100
          pt-5
        "
      >
        <input
          type="checkbox"
          checked={
            openNow
          }
          disabled={
            disabled
          }
          onChange={
            (
              event
            ) =>
              onOpenNowChange(
                event.target.checked
              )
          }
          className="
            h-4
            w-4
            rounded
            border-slate-300
          "
        />

        <div>
          <p
            className="
              text-sm
              font-semibold
              text-slate-900
            "
          >
            Open now only
          </p>

          <p
            className="
              text-xs
              text-slate-500
            "
          >
            Facilities with unavailable
            opening-hour data will be excluded.
          </p>
        </div>
      </label>
    </section>
  );
}