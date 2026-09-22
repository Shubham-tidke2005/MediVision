import {
  NavLink,
} from "react-router-dom";

import {
  HeartPulse,
  X,
} from "lucide-react";

import {
  navigationItems,
} from "@/config/navigation";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";


export default function MobileSidebar({
  open,
  onClose,
}) {
  const {
    user,
  } = useAuth();


  if (!open) {
    return null;
  }


  const visibleItems =
    navigationItems.filter(
      (item) =>
        item.roles?.includes(
          user?.role
        )
    );


  return (
    <div
      className="
        fixed
        inset-0
        z-50
        md:hidden
      "
    >
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="
          absolute
          inset-0
          bg-slate-900/40
          backdrop-blur-sm
        "
      />


      {/* SIDEBAR */}

      <aside
        className="
          relative
          flex
          h-full
          w-[min(86vw,320px)]
          flex-col
          border-r
          border-slate-200
          bg-white
          shadow-xl
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            h-16
            items-center
            justify-between
            border-b
            border-slate-200
            px-4
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
                  text-xs
                  text-slate-500
                "
              >
                Healthcare Platform
              </p>
            </div>
          </div>


          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="
              flex
              min-h-[44px]
              min-w-[44px]
              items-center
              justify-center
              rounded-lg
              text-slate-500

              hover:bg-slate-100
              hover:text-slate-900

              active:scale-[0.98]

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          >
            <X
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>


        {/* NAVIGATION */}

        <nav
          className="
            flex-1
            space-y-1
            overflow-y-auto
            p-3
          "
          aria-label="Mobile navigation"
        >
          {visibleItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <NavLink
                  key={
                    item.path
                  }
                  to={
                    item.path
                  }
                  onClick={
                    onClose
                  }
                  className={({
                    isActive,
                  }) => `
                    flex
                    min-h-[44px]
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    transition-colors

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

                  {
                    item.label
                  }
                </NavLink>
              );
            }
          )}
        </nav>


        {/* ROLE */}

        <div
          className="
            border-t
            border-slate-200
            p-4
          "
        >
          <div
            className="
              rounded-lg
              bg-slate-50
              p-3
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
          </div>
        </div>
      </aside>
    </div>
  );
}