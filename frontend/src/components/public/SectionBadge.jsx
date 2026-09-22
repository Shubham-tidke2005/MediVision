export default function SectionBadge({
  children,
}) {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-2

        rounded-full
        border
        border-sky-200/80

        bg-white/90

        px-3
        py-1.5

        text-xs
        font-semibold
        tracking-wide
        text-sky-700

        shadow-sm
        shadow-sky-100/60

        backdrop-blur-sm
      "
    >
      <span
        className="
          h-1.5
          w-1.5
          rounded-full
          bg-blue-600
        "
        aria-hidden="true"
      />

      {children}
    </span>
  );
}