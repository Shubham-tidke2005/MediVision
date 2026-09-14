import {
  Activity,
  Bell,
  BrainCircuit,
  CalendarDays,
  FileHeart,
  HeartHandshake,
  Hospital,
  Image,
  Pill,
  Salad,
  Siren,
  Stethoscope,
} from "lucide-react";

import ClinicalCard from "@/components/common/ClinicalCard";
import SectionBadge from "@/components/public/SectionBadge";


const services = [
  {
    title: "AI Symptom Assessment",
    description:
      "AI-assisted possible-condition and risk estimation based on submitted symptoms.",
    icon: BrainCircuit,
  },
  {
    title: "Doctor Recommendation",
    description:
      "Connect assessment results with suitable specialties and available doctors.",
    icon: Stethoscope,
  },
  {
    title: "Appointments",
    description:
      "Request, approve, schedule and track healthcare appointments.",
    icon: CalendarDays,
  },
  {
    title: "Medical History",
    description:
      "Organize encounters, diagnoses, documents, allergies and clinical records.",
    icon: FileHeart,
  },
  {
    title: "Prescriptions & Medicines",
    description:
      "Maintain structured prescriptions, medication schedules and adherence.",
    icon: Pill,
  },
  {
    title: "Health Tracking",
    description:
      "Record and monitor health measurements over time.",
    icon: Activity,
  },
  {
    title: "Medical Image AI",
    description:
      "AI-assisted screening of supported medical images with model confidence and explainability.",
    icon: Image,
  },
  {
    title: "Diet & Routine",
    description:
      "Manage personalized wellness, diet and activity plans.",
    icon: Salad,
  },
  {
    title: "Nearby Healthcare",
    description:
      "Discover hospitals, clinics, pharmacies and diagnostic centers.",
    icon: Hospital,
  },
  {
    title: "Emergency SOS",
    description:
      "Support emergency-contact workflows and location-aware SOS events.",
    icon: Siren,
  },
  {
    title: "Notifications",
    description:
      "Receive appointment, medicine, health and platform notifications.",
    icon: Bell,
  },
  {
    title: "Integrated Care",
    description:
      "Connect records, doctors, AI assistance and daily health management.",
    icon: HeartHandshake,
  },
];


export default function ServicesPage() {
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
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <div className="max-w-3xl">
          <SectionBadge>
            MediVision services
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
            A connected healthcare workspace.
          </h1>

          <p
            className="
              mt-5
              text-base
              leading-7
              text-slate-500
            "
          >
            MediVision combines clinical record
            management, healthcare coordination,
            personal health tools and AI-assisted
            decision support within a unified
            platform.
          </p>
        </div>

        <div
          className="
            mt-12
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
            lg:grid-cols-3
          "
        >
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <ClinicalCard
                key={service.title}
                interactive
                className="p-5"
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-lg
                    bg-sky-50
                    text-sky-600
                  "
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h2
                  className="
                    mt-4
                    text-base
                    font-semibold
                    text-slate-900
                  "
                >
                  {service.title}
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  {service.description}
                </p>
              </ClinicalCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}