import {
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createSpecialty,
  getAdminSpecialties,
  updateSpecialty,
} from "@/features/admin/api/adminApi";

import AdminPageHeader
  from "@/features/admin/components/AdminPageHeader";

import AdminQueryState
  from "@/features/admin/components/AdminQueryState";

import AdminTable
  from "@/features/admin/components/AdminTable";


const emptyForm = {
  code: "",
  name: "",
  description: "",
  is_active: true,
};


export default function AdminSpecialtiesPage() {
  const queryClient =
    useQueryClient();

  const [
    form,
    setForm,
  ] = useState(
    emptyForm
  );

  const [
    editingId,
    setEditingId,
  ] = useState(null);


  const query =
    useQuery({
      queryKey: [
        "admin-specialties",
      ],
      queryFn:
        getAdminSpecialties,
    });


  const saveMutation =
    useMutation({
      mutationFn: (
        payload
      ) =>
        editingId
          ? updateSpecialty(
              editingId,
              payload
            )
          : createSpecialty(
              payload
            ),

      onSuccess: () => {
        setForm(
          emptyForm
        );
        setEditingId(
          null
        );

        queryClient
          .invalidateQueries({
            queryKey: [
              "admin-specialties",
            ],
          });
      },
    });


  function startEdit(
    row
  ) {
    setEditingId(
      row.id
    );

    setForm({
      code:
        row.code
        ?? "",
      name:
        row.name
        ?? "",
      description:
        row.description
        ?? "",
      is_active:
        row.is_active
        ?? true,
    });
  }


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      <AdminPageHeader
        title="Specialties"
        description="Manage the specialty master used by doctors and specialist recommendations."
      />


      <form
        onSubmit={(
          event
        ) => {
          event.preventDefault();
          saveMutation.mutate(
            form
          );
        }}
        className="
          grid
          grid-cols-1
          gap-4
          rounded-xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm

          md:grid-cols-2
        "
      >
        <input
          value={form.code}
          onChange={(
            event
          ) =>
            setForm({
              ...form,
              code:
                event.target
                  .value
                  .toUpperCase(),
            })
          }
          placeholder="Code e.g. NEUROLOGY"
          className="
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5
          "
          required
        />

        <input
          value={form.name}
          onChange={(
            event
          ) =>
            setForm({
              ...form,
              name:
                event.target
                  .value,
            })
          }
          placeholder="Specialty name"
          className="
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5
          "
          required
        />

        <textarea
          value={form.description}
          onChange={(
            event
          ) =>
            setForm({
              ...form,
              description:
                event.target
                  .value,
            })
          }
          placeholder="Description"
          className="
            min-h-24
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5

            md:col-span-2
          "
        />

        <label
          className="
            flex
            items-center
            gap-2
            text-sm
            text-slate-700
          "
        >
          <input
            type="checkbox"
            checked={
              form.is_active
            }
            onChange={(
              event
            ) =>
              setForm({
                ...form,
                is_active:
                  event.target
                    .checked,
              })
            }
          />
          Active
        </label>

        <div
          className="
            flex
            gap-2
            md:justify-end
          "
        >
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="
                rounded-lg
                border
                border-slate-200
                px-4
                py-2
                text-sm
                font-semibold
              "
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={
              saveMutation.isPending
            }
            className="
              rounded-lg
              bg-blue-600
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              hover:bg-blue-700
              disabled:opacity-50
            "
          >
            {editingId
              ? "Save Changes"
              : "Add Specialty"}
          </button>
        </div>
      </form>


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
                key: "code",
                label: "Code",
              },
              {
                key: "name",
                label: "Name",
              },
              {
                key: "description",
                label: "Description",
              },
              {
                key: "is_active",
                label: "Active",
              },
              {
                key: "actions",
                label: "Actions",
                render: (
                  row
                ) => (
                  <button
                    type="button"
                    onClick={() => startEdit(row)}
                    className="
                      rounded-lg
                      border
                      border-slate-200
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-blue-700
                    "
                  >
                    Edit
                  </button>
                ),
              },
            ]}
          />
        )}
    </div>
  );
}
