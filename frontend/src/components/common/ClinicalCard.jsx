export default function ClinicalCard({
  children,
  className = "",
  interactive = false,
}) {
  const interactiveClasses = interactive
    ? `
      hover:-translate-y-0.5
      hover:shadow-md
      transition-all
      duration-200
      ease-in-out
    `
    : "";

  return (
    <section
      className={`
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-sm
        ${interactiveClasses}
        ${className}
      `}
    >
      {children}
    </section>
  );
}