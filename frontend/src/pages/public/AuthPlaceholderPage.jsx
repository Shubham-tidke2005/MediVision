import {
  Link,
} from "react-router-dom";

import {
  LockKeyhole,
} from "lucide-react";

import ClinicalCard from "@/components/common/ClinicalCard";


export default function AuthPlaceholderPage({
  mode,
}) {
  const isLogin = mode === "login";

  return (
    <section
      className="
        flex
        min-h-[600px]
        items-center
        justify-center
        px-4
        py-16
      "
    >
      <ClinicalCard
        className="
          w-full
          max-w-md
          p-6
          sm:p-8
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-sky-50
            text-sky-600
          "
        >
          <LockKeyhole className="h-5 w-5" />
        </div>

        <h1
          className="
            mt-5
            text-2xl
            font-bold
            text-slate-900
          "
        >
          {isLogin
            ? "Sign in to MediVision"
            : "Create your MediVision account"}
        </h1>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          The authentication interface will be
          connected to the existing FastAPI JWT
          backend in the next frontend phase.
        </p>

        <Link
          to="/"
          className="
            mt-6
            inline-flex
            min-h-[44px]
            items-center
            justify-center
            rounded-lg
            border
            border-slate-200
            px-4
            text-sm
            font-semibold
            text-slate-700

            hover:bg-slate-50

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
            focus:ring-offset-2
          "
        >
          Return Home
        </Link>
      </ClinicalCard>
    </section>
  );
}