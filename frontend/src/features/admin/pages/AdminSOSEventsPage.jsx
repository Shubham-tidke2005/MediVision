import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAdminSOSEvents,
} from "@/features/admin/api/adminApi";

import AdminPageHeader
  from "@/features/admin/components/AdminPageHeader";

import AdminQueryState
  from "@/features/admin/components/AdminQueryState";

import AdminTable
  from "@/features/admin/components/AdminTable";


export default function AdminSOSEventsPage() {
  const query =
    useQuery({
      queryKey: [
        "admin-sos-events",
      ],
      queryFn:
        getAdminSOSEvents,
    });


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      <AdminPageHeader
        title="SOS Events"
        description="Review MediVision SOS workflow events. This does not mean emergency services were automatically dispatched."
      />

      <div
        className="
          rounded-xl
          border
          border-amber-200
          bg-amber-50
          p-4
          text-sm
          leading-6
          text-amber-800
        "
      >
        ACKNOWLEDGED is an internal
        MediVision workflow status. It
        must not be interpreted as
        confirmation from an ambulance,
        hospital, police, or other
        emergency service.
      </div>

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
                key: "patient_id",
                label: "Patient",
              },
              {
                key: "status",
                label: "Status",
              },
              {
                key: "share_location",
                label: "Location Shared",
              },
              {
                key: "triggered_at",
                label: "Triggered",
              },
              {
                key: "acknowledged_at",
                label: "Acknowledged",
              },
              {
                key: "resolved_at",
                label: "Resolved",
              },
              {
                key: "cancelled_at",
                label: "Cancelled",
              },
            ]}
          />
        )}
    </div>
  );
}
