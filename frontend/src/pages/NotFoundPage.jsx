import {
  Link,
} from "react-router-dom";

import PrimaryButton from "@/components/common/PrimaryButton";


export default function NotFoundPage() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-50
        p-6
      "
    >
      <div
        className="
          max-w-md
          text-center
        "
      >
        <p
          className="
            text-sm
            font-semibold
            text-sky-600
          "
        >
          404
        </p>

        <h1
          className="
            mt-2
            text-3xl
            font-bold
            text-slate-900
          "
        >
          Page not found
        </h1>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-slate-500
          "
        >
          The page you requested does not
          exist or may have been moved.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-block"
        >
          <PrimaryButton>
            Return to dashboard
          </PrimaryButton>
        </Link>
      </div>
    </main>
  );
}