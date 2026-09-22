import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAdminAIAssessments,
} from "@/features/admin/api/adminApi";

import AdminPageHeader
  from "@/features/admin/components/AdminPageHeader";

import AdminQueryState
  from "@/features/admin/components/AdminQueryState";

import AdminTable
  from "@/features/admin/components/AdminTable";


export default function AdminAIAssessmentsPage() {
  const query =
    useQuery({
      queryKey: [
        "admin-ai-assessments",
      ],
      queryFn:
        getAdminAIAssessments,
    });


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      <AdminPageHeader
        title="AI Assessments"
        description="Operational metadata for AI-assisted symptom assessments. This page does not turn AI output into a clinical diagnosis."
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
                label: "Assessment",
              },
              {
                key: "patient_id",
                label: "Patient",
              },
              {
                key: "urgency",
                label: "Urgency",
              },
              {
                key: "triage_level",
                label: "Triage",
              },
              {
                key: "recommended_specialty_code",
                label: "Specialty",
              },
              {
                key: "provider",
                label: "Provider",
              },
              {
                key: "model",
                label: "Model",
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
