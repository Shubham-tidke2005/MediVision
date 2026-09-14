import {
  AlertTriangle,
  BrainCircuit,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import ClinicalCard from "@/components/common/ClinicalCard";
import SectionBadge from "@/components/public/SectionBadge";


export default function SafetyPage() {
  return (
    <section
      className="
        py-16
        sm:py-20
      "
    >
      <div
        className="
          mx-auto
          max-w-5xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <SectionBadge>
          AI & Safety
        </SectionBadge>

        <h1
          className="
            mt-4
            text-4xl
            font-bold
            tracking-tight
            text-slate-900
          "
        >
          AI supports medical decisions. It does
          not replace professional care.
        </h1>

        <p
          className="
            mt-5
            max-w-3xl
            text-base
            leading-7
            text-slate-500
          "
        >
          MediVision separates machine-generated
          assessments from diagnoses made by
          healthcare professionals and presents AI
          results as assistive information.
        </p>

        <div
          className="
            mt-10
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
          "
        >
          <ClinicalCard className="p-6">
            <BrainCircuit
              className="
                h-6
                w-6
                text-sky-600
              "
            />

            <h2
              className="
                mt-4
                font-semibold
                text-slate-900
              "
            >
              AI-assisted assessment
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              Symptom analysis can suggest possible
              conditions, risk levels and relevant
              specialties.
            </p>
          </ClinicalCard>

          <ClinicalCard className="p-6">
            <Stethoscope
              className="
                h-6
                w-6
                text-teal-600
              "
            />

            <h2
              className="
                mt-4
                font-semibold
                text-slate-900
              "
            >
              Clinical diagnosis
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              Professional diagnoses and
              prescriptions belong to qualified
              clinicians, not AI predictions.
            </p>
          </ClinicalCard>

          <ClinicalCard className="p-6">
            <ShieldCheck
              className="
                h-6
                w-6
                text-emerald-700
              "
            />

            <h2
              className="
                mt-4
                font-semibold
                text-slate-900
              "
            >
              Model traceability
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              AI results can be associated with
              specific model versions so system
              outputs remain traceable.
            </p>
          </ClinicalCard>

          <div
            className="
              rounded-xl
              border
              border-rose-200
              bg-rose-50
              p-6
            "
          >
            <AlertTriangle
              className="
                h-6
                w-6
                text-rose-700
              "
            />

            <h2
              className="
                mt-4
                font-semibold
                text-rose-700
              "
            >
              Emergencies require immediate care
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-rose-700
              "
            >
              The platform must not be used as a
              substitute for emergency medical
              assistance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}