import { useState } from "react";

import {
  HeartPulse,
  Menu,
  X,
} from "lucide-react";

import {
  Link,
  NavLink,
} from "react-router-dom";


const navigation = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "Services",
    path: "/services",
  },
  {
    label: "About",
    path: "/about",
  },
  {
    label: "Safety",
    path: "/safety",
  },
];


export default function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ==================================================
          FLOATING PUBLIC NAVBAR
      ================================================== */}

      <header
        className="
          fixed
          inset-x-0
          top-3
          z-50
          px-3

          sm:top-4
          sm:px-4
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-6xl
            items-center
            justify-between
            gap-3

            rounded-full
            border
            border-slate-200/80

            bg-white/90

            px-3
            py-2

            shadow-lg
            shadow-slate-900/5

            backdrop-blur-xl

            sm:px-4
          "
        >
          {/* ==============================================
              BRAND
          ============================================== */}

          <Link
            to="/"
            className="
              group
              flex
              min-h-[44px]
              min-w-0
              items-center
              gap-2.5

              rounded-full

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          >
            <div
              className="
                relative

                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                rounded-full

                bg-gradient-to-br
                from-blue-600
                to-sky-500

                text-white

                shadow-sm
                shadow-blue-600/30

                transition-transform
                duration-200

                group-hover:scale-105
              "
            >
              <HeartPulse
                className="
                  h-5
                  w-5
                "
                aria-hidden="true"
              />

              <span
                className="
                  absolute
                  -right-0.5
                  -top-0.5

                  h-2.5
                  w-2.5

                  rounded-full

                  bg-emerald-500

                  ring-2
                  ring-white
                "
                aria-hidden="true"
              />
            </div>

            <div
              className="
                min-w-0
                leading-tight
              "
            >
              <p
                className="
                  truncate

                  text-sm
                  font-bold
                  tracking-tight
                  text-slate-900

                  sm:text-base
                "
              >
                MediVision AI
              </p>

              <p
                className="
                  hidden

                  text-[11px]
                  font-medium
                  tracking-wide
                  text-slate-500

                  sm:block
                "
              >
                Predict • Prevent • Monitor • Recover
              </p>
            </div>
          </Link>


          {/* ==============================================
              DESKTOP NAVIGATION
          ============================================== */}

          <nav
            className="
              hidden
              items-center
              gap-1

              md:flex
            "
            aria-label="Public navigation"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  inline-flex
                  min-h-[44px]
                  items-center
                  justify-center

                  rounded-full

                  px-3.5
                  py-2

                  text-sm
                  font-medium

                  transition-all
                  duration-200

                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-600
                  focus:ring-offset-2

                  ${
                    isActive
                      ? `
                        bg-sky-50
                        text-sky-700
                        shadow-sm
                        ring-1
                        ring-sky-100
                      `
                      : `
                        text-slate-600

                        hover:bg-slate-100/80
                        hover:text-slate-900
                      `
                  }
                `}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>


          {/* ==============================================
              DESKTOP ACTION BUTTONS
          ============================================== */}

          <div
            className="
              hidden
              shrink-0
              items-center
              gap-2

              md:flex
            "
          >
            <Link
              to="/login"
              className="
                inline-flex
                min-h-[44px]
                items-center
                justify-center

                rounded-full

                border
                border-transparent

                px-4

                text-sm
                font-semibold
                text-slate-700

                transition-all
                duration-200

                hover:border-slate-200
                hover:bg-slate-50
                hover:text-slate-900

                active:scale-[0.98]

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2
              "
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="
                inline-flex
                min-h-[44px]
                items-center
                justify-center

                rounded-full

                bg-blue-600

                px-5

                text-sm
                font-semibold
                text-white

                shadow-md
                shadow-blue-600/20

                transition-all
                duration-200

                hover:bg-blue-700
                hover:shadow-lg
                hover:shadow-blue-600/25

                active:scale-[0.98]

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2
              "
            >
              Get Started
            </Link>
          </div>


          {/* ==============================================
              MOBILE MENU BUTTON
          ============================================== */}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={
              open
                ? "Close navigation"
                : "Open navigation"
            }
            className={`
              flex
              min-h-[44px]
              min-w-[44px]
              shrink-0
              items-center
              justify-center

              rounded-full
              border

              transition-all
              duration-200

              active:scale-[0.96]

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2

              md:hidden

              ${
                open
                  ? `
                    border-blue-100
                    bg-blue-50
                    text-blue-700
                  `
                  : `
                    border-slate-200/80
                    bg-white
                    text-slate-700

                    shadow-sm

                    hover:bg-slate-100
                    hover:text-slate-900
                  `
              }
            `}
          >
            {open ? (
              <X
                className="
                  h-5
                  w-5
                "
                aria-hidden="true"
              />
            ) : (
              <Menu
                className="
                  h-5
                  w-5
                "
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </header>


      {/* ==================================================
          MOBILE DROPDOWN
      ================================================== */}

      {open && (
        <div
          id="mobile-navigation"
          className="
            fixed
            right-3
            top-[76px]
            z-50

            w-[calc(100%-24px)]
            max-w-[320px]

            sm:right-4
            sm:top-[84px]

            md:hidden
          "
        >
          <div
            className="
              overflow-hidden

              rounded-3xl

              border
              border-slate-200/80

              bg-white/95

              p-2.5

              shadow-xl
              shadow-slate-900/10

              backdrop-blur-xl
            "
          >
            {/* ============================================
                MOBILE NAVIGATION
            ============================================ */}

            <nav
              className="
                flex
                flex-col
                gap-1
              "
              aria-label="Mobile public navigation"
            >
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `
                    flex
                    min-h-[46px]
                    w-full
                    items-center
                    justify-between

                    rounded-2xl

                    px-4

                    text-sm
                    font-medium

                    transition-all
                    duration-200

                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-600
                    focus:ring-offset-1

                    ${
                      isActive
                        ? `
                          bg-blue-50
                          text-blue-700
                          font-semibold
                        `
                        : `
                          text-slate-700

                          hover:bg-slate-50
                          hover:text-slate-900
                        `
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <span>
                        {item.label}
                      </span>

                      <span
                        className={`
                          h-1.5
                          w-1.5

                          rounded-full

                          ${
                            isActive
                              ? "bg-blue-600"
                              : "bg-slate-300"
                          }
                        `}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>


            {/* ============================================
                MOBILE ACTION BUTTONS
            ============================================ */}

            <div
              className="
                mt-2

                grid
                grid-cols-2
                gap-2

                border-t
                border-slate-100

                pt-2
              "
            >
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="
                  flex
                  min-h-[46px]
                  items-center
                  justify-center

                  rounded-2xl

                  border
                  border-slate-200

                  bg-white

                  px-3

                  text-sm
                  font-semibold
                  text-slate-700

                  transition-all
                  duration-200

                  hover:bg-slate-50
                  hover:text-slate-900

                  active:scale-[0.98]

                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-600
                  focus:ring-offset-1
                "
              >
                Sign In
              </Link>

              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="
                  flex
                  min-h-[46px]
                  items-center
                  justify-center

                  rounded-2xl

                  bg-blue-600

                  px-3

                  text-sm
                  font-semibold
                  text-white

                  shadow-sm
                  shadow-blue-600/20

                  transition-all
                  duration-200

                  hover:bg-blue-700

                  active:scale-[0.98]

                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-600
                  focus:ring-offset-1
                "
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}