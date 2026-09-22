import {
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Hospital,
  LoaderCircle,
  MapPin,
  ShieldAlert,
} from "lucide-react";

import {
  createSOS,
  getCurrentSOS,
  getSOSConfig,
  recordSOSAction,
  updateSOSLocation,
  updateSOSStatus,
} from "@/features/sos/api/sosApi";

import {
  getNearbyHealthcare,
} from "@/features/nearby/api/nearbyApi";

import SOSActions
  from "@/features/sos/components/SOSActions";

import SOSStatusCard
  from "@/features/sos/components/SOSStatusCard";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


function getCurrentLocation() {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      if (
        !navigator.geolocation
      ) {
        reject(
          new Error(
            "Geolocation is not supported by this browser."
          )
        );

        return;
      }

      navigator
        .geolocation
        .getCurrentPosition(
          (
            position
          ) => {
            resolve({
              latitude:
                position
                  .coords
                  .latitude,

              longitude:
                position
                  .coords
                  .longitude,

              accuracy:
                position
                  .coords
                  .accuracy,
            });
          },

          (
            error
          ) => {
            reject(
              error
            );
          },

          {
            enableHighAccuracy:
              true,

            maximumAge:
              0,

            timeout:
              15000,
          }
        );
    }
  );
}


export default function EmergencySOSPage() {
  const queryClient =
    useQueryClient();


  const [
    emergencyContactName,
    setEmergencyContactName,
  ] = useState("");


  const [
    emergencyContactPhone,
    setEmergencyContactPhone,
  ] = useState("");


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    shareLocationInitially,
    setShareLocationInitially,
  ] = useState(false);


  const [
    locationMessage,
    setLocationMessage,
  ] = useState("");


  const [
    showHospitals,
    setShowHospitals,
  ] = useState(false);


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


  const {
    data: config,
  } = useQuery({
    queryKey: [
      "sos-config",
    ],

    queryFn:
      getSOSConfig,
  });


  const {
    data: currentEvent,
    isLoading:
      currentLoading,
    isError:
      currentError,
    error:
      currentErrorValue,
  } = useQuery({
    queryKey: [
      "current-sos",
    ],

    queryFn:
      getCurrentSOS,

    refetchOnWindowFocus:
      false,
  });


  const createMutation =
    useMutation({
      mutationFn:
        createSOS,

      onSuccess:
        (
          event
        ) => {
          queryClient
            .setQueryData(
              [
                "current-sos",
              ],
              event
            );

          setLocationMessage(
            ""
          );
        },
    });


  const statusMutation =
    useMutation({
      mutationFn:
        ({
          eventId,
          status,
        }) =>
          updateSOSStatus(
            eventId,
            status
          ),

      onSuccess:
        (
          event
        ) => {
          queryClient
            .setQueryData(
              [
                "current-sos",
              ],
              (
                event.status
                === "RESOLVED"
                || event.status
                === "CANCELLED"
              )
                ? null
                : event
            );

          queryClient
            .invalidateQueries({
              queryKey: [
                "sos-history",
              ],
            });
        },
    });


  const locationMutation =
    useMutation({
      mutationFn:
        ({
          eventId,
          location,
        }) =>
          updateSOSLocation(
            eventId,
            location
          ),

      onSuccess:
        (
          event
        ) => {
          queryClient
            .setQueryData(
              [
                "current-sos",
              ],
              event
            );

          setLocationMessage(
            "Location shared successfully."
          );
        },
    });


  const hospitalsQuery =
    useQuery({
      queryKey: [
        "sos-nearby-hospitals",

        currentEvent
          ?.latitude,

        currentEvent
          ?.longitude,

        timezone,
      ],

      queryFn: () =>
        getNearbyHealthcare({
          latitude:
            currentEvent.latitude,

          longitude:
            currentEvent.longitude,

          radiusKm:
            10,

          facilityType:
            "HOSPITAL",

          openNow:
            false,

          timezone,
        }),

      enabled:
        Boolean(
          showHospitals
          && currentEvent
            ?.latitude
          != null
          && currentEvent
            ?.longitude
          != null
        ),

      refetchOnWindowFocus:
        false,
    });


  async function handleTriggerSOS() {
    let location = null;


    setLocationMessage(
      ""
    );


    if (
      shareLocationInitially
    ) {
      try {
        location =
          await getCurrentLocation();

      } catch {
        setLocationMessage(
          "Current location could not be obtained. SOS will still be activated without location sharing."
        );
      }
    }


    createMutation.mutate({
      share_location:
        Boolean(
          location
        ),

      latitude:
        location
          ?.latitude
        ?? null,

      longitude:
        location
          ?.longitude
        ?? null,

      location_accuracy_m:
        location
          ?.accuracy
        ?? null,

      emergency_contact_name:
        emergencyContactName
          .trim()
        || null,

      emergency_contact_phone:
        emergencyContactPhone
          .trim()
        || null,

      message:
        message.trim()
        || null,
    });
  }


  async function logAction(
    actionType
  ) {
    if (
      !currentEvent
    ) {
      return;
    }

    try {
      await recordSOSAction(
        currentEvent.id,
        actionType
      );

    } catch (
      error
    ) {
      console.error(
        "Unable to log SOS action:",
        error
      );
    }
  }


  async function handleCallEmergency() {
    const number =
      config
        ?.emergency_phone_number;

    if (!number) {
      return;
    }

    await logAction(
      "EMERGENCY_NUMBER_OPENED"
    );

    window.location.href =
      `tel:${number}`;
  }


  async function handleCallContact() {
    const number =
      currentEvent
        ?.emergency_contact_phone;

    if (!number) {
      return;
    }

    await logAction(
      "EMERGENCY_CONTACT_OPENED"
    );

    window.location.href =
      `tel:${number}`;
  }


  async function handleShareLocation() {
    if (
      !currentEvent
    ) {
      return;
    }

    setLocationMessage(
      ""
    );

    try {
      const location =
        await getCurrentLocation();

      locationMutation.mutate({
        eventId:
          currentEvent.id,

        location,
      });

    } catch {
      setLocationMessage(
        "Unable to access your current location. Check browser location permission and try again."
      );
    }
  }


  async function handleFindHospitals() {
    if (
      !currentEvent
    ) {
      return;
    }


    if (
      currentEvent.latitude
      == null
      || currentEvent.longitude
      == null
    ) {
      setLocationMessage(
        "Share your current location first to search for nearby hospitals."
      );

      return;
    }


    await logAction(
      "NEARBY_HOSPITALS_OPENED"
    );

    setShowHospitals(
      true
    );
  }


  function handleStatus(
    newStatus
  ) {
    if (
      !currentEvent
    ) {
      return;
    }


    if (
      newStatus
      === "CANCELLED"
      && !window.confirm(
        "Cancel this SOS event?"
      )
    ) {
      return;
    }


    if (
      newStatus
      === "RESOLVED"
      && !window.confirm(
        "Mark this SOS event as resolved?"
      )
    ) {
      return;
    }


    statusMutation.mutate({
      eventId:
        currentEvent.id,

      status:
        newStatus,
    });
  }


  const hospitals =
    hospitalsQuery
      .data
      ?.facilities
      ?.slice(
        0,
        5
      )
    ?? [];


  return (
    <div
      className="
        mx-auto
        max-w-5xl
        space-y-6
        pb-10
      "
    >
      {/* HEADER */}

      <section>
        <div
          className="
            flex
            items-center
            gap-2
            text-rose-600
          "
        >
          <ShieldAlert
            className="h-5 w-5"
          />

          <span
            className="
              text-sm
              font-semibold
            "
          >
            Emergency Support
          </span>
        </div>


        <h1
          className="
            mt-2
            text-2xl
            font-bold
            text-slate-900

            sm:text-3xl
          "
        >
          Emergency SOS
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
          Quickly access emergency
          calling, your emergency contact,
          optional location sharing and
          nearby hospitals.
        </p>
      </section>


      {/* SAFETY NOTICE */}

      <section
        className="
          flex
          items-start
          gap-3
          rounded-xl
          border
          border-rose-200
          bg-rose-50
          p-4
        "
      >
        <AlertTriangle
          className="
            mt-0.5
            h-5
            w-5
            shrink-0
            text-rose-600
          "
        />

        <div>
          <p
            className="
              text-sm
              font-bold
              text-rose-900
            "
          >
            Important
          </p>

          <p
            className="
              mt-1
              text-sm
              leading-6
              text-rose-800
            "
          >
            MediVision SOS provides
            emergency-support shortcuts.
            It does not automatically
            contact emergency services,
            dispatch an ambulance, or
            confirm that help is on the way.
          </p>
        </div>
      </section>


      {currentLoading
        && (
          <div
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
                text-rose-600
              "
            />
          </div>
        )}


      {currentError
        && (
          <div
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
                currentErrorValue,
                "Unable to load SOS information."
              )
            }
          </div>
        )}


      {/* NO ACTIVE SOS */}

      {!currentLoading
        && !currentEvent
        && (
          <section
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm

              sm:p-8
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-rose-100
                text-rose-700
              "
            >
              <AlertTriangle
                className="h-8 w-8"
              />
            </div>


            <div
              className="
                mx-auto
                mt-6
                max-w-xl
                space-y-4
              "
            >
              <div>
                <label
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Emergency Contact Name
                </label>

                <input
                  value={
                    emergencyContactName
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEmergencyContactName(
                        event.target.value
                      )
                  }
                  placeholder="Example: Family member"
                  maxLength={120}
                  className="
                    mt-2
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    outline-none

                    focus:border-blue-500
                  "
                />
              </div>


              <div>
                <label
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Emergency Contact Phone
                </label>

                <input
                  value={
                    emergencyContactPhone
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEmergencyContactPhone(
                        event.target.value
                      )
                  }
                  placeholder="+91..."
                  maxLength={32}
                  className="
                    mt-2
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    outline-none

                    focus:border-blue-500
                  "
                />
              </div>


              <div>
                <label
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Optional Message
                </label>

                <textarea
                  value={
                    message
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setMessage(
                        event.target.value
                      )
                  }
                  maxLength={500}
                  rows={3}
                  placeholder="Optional emergency note"
                  className="
                    mt-2
                    w-full
                    resize-none
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2.5
                    outline-none

                    focus:border-blue-500
                  "
                />
              </div>


              <label
                className="
                  flex
                  cursor-pointer
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-4
                "
              >
                <input
                  type="checkbox"
                  checked={
                    shareLocationInitially
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setShareLocationInitially(
                        event.target.checked
                      )
                  }
                  className="
                    mt-1
                    h-4
                    w-4
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
                    Share my current location
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    Optional. Your location
                    will be stored with this
                    SOS event only when you
                    choose to share it.
                  </p>
                </div>
              </label>


              <button
                type="button"
                onClick={
                  handleTriggerSOS
                }
                disabled={
                  createMutation.isPending
                }
                className="
                  flex
                  min-h-[56px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  bg-rose-600
                  px-6
                  text-base
                  font-bold
                  text-white
                  shadow-sm

                  hover:bg-rose-700

                  disabled:opacity-60
                "
              >
                {createMutation.isPending
                  ? (
                    <LoaderCircle
                      className="
                        h-5
                        w-5
                        animate-spin
                      "
                    />
                  )
                  : (
                    <AlertTriangle
                      className="h-5 w-5"
                    />
                  )}

                ACTIVATE SOS
              </button>


              {createMutation.isError
                && (
                  <p
                    className="
                      text-sm
                      text-rose-600
                    "
                  >
                    {
                      getApiErrorMessage(
                        createMutation.error,
                        "Unable to activate SOS."
                      )
                    }
                  </p>
                )}
            </div>
          </section>
        )}


      {/* ACTIVE SOS */}

      {currentEvent
        && (
          <>
            <SOSStatusCard
              event={
                currentEvent
              }
            />


            <SOSActions
              event={
                currentEvent
              }

              config={
                config
              }

              sharingLocation={
                locationMutation.isPending
              }

              findingHospitals={
                hospitalsQuery.isFetching
              }

              onCallEmergency={
                handleCallEmergency
              }

              onCallContact={
                handleCallContact
              }

              onShareLocation={
                handleShareLocation
              }

              onFindHospitals={
                handleFindHospitals
              }
            />


            {/* LOCATION */}

            {currentEvent.share_location
              && (
                <section
                  className="
                    rounded-xl
                    border
                    border-blue-200
                    bg-blue-50
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <MapPin
                      className="
                        mt-0.5
                        h-5
                        w-5
                        text-blue-600
                      "
                    />

                    <div
                      className="
                        text-sm
                        text-blue-900
                      "
                    >
                      <p
                        className="font-bold"
                      >
                        Location shared
                      </p>

                      <p
                        className="mt-1"
                      >
                        Latitude:{" "}
                        {
                          currentEvent.latitude
                        }
                      </p>

                      <p>
                        Longitude:{" "}
                        {
                          currentEvent.longitude
                        }
                      </p>

                      {currentEvent
                        .location_accuracy_m
                        != null
                        && (
                          <p>
                            Estimated accuracy:{" "}
                            {Math.round(
                              currentEvent
                                .location_accuracy_m
                            )}{" "}
                            meters
                          </p>
                        )}
                    </div>
                  </div>
                </section>
              )}


            {locationMessage
              && (
                <div
                  className="
                    rounded-xl
                    border
                    border-amber-200
                    bg-amber-50
                    p-4
                    text-sm
                    text-amber-800
                  "
                >
                  {
                    locationMessage
                  }
                </div>
              )}


            {/* NEARBY HOSPITALS */}

            {showHospitals
              && (
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
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Hospital
                      className="
                        h-5
                        w-5
                        text-blue-600
                      "
                    />

                    <h2
                      className="
                        text-lg
                        font-bold
                        text-slate-900
                      "
                    >
                      Nearby Hospitals
                    </h2>
                  </div>


                  {hospitalsQuery
                    .isLoading
                    && (
                      <LoaderCircle
                        className="
                          mt-6
                          h-6
                          w-6
                          animate-spin
                          text-blue-600
                        "
                      />
                    )}


                  {hospitalsQuery
                    .isError
                    && (
                      <p
                        className="
                          mt-4
                          text-sm
                          text-rose-600
                        "
                      >
                        Unable to load
                        nearby hospitals.
                      </p>
                    )}


                  {!hospitalsQuery
                    .isLoading
                    && !hospitalsQuery
                      .isError
                    && hospitals.length
                    === 0
                    && (
                      <p
                        className="
                          mt-4
                          text-sm
                          text-slate-500
                        "
                      >
                        No hospital data was
                        found within 10 km.
                      </p>
                    )}


                  <div
                    className="
                      mt-4
                      space-y-3
                    "
                  >
                    {hospitals.map(
                      (
                        hospital
                      ) => {
                        const directions =
                          (
                            "https://www.google.com/maps/"
                            + "dir/?api=1"
                            + "&destination="
                            + encodeURIComponent(
                              `${hospital.latitude},${hospital.longitude}`
                            )
                          );

                        return (
                          <div
                            key={
                              hospital.provider_id
                            }
                            className="
                              rounded-lg
                              border
                              border-slate-200
                              p-4
                            "
                          >
                            <div
                              className="
                                flex
                                justify-between
                                gap-4
                              "
                            >
                              <div>
                                <p
                                  className="
                                    font-bold
                                    text-slate-900
                                  "
                                >
                                  {
                                    hospital.name
                                  }
                                </p>

                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                  "
                                >
                                  {
                                    hospital.distance_km
                                  }{" "}
                                  km away
                                </p>

                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                  "
                                >
                                  {
                                    hospital.address
                                    || "Address unavailable"
                                  }
                                </p>
                              </div>


                              <a
                                href={
                                  directions
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="
                                  inline-flex
                                  h-10
                                  shrink-0
                                  items-center
                                  gap-2
                                  rounded-lg
                                  bg-blue-600
                                  px-3
                                  text-sm
                                  font-semibold
                                  text-white
                                "
                              >
                                Directions

                                <ExternalLink
                                  className="h-4 w-4"
                                />
                              </a>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </section>
              )}


            {/* STATUS CONTROLS */}

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
                  font-bold
                  text-slate-900
                "
              >
                SOS Event Status
              </h2>


              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-3
                "
              >
                {currentEvent.status
                  === "TRIGGERED"
                  && (
                    <button
                      type="button"
                      disabled={
                        statusMutation
                          .isPending
                      }
                      onClick={() =>
                        handleStatus(
                          "ACKNOWLEDGED"
                        )
                      }
                      className="
                        rounded-lg
                        border
                        border-blue-200
                        bg-blue-50
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-blue-700
                      "
                    >
                      Acknowledge Event
                    </button>
                  )}


                <button
                  type="button"
                  disabled={
                    statusMutation
                      .isPending
                  }
                  onClick={() =>
                    handleStatus(
                      "RESOLVED"
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-emerald-600
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  <CheckCircle2
                    className="h-4 w-4"
                  />

                  Mark Resolved
                </button>


                <button
                  type="button"
                  disabled={
                    statusMutation
                      .isPending
                  }
                  onClick={() =>
                    handleStatus(
                      "CANCELLED"
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-slate-300
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Cancel SOS
                </button>
              </div>


              {statusMutation
                .isError
                && (
                  <p
                    className="
                      mt-3
                      text-sm
                      text-rose-600
                    "
                  >
                    {
                      getApiErrorMessage(
                        statusMutation.error,
                        "Unable to update SOS status."
                      )
                    }
                  </p>
                )}
            </section>
          </>
        )}
    </div>
  );
}