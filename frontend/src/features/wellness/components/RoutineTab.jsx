import {
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Activity,
  Check,
  Droplets,
  Footprints,
  Info,
  LoaderCircle,
  Moon,
  Sparkles,
  StretchHorizontal,
  X,
} from "lucide-react";

import {
  createActivityPlan,
  getTodayRoutine,
  updateActivityLog,
} from "@/features/wellness/api/activityApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


const goalOptions = [
  {
    value:
      "GENERAL_WELLNESS",

    label:
      "General wellness",
  },

  {
    value:
      "IMPROVE_FITNESS",

    label:
      "Improve fitness",
  },

  {
    value:
      "INCREASE_ACTIVITY",

    label:
      "Increase daily activity",
  },

  {
    value:
      "IMPROVE_SLEEP",

    label:
      "Improve sleep routine",
  },
];


const activityOptions = [
  {
    value:
      "SEDENTARY",

    label:
      "Sedentary",
  },

  {
    value:
      "LIGHT",

    label:
      "Light activity",
  },

  {
    value:
      "MODERATE",

    label:
      "Moderate activity",
  },

  {
    value:
      "ACTIVE",

    label:
      "Active",
  },
];


function getActivityIcon(
  type
) {
  if (
    type
    === "WALKING"
  ) {
    return (
      <Footprints
        className="h-5 w-5"
      />
    );
  }


  if (
    type
    === "STRETCHING"
  ) {
    return (
      <StretchHorizontal
        className="h-5 w-5"
      />
    );
  }


  if (
    type
    === "YOGA"
  ) {
    return (
      <Sparkles
        className="h-5 w-5"
      />
    );
  }


  if (
    type
    === "HYDRATION"
  ) {
    return (
      <Droplets
        className="h-5 w-5"
      />
    );
  }


  if (
    type
    === "SLEEP"
  ) {
    return (
      <Moon
        className="h-5 w-5"
      />
    );
  }


  return (
    <Activity
      className="h-5 w-5"
    />
  );
}


function formatTarget(
  item
) {
  const value =
    Number(
      item.target_value
    );


  if (
    item.target_unit
    === "ML"
  ) {
    return `${
      (
        value
        / 1000
      ).toFixed(
        1
      )
    } L`;
  }


  if (
    item.target_unit
    === "HOURS"
  ) {
    return `${
      value.toFixed(
        value % 1 === 0
          ? 0
          : 1
      )
    } hours`;
  }


  if (
    item.target_unit
    === "MINUTES"
  ) {
    return `${
      Math.round(
        value
      )
    } minutes`;
  }


  return `${
    value
  } ${
    item.target_unit
  }`;
}


function StatusButton({
  active,
  disabled,
  children,
  onClick,
  variant,
}) {
  const variants = {
    COMPLETED:
      active
        ? "border-emerald-600 bg-emerald-600 text-white"
        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",

    PARTIAL:
      active
        ? "border-amber-600 bg-amber-600 text-white"
        : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",

    SKIPPED:
      active
        ? "border-slate-600 bg-slate-600 text-white"
        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
  };


  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      className={`
        inline-flex
        min-h-[38px]
        items-center
        justify-center
        gap-1.5
        rounded-lg
        border
        px-3
        text-xs
        font-semibold
        transition

        disabled:cursor-not-allowed
        disabled:opacity-50

        ${
          variants[
            variant
          ]
        }
      `}
    >
      {children}
    </button>
  );
}


function RoutineItem({
  item,
  pending,
  onStatus,
}) {
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
          {getActivityIcon(
            item.activity_type
          )}
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
              flex-col
              gap-1

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <h3
              className="
                font-semibold
                text-slate-900
              "
            >
              {
                item.title
              }
            </h3>


            <span
              className="
                text-sm
                font-semibold
                text-teal-700
              "
            >
              {
                formatTarget(
                  item
                )
              }
            </span>
          </div>


          {item.description && (
            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              {
                item.description
              }
            </p>
          )}


          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-2
            "
          >
            <StatusButton
              variant="COMPLETED"
              active={
                item.log_status
                === "COMPLETED"
              }
              disabled={
                pending
              }
              onClick={() =>
                onStatus(
                  item.id,
                  "COMPLETED"
                )
              }
            >
              <Check
                className="h-3.5 w-3.5"
              />

              Completed
            </StatusButton>


            <StatusButton
              variant="PARTIAL"
              active={
                item.log_status
                === "PARTIAL"
              }
              disabled={
                pending
              }
              onClick={() =>
                onStatus(
                  item.id,
                  "PARTIAL"
                )
              }
            >
              <Activity
                className="h-3.5 w-3.5"
              />

              Partial
            </StatusButton>


            <StatusButton
              variant="SKIPPED"
              active={
                item.log_status
                === "SKIPPED"
              }
              disabled={
                pending
              }
              onClick={() =>
                onStatus(
                  item.id,
                  "SKIPPED"
                )
              }
            >
              <X
                className="h-3.5 w-3.5"
              />

              Skipped
            </StatusButton>
          </div>
        </div>
      </div>
    </article>
  );
}


export default function RoutineTab() {
  const queryClient =
    useQueryClient();


  const [
    form,
    setForm,
  ] = useState({
    goal:
      "GENERAL_WELLNESS",

    activity_level:
      "LIGHT",

    available_minutes_per_day:
      "30",

    sleep_hours:
      "7",
  });


  const [
    localError,
    setLocalError,
  ] = useState("");


  const {
    data: todayRoutine,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "today-routine",
    ],

    queryFn:
      getTodayRoutine,
  });


  const createPlan =
    useMutation({
      mutationFn:
        createActivityPlan,

      onSuccess:
        async () => {
          setLocalError("");

          await Promise.all([
            queryClient
              .invalidateQueries({
                queryKey: [
                  "today-routine",
                ],
              }),

            queryClient
              .invalidateQueries({
                queryKey: [
                  "activity-plans",
                ],
              }),

            queryClient
              .invalidateQueries({
                queryKey: [
                  "current-activity-plan",
                ],
              }),
          ]);
        },
    });


  const saveLog =
    useMutation({
      mutationFn:
        updateActivityLog,

      onSuccess:
        async () => {
          await queryClient
            .invalidateQueries({
              queryKey: [
                "today-routine",
              ],
            });
        },
    });


  function updateField(
    event
  ) {
    const {
      name,
      value,
    } = event.target;


    setForm(
      (
        current
      ) => ({
        ...current,

        [name]:
          value,
      })
    );
  }


  function submit(
    event
  ) {
    event.preventDefault();

    setLocalError("");


    const availableMinutes =
      Number(
        form
          .available_minutes_per_day
      );


    const sleepHours =
      Number(
        form.sleep_hours
      );


    if (
      !Number.isFinite(
        availableMinutes
      )
      || availableMinutes < 10
      || availableMinutes > 180
    ) {
      setLocalError(
        "Available time must be between 10 and 180 minutes."
      );

      return;
    }


    if (
      !Number.isFinite(
        sleepHours
      )
      || sleepHours < 3
      || sleepHours > 12
    ) {
      setLocalError(
        "Sleep hours must be between 3 and 12."
      );

      return;
    }


    createPlan.mutate({
      goal:
        form.goal,

      activity_level:
        form.activity_level,

      available_minutes_per_day:
        availableMinutes,

      sleep_hours:
        sleepHours,
    });
  }


  function markStatus(
    itemId,
    status
  ) {
    saveLog.mutate({
      itemId,
      status,
    });
  }


  const apiError =
    createPlan.isError
      ? getApiErrorMessage(
          createPlan.error,
          "Unable to create routine."
        )
      : "";


  if (
    isLoading
  ) {
    return (
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
            h-6
            w-6
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
          Loading your routine...
        </p>
      </div>
    );
  }


  if (
    isError
  ) {
    return (
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
            error,
            "Unable to load routine."
          )
        }
      </div>
    );
  }


  return (
    <div
      className="
        space-y-6
      "
    >
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
        <Info
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
            General wellness routine
          </p>

          <p
            className="
              mt-1
              text-sm
              leading-6
              text-sky-800
            "
          >
            Walking, gentle stretching,
            light yoga, hydration and sleep
            targets are generated using simple
            predefined rules. This is not a
            medical exercise prescription.
          </p>
        </div>
      </section>


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
        <h2
          className="
            text-lg
            font-semibold
            text-slate-900
          "
        >
          Create Daily Routine
        </h2>


        <form
          onSubmit={
            submit
          }
          className="
            mt-5
            space-y-5
          "
        >
          <div
            className="
              grid
              grid-cols-1
              gap-4

              md:grid-cols-2
            "
          >
            <label>
              <span
                className="
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Goal
              </span>

              <select
                name="goal"
                value={
                  form.goal
                }
                onChange={
                  updateField
                }
                className="
                  mt-2
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  text-sm
                "
              >
                {goalOptions.map(
                  (
                    option
                  ) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>
            </label>


            <label>
              <span
                className="
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Current activity level
              </span>

              <select
                name="activity_level"
                value={
                  form.activity_level
                }
                onChange={
                  updateField
                }
                className="
                  mt-2
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  text-sm
                "
              >
                {activityOptions.map(
                  (
                    option
                  ) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>
            </label>


            <label>
              <span
                className="
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Available time per day
              </span>

              <input
                type="number"
                name="available_minutes_per_day"
                min="10"
                max="180"
                value={
                  form
                    .available_minutes_per_day
                }
                onChange={
                  updateField
                }
                className="
                  mt-2
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  text-sm
                "
              />

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Minutes
              </p>
            </label>


            <label>
              <span
                className="
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Current sleep
              </span>

              <input
                type="number"
                step="0.5"
                name="sleep_hours"
                min="3"
                max="12"
                value={
                  form.sleep_hours
                }
                onChange={
                  updateField
                }
                className="
                  mt-2
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  text-sm
                "
              />

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Hours per night
              </p>
            </label>
          </div>


          {(localError
            || apiError)
            && (
              <div
                className="
                  rounded-lg
                  border
                  border-rose-200
                  bg-rose-50
                  p-3
                  text-sm
                  text-rose-700
                "
              >
                {
                  localError
                  || apiError
                }
              </div>
            )}


          <button
            type="submit"
            disabled={
              createPlan.isPending
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

              disabled:opacity-60
            "
          >
            {createPlan.isPending
              ? (
                <>
                  <LoaderCircle
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                  Creating...
                </>
              )
              : (
                <>
                  <Sparkles
                    className="h-4 w-4"
                  />

                  Generate Routine
                </>
              )}
          </button>
        </form>
      </section>


      {todayRoutine ? (
        <>
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
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-teal-600
                  "
                >
                  Today's Routine
                </p>

                <h2
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-slate-900
                  "
                >
                  {
                    todayRoutine.title
                  }
                </h2>
              </div>


              <div
                className="
                  text-left

                  sm:text-right
                "
              >
                <p
                  className="
                    text-2xl
                    font-bold
                    text-blue-600
                  "
                >
                  {
                    todayRoutine
                      .progress
                      .progress_percent
                  }%
                </p>

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Daily progress
                </p>
              </div>
            </div>


            <div
              className="
                mt-4
                h-2.5
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
                    `${
                      todayRoutine
                        .progress
                        .progress_percent
                    }%`,
                }}
              />
            </div>


            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-x-5
                gap-y-2
                text-xs
                text-slate-500
              "
            >
              <span>
                Completed:{" "}
                {
                  todayRoutine
                    .progress
                    .completed
                }
              </span>

              <span>
                Partial:{" "}
                {
                  todayRoutine
                    .progress
                    .partial
                }
              </span>

              <span>
                Skipped:{" "}
                {
                  todayRoutine
                    .progress
                    .skipped
                }
              </span>

              <span>
                Remaining:{" "}
                {
                  todayRoutine
                    .progress
                    .not_logged
                }
              </span>
            </div>
          </section>


          <div
            className="
              grid
              grid-cols-1
              gap-4

              xl:grid-cols-2
            "
          >
            {todayRoutine
              .items
              .map(
                (
                  item
                ) => (
                  <RoutineItem
                    key={
                      item.id
                    }
                    item={
                      item
                    }
                    pending={
                      saveLog.isPending
                    }
                    onStatus={
                      markStatus
                    }
                  />
                )
              )}
          </div>


          {saveLog.isError && (
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
                  saveLog.error,
                  "Unable to update activity status."
                )
              }
            </div>
          )}


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
              {
                todayRoutine
                  .safety_message
              }
            </p>
          </section>
        </>
      ) : (
        <section
          className="
            rounded-xl
            border
            border-dashed
            border-slate-200
            bg-white
            p-10
            text-center
          "
        >
          <Activity
            className="
              mx-auto
              h-8
              w-8
              text-slate-400
            "
          />

          <h3
            className="
              mt-3
              font-semibold
              text-slate-900
            "
          >
            No routine yet
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Create your first daily wellness
            routine using the form above.
          </p>
        </section>
      )}
    </div>
  );
}