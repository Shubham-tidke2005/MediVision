import {
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createHealthArticle,
  getAdminHealthArticles,
  updateHealthArticle,
} from "@/features/admin/api/adminApi";

import AdminPageHeader
  from "@/features/admin/components/AdminPageHeader";

import AdminQueryState
  from "@/features/admin/components/AdminQueryState";

import AdminTable
  from "@/features/admin/components/AdminTable";


const emptyForm = {
  category: "GENERAL_SCREENING",
  slug: "",
  title: "",
  summary: "",
  content: "",
  key_points_text: "",
  professional_advice_note:
    "For personalized medical advice, consult a qualified healthcare professional.",
  source_name: "",
  source_url: "",
  status: "DRAFT",
  featured: false,
};


export default function AdminHealthArticlesPage() {
  const queryClient =
    useQueryClient();

  const [form, setForm] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState(null);

  const query =
    useQuery({
      queryKey: [
        "admin-health-articles",
      ],
      queryFn:
        getAdminHealthArticles,
    });

  const mutation =
    useMutation({
      mutationFn: (
        payload
      ) =>
        editingId
          ? updateHealthArticle(
              editingId,
              payload
            )
          : createHealthArticle(
              payload
            ),

      onSuccess: () => {
        setEditingId(null);
        setForm(emptyForm);

        queryClient.invalidateQueries({
          queryKey: [
            "admin-health-articles",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "admin-dashboard",
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
      category:
        row.category
        ?? "GENERAL_SCREENING",
      slug:
        row.slug
        ?? "",
      title:
        row.title
        ?? "",
      summary:
        row.summary
        ?? "",
      content:
        row.content
        ?? "",
      key_points_text:
        (
          row.key_points
          ?? []
        ).join("\n"),
      professional_advice_note:
        row.professional_advice_note
        ?? "",
      source_name:
        row.source_name
        ?? "",
      source_url:
        row.source_url
        ?? "",
      status:
        row.status
        ?? "DRAFT",
      featured:
        row.featured
        ?? false,
    });
  }


  function submit(
    event
  ) {
    event.preventDefault();

    mutation.mutate({
      category: form.category,
      slug: form.slug,
      title: form.title,
      summary: form.summary,
      content: form.content,
      key_points:
        form
          .key_points_text
          .split("\n")
          .map(
            item => item.trim()
          )
          .filter(Boolean),
      professional_advice_note:
        form.professional_advice_note,
      source_name:
        form.source_name
        || null,
      source_url:
        form.source_url
        || null,
      status: form.status,
      featured: form.featured,
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
        title="Health Articles"
        description="Create, edit, publish and archive preventive-health education content."
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
          value={form.category}
          onChange={(
            event
          ) => field(
            "category",
            event.target.value.toUpperCase()
          )}
          placeholder="Category code"
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
          value={form.slug}
          onChange={(
            event
          ) => field(
            "slug",
            event.target.value
          )}
          placeholder="article-slug"
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
          value={form.title}
          onChange={(
            event
          ) => field(
            "title",
            event.target.value
          )}
          placeholder="Article title"
          className="
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5

            md:col-span-2
          "
          required
        />

        <textarea
          value={form.summary}
          onChange={(
            event
          ) => field(
            "summary",
            event.target.value
          )}
          placeholder="Summary"
          className="
            min-h-24
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5

            md:col-span-2
          "
          required
        />

        <textarea
          value={form.content}
          onChange={(
            event
          ) => field(
            "content",
            event.target.value
          )}
          placeholder="Article content"
          className="
            min-h-52
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5

            md:col-span-2
          "
          required
        />

        <textarea
          value={form.key_points_text}
          onChange={(
            event
          ) => field(
            "key_points_text",
            event.target.value
          )}
          placeholder="Key points — one per line"
          className="
            min-h-32
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5
          "
        />

        <textarea
          value={form.professional_advice_note}
          onChange={(
            event
          ) => field(
            "professional_advice_note",
            event.target.value
          )}
          placeholder="Professional advice note"
          className="
            min-h-32
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5
          "
          required
        />

        <input
          value={form.source_name}
          onChange={(
            event
          ) => field(
            "source_name",
            event.target.value
          )}
          placeholder="Source name"
          className="
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5
          "
        />

        <input
          value={form.source_url}
          onChange={(
            event
          ) => field(
            "source_url",
            event.target.value
          )}
          placeholder="Source URL"
          className="
            rounded-lg
            border
            border-slate-200
            px-3
            py-2.5
          "
        />

        <select
          value={form.status}
          onChange={(
            event
          ) => field(
            "status",
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
          <option value="DRAFT">
            Draft
          </option>
          <option value="PUBLISHED">
            Published
          </option>
          <option value="ARCHIVED">
            Archived
          </option>
        </select>

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
            checked={form.featured}
            onChange={(
              event
            ) => field(
              "featured",
              event.target.checked
            )}
          />
          Featured
        </label>

        <div
          className="
            flex
            gap-2

            md:col-span-2
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
              ? "Save Article"
              : "Create Article"}
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
                key: "title",
                label: "Title",
              },
              {
                key: "category",
                label: "Category",
              },
              {
                key: "status",
                label: "Status",
              },
              {
                key: "featured",
                label: "Featured",
              },
              {
                key: "published_at",
                label: "Published",
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
