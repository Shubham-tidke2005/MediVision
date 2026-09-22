import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminDoctors,
  updateDoctorVerification,
} from "@/features/admin/api/adminApi";

import AdminPageHeader
  from "@/features/admin/components/AdminPageHeader";

import AdminQueryState
  from "@/features/admin/components/AdminQueryState";

import AdminTable
  from "@/features/admin/components/AdminTable";


const statuses = [
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
];


export default function AdminDoctorsPage() {
  const queryClient =
    useQueryClient();

  const query =
    useQuery({
      queryKey: [
        "admin-doctors",
      ],
      queryFn:
        getAdminDoctors,
    });

  const mutation =
    useMutation({
      mutationFn: ({
        doctorId,
        verificationStatus,
      }) =>
        updateDoctorVerification(
          doctorId,
          verificationStatus
        ),

      onSuccess: () => {
        queryClient
          .invalidateQueries({
            queryKey: [
              "admin-doctors",
            ],
          });

        queryClient
          .invalidateQueries({
            queryKey: [
              "admin-dashboard",
            ],
          });
      },
    });


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      <AdminPageHeader
        title="Doctor Verification"
        description="Review professional accounts and manage verification status. Rejected or suspended doctors are automatically marked as not accepting patients."
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
            rows={
              query.data?.items
              ?? []
            }
            columns={[
              {
                key: "doctor_code",
                label: "Doctor Code",
              },
              {
                key: "first_name",
                label: "First Name",
              },
              {
                key: "last_name",
                label: "Last Name",
              },
              {
                key: "qualification",
                label: "Qualification",
              },
              {
                key: "registration_number",
                label: "Registration",
              },
              {
                key: "verification_status",
                label: "Verification",
              },
              {
                key: "actions",
                label: "Update",
                render: (
                  row
                ) => (
                  <select
                    value={
                      row
                        .verification_status
                      ?? "PENDING"
                    }
                    disabled={
                      mutation
                        .isPending
                    }
                    onChange={(
                      event
                    ) =>
                      mutation.mutate({
                        doctorId:
                          row.id,
                        verificationStatus:
                          event.target
                            .value,
                      })
                    }
                    className="
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-slate-700
                    "
                  >
                    {statuses.map(
                      (
                        item
                      ) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                ),
              },
            ]}
          />
        )}
    </div>
  );
}
