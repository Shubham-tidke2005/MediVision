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


  const addRule =
    useMutation({
      mutationFn:
        createAvailabilityRule,

      onSuccess: refresh,
    });


  const removeRule =
    useMutation({
      mutationFn:
        deleteAvailabilityRule,

      onSuccess: refresh,
    });


  const addTimeOff =
    useMutation({
      mutationFn:
        createDoctorTimeOff,

      onSuccess: refresh,
    });


  const removeTimeOff =
    useMutation({
      mutationFn:
        deleteDoctorTimeOff,

      onSuccess: refresh,
    });


  const generateSlots =
    useMutation({
      mutationFn: () =>
        generateDoctorSlots(30),

      onSuccess: refresh,
    });


  return (
    <div className="space-y-6">
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

              hover:bg-blue-700
              active:scale-[0.98]

              disabled:opacity-60
            "
          >
            <RefreshCw
              className="h-4 w-4"
            />

            {generateSlots.isPending
              ? "Generating..."
              : "Generate 30 Days"}
          </button>
        }
      />


      <div
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-3
        "
      >
        <div
          className="
            space-y-6
            xl:col-span-2
          "
        >
          <AvailabilityRuleForm
            onSubmit={
              async (payload) =>
                addRule.mutateAsync(
                  payload
                )
            }
            submitting={
              addRule.isPending
            }
          />


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
                (rule) => (
                  <div
                    key={rule.id}
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
                        aria-label="Delete availability rule"
                        className="
                          flex
                          min-h-[44px]
                          min-w-[44px]
                          items-center
                          justify-center
                          rounded-lg
                          text-slate-500

                          hover:bg-slate-100
                          hover:text-slate-900
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
                justify-between
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
              {slots.slice(
                0,
                18
              ).map(
                (slot) => (
                  <div
                    key={slot.id}
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
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        </div>


        <div>
          <TimeOffForm
            onSubmit={
              async (payload) =>
                addTimeOff.mutateAsync(
                  payload
                )
            }
            submitting={
              addTimeOff.isPending
            }
          />

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
                (item) => (
                  <div
                    key={item.id}
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

                    {item.reason && (
                      <p
                        className="
                          mt-1
                          text-xs
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
                      className="
                        mt-2
                        text-xs
                        font-semibold
                        text-slate-600
                        hover:text-slate-900
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