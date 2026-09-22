import {
  LoaderCircle,
} from "lucide-react";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


export default function AdminQueryState({
  isLoading,
  isError,
  error,
  loadingMessage =
    "Loading records...",
}) {
  if (isLoading) {
    return (
      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-10
          text-center
        "
      >
        <LoaderCircle
          className="
            mx-auto
            h-6
            w-6
            animate-spin
            text-blue-600
          "
        />

        <p
          className="
            mt-3
            text-sm
            text-slate-500
          "
        >
          {loadingMessage}
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="
          rounded-xl
          border
          border-rose-200
          bg-rose-50
          p-5
          text-sm
          text-rose-700
        "
      >
        {
          getApiErrorMessage(
            error,
            "Unable to load admin data."
          )
        }
      </div>
    );
  }

  return null;
}
