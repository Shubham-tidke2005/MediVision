import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";

import {
  getAdminAuditLogs,
} from "@/features/admin/api/auditApi";

import AdminPageHeader
  from "@/features/admin/components/AdminPageHeader";

import AdminQueryState
  from "@/features/admin/components/AdminQueryState";


const ACTION_OPTIONS = [
  "LOGIN",
  "APPOINTMENT_CREATED",
  "APPOINTMENT_APPROVED",
  "APPOINTMENT_REJECTED",
  "APPOINTMENT_CANCELLED",
  "PATIENT_RECORD_VIEWED",
  "MEDICAL_ACCESS_GRANTED",
  "MEDICAL_ACCESS_REVOKED",
  "PRESCRIPTION_CREATED",
  "MEDICAL_DOCUMENT_VIEWED",
  "AI_ASSESSMENT_CREATED",
  "IMAGE_ANALYSIS_CREATED",
];


const RESOURCE_OPTIONS = [
  "USER",
  "APPOINTMENT",
  "PATIENT",
  "MEDICAL_ACCESS_GRANT",
  "PRESCRIPTION",
  "MEDICAL_DOCUMENT",
  "AI_ASSESSMENT",
  "IMAGE_ANALYSIS",
];


const PAGE_SIZE = 50;


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? value
    : date.toLocaleString();
}


function formatLabel(value) {
  return (
    value
      ?.replaceAll("_", " ")
    ?? "—"
  );
}


export default function AdminAuditLogsPage() {
  const [
    filters,
    setFilters,
  ] = useState({
    action: "",
    resourceType: "",
    resourceId: "",
    userId: "",
  });

  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState({
    action: "",
    resourceType: "",
    resourceId: "",
    userId: "",
  });

  const [
    offset,
    setOffset,
  ] = useState(0);


  const query =
    useQuery({
      queryKey: [
        "admin-audit-logs",
        appliedFilters,
        offset,
      ],

      queryFn: () =>
        getAdminAuditLogs({
          ...appliedFilters,
          limit: PAGE_SIZE,
          offset,
        }),
    });


  const items =
    query.data?.items
    ?? [];

  const total =
    query.data?.total
    ?? 0;

  const currentPage =
    Math.floor(
      offset / PAGE_SIZE
    ) + 1;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total / PAGE_SIZE
      )
    );


  function setFilter(
    key,
    value
  ) {
    setFilters(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  }


  function applyFilters(
    event
  ) {
    event.preventDefault();

    setOffset(0);

    setAppliedFilters({
      action:
        filters.action,
      resourceType:
        filters.resourceType,
      resourceId:
        filters.resourceId.trim(),
      userId:
        filters.userId.trim(),
    });
  }


  function clearFilters() {
    const empty = {
      action: "",
      resourceType: "",
      resourceId: "",
      userId: "",
    };

    setFilters(empty);
    setAppliedFilters(empty);
    setOffset(0);
  }


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      <AdminPageHeader
        eyebrow="Security & Traceability"
        title="Audit Logs"
        description="Review important authenticated actions across MediVision. Audit history is read-only."
        action={
          <button
            type="button"
            onClick={() =>
              query.refetch()
            }
            disabled={
              query.isFetching
            }
            className="
              inline-flex
              min-h-[40px]
              items-center
              gap-2
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              font-semibold
              text-slate-700
              hover:bg-slate-50
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={
                query.isFetching
                  ? "h-4 w-4 animate-spin"
                  : "h-4 w-4"
              }
            />
            Refresh
          </button>
        }
      />


      <section
        className="
          rounded-xl
          border
          border-emerald-200
          bg-emerald-50
          p-4
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <ShieldCheck
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
              text-emerald-700
            "
          />

          <p
            className="
              text-sm
              leading-6
              text-emerald-800
            "
          >
            Audit entries contain operational metadata only.
            Passwords, JWTs, API keys, prompts and full
            unnecessary Patient data must never be stored.
          </p>
        </div>
      </section>


      <form
        onSubmit={
          applyFilters
        }
        className="
          grid
          grid-cols-1
          gap-3
          rounded-xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        <select
          value={filters.action}
          onChange={(event) =>
            setFilter(
              "action",
              event.target.value
            )
          }
          className="
            rounded-lg
            border
            border-slate-200
            bg-white
            px-3
            py-2.5
            text-sm
          "
        >
          <option value="">
            All actions
          </option>

          {ACTION_OPTIONS.map(
            (action) => (
              <option
                key={action}
                value={action}
              >
                {formatLabel(action)}
              </option>
            )
          )}
        </select>


        <select
          value={
            filters.resourceType
          }
          onChange={(event) =>
            setFilter(
              "resourceType",
              event.target.value
            )
          }
          className="
            rounded-lg
            border
            border-slate-200
            bg-white
            px-3
            py-2.5
            text-sm
          "
        >
          <option value="">
            All resources
          </option>

          {RESOURCE_OPTIONS.map(
            (resource) => (
              <option
                key={resource}
                value={resource}
              >
                {formatLabel(resource)}
              </option>
            )
          )}
        </select>


        <input
          value={
            filters.resourceId
          }
          onChange={(event) =>
            setFilter(
              "resourceId",
              event.target.value
            )
          }
          placeholder="Resource ID"
          className="
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5
            text-sm
          "
        />


        <input
          value={filters.userId}
          onChange={(event) =>
            setFilter(
              "userId",
              event.target.value
            )
          }
          placeholder="User UUID"
          className="
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5
            text-sm
          "
        />


        <div
          className="
            flex
            flex-wrap
            gap-2
            md:col-span-2
            xl:col-span-4
            xl:justify-end
          "
        >
          <button
            type="button"
            onClick={clearFilters}
            className="
              rounded-lg
              border
              border-slate-200
              px-4
              py-2
              text-sm
              font-semibold
              text-slate-700
              hover:bg-slate-50
            "
          >
            Clear
          </button>

          <button
            type="submit"
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              bg-blue-600
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              hover:bg-blue-700
            "
          >
            <Search
              className="h-4 w-4"
            />
            Apply Filters
          </button>
        </div>
      </form>


      <AdminQueryState
        isLoading={
          query.isLoading
        }
        isError={
          query.isError
        }
        error={query.error}
        loadingMessage="Loading audit history..."
      />


      {!query.isLoading
        && !query.isError
        && items.length === 0
        && (
          <section
            className="
              rounded-xl
              border
              border-dashed
              border-slate-300
              bg-white
              p-12
              text-center
              text-sm
              text-slate-500
            "
          >
            No audit events match the current filters.
          </section>
        )}


      {!query.isLoading
        && !query.isError
        && items.length > 0
        && (
          <div
            className="
              overflow-x-auto
              rounded-xl
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >
            <table
              className="
                min-w-full
                divide-y
                divide-slate-200
              "
            >
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Time",
                    "Action",
                    "User",
                    "Resource",
                    "Resource ID",
                    "Metadata",
                  ].map(
                    (label) => (
                      <th
                        key={label}
                        className="
                          whitespace-nowrap
                          px-4
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-slate-500
                        "
                      >
                        {label}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody
                className="
                  divide-y
                  divide-slate-100
                "
              >
                {items.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="
                        hover:bg-slate-50
                      "
                    >
                      <td
                        className="
                          whitespace-nowrap
                          px-4
                          py-3
                          text-sm
                          text-slate-600
                        "
                      >
                        {
                          formatDate(
                            item.created_at
                          )
                        }
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                          text-sm
                          font-semibold
                          text-blue-700
                        "
                      >
                        {
                          formatLabel(
                            item.action
                          )
                        }
                      </td>

                      <td
                        className="
                          max-w-[220px]
                          break-all
                          px-4
                          py-3
                          text-xs
                          text-slate-600
                        "
                      >
                        {
                          item.user_id
                          ?? "SYSTEM / REMOVED USER"
                        }
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                          text-sm
                          font-medium
                          text-slate-700
                        "
                      >
                        {
                          formatLabel(
                            item.resource_type
                          )
                        }
                      </td>

                      <td
                        className="
                          max-w-[220px]
                          break-all
                          px-4
                          py-3
                          text-xs
                          text-slate-600
                        "
                      >
                        {
                          item.resource_id
                          ?? "—"
                        }
                      </td>

                      <td
                        className="
                          max-w-[360px]
                          px-4
                          py-3
                        "
                      >
                        <pre
                          className="
                            max-h-32
                            overflow-auto
                            whitespace-pre-wrap
                            break-words
                            rounded-lg
                            bg-slate-50
                            p-2
                            text-xs
                            leading-5
                            text-slate-600
                          "
                        >
                          {
                            JSON.stringify(
                              item.metadata
                              ?? {},
                              null,
                              2
                            )
                          }
                        </pre>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}


      {!query.isLoading
        && !query.isError
        && total > 0
        && (
          <section
            className="
              flex
              flex-col
              gap-3
              rounded-xl
              border
              border-slate-200
              bg-white
              p-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p
              className="
                text-sm
                text-slate-500
              "
            >
              Page {currentPage}
              {" "}of{" "}
              {totalPages}
              {" · "}
              {total}
              {" "}events
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  offset === 0
                }
                onClick={() =>
                  setOffset(
                    (current) =>
                      Math.max(
                        0,
                        current - PAGE_SIZE
                      )
                  )
                }
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-lg
                  border
                  border-slate-200
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  disabled:opacity-40
                "
              >
                <ChevronLeft
                  className="h-4 w-4"
                />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  offset
                  + PAGE_SIZE
                  >= total
                }
                onClick={() =>
                  setOffset(
                    (current) =>
                      current
                      + PAGE_SIZE
                  )
                }
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-lg
                  border
                  border-slate-200
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  disabled:opacity-40
                "
              >
                Next
                <ChevronRight
                  className="h-4 w-4"
                />
              </button>
            </div>
          </section>
        )}
    </div>
  );
}
