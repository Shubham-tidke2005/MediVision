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
        z-30

        bg-slate-50/80

        px-3
        py-3

        backdrop-blur-xl

        sm:px-5
        lg:px-6
      "
    >
      <div
        className="
          flex
          min-h-14
          items-center
          gap-3

          rounded-2xl

          border
          border-slate-200/80

          bg-white/90

          px-2.5
          py-2

          shadow-sm
          shadow-slate-900/5

          backdrop-blur-xl

          sm:px-3
        "
      >
        {/* ==============================================
            MOBILE MENU
        ============================================== */}

        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="
            flex
            min-h-[44px]
            min-w-[44px]
            shrink-0
            items-center
            justify-center

            rounded-xl

            border
            border-slate-200/80

            bg-white

            text-slate-600

            transition-all
            duration-200

            hover:bg-slate-50
            hover:text-slate-900

            active:scale-[0.96]

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
            focus:ring-offset-2

            md:hidden
          "
        >
          <Menu
            className="
              h-5
              w-5
            "
            aria-hidden="true"
          />
        </button>


        {/* ==============================================
            SEARCH
        ============================================== */}

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

          <div
            className="
              relative
            "
          >
            <Search
              className="
                pointer-events-none
                absolute
                left-3.5
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

                rounded-xl

                border
                border-slate-200/80

                bg-slate-50/70

                py-2
                pl-10
                pr-4

                text-sm
                text-slate-900

                placeholder:text-slate-400

                transition-all
                duration-200

                hover:border-slate-300
                hover:bg-white

                focus:border-blue-300
                focus:bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-blue-600/20
              "
            />
          </div>
        </div>


        {/* ==============================================
            RIGHT SIDE
        ============================================== */}

        <div
          className="
            ml-auto
            flex
            items-center
            gap-1.5

            sm:gap-2
          "
        >
          {/* ============================================
              NOTIFICATIONS
          ============================================ */}

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

              rounded-xl

              border
              border-transparent

              text-slate-600

              transition-all
              duration-200

              hover:border-slate-200
              hover:bg-slate-50
              hover:text-slate-900

              active:scale-[0.96]

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          >
            <Bell
              className="
                h-5
                w-5
              "
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

                ring-2
                ring-white
              "
              aria-hidden="true"
            />
          </Link>


          {/* ============================================
              USER PROFILE
          ============================================ */}

          <div
            className="
              hidden
              min-w-0
              items-center
              gap-2.5

              rounded-xl

              border
              border-slate-200/70

              bg-slate-50/70

              px-2.5
              py-1.5

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

                bg-gradient-to-br
                from-blue-600
                to-sky-500

                text-sm
                font-bold
                text-white

                shadow-sm
                shadow-blue-600/20
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
                pr-1
                text-left
              "
            >
              <p
                className="
                  max-w-[180px]
                  truncate

                  text-sm
                  font-semibold
                  text-slate-900

                  xl:max-w-[220px]
                "
              >
                {user?.email ??
                  "User"}
              </p>

              <p
                className="
                  mt-0.5

                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                {user?.role ??
                  "ACCOUNT"}
              </p>
            </div>
          </div>


          {/* ============================================
              LOGOUT
          ============================================ */}

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
            className="
              flex
              min-h-[44px]
              min-w-[44px]
              shrink-0
              items-center
              justify-center

              rounded-xl

              border
              border-transparent

              text-slate-600

              transition-all
              duration-200

              hover:border-rose-100
              hover:bg-rose-50
              hover:text-rose-600

              active:scale-[0.96]

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          >
            <LogOut
              className="
                h-5
                w-5
              "
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </header>
  );
}