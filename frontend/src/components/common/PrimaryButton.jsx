export default function PrimaryButton({
  children,
  type = "button",
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        inline-flex
        min-h-[44px]
        items-center
        justify-center
        gap-2
        rounded-lg
        bg-blue-600
        px-4
        py-2
        text-sm
        font-semibold
        text-white

        transition-all
        duration-200

        hover:bg-blue-700

        active:scale-[0.98]

        focus:outline-none
        focus:ring-2
        focus:ring-blue-600
        focus:ring-offset-2

        disabled:pointer-events-none
        disabled:opacity-50

        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}