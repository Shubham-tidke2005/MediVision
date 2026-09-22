export default function AdminPageHeader({
  eyebrow = "Administration",
  title,
  description,
  action = null,
}) {
  return (
    <section
      className="
        flex
        flex-col
        gap-4

        sm:flex-row
        sm:items-end
        sm:justify-between
      "
    >
      <div>
        <p
          className="
            text-sm
            font-semibold
            text-blue-600
          "
        >
          {eyebrow}
        </p>

        <h1
          className="
            mt-1
            text-2xl
            font-bold
            tracking-tight
            text-slate-900

            sm:text-3xl
          "
        >
          {title}
        </h1>

        {description && (
          <p
            className="
              mt-2
              max-w-3xl
              text-sm
              leading-6
              text-slate-500
            "
          >
            {description}
          </p>
        )}
      </div>

      {action}
    </section>
  );
}
