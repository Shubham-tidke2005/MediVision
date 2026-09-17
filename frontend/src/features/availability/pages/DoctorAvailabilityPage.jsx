import {
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  CalendarClock,
  RefreshCw,
  Trash2,
} from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";

import AvailabilityRuleForm from "@/features/availability/components/AvailabilityRuleForm";
import TimeOffForm from "@/features/availability/components/TimeOffForm";

import {
  createAvailabilityRule,
  createDoctorTimeOff,
  deleteAvailabilityRule,
  deleteDoctorTimeOff,
  generateDoctorSlots,
  getAvailabilityRules,
  getDoctorSlots,
  getDoctorTimeOff,
} from "@/features/availability/api/availabilityApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


const weekdayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];


function formatTime(
  value
) {
  return value?.slice(
    0,
    5
  );
}


export default function DoctorAvailabilityPage() {
  const queryClient =
    useQueryClient();


  // ======================================================
  // SLOT GENERATION MESSAGE
  // ======================================================

  const [
    generationMessage,
    setGenerationMessage,
  ] = useState("");


  const [
    generationError,
    setGenerationError,
  ] = useState("");


  // ======================================================
  // QUERIES
  // ======================================================

  const {
    data: rules = [],
  } = useQuery({
    queryKey: [
      "doctor-availability-rules",
    ],

    queryFn:
      getAvailabilityRules,
  });


  const {
    data: timeOff = [],
  } = useQuery({
    queryKey: [
      "doctor-time-off",
    ],

    queryFn:
      getDoctorTimeOff,
  });


  const {
    data: slots = [],
  } = useQuery({
    queryKey: [
      "doctor-slots",
    ],

    queryFn: () =>
      getDoctorSlots(30),
  });


  // ======================================================
  // REFRESH ALL AVAILABILITY DATA
  // ======================================================

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "doctor-availability-rules",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "doctor-time-off",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "doctor-slots",
        ],
      }),
    ]);
  }


  // ======================================================
  // ADD AVAILABILITY RULE
  // ======================================================

  const addRule =
    useMutation({
      mutationFn:
        createAvailabilityRule,

      onSuccess: refresh,
    });


  // ======================================================
  // DELETE AVAILABILITY RULE
  // ======================================================

  const removeRule =
    useMutation({
      mutationFn:
        deleteAvailabilityRule,

      onSuccess: refresh,
    });


  // ======================================================
  // ADD TIME OFF
  // ======================================================

  const addTimeOff =
    useMutation({
      mutationFn:
        createDoctorTimeOff,

      onSuccess: refresh,
    });


  // ======================================================
  // DELETE TIME OFF
  // ======================================================

  const removeTimeOff =
    useMutation({
      mutationFn:
        deleteDoctorTimeOff,

      onSuccess: refresh,
    });


  // ======================================================
  // GENERATE SLOTS
  // ======================================================

  const generateSlots =
    useMutation({
      mutationFn: () =>
        generateDoctorSlots(30),

      onMutate: () => {
        setGenerationMessage("");
        setGenerationError("");
      },

      onSuccess: async (
        data
      ) => {
        setGenerationError("");

        const generated =
          data?.generated
          ?? 0;

        const skipped =
          data?.skipped
          ?? 0;


        setGenerationMessage(
          `Generated ${generated} slots. `
          + `${skipped} skipped.`
        );


        await refresh();
      },

      onError: (
        error
      ) => {
        setGenerationMessage("");

        setGenerationError(
          getApiErrorMessage(
            error,
            "Unable to generate slots."
          )
        );
      },
    });


  // ======================================================
  // UI
  // ======================================================

  return (
    <div
      className="
        space-y-6
      "
    >
      {/* =============================================== */}
      {/* PAGE HEADER                                     */}
      {/* =============================================== */}

      <PageHeader
        title="Doctor Availability"
        description="Manage your weekly working hours, time off and appointment slots."
        action={
          <button
            type="button"
            onClick={() =>
              generateSlots.mutate()
            }
            disabled={
              generateSlots.isPending
            }
            className="
              inline-flex
              min-h-[44px]
              items-center
              gap-2
              rounded-lg
              bg-blue-600
              px-4
              text-sm
              font-semibold
              text-white
              transition

              hover:bg-blue-700

              active:scale-[0.98]

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2

              disabled:pointer-events-none
              disabled:opacity-60
            "
          >
            <RefreshCw
              className={`
                h-4
                w-4

                ${
                  generateSlots.isPending
                    ? "animate-spin"
                    : ""
                }
              `}
            />

            {generateSlots.isPending
              ? "Generating..."
              : "Generate 30 Days"}
          </button>
        }
      />


      {/* =============================================== */}
      {/* SLOT GENERATION ERROR                          */}
      {/* =============================================== */}

      {generationError && (
        <div
          role="alert"
          className="
            rounded-lg
            border
            border-rose-200
            bg-rose-50
            p-4
            text-sm
            leading-6
            text-rose-700
          "
        >
          {generationError}
        </div>
      )}


      {/* =============================================== */}
      {/* SLOT GENERATION SUCCESS                        */}
      {/* =============================================== */}

      {generationMessage && (
        <div
          role="status"
          className="
            rounded-lg
            border
            border-emerald-200
            bg-emerald-50
            p-4
            text-sm
            leading-6
            text-emerald-700
          "
        >
          {generationMessage}
        </div>
      )}


      {/* =============================================== */}
      {/* MAIN GRID                                      */}
      {/* =============================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-6

          xl:grid-cols-3
        "
      >
        {/* ============================================= */}
        {/* LEFT AREA                                     */}
        {/* ============================================= */}

        <div
          className="
            space-y-6

            xl:col-span-2
          "
        >
          {/* =========================================== */}
          {/* ADD AVAILABILITY RULE                       */}
          {/* =========================================== */}

          <AvailabilityRuleForm
            onSubmit={
              async (
                payload
              ) =>
                addRule.mutateAsync(
                  payload
                )
            }
            submitting={
              addRule.isPending
            }
          />


          {/* =========================================== */}
          {/* WEEKLY SCHEDULE                             */}
          {/* =========================================== */}

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
                font-semibold
                text-slate-900
              "
            >
              Weekly schedule
            </h2>


            <div
              className="
                mt-5
                space-y-3
              "
            >
              {rules.length === 0 && (
                <p
                  className="
                    text-sm
                    text-slate-500
                  "
                >
                  No availability rules
                  configured yet.
                </p>
              )}


              {rules.map(
                (
                  rule
                ) => (
                  <div
                    key={
                      rule.id
                    }
                    className="
                      flex
                      flex-col
                      gap-3
                      rounded-lg
                      border
                      border-slate-200
                      p-4

                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <div>
                      <p
                        className="
                          font-semibold
                          text-slate-900
                        "
                      >
                        {
                          weekdayNames[
                            rule.day_of_week
                          ]
                        }
                      </p>


                      <p
                        className="
                          mt-1
                          text-sm
                          text-slate-500
                        "
                      >
                        {formatTime(
                          rule.start_time
                        )}

                        {" – "}

                        {formatTime(
                          rule.end_time
                        )}

                        {" • "}

                        {
                          rule.slot_duration_minutes
                        }

                        {" min"}
                      </p>


                      {(rule.valid_from
                        || rule.valid_until) && (
                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-400
                          "
                        >
                          {rule.valid_from
                            ? `From ${rule.valid_from}`
                            : "No start date"}

                          {" → "}

                          {rule.valid_until
                            ? rule.valid_until
                            : "No end date"}
                        </p>
                      )}
                    </div>


                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <StatusBadge
                        variant={
                          rule.is_active
                            ? "success"
                            : "neutral"
                        }
                      >
                        {rule.is_active
                          ? "Active"
                          : "Inactive"}
                      </StatusBadge>


                      <button
                        type="button"
                        onClick={() =>
                          removeRule.mutate(
                            rule.id
                          )
                        }
                        disabled={
                          removeRule.isPending
                        }
                        aria-label="Delete availability rule"
                        className="
                          flex
                          min-h-[44px]
                          min-w-[44px]
                          items-center
                          justify-center
                          rounded-lg
                          text-slate-500
                          transition

                          hover:bg-slate-100
                          hover:text-slate-900

                          disabled:pointer-events-none
                          disabled:opacity-50
                        "
                      >
                        <Trash2
                          className="h-4 w-4"
                        />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>


          {/* =========================================== */}
          {/* UPCOMING SLOTS                              */}
          {/* =========================================== */}

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
                flex-col
                gap-3

                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <h2
                  className="
                    font-semibold
                    text-slate-900
                  "
                >
                  Upcoming slots
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Generated for the next
                  30 days.
                </p>
              </div>


              <StatusBadge
                variant="info"
              >
                {slots.length} slots
              </StatusBadge>
            </div>


            {/* ========================================= */}
            {/* EMPTY SLOT STATE                          */}
            {/* ========================================= */}

            {slots.length === 0 && (
              <div
                className="
                  mt-5
                  rounded-lg
                  border
                  border-dashed
                  border-slate-300
                  bg-slate-50
                  p-5
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  No generated slots
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Add an active availability
                  rule and click
                  {" "}
                  <strong>
                    Generate 30 Days
                  </strong>
                  {" "}
                  to create appointment slots.
                </p>
              </div>
            )}


            {/* ========================================= */}
            {/* SLOT GRID                                  */}
            {/* ========================================= */}

            {slots.length > 0 && (
              <div
                className="
                  mt-5
                  grid
                  grid-cols-1
                  gap-3

                  sm:grid-cols-2

                  lg:grid-cols-3
                "
              >
                {slots
                  .slice(
                    0,
                    18
                  )
                  .map(
                    (
                      slot
                    ) => (
                      <div
                        key={
                          slot.id
                        }
                        className="
                          rounded-lg
                          border
                          border-slate-200
                          p-3
                        "
                      >
                        <div
                          className="
                            flex
                            items-start
                            gap-2
                          "
                        >
                          <CalendarClock
                            className="
                              mt-0.5
                              h-4
                              w-4
                              shrink-0
                              text-sky-600
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
                              {new Date(
                                slot.start_at
                              ).toLocaleDateString(
                                undefined,
                                {
                                  day:
                                    "2-digit",
                                  month:
                                    "short",
                                  year:
                                    "numeric",
                                }
                              )}
                            </p>


                            <p
                              className="
                                mt-1
                                text-xs
                                text-slate-500
                              "
                            >
                              {new Date(
                                slot.start_at
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour:
                                    "2-digit",
                                  minute:
                                    "2-digit",
                                }
                              )}

                              {" – "}

                              {new Date(
                                slot.end_at
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour:
                                    "2-digit",
                                  minute:
                                    "2-digit",
                                }
                              )}
                            </p>


                            {slot.status && (
                              <p
                                className="
                                  mt-1
                                  text-[11px]
                                  font-medium
                                  uppercase
                                  tracking-wide
                                  text-slate-400
                                "
                              >
                                {slot.status}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
              </div>
            )}


            {slots.length > 18 && (
              <p
                className="
                  mt-4
                  text-center
                  text-xs
                  text-slate-500
                "
              >
                Showing first 18 of
                {" "}
                {slots.length}
                {" "}
                slots.
              </p>
            )}
          </section>
        </div>


        {/* ============================================= */}
        {/* RIGHT AREA                                    */}
        {/* ============================================= */}

        <div>
          {/* =========================================== */}
          {/* TIME OFF FORM                               */}
          {/* =========================================== */}

          <TimeOffForm
            onSubmit={
              async (
                payload
              ) =>
                addTimeOff.mutateAsync(
                  payload
                )
            }
            submitting={
              addTimeOff.isPending
            }
          />


          {/* =========================================== */}
          {/* PLANNED TIME OFF                            */}
          {/* =========================================== */}

          <section
            className="
              mt-6
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
                font-semibold
                text-slate-900
              "
            >
              Planned time off
            </h2>


            <div
              className="
                mt-4
                space-y-3
              "
            >
              {timeOff.map(
                (
                  item
                ) => (
                  <div
                    key={
                      item.id
                    }
                    className="
                      rounded-lg
                      border
                      border-slate-200
                      p-3
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-slate-900
                      "
                    >
                      {new Date(
                        item.start_at
                      ).toLocaleDateString()}

                      {" → "}

                      {new Date(
                        item.end_at
                      ).toLocaleDateString()}
                    </p>


                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      {new Date(
                        item.start_at
                      ).toLocaleTimeString(
                        [],
                        {
                          hour:
                            "2-digit",
                          minute:
                            "2-digit",
                        }
                      )}

                      {" – "}

                      {new Date(
                        item.end_at
                      ).toLocaleTimeString(
                        [],
                        {
                          hour:
                            "2-digit",
                          minute:
                            "2-digit",
                        }
                      )}
                    </p>


                    {item.reason && (
                      <p
                        className="
                          mt-2
                          text-xs
                          leading-5
                          text-slate-500
                        "
                      >
                        {item.reason}
                      </p>
                    )}


                    <button
                      type="button"
                      onClick={() =>
                        removeTimeOff.mutate(
                          item.id
                        )
                      }
                      disabled={
                        removeTimeOff.isPending
                      }
                      className="
                        mt-3
                        text-xs
                        font-semibold
                        text-slate-600
                        transition

                        hover:text-slate-900

                        disabled:pointer-events-none
                        disabled:opacity-50
                      "
                    >
                      Remove
                    </button>
                  </div>
                )
              )}


              {timeOff.length === 0 && (
                <p
                  className="
                    text-sm
                    text-slate-500
                  "
                >
                  No time off scheduled.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}