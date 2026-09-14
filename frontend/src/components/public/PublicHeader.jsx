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
    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-slate-200/80
        bg-white/80
        backdrop-blur-md
      "
    >
      <div
        className="
          mx-auto
          flex
          h-16
          max-w-7xl
          items-center
          justify-between
          gap-4
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <Link
          to="/"
          className="
            flex
            min-h-[44px]
            items-center
            gap-3
            rounded-lg

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
            focus:ring-offset-2
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              text-white
            "
          >
            <HeartPulse
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <p
              className="
                text-sm
                font-bold
                text-slate-900
              "
            >
              MediVision AI
            </p>

            <p
              className="
                hidden
                text-xs
                text-slate-500
                sm:block
              "
            >
              Predict • Prevent • Monitor • Recover
            </p>
          </div>
        </Link>

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
                flex
                min-h-[44px]
                items-center
                rounded-lg
                px-3
                text-sm
                font-medium
                transition-colors

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2

                ${
                  isActive
                    ? "bg-sky-50 text-sky-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }
              `}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div
          className="
            hidden
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
              rounded-lg
              px-4
              text-sm
              font-semibold
              text-slate-700

              hover:bg-slate-100

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
              rounded-lg
              bg-blue-600
              px-4
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
            "
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={
            open
              ? "Close navigation"
              : "Open navigation"
          }
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
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {open && (
        <div
          className="
            border-t
            border-slate-200
            bg-white
            px-4
            pb-4
            pt-3
            md:hidden
          "
        >
          <nav
            className="space-y-1"
            aria-label="Mobile public navigation"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `
                  flex
                  min-h-[44px]
                  items-center
                  rounded-lg
                  px-3
                  text-sm
                  font-medium

                  ${
                    isActive
                      ? "bg-sky-50 text-sky-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div
            className="
              mt-4
              grid
              grid-cols-2
              gap-3
              border-t
              border-slate-200
              pt-4
            "
          >
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="
                flex
                min-h-[44px]
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Sign In
            </Link>

            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="
                flex
                min-h-[44px]
                items-center
                justify-center
                rounded-lg
                bg-blue-600
                px-4
                text-sm
                font-semibold
                text-white
              "
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}