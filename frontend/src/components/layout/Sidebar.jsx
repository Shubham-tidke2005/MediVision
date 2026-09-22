import {
  HeartPulse,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import {
  navigationItems,
} from "@/config/navigation";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";


function SidebarItem({
  item,
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      title={item.label}
      className={({ isActive }) => `
        group

        flex
        min-h-[46px]
        items-center
        gap-3

        rounded-xl

        px-3
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
              bg-blue-50
              text-blue-700

              shadow-sm
              shadow-blue-100/60

              ring-1
              ring-blue-100
            `
            : `
              text-slate-600

              hover:bg-slate-50
              hover:text-slate-900
            `
        }
      `}
    >
      <span
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center

          rounded-lg

          transition-all
          duration-200
        `}
      >
        <Icon
          className="
            h-5
            w-5
            shrink-0

            transition-transform
            duration-200

            group-hover:scale-105
          "
          aria-hidden="true"
        />
      </span>

      <span
        className="
          truncate

          md:hidden
          lg:inline
        "
      >
        {item.label}
      </span>
    </NavLink>
  );
}


export default function Sidebar() {
  const {
    user,
  } = useAuth();


  const visibleItems =
    navigationItems.filter(
      (item) =>
        item.roles?.includes(
          user?.role
        )
    );


  return (
    <aside
      className="
        fixed
        inset-y-0
        left-0
        z-30

        hidden

        bg-slate-50

        md:flex
        md:w-20
        md:flex-col

        lg:w-72
      "
    >
      <div
        className="
          m-3
          flex
          min-h-0
          flex-1
          flex-col

          overflow-hidden

          rounded-2xl

          border
          border-slate-200/80

          bg-white/95

          shadow-sm
          shadow-slate-900/5

          backdrop-blur-xl
        "
      >
        {/* ==============================================
            BRAND
        ============================================== */}

        <div
          className="
            flex
            h-16
            shrink-0
            items-center

            border-b
            border-slate-100

            px-3

            md:justify-center

            lg:justify-start
            lg:px-4
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
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
                shadow-blue-600/25
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
                hidden
                min-w-0

                lg:block
              "
            >
              <p
                className="
                  truncate

                  text-sm
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                MediVision AI
              </p>

              <p
                className="
                  mt-0.5

                  text-[11px]
                  font-medium
                  text-slate-500
                "
              >
                Healthcare Platform
              </p>
            </div>
          </div>
        </div>


        {/* ==============================================
            NAVIGATION
        ============================================== */}

        <nav
          className="
            flex-1
            space-y-1

            overflow-y-auto

            p-2.5

            lg:p-3
          "
          aria-label="Primary navigation"
        >
          {visibleItems.map(
            (item) => (
              <SidebarItem
                key={item.path}
                item={item}
              />
            )
          )}
        </nav>


        {/* ==============================================
            ACCOUNT / SAFETY
        ============================================== */}

        <div
          className="
            shrink-0

            border-t
            border-slate-100

            p-2.5

            lg:p-3
          "
        >
          {/* Tablet role indicator */}

          <div
            className="
              hidden
              text-center

              md:block
              lg:hidden
            "
          >
            <div
              className="
                mx-auto

                flex
                h-10
                w-10
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
              title={user?.role}
            >
              {user?.role
                ?.charAt(0)
                ?.toUpperCase() ??
                "U"}
            </div>
          </div>


          {/* Desktop account information */}

          <div
            className="
              hidden

              rounded-xl

              border
              border-slate-200/70

              bg-slate-50/80

              p-3

              lg:block
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  h-2
                  w-2
                  shrink-0

                  rounded-full

                  bg-emerald-500
                "
                aria-hidden="true"
              />

              <p
                className="
                  truncate

                  text-xs
                  font-semibold
                  text-slate-700
                "
              >
                {user?.role
                  ? `${user.role} account`
                  : "MediVision account"}
              </p>
            </div>

            <p
              className="
                mt-2

                text-[11px]
                leading-5
                text-slate-500
              "
            >
              AI-assisted healthcare tools
              support decision-making and do
              not replace professional care.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}