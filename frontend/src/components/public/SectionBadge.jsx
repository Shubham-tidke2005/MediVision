export default function SectionBadge({
  children,
}) {
  return (
    <span
      className="
        inline-flex
        items-center
        rounded-full
        border
        border-sky-200
        bg-sky-50
        px-3
        py-1
        text-xs
        font-semibold
        text-sky-700
      "
    >
      {children}
    </span>
  );
}