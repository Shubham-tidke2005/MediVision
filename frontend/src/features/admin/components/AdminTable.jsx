function formatValue(
  value
) {
  if (
    value === null
    || value === undefined
    || value === ""
  ) {
    return "—";
  }

  if (
    typeof value
    === "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }

  if (
    typeof value
    === "object"
  ) {
    return JSON.stringify(
      value
    );
  }

  const stringValue =
    String(value);

  if (
    /^\d{4}-\d{2}-\d{2}T/
      .test(
        stringValue
      )
  ) {
    const date =
      new Date(
        stringValue
      );

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date
        .toLocaleString();
    }
  }

  return stringValue;
}


export default function AdminTable({
  columns,
  rows,
  emptyMessage =
    "No records found.",
}) {
  if (!rows?.length) {
    return (
      <div
        className="
          rounded-xl
          border
          border-dashed
          border-slate-300
          bg-white
          p-10
          text-center
          text-sm
          text-slate-500
        "
      >
        {emptyMessage}
      </div>
    );
  }

  return (
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
        <thead
          className="bg-slate-50"
        >
          <tr>
            {columns.map(
              (
                column
              ) => (
                <th
                  key={
                    column.key
                  }
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
                  {
                    column.label
                  }
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
          {rows.map(
            (
              row,
              index
            ) => (
              <tr
                key={
                  row.id
                  ?? index
                }
                className="
                  hover:bg-slate-50
                "
              >
                {columns.map(
                  (
                    column
                  ) => (
                    <td
                      key={
                        column.key
                      }
                      className="
                        max-w-[320px]
                        px-4
                        py-3
                        align-top
                        text-sm
                        text-slate-700
                      "
                    >
                      {column.render
                        ? column.render(
                            row
                          )
                        : (
                          <span
                            className="
                              break-words
                            "
                          >
                            {
                              formatValue(
                                row[
                                  column
                                    .key
                                ]
                              )
                            }
                          </span>
                        )}
                    </td>
                  )
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
