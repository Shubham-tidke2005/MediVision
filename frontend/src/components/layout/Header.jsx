import {
  Bell,
  Menu,
  Search,
} from "lucide-react";


export default function Header({
  onOpenMenu,
}) {
  return (
    <header
      className="
        sticky
        top-0
        z-20

        flex
        h-16
        items-center
        gap-3

        border-b
        border-slate-200/80
        bg-white/80
        px-4
        backdrop-blur-md

        sm:px-6
        lg:px-8
      "
    >
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="
          flex
          min-h-[44px]
          min-w-[44px]
          items-center
          justify-center
          rounded-lg
          text-slate-600

          hover:bg-slate-100
          hover:text-slate-900

          active:scale-[0.98]

          focus:outline-none
          focus:ring-2
          focus:ring-blue-600
          focus:ring-offset-2

          md:hidden
        "
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className="
          hidden
          max-w-md
          flex-1
          sm:block
        "
      >
        <label
          htmlFor="global-search"
          className="sr-only"
        >
          Search MediVision
        </label>

        <div className="relative">
          <Search
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            id="global-search"
            type="search"
            placeholder="Search..."
            className="
              min-h-[44px]
              w-full
              rounded-lg
              border
              border-slate-200
              bg-white
              py-2
              pl-10
              pr-3
              text-sm
              text-slate-900

              placeholder:text-slate-400

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          />
        </div>
      </div>

      <div
        className="
          ml-auto
          flex
          items-center
          gap-2
        "
      >
        <button
          type="button"
          aria-label="Notifications"
          className="
            relative
            flex
            min-h-[44px]
            min-w-[44px]
            items-center
            justify-center
            rounded-lg
            text-slate-600

            hover:bg-slate-100
            hover:text-slate-900

            active:scale-[0.98]

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
            focus:ring-offset-2
          "
        >
          <Bell className="h-5 w-5" />

          <span
            className="
              absolute
              right-2.5
              top-2.5
              h-2
              w-2
              rounded-full
              bg-blue-600
            "
          />
        </button>

        <button
          type="button"
          className="
            flex
            min-h-[44px]
            items-center
            gap-3
            rounded-lg
            px-2

            hover:bg-slate-100

            active:scale-[0.98]

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
            focus:ring-offset-2
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-slate-100
              text-sm
              font-semibold
              text-slate-700
            "
          >
            U
          </div>

          <div
            className="
              hidden
              text-left
              lg:block
            "
          >
            <p
              className="
                text-sm
                font-semibold
                text-slate-900
              "
            >
              User
            </p>

            <p
              className="
                text-xs
                text-slate-500
              "
            >
              Account
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}