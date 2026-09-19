import {
  useState,
} from "react";

import {
  Apple,
  Activity,
} from "lucide-react";

import DietTab from "@/features/wellness/components/DietTab";

import RoutineTab from "@/features/wellness/components/RoutineTab";


export default function WellnessPage() {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "DIET"
  );


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      <section>
        <p
          className="
            text-sm
            font-semibold
            text-blue-600
          "
        >
          Patient Wellness
        </p>


        <h1
          className="
            mt-1
            text-2xl
            font-bold
            tracking-tight
            text-slate-900

            sm:text-3xl
          "
        >
          Diet & Routine
        </h1>


        <p
          className="
            mt-2
            max-w-3xl
            text-sm
            leading-6
            text-slate-500
          "
        >
          Manage general meal suggestions,
          hydration targets and your daily
          wellness routine.
        </p>
      </section>


      <section
        className="
          flex
          w-fit
          rounded-xl
          border
          border-slate-200
          bg-white
          p-1
          shadow-sm
        "
      >
        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "DIET"
            )
          }
          className={`
            inline-flex
            min-h-[42px]
            items-center
            gap-2
            rounded-lg
            px-4
            text-sm
            font-semibold
            transition

            ${
              activeTab
              === "DIET"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }
          `}
        >
          <Apple
            className="h-4 w-4"
          />

          Diet
        </button>


        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "ROUTINE"
            )
          }
          className={`
            inline-flex
            min-h-[42px]
            items-center
            gap-2
            rounded-lg
            px-4
            text-sm
            font-semibold
            transition

            ${
              activeTab
              === "ROUTINE"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }
          `}
        >
          <Activity
            className="h-4 w-4"
          />

          Routine
        </button>
      </section>


      {activeTab
        === "DIET"
        ? (
          <DietTab />
        )
        : (
          <RoutineTab />
        )}
    </div>
  );
}