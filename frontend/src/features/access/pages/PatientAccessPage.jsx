import {
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ShieldCheck,
  Share2,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  getAccessGrants,
  revokeMedicalAccess,
  shareMedicalRecords,
} from "@/features/access/api/accessApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";

import {
  apiClient,
} from "@/api/client";


// ======================================================
// LOAD AVAILABLE DOCTORS
// ======================================================

async function getDoctorsForSharing() {
  const response =
    await apiClient.get(
      "/discovery/doctors"
    );

  return response.data;
}


// ======================================================
// HELPERS
// ======================================================

function doctorName(
  doctor
) {
  if (!doctor) {
    return "Doctor";
  }

  return `Dr. ${
    doctor.first_name ?? ""
  } ${
    doctor.last_name ?? ""
  }`.trim();
}


function formatScope(
  scope
) {
  if (
    scope === "FULL_HISTORY"
  ) {
    return "Full History";
  }

  if (
    scope === "APPOINTMENT_ONLY"
  ) {
    return "Appointment Only";
  }

  return scope
    ?.replaceAll(
      "_",
      " "
    );
}


function formatDate(
  value
) {
  if (!value) {
    return "";
  }

  return new Date(
    value
  ).toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}


// ======================================================
// PAGE
// ======================================================

export default function PatientAccessPage() {
  const queryClient =
    useQueryClient();

  const [
    doctorId,
    setDoctorId,
  ] = useState("");

  const [
    scope,
    setScope,
  ] = useState(
    "APPOINTMENT_ONLY"
  );

  const [
    expiresAt,
    setExpiresAt,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  // ====================================================
  // ACCESS GRANTS
  // ====================================================

  const {
    data: grants = [],
    isLoading:
      grantsLoading,
    isError:
      grantsError,
    error:
      grantsQueryError,
  } = useQuery({
    queryKey: [
      "medical-access-grants",
    ],

    queryFn:
      getAccessGrants,
  });


  // ====================================================
  // DOCTORS
  // ====================================================

  const {
    data:
      doctorResponse,
    isLoading:
      doctorsLoading,
    isError:
      doctorsError,
  } = useQuery({
    queryKey: [
      "doctors-for-record-sharing",
    ],

    queryFn:
      getDoctorsForSharing,
  });


  const doctors =
    Array.isArray(
      doctorResponse
    )
      ? doctorResponse
      : (
          doctorResponse
            ?.items
          ?? doctorResponse
            ?.doctors
          ?? []
        );


  // ====================================================
  // SHARE / UPDATE
  // ====================================================

  const shareMutation =
    useMutation({
      mutationFn:
        shareMedicalRecords,

      onMutate: () => {
        setErrorMessage("");
        setSuccessMessage("");
      },

      onSuccess:
        async () => {
          setSuccessMessage(
            "Medical record access updated successfully."
          );

          setDoctorId("");
          setScope(
            "APPOINTMENT_ONLY"
          );
          setExpiresAt("");

          await queryClient
            .invalidateQueries({
              queryKey: [
                "medical-access-grants",
              ],
            });
        },

      onError:
        (
          mutationError
        ) => {
          setErrorMessage(
            getApiErrorMessage(
              mutationError,
              "Unable to share medical records."
            )
          );
        },
    });


  // ====================================================
  // REVOKE
  // ====================================================

  const revokeMutation =
    useMutation({
      mutationFn:
        revokeMedicalAccess,

      onMutate: () => {
        setErrorMessage("");
        setSuccessMessage("");
      },

      onSuccess:
        async () => {
          setSuccessMessage(
            "Doctor access revoked successfully."
          );

          await queryClient
            .invalidateQueries({
              queryKey: [
                "medical-access-grants",
              ],
            });
        },

      onError:
        (
          mutationError
        ) => {
          setErrorMessage(
            getApiErrorMessage(
              mutationError,
              "Unable to revoke medical access."
            )
          );
        },
    });


  // ====================================================
  // SUBMIT
  // ====================================================

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!doctorId) {
      setErrorMessage(
        "Please select a doctor."
      );

      return;
    }


    let formattedExpiry =
      null;


    if (expiresAt) {
      const date =
        new Date(
          expiresAt
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        setErrorMessage(
          "Invalid expiration date."
        );

        return;
      }

      if (
        date
        <= new Date()
      ) {
        setErrorMessage(
          "Expiration must be in the future."
        );

        return;
      }

      formattedExpiry =
        date.toISOString();
    }


    shareMutation.mutate({
      doctorId,
      scope,
      expiresAt:
        formattedExpiry,
    });
  }


  // ====================================================
  // REVOKE HANDLER
  // ====================================================

  function handleRevoke(
    doctor
  ) {
    const confirmed =
      window.confirm(
        `Revoke medical record access for ${doctorName(
          doctor
        )}?`
      );

    if (!confirmed) {
      return;
    }

    revokeMutation.mutate(
      doctor.id
    );
  }


  // ====================================================
  // UI
  // ====================================================

  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >

      {/* =============================================== */}
      {/* HEADER                                          */}
      {/* =============================================== */}

      <section>
        <p
          className="
            text-sm
            font-semibold
            text-blue-600
          "
        >
          Privacy & Access
        </p>

        <h1
          className="
            mt-1
            text-2xl
            font-bold
            tracking-tight
            text-slate-900

            sm:text-3xl
          "
        >
          Share Medical Records
        </h1>

        <p
          className="
            mt-2
            max-w-2xl
            text-sm
            leading-6
            text-slate-500
          "
        >
          Choose which doctor can access your
          medical records and control how much
          history they can view.
        </p>
      </section>


      {/* =============================================== */}
      {/* GLOBAL MESSAGES                                 */}
      {/* =============================================== */}

      {errorMessage && (
        <div
          role="alert"
          className="
            rounded-lg
            border
            border-rose-200
            bg-rose-50
            p-4
            text-sm
            text-rose-700
          "
        >
          {errorMessage}
        </div>
      )}


      {successMessage && (
        <div
          role="status"
          className="
            rounded-lg
            border
            border-emerald-200
            bg-emerald-50
            p-4
            text-sm
            text-emerald-700
          "
        >
          {successMessage}
        </div>
      )}


      {/* =============================================== */}
      {/* SHARE FORM                                      */}
      {/* =============================================== */}

      <form
        onSubmit={
          handleSubmit
        }
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm

          sm:p-6
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
            <Share2
              className="h-5 w-5"
            />
          </div>

          <div>
            <h2
              className="
                font-semibold
                text-slate-900
              "
            >
              Share Records
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Select a Doctor and choose the
              level of access.
            </p>
          </div>
        </div>


        <div
          className="
            mt-6
            space-y-5
          "
        >

          {/* DOCTOR */}

          <div>
            <label
              htmlFor="access-doctor"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Doctor
            </label>

            <select
              id="access-doctor"
              value={
                doctorId
              }
              onChange={(
                event
              ) =>
                setDoctorId(
                  event.target.value
                )
              }
              disabled={
                doctorsLoading
                || shareMutation
                  .isPending
              }
              className="
                mt-2
                min-h-[44px]
                w-full
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                text-slate-900

                focus:border-blue-500
                focus:outline-none
                focus:ring-2
                focus:ring-blue-100
              "
            >
              <option value="">
                Select Doctor
              </option>

              {doctors.map(
                (
                  doctor
                ) => (
                  <option
                    key={
                      doctor.id
                    }
                    value={
                      doctor.id
                    }
                  >
                    {doctorName(
                      doctor
                    )}

                    {doctor
                      .qualification
                      ? ` — ${
                          doctor
                            .qualification
                        }`
                      : ""}
                  </option>
                )
              )}
            </select>


            {doctorsError && (
              <p
                className="
                  mt-2
                  text-sm
                  text-rose-600
                "
              >
                Unable to load Doctors.
              </p>
            )}
          </div>


          {/* ACCESS LEVEL */}

          <fieldset>
            <legend
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Access Level
            </legend>


            <div
              className="
                mt-3
                grid
                grid-cols-1
                gap-3

                lg:grid-cols-2
              "
            >

              {/* APPOINTMENT ONLY */}

              <label
                className={`
                  cursor-pointer
                  rounded-xl
                  border
                  p-4

                  ${
                    scope
                    === "APPOINTMENT_ONLY"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }
                `}
              >
                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <input
                    type="radio"
                    name="access-scope"
                    value="APPOINTMENT_ONLY"
                    checked={
                      scope
                      === "APPOINTMENT_ONLY"
                    }
                    onChange={(
                      event
                    ) =>
                      setScope(
                        event.target.value
                      )
                    }
                    className="
                      mt-1
                    "
                  />

                  <div>
                    <p
                      className="
                        font-semibold
                        text-slate-900
                      "
                    >
                      Appointment Only
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-slate-500
                      "
                    >
                      This Doctor can view only
                      consultations, diagnoses and
                      prescriptions connected to
                      appointments involving them.
                    </p>
                  </div>
                </div>
              </label>


              {/* FULL HISTORY */}

              <label
                className={`
                  cursor-pointer
                  rounded-xl
                  border
                  p-4

                  ${
                    scope
                    === "FULL_HISTORY"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }
                `}
              >
                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <input
                    type="radio"
                    name="access-scope"
                    value="FULL_HISTORY"
                    checked={
                      scope
                      === "FULL_HISTORY"
                    }
                    onChange={(
                      event
                    ) =>
                      setScope(
                        event.target.value
                      )
                    }
                    className="
                      mt-1
                    "
                  />

                  <div>
                    <p
                      className="
                        font-semibold
                        text-slate-900
                      "
                    >
                      Full History
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-slate-500
                      "
                    >
                      This Doctor can view your
                      complete permitted medical
                      history timeline.
                    </p>
                  </div>
                </div>
              </label>

            </div>
          </fieldset>


          {/* EXPIRATION */}

          <div>
            <label
              htmlFor="access-expiry"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Access Expiration
            </label>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Optional. Leave empty for no
              automatic expiration.
            </p>

            <input
              id="access-expiry"
              type="datetime-local"
              value={
                expiresAt
              }
              onChange={(
                event
              ) =>
                setExpiresAt(
                  event.target.value
                )
              }
              disabled={
                shareMutation
                  .isPending
              }
              className="
                mt-2
                min-h-[44px]
                w-full
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                text-slate-900

                sm:max-w-md
              "
            />
          </div>


          {/* PRIVACY INFO */}

          <div
            className="
              flex
              items-start
              gap-3
              rounded-lg
              border
              border-slate-200
              bg-slate-50
              p-4
            "
          >
            <ShieldCheck
              className="
                mt-0.5
                h-5
                w-5
                shrink-0
                text-blue-600
              "
            />

            <p
              className="
                text-sm
                leading-6
                text-slate-600
              "
            >
              Record access is checked by the
              backend whenever a Doctor requests
              Patient medical history. You can
              change or revoke access later.
            </p>
          </div>


          {/* SUBMIT */}

          <div
            className="
              flex
              justify-end
            "
          >
            <button
              type="submit"
              disabled={
                shareMutation
                  .isPending
                || !doctorId
              }
              className="
                inline-flex
                min-h-[44px]
                items-center
                gap-2
                rounded-lg
                bg-blue-600
                px-5
                text-sm
                font-semibold
                text-white

                hover:bg-blue-700

                disabled:pointer-events-none
                disabled:opacity-60
              "
            >
              <Share2
                className="h-4 w-4"
              />

              {shareMutation
                .isPending
                ? "Saving..."
                : "Share Records"}
            </button>
          </div>

        </div>
      </form>


      {/* =============================================== */}
      {/* CURRENT ACCESS                                  */}
      {/* =============================================== */}

      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm

          sm:p-6
        "
      >
        <div>
          <h2
            className="
              font-semibold
              text-slate-900
            "
          >
            Doctors With Access
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Review or revoke currently active
            medical record access.
          </p>
        </div>


        {grantsLoading && (
          <p
            className="
              mt-5
              text-sm
              text-slate-500
            "
          >
            Loading access grants...
          </p>
        )}


        {grantsError && (
          <div
            className="
              mt-5
              rounded-lg
              border
              border-rose-200
              bg-rose-50
              p-4
              text-sm
              text-rose-700
            "
          >
            {getApiErrorMessage(
              grantsQueryError,
              "Unable to load access grants."
            )}
          </div>
        )}


        {!grantsLoading
          && !grantsError
          && grants.length
          === 0 && (
          <div
            className="
              mt-5
              rounded-lg
              border
              border-dashed
              border-slate-200
              p-8
              text-center
            "
          >
            <UserRound
              className="
                mx-auto
                h-8
                w-8
                text-slate-400
              "
            />

            <p
              className="
                mt-3
                font-semibold
                text-slate-900
              "
            >
              No Doctors have access
            </p>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Share your records with a Doctor
              when needed.
            </p>
          </div>
        )}


        <div
          className="
            mt-5
            space-y-3
          "
        >
          {grants.map(
            (
              grant
            ) => (
              <article
                key={
                  grant.id
                }
                className="
                  flex
                  flex-col
                  gap-4
                  rounded-xl
                  border
                  border-slate-200
                  p-4

                  md:flex-row
                  md:items-center
                  md:justify-between
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
                    <UserRound
                      className="h-5 w-5"
                    />
                  </div>


                  <div>
                    <p
                      className="
                        font-semibold
                        text-slate-900
                      "
                    >
                      {doctorName(
                        grant.doctor
                      )}
                    </p>

                    {grant.doctor
                      ?.qualification && (
                      <p
                        className="
                          mt-0.5
                          text-sm
                          text-slate-500
                        "
                      >
                        {
                          grant.doctor
                            .qualification
                        }
                      </p>
                    )}


                    <div
                      className="
                        mt-2
                        flex
                        flex-wrap
                        gap-2
                      "
                    >
                      <span
                        className="
                          rounded-full
                          border
                          border-blue-200
                          bg-blue-50
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          text-blue-700
                        "
                      >
                        {formatScope(
                          grant.scope
                        )}
                      </span>


                      {grant
                        .expires_at && (
                        <span
                          className="
                            rounded-full
                            border
                            border-slate-200
                            bg-slate-50
                            px-2.5
                            py-1
                            text-xs
                            text-slate-600
                          "
                        >
                          Expires{" "}
                          {formatDate(
                            grant
                              .expires_at
                          )}
                        </span>
                      )}
                    </div>


                    <p
                      className="
                        mt-2
                        text-xs
                        text-slate-500
                      "
                    >
                      Shared{" "}
                      {formatDate(
                        grant
                          .granted_at
                      )}
                    </p>
                  </div>
                </div>


                <button
                  type="button"
                  onClick={() =>
                    handleRevoke(
                      grant.doctor
                    )
                  }
                  disabled={
                    revokeMutation
                      .isPending
                  }
                  className="
                    inline-flex
                    min-h-[40px]
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-rose-200
                    bg-white
                    px-4
                    text-sm
                    font-semibold
                    text-rose-600

                    hover:bg-rose-50

                    disabled:pointer-events-none
                    disabled:opacity-60
                  "
                >
                  <Trash2
                    className="h-4 w-4"
                  />

                  Revoke
                </button>
              </article>
            )
          )}
        </div>
      </section>

    </div>
  );
}