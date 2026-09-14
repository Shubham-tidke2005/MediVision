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
        border-t
        border-slate-200
        bg-white
      "
    >
      <div
        className="
          mx-auto
          grid
          max-w-7xl
          grid-cols-1
          gap-8
          px-4
          py-10
          sm:px-6
          md:grid-cols-3
          lg:px-8
        "
      >
        <div>
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
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-blue-600
                text-white
              "
            >
              <HeartPulse className="h-5 w-5" />
            </div>

            <span
              className="
                font-bold
                text-slate-900
              "
            >
              MediVision AI
            </span>
          </div>

          <p
            className="
              mt-4
              max-w-sm
              text-sm
              leading-6
              text-slate-500
            "
          >
            An integrated AI-assisted healthcare
            platform designed to help organize care,
            health information, appointments and
            decision support.
          </p>
        </div>

        <div>
          <h2
            className="
              text-sm
              font-semibold
              text-slate-900
            "
          >
            Platform
          </h2>

          <div
            className="
              mt-4
              space-y-3
              text-sm
            "
          >
            <Link
              to="/services"
              className="
                block
                text-slate-500
                hover:text-blue-600
              "
            >
              Services
            </Link>

            <Link
              to="/about"
              className="
                block
                text-slate-500
                hover:text-blue-600
              "
            >
              About
            </Link>

            <Link
              to="/safety"
              className="
                block
                text-slate-500
                hover:text-blue-600
              "
            >
              AI & Safety
            </Link>
          </div>
        </div>

        <div>
          <h2
            className="
              text-sm
              font-semibold
              text-slate-900
            "
          >
            Medical notice
          </h2>

          <p
            className="
              mt-4
              text-sm
              leading-6
              text-slate-500
            "
          >
            MediVision AI provides assistive
            information and does not replace
            evaluation, diagnosis, or treatment by
            qualified healthcare professionals.
          </p>
        </div>
      </div>

      <div
        className="
          border-t
          border-slate-200
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-5
            text-xs
            text-slate-500
            sm:px-6
            lg:px-8
          "
        >
          © 2026 MediVision AI. Academic healthcare
          platform project.
        </div>
      </div>
    </footer>
  );
}