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
        flex
        min-h-[44px]
        items-center
        gap-3
        rounded-lg
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
              bg-sky-50
              text-sky-700
            `
            : `
              text-slate-600
              hover:bg-slate-100
              hover:text-slate-900
            `
        }
      `}
    >
      <Icon
        className="
          h-5
          w-5
          shrink-0
        "
        aria-hidden="true"
      />

      <span
        className="
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

        border-r
        border-slate-200
        bg-white

        md:flex
        md:w-20
        md:flex-col

        lg:w-72
      "
    >
      {/* Brand */}
      <div
        className="
          flex
          h-16
          shrink-0
          items-center

          border-b
          border-slate-200

          px-4

          md:justify-center

          lg:justify-start
          lg:px-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center

              rounded-xl
              bg-blue-600
              text-white
            "
          >
            <HeartPulse
              className="
                h-5
                w-5
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
                text-sm
                font-bold
                text-slate-900
              "
            >
              MediVision AI
            </p>

            <p
              className="
                text-xs
                text-slate-500
              "
            >
              Healthcare Platform
            </p>
          </div>
        </div>
      </div>


      {/* Navigation */}
      <nav
        className="
          flex-1
          space-y-1
          overflow-y-auto
          p-3
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


      {/* Bottom section */}
      <div
        className="
          shrink-0
          border-t
          border-slate-200
          p-4
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
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              bg-sky-50
              text-sm
              font-semibold
              text-sky-700
            "
            title={user?.role}
          >
            {user?.role
              ?.charAt(0)
              ?.toUpperCase() ??
              "U"}
          </div>
        </div>


        {/* Desktop information */}
        <div
          className="
            hidden
            rounded-lg
            bg-slate-50
            p-3
            lg:block
          "
        >
          <p
            className="
              text-xs
              font-semibold
              text-slate-700
            "
          >
            {user?.role
              ? `${user.role} account`
              : "MediVision account"}
          </p>

          <p
            className="
              mt-1
              text-xs
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
    </aside>
  );
}