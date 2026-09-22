import {
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createFacility,
  getAdminFacilities,
  updateFacility,
} from "@/features/admin/api/adminApi";

import AdminPageHeader
  from "@/features/admin/components/AdminPageHeader";

import AdminQueryState
  from "@/features/admin/components/AdminQueryState";

import AdminTable
  from "@/features/admin/components/AdminTable";


const emptyForm = {
  name: "",
  facility_type: "HOSPITAL",
  address_line_1: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  phone: "",
  website: "",
  latitude: "",
  longitude: "",
  is_active: true,
};


export default function AdminFacilitiesPage() {
  const queryClient =
    useQueryClient();

  const [form, setForm] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState(null);

  const query =
    useQuery({
      queryKey: [
        "admin-facilities",
      ],
      queryFn:
        getAdminFacilities,
    });

  const mutation =
    useMutation({
      mutationFn: (
        payload
      ) =>
        editingId
          ? updateFacility(
              editingId,
              payload
            )
          : createFacility(
              payload
            ),

      onSuccess: () => {
        setEditingId(null);
        setForm(emptyForm);

        queryClient.invalidateQueries({
          queryKey: [
            "admin-facilities",
          ],
        });
      },
    });


  function field(
    key,
    value
  ) {
    setForm({
      ...form,
      [key]: value,
    });
  }


  function startEdit(
    row
  ) {
    setEditingId(row.id);

    setForm({
      name: row.name ?? "",
      facility_type:
        row.facility_type
        ?? "HOSPITAL",
      address_line_1:
        row.address_line_1
        ?? "",
      city: row.city ?? "",
      state: row.state ?? "",
      postal_code:
        row.postal_code
        ?? "",
      country:
        row.country
        ?? "India",
      phone: row.phone ?? "",
      website: row.website ?? "",
      latitude:
        row.latitude
        ?? "",
      longitude:
        row.longitude
        ?? "",
      is_active:
        row.is_active
        ?? true,
    });
  }


  function submit(
    event
  ) {
    event.preventDefault();

    mutation.mutate({
      ...form,
      latitude:
        form.latitude === ""
          ? null
          : Number(form.latitude),
      longitude:
        form.longitude === ""
          ? null
          : Number(form.longitude),
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
        title="Facilities"
        description="Manage MediVision-maintained hospitals, clinics, pharmacies and diagnostic centers."
      />


      <form
        onSubmit={submit}
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
          value={form.name}
          onChange={(
            event
          ) => field(
            "name",
            event.target.value
          )}
          placeholder="Facility name"
          required
          className="
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5
          "
        />

        <select
          value={form.facility_type}
          onChange={(
            event
          ) => field(
            "facility_type",
            event.target.value
          )}
          className="
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5
          "
        >
          <option value="HOSPITAL">
            Hospital
          </option>
          <option value="CLINIC">
            Clinic
          </option>
          <option value="PHARMACY">
            Pharmacy
          </option>
          <option value="DIAGNOSTIC_CENTER">
            Diagnostic Center
          </option>
        </select>

        {[
          ["address_line_1", "Address"],
          ["city", "City"],
          ["state", "State"],
          ["postal_code", "Postal code"],
          ["country", "Country"],
          ["phone", "Phone"],
          ["website", "Website"],
          ["latitude", "Latitude"],
          ["longitude", "Longitude"],
        ].map(
          ([key, placeholder]) => (
            <input
              key={key}
              value={form[key]}
              onChange={(
                event
              ) => field(
                key,
                event.target.value
              )}
              placeholder={placeholder}
              className="
                rounded-lg
                border
                border-slate-200
                px-3
                py-2.5
              "
            />
          )
        )}

        <label
          className="
            flex
            items-center
            gap-2
            text-sm
          "
        >
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(
              event
            ) => field(
              "is_active",
              event.target.checked
            )}
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
            disabled={mutation.isPending}
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
              : "Add Facility"}
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
                key: "name",
                label: "Name",
              },
              {
                key: "facility_type",
                label: "Type",
              },
              {
                key: "city",
                label: "City",
              },
              {
                key: "state",
                label: "State",
              },
              {
                key: "phone",
                label: "Phone",
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
