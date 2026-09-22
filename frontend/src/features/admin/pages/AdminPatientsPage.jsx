import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAdminPatients,
} from "@/features/admin/api/adminApi";

import AdminPageHeader
  from "@/features/admin/components/AdminPageHeader";

import AdminQueryState
  from "@/features/admin/components/AdminQueryState";

import AdminTable
  from "@/features/admin/components/AdminTable";


export default function AdminPatientsPage() {
  const query =
    useQuery({
      queryKey: [
        "admin-patients",
      ],
      queryFn:
        getAdminPatients,
    });


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      <AdminPageHeader
        title="Patients"
        description="Administrative patient directory. Full clinical history is intentionally not exposed in this list."
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
                key: "patient_code",
                label: "Patient Code",
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
                key: "dob",
                label: "DOB",
              },
              {
                key: "date_of_birth",
                label: "Date of Birth",
              },
              {
                key: "blood_group",
                label: "Blood Group",
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
