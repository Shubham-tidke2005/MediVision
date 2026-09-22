import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminUsers,
  updateUserActive,
} from "@/features/admin/api/adminApi";

import AdminPageHeader
  from "@/features/admin/components/AdminPageHeader";

import AdminQueryState
  from "@/features/admin/components/AdminQueryState";

import AdminTable
  from "@/features/admin/components/AdminTable";


export default function AdminUsersPage() {
  const queryClient =
    useQueryClient();

  const query =
    useQuery({
      queryKey: [
        "admin-users",
      ],
      queryFn:
        getAdminUsers,
    });

  const mutation =
    useMutation({
      mutationFn: ({
        userId,
        isActive,
      }) =>
        updateUserActive(
          userId,
          isActive
        ),

      onSuccess: () => {
        queryClient
          .invalidateQueries({
            queryKey: [
              "admin-users",
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
        title="Users"
        description="Review platform accounts and enable or disable access. Password hashes, tokens and secrets are never returned."
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
                key: "email",
                label: "Email",
              },
              {
                key: "role",
                label: "Role",
              },
              {
                key: "is_verified",
                label: "Verified",
              },
              {
                key: "created_at",
                label: "Created",
              },
              {
                key: "actions",
                label: "Access",
                render: (
                  row
                ) => (
                  <button
                    type="button"
                    disabled={
                      mutation
                        .isPending
                    }
                    onClick={() =>
                      mutation.mutate({
                        userId:
                          row.id,
                        isActive:
                          !row
                            .is_active,
                      })
                    }
                    className={`
                      rounded-lg
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-white

                      ${
                        row.is_active
                          ? "bg-rose-600 hover:bg-rose-700"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }
                    `}
                  >
                    {row.is_active
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                ),
              },
            ]}
          />
        )}
    </div>
  );
}
