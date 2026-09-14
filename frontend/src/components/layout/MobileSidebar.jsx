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


export default function MobileSidebar({
  open,
  onClose,
}) {
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
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          className="
            flex-1
            space-y-1
            overflow-y-auto
            p-3
          "
        >
          {navigationItems.map(
            (item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
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
                  />

                  {item.label}
                </NavLink>
              );
            }
          )}
        </nav>
      </aside>
    </div>
  );
}