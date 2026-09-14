import {
  Activity,
  CalendarDays,
  HeartPulse,
  Stethoscope,
} from "lucide-react";

import {
  useQuery,
} from "@tanstack/react-query";

import ClinicalCard from "@/components/common/ClinicalCard";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";

import {
  getBackendHealth,
} from "@/api/health";


const metrics = [
  {
    label: "Upcoming Appointments",
    value: "0",
    helper: "No appointments scheduled",
    icon: CalendarDays,
  },

  {
    label: "Health Records",
    value: "0",
    helper: "Records will appear here",
    icon: HeartPulse,
  },

  {
    label: "Health Metrics",
    value: "0",
    helper: "Start tracking your health",
    icon: Activity,
  },

  {
    label: "Care Team",
    value: "0",
    helper: "No doctors connected",
    icon: Stethoscope,
  },
];


export default function DashboardPage() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["backend-health"],
    queryFn: getBackendHealth,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="
          A clear overview of your healthcare
          activity and MediVision services.
        "
      />

      <div
        className="
          grid
          grid-cols-1
          gap-4

          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <ClinicalCard
              key={metric.label}
              interactive
              className="p-5"
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-medium
                      text-slate-500
                    "
                  >
                    {metric.label}
                  </p>

                  <p
                    className="
                      mt-2
                      text-3xl
                      font-bold
                      tracking-tight
                      text-slate-900
                    "
                  >
                    {metric.value}
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
                    {metric.helper}
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-lg
                    bg-sky-50
                    text-sky-600
                  "
                >
                  <Icon
                    className="h-5 w-5"
                  />
                </div>
              </div>
            </ClinicalCard>
          );
        })}
      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-6
          lg:grid-cols-3
        "
      >
        <ClinicalCard
          className="
            p-5
            lg:col-span-2
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                className="
                  text-base
                  font-semibold
                  text-slate-900
                "
              >
                Healthcare workspace
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Patient, appointment,
                medical-history and AI modules
                will be connected here.
              </p>
            </div>
          </div>

          <div
            className="
              mt-6
              rounded-lg
              border
              border-dashed
              border-slate-200
              bg-slate-50
              p-8
              text-center
            "
          >
            <HeartPulse
              className="
                mx-auto
                h-8
                w-8
                text-sky-600
              "
            />

            <p
              className="
                mt-3
                text-sm
                font-semibold
                text-slate-900
              "
            >
              MediVision AI
            </p>

            <p
              className="
                mx-auto
                mt-1
                max-w-lg
                text-sm
                leading-6
                text-slate-500
              "
            >
              Predict • Prevent • Monitor •
              Recover
            </p>
          </div>
        </ClinicalCard>

        <ClinicalCard className="p-5">
          <h2
            className="
              text-base
              font-semibold
              text-slate-900
            "
          >
            System Status
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            FastAPI backend connection
          </p>

          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <span
              className="
                text-sm
                font-medium
                text-slate-700
              "
            >
              API
            </span>

            {isLoading && (
              <StatusBadge>
                Checking
              </StatusBadge>
            )}

            {isError && (
              <StatusBadge
                variant="critical"
              >
                Offline
              </StatusBadge>
            )}

            {data && (
              <StatusBadge
                variant="success"
              >
                Connected
              </StatusBadge>
            )}
          </div>
        </ClinicalCard>
      </div>
    </div>
  );
}