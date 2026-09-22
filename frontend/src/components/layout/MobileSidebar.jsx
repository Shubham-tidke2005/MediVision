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


  const visibleItems =
    navigationItems.filter(
      (item) =>
        item.roles?.includes(
          user?.role
        )
    );


  if (!open) {
    return null;
  }


  return (
    <div
      className="
        fixed
        inset-0
        z-50

        md:hidden
      "
    >
      {/* ==============================================
          BACKDROP
      ============================================== */}

      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="
          absolute
          inset-0

          bg-slate-950/20
          backdrop-blur-[2px]
        "
      />


      {/* ==============================================
          MOBILE SIDEBAR
      ============================================== */}

      <aside
        className="
          absolute
          bottom-3
          left-3
          top-3

          flex
          w-[min(88vw,340px)]
          flex-col

          overflow-hidden

          rounded-3xl

          border
          border-slate-200/80

          bg-white/95

          shadow-2xl
          shadow-slate-950/15

          backdrop-blur-xl
        "
      >
        {/* ============================================
            HEADER
        ============================================ */}

        <div
          className="
            flex
            min-h-[72px]
            shrink-0
            items-center
            justify-between

            border-b
            border-slate-100

            px-4
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
                min-w-0
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


          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="
              flex
              min-h-[44px]
              min-w-[44px]
              shrink-0
              items-center
              justify-center

              rounded-xl

              border
              border-slate-200/70

              bg-white

              text-slate-500

              transition-all
              duration-200

              hover:bg-slate-50
              hover:text-slate-900

              active:scale-[0.96]

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          >
            <X
              className="
                h-5
                w-5
              "
              aria-hidden="true"
            />
          </button>
        </div>


        {/* ============================================
            NAVIGATION
        ============================================ */}

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
                    group

                    flex
                    min-h-[48px]
                    items-center
                    gap-3

                    rounded-xl

                    px-3
                    py-2.5

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
                          shadow-blue-100/50

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
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center

                      rounded-lg

                      transition-all
                      duration-200
                    "
                  >
                    <Icon
                      className="
                        h-5
                        w-5

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
                    "
                  >
                    {
                      item.label
                    }
                  </span>
                </NavLink>
              );
            }
          )}
        </nav>


        {/* ============================================
            ACCOUNT
        ============================================ */}

        <div
          className="
            shrink-0

            border-t
            border-slate-100

            p-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-3

              rounded-2xl

              border
              border-slate-200/70

              bg-slate-50/80

              p-3
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
              {user?.role
                ?.charAt(0)
                ?.toUpperCase() ??
                "U"}
            </div>


            <div
              className="
                min-w-0
              "
            >
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

              <p
                className="
                  mt-0.5

                  text-[11px]
                  text-slate-500
                "
              >
                Secure MediVision workspace
              </p>
            </div>


            <span
              className="
                ml-auto

                h-2
                w-2
                shrink-0

                rounded-full

                bg-emerald-500
              "
              aria-hidden="true"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}