import {
  ShieldX,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


export default function UnauthorizedPage() {
  return (
    <div
      className="
        flex
        min-h-[500px]
        items-center
        justify-center
        p-6
      "
    >
      <div
        className="
          max-w-md
          text-center
        "
      >
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-slate-100
            text-slate-600
          "
        >
          <ShieldX
            className="h-6 w-6"
          />
        </div>

        <h1
          className="
            mt-5
            text-2xl
            font-bold
            text-slate-900
          "
        >
          Access restricted
        </h1>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          Your account does not have
          permission to access this
          section.
        </p>

        <Link
          to="/dashboard"
          className="
            mt-6
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

            hover:bg-blue-700

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
            focus:ring-offset-2
          "
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}