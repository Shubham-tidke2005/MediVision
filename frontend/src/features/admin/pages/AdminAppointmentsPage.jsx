import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAdminAppointments,
} from "@/features/admin/api/adminApi";

import AdminPageHeader
  from "@/features/admin/components/AdminPageHeader";

import AdminQueryState
  from "@/features/admin/components/AdminQueryState";

import AdminTable
  from "@/features/admin/components/AdminTable";


export default function AdminAppointmentsPage() {
  const query =
    useQuery({
      queryKey: [
        "admin-appointments",
      ],
      queryFn:
        getAdminAppointments,
    });


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      <AdminPageHeader
        title="Appointments"
        description="Read-only operational view of appointment activity. Admin does not arbitrarily rewrite clinical workflow states."
      />

      <AdminQueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
      />

      {!query.isLoading
        && !query.isError
        && (
          <AdminTable
            rows={query.data?.items ?? []}
            columns={[
              {
                key: "id",
                label: "Appointment",
              },
              {
                key: "patient_id",
                label: "Patient",
              },
              {
                key: "doctor_id",
                label: "Doctor",
              },
              {
                key: "appointment_type",
                label: "Type",
              },
              {
                key: "status",
                label: "Status",
              },
              {
                key: "start_at",
                label: "Start",
              },
              {
                key: "created_at",
                label: "Created",
              },
            ]}
          />
        )}
    </div>
  );
}
