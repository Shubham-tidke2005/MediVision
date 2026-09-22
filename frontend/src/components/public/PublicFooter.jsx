import {
  HeartPulse,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


export default function PublicFooter() {
  return (
    <footer
      className="
        shrink-0
        border-t
        border-slate-200/80
        bg-white
      "
    >
      <div
        className="
          mx-auto
          flex
          max-w-6xl
          flex-col
          gap-4
          px-4
          py-4

          sm:px-6

          md:flex-row
          md:items-center
          md:justify-between

          lg:px-8
        "
      >
        {/* BRAND */}

        <Link
          to="/"
          className="
            flex
            w-fit
            items-center
            gap-2.5

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
              h-8
              w-8
              shrink-0
              items-center
              justify-center

              rounded-full
              bg-blue-600
              text-white

              shadow-sm
              shadow-blue-600/20
            "
          >
            <HeartPulse
              className="
                h-4
                w-4
              "
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
                text-[11px]
                text-slate-500
              "
            >
              AI-assisted healthcare support
            </p>
          </div>
        </Link>


        {/* LINKS */}

        <nav
          aria-label="Footer navigation"
          className="
            flex
            flex-wrap
            items-center
            gap-4
          "
        >
          <Link
            to="/services"
            className="
              rounded-md

              text-xs
              font-medium
              text-slate-600

              transition-colors

              hover:text-blue-600

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          >
            Services
          </Link>

          <Link
            to="/about"
            className="
              rounded-md

              text-xs
              font-medium
              text-slate-600

              transition-colors

              hover:text-blue-600

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          >
            About
          </Link>

          <Link
            to="/safety"
            className="
              rounded-md

              text-xs
              font-medium
              text-slate-600

              transition-colors

              hover:text-blue-600

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          >
            AI & Safety
          </Link>
        </nav>


        {/* COPYRIGHT */}

        <p
          className="
            shrink-0

            text-xs
            font-medium
            text-slate-500
          "
        >
          © 2026 MediVision AI
        </p>
      </div>


      {/* MEDICAL NOTICE */}

      <div
        className="
          border-t
          border-slate-100

          bg-slate-50/70
        "
      >
        <p
          className="
            mx-auto
            max-w-6xl

            px-4
            py-2

            text-center
            text-[11px]
            leading-5
            text-slate-500

            sm:px-6
            lg:px-8
          "
        >
          MediVision AI provides assistive information
          and does not replace professional medical
          evaluation, diagnosis, or treatment.
        </p>
      </div>
    </footer>
  );
}