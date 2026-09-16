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
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Pill,
  Plus,
  SkipForward,
} from "lucide-react";

import {
  addManualMedication,
  addMedicationSchedule,
  getMedicationAdherence,
  getMedicationDoses,
  getMedications,
  recordDoseStatus,
} from "@/features/medications/api/medicationApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


// ======================================================
// HELPERS
// ======================================================

function getLocalDateString() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function formatTime(
  value
) {
  if (!value) {
    return "";
  }

  return new Date(
    value
  ).toLocaleTimeString(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


function formatDate(
  value
) {
  if (!value) {
    return "";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


function formatSource(
  source
) {
  if (
    source === "PRESCRIPTION"
  ) {
    return "Prescription";
  }

  if (
    source === "MANUAL"
  ) {
    return "Manually Added";
  }

  return source
    ?.replaceAll(
      "_",
      " "
    );
}


function getDoseStatusStyle(
  status
) {
  switch (status) {
    case "TAKEN":
      return (
        "border-emerald-200 bg-emerald-50 text-emerald-700"
      );

    case "LATE":
      return (
        "border-amber-200 bg-amber-50 text-amber-700"
      );

    case "MISSED":
      return (
        "border-rose-200 bg-rose-50 text-rose-700"
      );

    case "SKIPPED":
      return (
        "border-slate-300 bg-slate-100 text-slate-700"
      );

    default:
      return (
        "border-blue-200 bg-blue-50 text-blue-700"
      );
  }
}


function getDoseDisplayStatus(
  dose
) {
  if (
    dose.status
  ) {
    return dose.status;
  }

  const scheduledTime =
    new Date(
      dose.scheduled_for
    );

  if (
    scheduledTime
    > new Date()
  ) {
    return "UPCOMING";
  }

  return "PENDING";
}


// ======================================================
// ADHERENCE CARD
// ======================================================

function AdherenceCard({
  adherence,
  loading,
}) {
  const percentage =
    adherence
      ?.adherence_percentage;

  const safePercentage =
    percentage == null
      ? 0
      : Math.min(
          100,
          Math.max(
            0,
            percentage
          )
        );


  return (
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
            bg-teal-50
            text-teal-600
          "
        >
          <Activity
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
            Medication Adherence
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Last 30 days
          </p>
        </div>
      </div>


      {loading ? (
        <p
          className="
            mt-6
            text-sm
            text-slate-500
          "
        >
          Calculating adherence...
        </p>
      ) : (
        <>
          <div
            className="
              mt-6
              flex
              items-end
              gap-2
            "
          >
            <span
              className="
                text-3xl
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              {percentage == null
                ? "—"
                : `${percentage}%`}
            </span>

            <span
              className="
                pb-1
                text-sm
                text-slate-500
              "
            >
              adherence
            </span>
          </div>


          <div
            className="
              mt-4
              h-2
              overflow-hidden
              rounded-full
              bg-slate-100
            "
          >
            <div
              className="
                h-full
                rounded-full
                bg-blue-600
                transition-all
              "
              style={{
                width:
                  `${safePercentage}%`,
              }}
            />
          </div>


          <div
            className="
              mt-6
              grid
              grid-cols-2
              gap-3

              lg:grid-cols-4
            "
          >
            <div
              className="
                rounded-lg
                border
                border-emerald-200
                bg-emerald-50
                p-3
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  text-emerald-700
                "
              >
                TAKEN
              </p>

              <p
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-emerald-800
                "
              >
                {
                  adherence
                    ?.taken
                  ?? 0
                }
              </p>
            </div>


            <div
              className="
                rounded-lg
                border
                border-amber-200
                bg-amber-50
                p-3
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  text-amber-700
                "
              >
                LATE
              </p>

              <p
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-amber-800
                "
              >
                {
                  adherence
                    ?.late
                  ?? 0
                }
              </p>
            </div>


            <div
              className="
                rounded-lg
                border
                border-rose-200
                bg-rose-50
                p-3
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  text-rose-700
                "
              >
                MISSED
              </p>

              <p
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-rose-800
                "
              >
                {
                  adherence
                    ?.missed
                  ?? 0
                }
              </p>
            </div>


            <div
              className="
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                p-3
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  text-slate-600
                "
              >
                SKIPPED
              </p>

              <p
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-slate-800
                "
              >
                {
                  adherence
                    ?.skipped
                  ?? 0
                }
              </p>
            </div>
          </div>


          <p
            className="
              mt-4
              text-xs
              leading-5
              text-slate-500
            "
          >
            MediVision calculates this application
            metric using Taken + Late doses as
            adherent doses. It is not a clinical
            assessment.
          </p>
        </>
      )}
    </section>
  );
}


// ======================================================
// TODAY'S DOSE CARD
// ======================================================

function DoseCard({
  dose,
  onRecord,
  pending,
}) {
  const displayStatus =
    getDoseDisplayStatus(
      dose
    );


  const canRecord =
    ![
      "TAKEN",
      "LATE",
    ].includes(
      dose.status
    );


  return (
    <article
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4

          sm:flex-row
          sm:items-center
          sm:justify-between
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
            <Pill
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
              {
                dose.medicine_name
              }
            </p>

            <div
              className="
                mt-1
                flex
                items-center
                gap-2
                text-sm
                text-slate-500
              "
            >
              <Clock3
                className="h-4 w-4"
              />

              {formatTime(
                dose.scheduled_for
              )}
            </div>
          </div>
        </div>


        <span
          className={`
            inline-flex
            w-fit
            rounded-full
            border
            px-2.5
            py-1
            text-xs
            font-semibold

            ${
              getDoseStatusStyle(
                dose.status
              )
            }
          `}
        >
          {displayStatus}
        </span>
      </div>


      {dose.taken_at && (
        <p
          className="
            mt-3
            text-xs
            text-slate-500
          "
        >
          Recorded at{" "}
          {formatTime(
            dose.taken_at
          )}
        </p>
      )}


      {canRecord && (
        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          <button
            type="button"
            disabled={
              pending
            }
            onClick={() =>
              onRecord(
                dose,
                "TAKEN"
              )
            }
            className="
              inline-flex
              min-h-[40px]
              items-center
              gap-2
              rounded-lg
              bg-emerald-600
              px-4
              text-sm
              font-semibold
              text-white

              hover:bg-emerald-700

              disabled:pointer-events-none
              disabled:opacity-60
            "
          >
            <CheckCircle2
              className="h-4 w-4"
            />

            Taken
          </button>


          <button
            type="button"
            disabled={
              pending
            }
            onClick={() =>
              onRecord(
                dose,
                "SKIPPED"
              )
            }
            className="
              inline-flex
              min-h-[40px]
              items-center
              gap-2
              rounded-lg
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              font-semibold
              text-slate-700

              hover:bg-slate-50

              disabled:pointer-events-none
              disabled:opacity-60
            "
          >
            <SkipForward
              className="h-4 w-4"
            />

            Skip
          </button>
        </div>
      )}
    </article>
  );
}


// ======================================================
// MEDICATION CARD
// ======================================================

function MedicationCard({
  medication,
  doses,
  onAddSchedule,
  schedulePending,
}) {
  const [
    reminderTime,
    setReminderTime,
  ] = useState("");


  function handleScheduleSubmit(
    event
  ) {
    event.preventDefault();

    if (!reminderTime) {
      return;
    }

    onAddSchedule(
      medication.id,
      reminderTime,
      () => {
        setReminderTime("");
      }
    );
  }


  const medicationDoses =
    doses.filter(
      (
        dose
      ) =>
        dose.patient_medication_id
        === medication.id
    );


  return (
    <article
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-5
      "
    >
      <div
        className="
          flex
          flex-col
          gap-3

          sm:flex-row
          sm:items-start
          sm:justify-between
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
              bg-sky-50
              text-sky-600
            "
          >
            <Pill
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
              {
                medication
                  .medicine_name
              }
            </p>

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
                  border-slate-200
                  bg-slate-50
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  text-slate-600
                "
              >
                {formatSource(
                  medication.source
                )}
              </span>

              <span
                className="
                  rounded-full
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  text-emerald-700
                "
              >
                {
                  medication.status
                }
              </span>
            </div>
          </div>
        </div>


        <div
          className="
            text-sm
            text-slate-500
          "
        >
          {formatDate(
            medication.start_date
          )}

          {medication.end_date && (
            <>
              {" → "}
              {formatDate(
                medication.end_date
              )}
            </>
          )}
        </div>
      </div>


      <div
        className="
          mt-4
          grid
          grid-cols-1
          gap-3

          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        {medication.strength && (
          <div>
            <p
              className="
                text-xs
                font-semibold
                text-slate-500
              "
            >
              Strength
            </p>

            <p
              className="
                mt-1
                text-sm
                text-slate-700
              "
            >
              {
                medication.strength
              }
            </p>
          </div>
        )}


        {medication.dose && (
          <div>
            <p
              className="
                text-xs
                font-semibold
                text-slate-500
              "
            >
              Dose
            </p>

            <p
              className="
                mt-1
                text-sm
                text-slate-700
              "
            >
              {
                medication.dose
              }
            </p>
          </div>
        )}


        {medication.route && (
          <div>
            <p
              className="
                text-xs
                font-semibold
                text-slate-500
              "
            >
              Route
            </p>

            <p
              className="
                mt-1
                text-sm
                text-slate-700
              "
            >
              {
                medication.route
              }
            </p>
          </div>
        )}
      </div>


      {medication.instructions && (
        <div
          className="
            mt-4
            rounded-lg
            bg-slate-50
            p-3
          "
        >
          <p
            className="
              text-xs
              font-semibold
              text-slate-500
            "
          >
            Instructions
          </p>

          <p
            className="
              mt-1
              text-sm
              leading-6
              text-slate-700
            "
          >
            {
              medication.instructions
            }
          </p>
        </div>
      )}


      {/* TODAY'S REMINDER TIMES */}

      <div
        className="
          mt-5
          border-t
          border-slate-100
          pt-4
        "
      >
        <p
          className="
            text-sm
            font-semibold
            text-slate-900
          "
        >
          Reminder Times
        </p>


        {medicationDoses.length > 0 ? (
          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-2
            "
          >
            {medicationDoses.map(
              (
                dose
              ) => (
                <span
                  key={
                    dose.schedule_id
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    py-1.5
                    text-sm
                    text-slate-700
                  "
                >
                  <Clock3
                    className="h-3.5 w-3.5"
                  />

                  {formatTime(
                    dose.scheduled_for
                  )}
                </span>
              )
            )}
          </div>
        ) : (
          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            No reminder time configured for today.
          </p>
        )}


        {medication.status
          === "ACTIVE" && (
          <form
            onSubmit={
              handleScheduleSubmit
            }
            className="
              mt-4
              flex
              flex-col
              gap-3

              sm:flex-row
              sm:items-end
            "
          >
            <div>
              <label
                htmlFor={
                  `schedule-${medication.id}`
                }
                className="
                  text-xs
                  font-semibold
                  text-slate-600
                "
              >
                Add reminder time
              </label>

              <input
                id={
                  `schedule-${medication.id}`
                }
                type="time"
                value={
                  reminderTime
                }
                onChange={(
                  event
                ) =>
                  setReminderTime(
                    event.target.value
                  )
                }
                disabled={
                  schedulePending
                }
                className="
                  mt-1
                  min-h-[40px]
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm
                  text-slate-900
                "
              />
            </div>


            <button
              type="submit"
              disabled={
                !reminderTime
                || schedulePending
              }
              className="
                inline-flex
                min-h-[40px]
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-blue-200
                bg-blue-50
                px-4
                text-sm
                font-semibold
                text-blue-700

                hover:bg-blue-100

                disabled:pointer-events-none
                disabled:opacity-60
              "
            >
              <Plus
                className="h-4 w-4"
              />

              Add Time
            </button>
          </form>
        )}
      </div>
    </article>
  );
}


// ======================================================
// MAIN PAGE
// ======================================================

export default function PatientMedicationsPage() {
  const queryClient =
    useQueryClient();

  const today =
    getLocalDateString();


  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  const [
    manualForm,
    setManualForm,
  ] = useState({
    medicine_name: "",
    strength: "",
    dose: "",
    route: "",
    instructions: "",
    start_date: today,
    end_date: "",
  });


  // ====================================================
  // QUERIES
  // ====================================================

  const {
    data: medications = [],
    isLoading:
      medicationsLoading,
    isError:
      medicationsError,
    error:
      medicationsQueryError,
  } = useQuery({
    queryKey: [
      "patient-medications",
    ],

    queryFn:
      getMedications,
  });


  const {
    data: doses = [],
    isLoading:
      dosesLoading,
    isError:
      dosesError,
    error:
      dosesQueryError,
  } = useQuery({
    queryKey: [
      "medication-doses",
      today,
    ],

    queryFn: () =>
      getMedicationDoses(
        today
      ),
  });


  const {
    data: adherence,
    isLoading:
      adherenceLoading,
    isError:
      adherenceError,
    error:
      adherenceQueryError,
  } = useQuery({
    queryKey: [
      "medication-adherence",
      30,
    ],

    queryFn: () =>
      getMedicationAdherence(
        30
      ),
  });


  // ====================================================
  // INVALIDATION
  // ====================================================

  async function refreshMedicationData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "patient-medications",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "medication-doses",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "medication-adherence",
        ],
      }),
    ]);
  }


  // ====================================================
  // ADD MANUAL MEDICATION
  // ====================================================

  const manualMedicationMutation =
    useMutation({
      mutationFn:
        addManualMedication,

      onMutate: () => {
        setErrorMessage("");
        setSuccessMessage("");
      },

      onSuccess:
        async () => {
          setSuccessMessage(
            "Medication added successfully."
          );

          setManualForm({
            medicine_name: "",
            strength: "",
            dose: "",
            route: "",
            instructions: "",
            start_date: today,
            end_date: "",
          });

          await refreshMedicationData();
        },

      onError:
        (
          mutationError
        ) => {
          setErrorMessage(
            getApiErrorMessage(
              mutationError,
              "Unable to add medication."
            )
          );
        },
    });


  // ====================================================
  // ADD SCHEDULE
  // ====================================================

  const scheduleMutation =
    useMutation({
      mutationFn:
        addMedicationSchedule,

      onMutate: () => {
        setErrorMessage("");
        setSuccessMessage("");
      },

      onSuccess:
        async (
          _data,
          variables
        ) => {
          setSuccessMessage(
            `Reminder added for ${variables.timeOfDay}.`
          );

          await refreshMedicationData();
        },

      onError:
        (
          mutationError
        ) => {
          setErrorMessage(
            getApiErrorMessage(
              mutationError,
              "Unable to add reminder time."
            )
          );
        },
    });


  // ====================================================
  // RECORD DOSE
  // ====================================================

  const doseMutation =
    useMutation({
      mutationFn:
        recordDoseStatus,

      onMutate: () => {
        setErrorMessage("");
        setSuccessMessage("");
      },

      onSuccess:
        async (
          result
        ) => {
          const status =
            result?.status;

          setSuccessMessage(
            status === "LATE"
              ? "Dose recorded as late."
              : "Dose status updated successfully."
          );

          await refreshMedicationData();
        },

      onError:
        (
          mutationError
        ) => {
          setErrorMessage(
            getApiErrorMessage(
              mutationError,
              "Unable to update dose status."
            )
          );
        },
    });


  // ====================================================
  // MANUAL FORM HANDLER
  // ====================================================

  function updateManualField(
    field,
    value
  ) {
    setManualForm(
      (
        current
      ) => ({
        ...current,
        [field]:
          value,
      })
    );
  }


  function handleManualSubmit(
    event
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");


    const medicineName =
      manualForm
        .medicine_name
        .trim();


    if (!medicineName) {
      setErrorMessage(
        "Medicine name is required."
      );

      return;
    }


    if (
      manualForm.end_date
      && manualForm.end_date
      < manualForm.start_date
    ) {
      setErrorMessage(
        "End date cannot be before start date."
      );

      return;
    }


    manualMedicationMutation.mutate({
      medicine_name:
        medicineName,

      strength:
        manualForm.strength.trim()
        || null,

      dose:
        manualForm.dose.trim()
        || null,

      route:
        manualForm.route.trim()
        || null,

      instructions:
        manualForm.instructions.trim()
        || null,

      start_date:
        manualForm.start_date,

      end_date:
        manualForm.end_date
        || null,
    });
  }


  // ====================================================
  // ADD SCHEDULE HANDLER
  // ====================================================

  function handleAddSchedule(
    medicationId,
    timeOfDay,
    onSuccess
  ) {
    scheduleMutation.mutate(
      {
        medicationId,
        timeOfDay,
      },
      {
        onSuccess:
          onSuccess,
      }
    );
  }


  // ====================================================
  // DOSE HANDLER
  // ====================================================

  function handleRecordDose(
    dose,
    status
  ) {
    doseMutation.mutate({
      scheduleId:
        dose.schedule_id,

      scheduledFor:
        dose.scheduled_for,

      status,
    });
  }


  // ====================================================
  // SORT TODAY'S DOSES
  // ====================================================

  const sortedDoses =
    useMemo(
      () =>
        [...doses].sort(
          (
            first,
            second
          ) =>
            new Date(
              first.scheduled_for
            )
            - new Date(
                second.scheduled_for
              )
        ),
      [
        doses,
      ]
    );


  // ====================================================
  // GLOBAL QUERY ERROR
  // ====================================================

  const queryError =
    medicationsError
      ? medicationsQueryError
      : dosesError
        ? dosesQueryError
        : adherenceError
          ? adherenceQueryError
          : null;


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
          Personal Health
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
          Medication Reminders
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
          Manage active medicines, configure
          reminder times and record whether each
          scheduled dose was taken, late, missed
          or skipped.
        </p>
      </section>


      {/* =============================================== */}
      {/* MESSAGES                                        */}
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


      {queryError && (
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
          {getApiErrorMessage(
            queryError,
            "Unable to load medication information."
          )}
        </div>
      )}


      {/* =============================================== */}
      {/* ADHERENCE                                       */}
      {/* =============================================== */}

      <AdherenceCard
        adherence={
          adherence
        }
        loading={
          adherenceLoading
        }
      />


      {/* =============================================== */}
      {/* TODAY'S DOSES                                   */}
      {/* =============================================== */}

      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          p-5

          sm:p-6
        "
      >
        <div>
          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            Today's Doses
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            {formatDate(
              today
            )}
          </p>
        </div>


        {dosesLoading ? (
          <p
            className="
              mt-5
              text-sm
              text-slate-500
            "
          >
            Loading today's doses...
          </p>
        ) : sortedDoses.length
          === 0 ? (
          <div
            className="
              mt-5
              rounded-xl
              border
              border-dashed
              border-slate-300
              bg-white
              p-8
              text-center
            "
          >
            <Clock3
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
              No doses scheduled today
            </p>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Add a reminder time to one of your
              active medications.
            </p>
          </div>
        ) : (
          <div
            className="
              mt-5
              grid
              grid-cols-1
              gap-3

              xl:grid-cols-2
            "
          >
            {sortedDoses.map(
              (
                dose
              ) => (
                <DoseCard
                  key={
                    `${dose.schedule_id}-${dose.scheduled_for}`
                  }
                  dose={
                    dose
                  }
                  onRecord={
                    handleRecordDose
                  }
                  pending={
                    doseMutation
                      .isPending
                  }
                />
              )
            )}
          </div>
        )}
      </section>


      {/* =============================================== */}
      {/* MY MEDICATIONS                                  */}
      {/* =============================================== */}

      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          p-5

          sm:p-6
        "
      >
        <div>
          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >
            My Medications
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Prescription-linked and manually
            added medications.
          </p>
        </div>


        {medicationsLoading ? (
          <p
            className="
              mt-5
              text-sm
              text-slate-500
            "
          >
            Loading medications...
          </p>
        ) : medications.length
          === 0 ? (
          <div
            className="
              mt-5
              rounded-xl
              border
              border-dashed
              border-slate-300
              bg-white
              p-8
              text-center
            "
          >
            <Pill
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
              No medications yet
            </p>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Prescription medicines will appear
              here automatically, or you can add
              a medication manually below.
            </p>
          </div>
        ) : (
          <div
            className="
              mt-5
              space-y-4
            "
          >
            {medications.map(
              (
                medication
              ) => (
                <MedicationCard
                  key={
                    medication.id
                  }
                  medication={
                    medication
                  }
                  doses={
                    doses
                  }
                  onAddSchedule={
                    handleAddSchedule
                  }
                  schedulePending={
                    scheduleMutation
                      .isPending
                  }
                />
              )
            )}
          </div>
        )}
      </section>


      {/* =============================================== */}
      {/* MANUAL MEDICATION                               */}
      {/* =============================================== */}

      <form
        onSubmit={
          handleManualSubmit
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
            <Plus
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
              Add Medication Manually
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Use this for medication that was not
              added through a MediVision prescription.
            </p>
          </div>
        </div>


        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-5

            md:grid-cols-2
          "
        >

          {/* MEDICINE NAME */}

          <div>
            <label
              htmlFor="manual-medicine-name"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Medicine Name *
            </label>

            <input
              id="manual-medicine-name"
              type="text"
              value={
                manualForm
                  .medicine_name
              }
              onChange={(
                event
              ) =>
                updateManualField(
                  "medicine_name",
                  event.target.value
                )
              }
              placeholder="Example: Medicine A"
              disabled={
                manualMedicationMutation
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
            />
          </div>


          {/* STRENGTH */}

          <div>
            <label
              htmlFor="manual-strength"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Strength
            </label>

            <input
              id="manual-strength"
              type="text"
              value={
                manualForm.strength
              }
              onChange={(
                event
              ) =>
                updateManualField(
                  "strength",
                  event.target.value
                )
              }
              placeholder="Doctor/packaging information"
              disabled={
                manualMedicationMutation
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
              "
            />
          </div>


          {/* DOSE */}

          <div>
            <label
              htmlFor="manual-dose"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Dose
            </label>

            <input
              id="manual-dose"
              type="text"
              value={
                manualForm.dose
              }
              onChange={(
                event
              ) =>
                updateManualField(
                  "dose",
                  event.target.value
                )
              }
              placeholder="Enter existing medication instructions"
              disabled={
                manualMedicationMutation
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
              "
            />
          </div>


          {/* ROUTE */}

          <div>
            <label
              htmlFor="manual-route"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Route
            </label>

            <input
              id="manual-route"
              type="text"
              value={
                manualForm.route
              }
              onChange={(
                event
              ) =>
                updateManualField(
                  "route",
                  event.target.value
                )
              }
              placeholder="Example: Oral"
              disabled={
                manualMedicationMutation
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
              "
            />
          </div>


          {/* START DATE */}

          <div>
            <label
              htmlFor="manual-start-date"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Start Date *
            </label>

            <input
              id="manual-start-date"
              type="date"
              value={
                manualForm
                  .start_date
              }
              onChange={(
                event
              ) =>
                updateManualField(
                  "start_date",
                  event.target.value
                )
              }
              disabled={
                manualMedicationMutation
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
              "
            />
          </div>


          {/* END DATE */}

          <div>
            <label
              htmlFor="manual-end-date"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              End Date
            </label>

            <input
              id="manual-end-date"
              type="date"
              min={
                manualForm
                  .start_date
              }
              value={
                manualForm
                  .end_date
              }
              onChange={(
                event
              ) =>
                updateManualField(
                  "end_date",
                  event.target.value
                )
              }
              disabled={
                manualMedicationMutation
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
              "
            />
          </div>

        </div>


        {/* INSTRUCTIONS */}

        <div
          className="mt-5"
        >
          <label
            htmlFor="manual-instructions"
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Existing Instructions
          </label>

          <textarea
            id="manual-instructions"
            rows={3}
            value={
              manualForm
                .instructions
            }
            onChange={(
              event
            ) =>
              updateManualField(
                "instructions",
                event.target.value
              )
            }
            placeholder="Enter instructions already provided by your healthcare professional or medication packaging."
            disabled={
              manualMedicationMutation
                .isPending
            }
            className="
              mt-2
              w-full
              resize-y
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-sm
              text-slate-900
            "
          />
        </div>


        <div
          className="
            mt-5
            flex
            items-start
            gap-2
            rounded-lg
            border
            border-amber-200
            bg-amber-50
            p-4
          "
        >
          <AlertCircle
            className="
              mt-0.5
              h-4
              w-4
              shrink-0
              text-amber-600
            "
          />

          <p
            className="
              text-xs
              leading-5
              text-amber-800
            "
          >
            MediVision does not create medication
            doses or prescribing instructions.
            Enter information from an existing
            prescription, clinician instruction or
            medication label.
          </p>
        </div>


        <div
          className="
            mt-5
            flex
            justify-end
          "
        >
          <button
            type="submit"
            disabled={
              manualMedicationMutation
                .isPending
              || !manualForm
                .medicine_name
                .trim()
              || !manualForm
                .start_date
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
            <Plus
              className="h-4 w-4"
            />

            {manualMedicationMutation
              .isPending
              ? "Adding..."
              : "Add Medication"}
          </button>
        </div>
      </form>

    </div>
  );
}