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
  Droplets,
  Footprints,
  HeartPulse,
  Moon,
  Plus,
  Scale,
} from "lucide-react";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  addHealthMeasurement,
  getHealthMeasurements,
  getHealthMetricTypes,
} from "@/features/health/api/healthApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


const ICONS = {
  WEIGHT:
    Scale,

  BLOOD_PRESSURE:
    HeartPulse,

  HEART_RATE:
    HeartPulse,

  BLOOD_SUGAR:
    Activity,

  SLEEP:
    Moon,

  STEPS:
    Footprints,

  WATER:
    Droplets,
};


function formatMetricValue(
  measurement
) {
  if (!measurement) {
    return "No data";
  }

  if (
    measurement.metric_code
    === "BLOOD_PRESSURE"
  ) {
    return `${
      measurement.value_primary
    }/${
      measurement.value_secondary
    } mmHg`;
  }

  return `${
    measurement.value_primary
  } ${
    measurement.primary_unit
  }`;
}


function formatChartDate(
  value
) {
  return new Date(
    value
  ).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );
}


export default function PatientHealthPage() {
  const queryClient =
    useQueryClient();


  const [
    metricCode,
    setMetricCode,
  ] = useState(
    "WEIGHT"
  );


  const [
    primaryValue,
    setPrimaryValue,
  ] = useState("");


  const [
    secondaryValue,
    setSecondaryValue,
  ] = useState("");


  const [
    notes,
    setNotes,
  ] = useState("");


  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  const {
    data: metricTypes = [],
  } = useQuery({
    queryKey: [
      "health-metric-types",
    ],

    queryFn:
      getHealthMetricTypes,
  });


  const {
    data: measurements = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "health-measurements",
      90,
    ],

    queryFn: () =>
      getHealthMeasurements(
        90
      ),
  });


  const selectedMetric =
    metricTypes.find(
      (
        metric
      ) =>
        metric.code
        === metricCode
    );


  const createMutation =
    useMutation({
      mutationFn:
        addHealthMeasurement,

      onMutate: () => {
        setErrorMessage("");
        setSuccessMessage("");
      },

      onSuccess:
        async () => {
          setPrimaryValue("");
          setSecondaryValue("");
          setNotes("");

          setSuccessMessage(
            "Health measurement recorded successfully."
          );

          await queryClient
            .invalidateQueries({
              queryKey: [
                "health-measurements",
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
              "Unable to save measurement."
            )
          );
        },
    });


  function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (
      primaryValue === ""
    ) {
      setErrorMessage(
        "Measurement value is required."
      );

      return;
    }


    if (
      metricCode
      === "BLOOD_PRESSURE"
      && secondaryValue
      === ""
    ) {
      setErrorMessage(
        "Both systolic and diastolic values are required."
      );

      return;
    }


    createMutation.mutate({
      metric_code:
        metricCode,

      value_primary:
        Number(
          primaryValue
        ),

      value_secondary:
        metricCode
        === "BLOOD_PRESSURE"
          ? Number(
              secondaryValue
            )
          : null,

      measured_at:
        null,

      notes:
        notes.trim()
        || null,
    });
  }


  const latestMeasurements =
    useMemo(
      () => {
        const map =
          new Map();

        for (
          const measurement
          of measurements
        ) {
          if (
            !map.has(
              measurement
                .metric_code
            )
          ) {
            map.set(
              measurement
                .metric_code,
              measurement
            );
          }
        }

        return map;
      },
      [
        measurements,
      ]
    );


  const weightData =
    useMemo(
      () =>
        measurements
          .filter(
            (
              item
            ) =>
              item.metric_code
              === "WEIGHT"
          )
          .slice()
          .reverse()
          .map(
            (
              item
            ) => ({
              date:
                formatChartDate(
                  item.measured_at
                ),

              weight:
                item.value_primary,
            })
          ),
      [
        measurements,
      ]
    );


  const bpData =
    useMemo(
      () =>
        measurements
          .filter(
            (
              item
            ) =>
              item.metric_code
              === "BLOOD_PRESSURE"
          )
          .slice()
          .reverse()
          .map(
            (
              item
            ) => ({
              date:
                formatChartDate(
                  item.measured_at
                ),

              systolic:
                item.value_primary,

              diastolic:
                item.value_secondary,
            })
          ),
      [
        measurements,
      ]
    );


  const sleepData =
    useMemo(
      () =>
        measurements
          .filter(
            (
              item
            ) =>
              item.metric_code
              === "SLEEP"
          )
          .slice()
          .reverse()
          .map(
            (
              item
            ) => ({
              date:
                formatChartDate(
                  item.measured_at
                ),

              sleep:
                item.value_primary,
            })
          ),
      [
        measurements,
      ]
    );


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >

      {/* HEADER */}

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
          Health Tracking
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
          Record health measurements and
          review changes over time.
        </p>
      </section>


      {/* MESSAGES */}

      {errorMessage && (
        <div
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


      {isError && (
        <div
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
            error,
            "Unable to load health data."
          )}
        </div>
      )}


      {/* LATEST VALUES */}

      <section
        className="
          grid
          grid-cols-1
          gap-4

          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {metricTypes.map(
          (
            metric
          ) => {
            const Icon =
              ICONS[
                metric.code
              ]
              ?? Activity;

            const latest =
              latestMeasurements.get(
                metric.code
              );

            return (
              <article
                key={
                  metric.id
                }
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
                    justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        text-slate-500
                      "
                    >
                      {
                        metric.name
                      }
                    </p>

                    <p
                      className="
                        mt-2
                        text-xl
                        font-bold
                        text-slate-900
                      "
                    >
                      {formatMetricValue(
                        latest
                      )}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-lg
                      bg-blue-50
                      p-2
                      text-blue-600
                    "
                  >
                    <Icon
                      className="h-5 w-5"
                    />
                  </div>
                </div>
              </article>
            );
          }
        )}
      </section>


      {/* RECORD MEASUREMENT */}

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
        <h2
          className="
            text-lg
            font-semibold
            text-slate-900
          "
        >
          Record Measurement
        </h2>


        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-5

            md:grid-cols-2
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
              Measurement Type
            </label>

            <select
              value={
                metricCode
              }
              onChange={(
                event
              ) => {
                setMetricCode(
                  event.target.value
                );

                setPrimaryValue("");
                setSecondaryValue("");
              }}
              className="
                mt-2
                min-h-[44px]
                w-full
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
              "
            >
              {metricTypes.map(
                (
                  metric
                ) => (
                  <option
                    key={
                      metric.id
                    }
                    value={
                      metric.code
                    }
                  >
                    {
                      metric.name
                    }
                  </option>
                )
              )}
            </select>
          </div>


          <div>
            <label
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              {
                selectedMetric
                  ?.primary_label
                ?? "Value"
              }

              {selectedMetric
                ?.primary_unit
                ? ` (${selectedMetric.primary_unit})`
                : ""}
            </label>

            <input
              type="number"
              step="any"
              value={
                primaryValue
              }
              onChange={(
                event
              ) =>
                setPrimaryValue(
                  event.target.value
                )
              }
              className="
                mt-2
                min-h-[44px]
                w-full
                rounded-lg
                border
                border-slate-200
                px-3
              "
            />
          </div>


          {selectedMetric
            ?.secondary_label && (
            <div>
              <label
                className="
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                {
                  selectedMetric
                    .secondary_label
                }

                {selectedMetric
                  .secondary_unit
                  ? ` (${selectedMetric.secondary_unit})`
                  : ""}
              </label>

              <input
                type="number"
                step="any"
                value={
                  secondaryValue
                }
                onChange={(
                  event
                ) =>
                  setSecondaryValue(
                    event.target.value
                  )
                }
                className="
                  mt-2
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  px-3
                "
              />
            </div>
          )}
        </div>


        <div className="mt-5">
          <label
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Notes
          </label>

          <textarea
            rows={3}
            value={
              notes
            }
            onChange={(
              event
            ) =>
              setNotes(
                event.target.value
              )
            }
            placeholder="Optional note"
            className="
              mt-2
              w-full
              rounded-lg
              border
              border-slate-200
              px-3
              py-2
            "
          />
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
              createMutation
                .isPending
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
            <Plus
              className="h-4 w-4"
            />

            {createMutation
              .isPending
              ? "Saving..."
              : "Record Measurement"}
          </button>
        </div>
      </form>


      {/* CHARTS */}

      {!isLoading && (
        <section
          className="
            grid
            grid-cols-1
            gap-6
          "
        >

          <TrendChart
            title="Weight Trend"
            data={
              weightData
            }
            lines={[
              {
                key:
                  "weight",

                name:
                  "Weight (kg)",

                stroke:
                  "#2563eb",
              },
            ]}
          />


          <TrendChart
            title="Blood Pressure Trend"
            data={
              bpData
            }
            lines={[
              {
                key:
                  "systolic",

                name:
                  "Systolic",

                stroke:
                  "#2563eb",
              },

              {
                key:
                  "diastolic",

                name:
                  "Diastolic",

                stroke:
                  "#0d9488",
              },
            ]}
          />


          <TrendChart
            title="Sleep Trend"
            data={
              sleepData
            }
            lines={[
              {
                key:
                  "sleep",

                name:
                  "Sleep (hours)",

                stroke:
                  "#0284c7",
              },
            ]}
          />

        </section>
      )}

    </div>
  );
}


// ======================================================
// TREND CHART
// ======================================================


function TrendChart({
  title,
  data,
  lines,
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

        sm:p-6
      "
    >
      <h2
        className="
          font-semibold
          text-slate-900
        "
      >
        {title}
      </h2>


      {data.length === 0 ? (
        <p
          className="
            mt-5
            text-sm
            text-slate-500
          "
        >
          No measurements available yet.
        </p>
      ) : (
        <div
          className="
            mt-5
            h-72
            w-full
          "
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={
                data
              }
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="date"
              />

              <YAxis />

              <Tooltip />

              <Legend />

              {lines.map(
                (
                  line
                ) => (
                  <Line
                    key={
                      line.key
                    }
                    type="monotone"
                    dataKey={
                      line.key
                    }
                    name={
                      line.name
                    }
                    stroke={
                      line.stroke
                    }
                    strokeWidth={2}
                    dot
                  />
                )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}