export default function AdminStatCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <article
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-sm
              font-medium
              text-slate-500
            "
          >
            {title}
          </p>

          <p
            className="
              mt-2
              text-3xl
              font-bold
              text-slate-900
            "
          >
            {value ?? 0}
          </p>

          {description && (
            <p
              className="
                mt-2
                text-xs
                leading-5
                text-slate-500
              "
            >
              {description}
            </p>
          )}
        </div>

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-blue-50
            text-blue-600
          "
        >
          <Icon
            className="h-5 w-5"
          />
        </div>
      </div>
    </article>
  );
}
