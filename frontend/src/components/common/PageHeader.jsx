export default function PageHeader({
  title,
  description,
  action,
}) {
  return (
    <div
      className="
        flex
        flex-col
        gap-4
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div className="min-w-0">
        <h1
          className="
            text-2xl
            font-bold
            tracking-tight
            text-slate-900
            lg:text-3xl
          "
        >
          {title}
        </h1>

        {description && (
          <p
            className="
              mt-1
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
            "
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}