const variants = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  warning:
    "border-amber-200 bg-amber-50 text-amber-700",

  critical:
    "border-rose-200 bg-rose-50 text-rose-700",

  neutral:
    "border-slate-200 bg-slate-50 text-slate-600",

  info:
    "border-sky-200 bg-sky-50 text-sky-700",
};


export default function StatusBadge({
  children,
  variant = "neutral",
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold
        ${variants[variant]}
      `}
    >
      {children}
    </span>
  );
}