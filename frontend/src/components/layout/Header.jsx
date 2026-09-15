import {
  Bell,
  LogOut,
  Menu,
  Search,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";


export default function Header({
  onOpenMenu,
}) {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();


  function handleLogout() {
    logout();

    navigate(
      "/",
      {
        replace: true,
      }
    );
  }


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
      {/* Mobile menu button */}
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

          transition-all
          duration-200

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
        <Menu
          className="h-5 w-5"
          aria-hidden="true"
        />
      </button>


      {/* Search */}
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
            aria-hidden="true"
          />

          <input
            id="global-search"
            type="search"
            placeholder="Search MediVision..."
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

              transition-all
              duration-200

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          />
        </div>
      </div>


      {/* Right side */}
      <div
        className="
          ml-auto
          flex
          items-center
          gap-2
        "
      >
        {/* Notifications */}
        <Link
          to="/notifications"
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

            transition-all
            duration-200

            hover:bg-slate-100
            hover:text-slate-900

            active:scale-[0.98]

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
            focus:ring-offset-2
          "
        >
          <Bell
            className="h-5 w-5"
            aria-hidden="true"
          />

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
            aria-hidden="true"
          />
        </Link>


        {/* User information */}
        <div
          className="
            hidden
            min-w-0
            items-center
            gap-3
            rounded-lg
            px-2
            lg:flex
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-sky-50
              text-sm
              font-semibold
              text-sky-700
            "
          >
            {user?.email
              ?.charAt(0)
              ?.toUpperCase() ??
              "U"}
          </div>

          <div
            className="
              min-w-0
              text-left
            "
          >
            <p
              className="
                max-w-[220px]
                truncate
                text-sm
                font-semibold
                text-slate-900
              "
            >
              {user?.email ??
                "User"}
            </p>

            <p
              className="
                text-xs
                font-medium
                text-slate-500
              "
            >
              {user?.role ??
                "ACCOUNT"}
            </p>
          </div>
        </div>


        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign out"
          title="Sign out"
          className="
            flex
            min-h-[44px]
            min-w-[44px]
            items-center
            justify-center

            rounded-lg
            text-slate-600

            transition-all
            duration-200

            hover:bg-slate-100
            hover:text-slate-900

            active:scale-[0.98]

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
            focus:ring-offset-2
          "
        >
          <LogOut
            className="h-5 w-5"
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
}