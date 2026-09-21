import {
  useMemo,
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Building2,
  Info,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Navigation,
  ShieldCheck,
} from "lucide-react";

import FacilityCard
  from "@/features/nearby/components/FacilityCard";

import HealthcareMap
  from "@/features/nearby/components/HealthcareMap";

import NearbyFilters
  from "@/features/nearby/components/NearbyFilters";

import {
  getNearbyHealthcare,
} from "@/features/nearby/api/nearbyApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


export default function NearbyHealthcarePage() {
  // =====================================================
  // LOCATION STATE
  // =====================================================

  const [
    location,
    setLocation,
  ] = useState(null);


  const [
    locationAccuracy,
    setLocationAccuracy,
  ] = useState(null);


  const [
    locationError,
    setLocationError,
  ] = useState("");


  const [
    locating,
    setLocating,
  ] = useState(false);


  // =====================================================
  // FILTER STATE
  // =====================================================

  const [
    facilityType,
    setFacilityType,
  ] = useState("ALL");


  const [
    radiusKm,
    setRadiusKm,
  ] = useState(5);


  const [
    openNow,
    setOpenNow,
  ] = useState(false);


  // =====================================================
  // BROWSER TIMEZONE
  // =====================================================

  const timezone = useMemo(
    () => {
      try {
        return (
          Intl
            .DateTimeFormat()
            .resolvedOptions()
            .timeZone
          || "UTC"
        );

      } catch {
        return "UTC";
      }
    },
    []
  );


  // =====================================================
  // NEARBY HEALTHCARE QUERY
  // =====================================================

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "nearby-healthcare",

      location?.latitude,

      location?.longitude,

      radiusKm,

      facilityType,

      openNow,

      timezone,
    ],

    queryFn: () =>
      getNearbyHealthcare({
        latitude:
          location.latitude,

        longitude:
          location.longitude,

        radiusKm,

        facilityType,

        openNow,

        timezone,
      }),

    enabled:
      Boolean(
        location
      ),

    refetchOnWindowFocus:
      false,
  });


  // =====================================================
  // GET CURRENT LOCATION
  // =====================================================

  function requestLocation() {
    setLocationError("");

    setLocationAccuracy(
      null
    );


    if (
      !navigator.geolocation
    ) {
      setLocationError(
        "Geolocation is not supported by this browser."
      );

      return;
    }


    setLocating(
      true
    );


    navigator.geolocation.getCurrentPosition(
      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      (
        position
      ) => {
        const latitude =
          position
            .coords
            .latitude;


        const longitude =
          position
            .coords
            .longitude;


        const accuracy =
          position
            .coords
            .accuracy;


        console.log(
          "Browser location:",
          {
            latitude,
            longitude,

            accuracyMeters:
              accuracy,
          }
        );


        setLocation({
          latitude,
          longitude,
        });


        setLocationAccuracy(
          accuracy
        );


        setLocating(
          false
        );
      },


      // -------------------------------------------------
      // ERROR
      // -------------------------------------------------

      (
        geolocationError
      ) => {
        setLocating(
          false
        );


        console.error(
          "Geolocation error:",
          geolocationError
        );


        if (
          geolocationError.code
          === geolocationError
            .PERMISSION_DENIED
        ) {
          setLocationError(
            "Location permission was denied. Please allow location access in your browser."
          );

          return;
        }


        if (
          geolocationError.code
          === geolocationError
            .POSITION_UNAVAILABLE
        ) {
          setLocationError(
            "Your current location could not be determined."
          );

          return;
        }


        if (
          geolocationError.code
          === geolocationError
            .TIMEOUT
        ) {
          setLocationError(
            "Location request timed out. Please try again."
          );

          return;
        }


        setLocationError(
          "Unable to access your current location."
        );
      },


      // -------------------------------------------------
      // LOCATION OPTIONS
      // -------------------------------------------------

      {
        enableHighAccuracy:
          true,

        // Do not use cached location.
        maximumAge:
          0,

        timeout:
          15000,
      }
    );
  }


  // =====================================================
  // RESULT DATA
  // =====================================================

  const facilities =
    data?.facilities
    ?? [];


  const roundedAccuracy =
    locationAccuracy !== null
      ? Math.round(
          locationAccuracy
        )
      : null;


  const lowAccuracy =
    roundedAccuracy !== null
    && roundedAccuracy > 1000;


  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      {/* ================================================= */}
      {/* HEADER                                            */}
      {/* ================================================= */}

      <section>
        <div
          className="
            flex
            items-center
            gap-2
            text-blue-600
          "
        >
          <MapPin
            className="h-5 w-5"
          />

          <span
            className="
              text-sm
              font-semibold
            "
          >
            Location Services
          </span>
        </div>


        <div
          className="
            mt-2
            flex
            flex-col
            justify-between
            gap-4

            lg:flex-row
            lg:items-end
          "
        >
          <div>
            <h1
              className="
                text-2xl
                font-bold
                tracking-tight
                text-slate-900

                sm:text-3xl
              "
            >
              Nearby Healthcare
            </h1>


            <p
              className="
                mt-2
                max-w-3xl
                text-sm
                leading-6
                text-slate-500
              "
            >
              Find hospitals, clinics,
              pharmacies and diagnostic
              centers near your current
              location.
            </p>
          </div>


          <button
            type="button"
            onClick={
              requestLocation
            }
            disabled={
              locating
            }
            className="
              inline-flex
              min-h-[44px]
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-blue-600
              px-4
              text-sm
              font-semibold
              text-white

              hover:bg-blue-700

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {locating
              ? (
                <LoaderCircle
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                />
              )
              : (
                <LocateFixed
                  className="h-4 w-4"
                />
              )}


            {locating
              ? "Getting Location..."
              : location
                ? "Refresh My Location"
                : "Use My Location"}
          </button>
        </div>
      </section>


      {/* ================================================= */}
      {/* PRIVACY NOTICE                                    */}
      {/* ================================================= */}

      <section
        className="
          flex
          items-start
          gap-3
          rounded-xl
          border
          border-sky-200
          bg-sky-50
          p-4
        "
      >
        <ShieldCheck
          className="
            mt-0.5
            h-5
            w-5
            shrink-0
            text-sky-600
          "
        />

        <div>
          <p
            className="
              text-sm
              font-semibold
              text-sky-900
            "
          >
            Location privacy
          </p>


          <p
            className="
              mt-1
              text-sm
              leading-6
              text-sky-800
            "
          >
            Your browser location is used
            only to perform this nearby
            search. MediVision does not
            store your live location in
            the database in this module.
          </p>
        </div>
      </section>


      {/* ================================================= */}
      {/* LOCATION ERROR                                    */}
      {/* ================================================= */}

      {locationError
        && (
          <section
            className="
              rounded-xl
              border
              border-rose-200
              bg-rose-50
              p-4
              text-sm
              text-rose-700
            "
          >
            {
              locationError
            }
          </section>
        )}


      {/* ================================================= */}
      {/* LOCATION INFORMATION                              */}
      {/* ================================================= */}

      {location
        && (
          <section
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              p-4
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
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-blue-50
                  text-blue-600
                "
              >
                <LocateFixed
                  className="h-5 w-5"
                />
              </div>


              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  Browser Location
                </p>


                <div
                  className="
                    mt-2
                    space-y-1
                    text-sm
                    text-slate-600
                  "
                >
                  <p>
                    <span
                      className="font-semibold"
                    >
                      Latitude:
                    </span>{" "}
                    {
                      location.latitude
                    }
                  </p>


                  <p>
                    <span
                      className="font-semibold"
                    >
                      Longitude:
                    </span>{" "}
                    {
                      location.longitude
                    }
                  </p>


                  {roundedAccuracy !== null
                    && (
                      <p>
                        <span
                          className="font-semibold"
                        >
                          Estimated accuracy:
                        </span>{" "}
                        approximately{" "}
                        {
                          roundedAccuracy
                        }{" "}
                        meters
                      </p>
                    )}
                </div>
              </div>
            </div>
          </section>
        )}


      {/* ================================================= */}
      {/* POOR ACCURACY WARNING                             */}
      {/* ================================================= */}

      {location
        && lowAccuracy
        && (
          <section
            className="
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              p-4
            "
          >
            <Info
              className="
                mt-0.5
                h-5
                w-5
                shrink-0
                text-amber-600
              "
            />

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-amber-900
                "
              >
                Location accuracy is low
              </p>


              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-amber-800
                "
              >
                Your browser estimates that
                this location may be inaccurate
                by approximately{" "}
                {
                  roundedAccuracy
                }{" "}
                meters. On desktop computers,
                location may be estimated using
                Wi-Fi or network information
                instead of GPS.
              </p>
            </div>
          </section>
        )}


      {/* ================================================= */}
      {/* BEFORE LOCATION                                   */}
      {/* ================================================= */}

      {!location
        && (
          <section
            className="
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-white
              px-6
              py-14
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-blue-50
                text-blue-600
              "
            >
              <Navigation
                className="h-7 w-7"
              />
            </div>


            <h2
              className="
                mt-5
                text-lg
                font-bold
                text-slate-900
              "
            >
              Find healthcare near you
            </h2>


            <p
              className="
                mx-auto
                mt-2
                max-w-lg
                text-sm
                leading-6
                text-slate-500
              "
            >
              Click Use My Location and
              allow browser location access.
              You can then filter nearby
              healthcare by facility type,
              distance and opening status.
            </p>
          </section>
        )}


      {/* ================================================= */}
      {/* AFTER LOCATION                                    */}
      {/* ================================================= */}

      {location
        && (
          <>
            <NearbyFilters
              facilityType={
                facilityType
              }
              onFacilityTypeChange={
                setFacilityType
              }

              radiusKm={
                radiusKm
              }
              onRadiusChange={
                setRadiusKm
              }

              openNow={
                openNow
              }
              onOpenNowChange={
                setOpenNow
              }

              disabled={
                isLoading
              }
            />


            {/* =========================================== */}
            {/* API ERROR                                   */}
            {/* =========================================== */}

            {isError
              && (
                <section
                  className="
                    rounded-xl
                    border
                    border-rose-200
                    bg-rose-50
                    p-4
                    text-sm
                    text-rose-700
                  "
                >
                  {
                    getApiErrorMessage(
                      error,
                      "Unable to load nearby healthcare facilities."
                    )
                  }
                </section>
              )}


            {/* =========================================== */}
            {/* LOADING                                     */}
            {/* =========================================== */}

            {isLoading
              && (
                <section
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    p-10
                    text-center
                  "
                >
                  <LoaderCircle
                    className="
                      mx-auto
                      h-7
                      w-7
                      animate-spin
                      text-blue-600
                    "
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      text-slate-500
                    "
                  >
                    Searching nearby
                    healthcare facilities...
                  </p>
                </section>
              )}


            {/* =========================================== */}
            {/* RESULTS                                     */}
            {/* =========================================== */}

            {!isLoading
              && !isError
              && data
              && (
                <>
                  <section
                    className="
                      flex
                      flex-wrap
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <div>
                      <h2
                        className="
                          text-lg
                          font-bold
                          text-slate-900
                        "
                      >
                        Nearby Facilities
                      </h2>


                      <p
                        className="
                          mt-1
                          text-sm
                          text-slate-500
                        "
                      >
                        {
                          data.total
                        }{" "}
                        result
                        {
                          data.total
                          === 1
                            ? ""
                            : "s"
                        }{" "}
                        within{" "}
                        {
                          data.radius_km
                        }{" "}
                        km
                      </p>
                    </div>


                    {isFetching
                      && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            text-xs
                            text-slate-500
                          "
                        >
                          <LoaderCircle
                            className="
                              h-3.5
                              w-3.5
                              animate-spin
                            "
                          />

                          Updating results...
                        </span>
                      )}
                  </section>


                  {/* ===================================== */}
                  {/* MAP                                   */}
                  {/* ===================================== */}

                  <HealthcareMap
                    center={
                      data.center
                    }
                    facilities={
                      facilities
                    }
                    radiusKm={
                      radiusKm
                    }
                  />


                  {/* ===================================== */}
                  {/* OPEN NOW NOTE                         */}
                  {/* ===================================== */}

                  {openNow
                    && (
                      <section
                        className="
                          flex
                          items-start
                          gap-3
                          rounded-xl
                          border
                          border-amber-200
                          bg-amber-50
                          p-4
                        "
                      >
                        <Info
                          className="
                            mt-0.5
                            h-5
                            w-5
                            shrink-0
                            text-amber-600
                          "
                        />

                        <p
                          className="
                            text-sm
                            leading-6
                            text-amber-800
                          "
                        >
                          Open-now results
                          depend on available
                          facility opening-hour
                          data. Facilities with
                          missing or complex
                          opening hours are
                          excluded.
                        </p>
                      </section>
                    )}


                  {/* ===================================== */}
                  {/* FACILITY LIST                         */}
                  {/* ===================================== */}

                  {facilities.length
                    > 0
                    ? (
                      <div
                        className="
                          grid
                          grid-cols-1
                          gap-4

                          xl:grid-cols-2
                        "
                      >
                        {facilities.map(
                          (
                            facility
                          ) => (
                            <FacilityCard
                              key={
                                facility.provider_id
                              }
                              facility={
                                facility
                              }
                            />
                          )
                        )}
                      </div>
                    )
                    : (
                      <section
                        className="
                          rounded-xl
                          border
                          border-dashed
                          border-slate-300
                          bg-white
                          p-10
                          text-center
                        "
                      >
                        <Building2
                          className="
                            mx-auto
                            h-9
                            w-9
                            text-slate-400
                          "
                        />

                        <h3
                          className="
                            mt-3
                            font-bold
                            text-slate-900
                          "
                        >
                          No facilities found
                        </h3>

                        <p
                          className="
                            mt-2
                            text-sm
                            text-slate-500
                          "
                        >
                          Try increasing the
                          distance or selecting
                          another facility type.
                        </p>
                      </section>
                    )}
                </>
              )}
          </>
        )}
    </div>
  );
}