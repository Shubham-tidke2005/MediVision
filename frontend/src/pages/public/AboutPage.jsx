import {
  BrainCircuit,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

import ClinicalCard from "@/components/common/ClinicalCard";
import SectionBadge from "@/components/public/SectionBadge";


export default function AboutPage() {
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
          max-w-6xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <div className="max-w-3xl">
          <SectionBadge>
            About MediVision AI
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
            Technology that supports healthcare,
            without replacing healthcare
            professionals.
          </h1>

          <p
            className="
              mt-6
              text-base
              leading-7
              text-slate-500
            "
          >
            MediVision AI is an integrated
            healthcare platform designed to bring
            health management, care coordination
            and selected AI-assisted capabilities
            into one structured system.
          </p>
        </div>

        <div
          className="
            mt-12
            grid
            grid-cols-1
            gap-5
            md:grid-cols-3
          "
        >
          <ClinicalCard className="p-6">
            <HeartHandshake
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
              Patient-centered
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              Health information and workflows are
              organized around the patient's care
              journey.
            </p>
          </ClinicalCard>

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
              AI-assisted
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              AI modules provide decision support,
              possible-condition estimates and
              screening assistance.
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
              Safety-conscious
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              AI predictions remain separate from
              professional diagnosis and clinical
              records.
            </p>
          </ClinicalCard>
        </div>
      </div>
    </section>
  );
}