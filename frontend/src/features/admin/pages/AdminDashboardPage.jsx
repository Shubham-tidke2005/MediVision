import {
  useQuery,
} from "@tanstack/react-query";

import {
  Activity,
  BrainCircuit,
  Building2,
  CalendarDays,
  FileText,
  ShieldAlert,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getAdminDashboard,
} from "@/features/admin/api/adminApi";

import AdminPageHeader
  from "@/features/admin/components/AdminPageHeader";

import AdminQueryState
  from "@/features/admin/components/AdminQueryState";

import AdminStatCard
  from "@/features/admin/components/AdminStatCard";


const managementLinks = [
  {
    to: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    to: "/admin/patients",
    label: "Patients",
    icon: UserRound,
  },
  {
    to: "/admin/doctors",
    label: "Doctors",
    icon: Stethoscope,
  },
  {
    to: "/admin/specialties",
    label: "Specialties",
    icon: Activity,
  },
  {
    to: "/admin/facilities",
    label: "Facilities",
    icon: Building2,
  },
  {
    to: "/admin/appointments",
    label: "Appointments",
    icon: CalendarDays,
  },
  {
    to: "/admin/health-articles",
    label: "Health Articles",
    icon: FileText,
  },
  {
    to: "/admin/ai-assessments",
    label: "AI Assessments",
    icon: BrainCircuit,
  },
  {
    to: "/admin/sos",
    label: "SOS Events",
    icon: ShieldAlert,
  },
];


export default function AdminDashboardPage() {
  const query =
    useQuery({
      queryKey: [
        "admin-dashboard",
      ],
      queryFn:
        getAdminDashboard,
    });


  if (
    query.isLoading
    || query.isError
  ) {
    return (
      <div
        className="space-y-6"
      >
        <AdminPageHeader
          title="Admin Dashboard"
          description="Platform management and operational oversight."
        />

        <AdminQueryState
          isLoading={
            query.isLoading
          }
          isError={
            query.isError
          }
          error={
            query.error
          }
          loadingMessage="Loading admin dashboard..."
        />
      </div>
    );
  }


  const data = query.data;


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      <AdminPageHeader
        title="Admin Dashboard"
        description="Manage MediVision users, doctors, healthcare content and platform activity."
      />


      <section
        className="
          grid
          grid-cols-1
          gap-4

          sm:grid-cols-2
          xl:grid-cols-3
        "
      >
        <AdminStatCard
          icon={UserRound}
          title="Total Patients"
          value={
            data.total_patients
          }
        />

        <AdminStatCard
          icon={Stethoscope}
          title="Total Doctors"
          value={
            data.total_doctors
          }
        />

        <AdminStatCard
          icon={Activity}
          title="Pending Verification"
          value={
            data
              .pending_doctor_verifications
          }
        />

        <AdminStatCard
          icon={CalendarDays}
          title="Appointments"
          value={
            data
              .total_appointments
          }
        />

        <AdminStatCard
          icon={BrainCircuit}
          title="AI Assessments"
          value={
            data
              .total_ai_assessments
          }
        />

        <AdminStatCard
          icon={BrainCircuit}
          title="Image Analyses"
          value={
            data
              .total_image_analyses
          }
          description="Shows 0 while the medical-image module is deferred."
        />
      </section>


      <section
        className="
          grid
          grid-cols-1
          gap-4

          sm:grid-cols-2
        "
      >
        <div
          className="
            rounded-xl
            border
            border-rose-200
            bg-rose-50
            p-5
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-rose-700
            "
          >
            Active SOS Events
          </p>

          <p
            className="
              mt-2
              text-3xl
              font-bold
              text-rose-900
            "
          >
            {
              data
                .active_sos_events
            }
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-emerald-200
            bg-emerald-50
            p-5
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-emerald-700
            "
          >
            Published Health Articles
          </p>

          <p
            className="
              mt-2
              text-3xl
              font-bold
              text-emerald-900
            "
          >
            {
              data
                .published_health_articles
            }
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
        "
      >
        <h2
          className="
            font-semibold
            text-slate-900
          "
        >
          Management
        </h2>

        <div
          className="
            mt-4
            grid
            grid-cols-1
            gap-3

            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {managementLinks.map(
            (
              item
            ) => {
              const Icon =
                item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="
                    flex
                    min-h-[64px]
                    items-center
                    gap-3
                    rounded-lg
                    border
                    border-slate-200
                    px-4
                    text-sm
                    font-semibold
                    text-slate-700

                    hover:border-blue-200
                    hover:bg-blue-50
                    hover:text-blue-700
                  "
                >
                  <Icon
                    className="h-5 w-5"
                  />

                  {item.label}
                </Link>
              );
            }
          )}
        </div>
      </section>
    </div>
  );
}
