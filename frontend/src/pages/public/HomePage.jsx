import {
  Activity,
  BrainCircuit,
  CalendarDays,
  ChevronRight,
  FileHeart,
  HeartPulse,
  Hospital,
  Image,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import ClinicalCard from "@/components/common/ClinicalCard";
import SectionBadge from "@/components/public/SectionBadge";


const services = [
  {
    title: "AI Symptom Assessment",
    description:
      "Enter symptoms and receive AI-assisted possible conditions, risk estimation and specialist guidance.",
    icon: BrainCircuit,
  },
  {
    title: "Doctor Discovery",
    description:
      "Find relevant specialists based on specialty, availability and healthcare facility.",
    icon: Stethoscope,
  },
  {
    title: "Appointments",
    description:
      "Manage appointment requests, schedules and consultation status in one place.",
    icon: CalendarDays,
  },
  {
    title: "Medical History",
    description:
      "Organize encounters, diagnoses, prescriptions, reports and other health records.",
    icon: FileHeart,
  },
  {
    title: "Health Tracking",
    description:
      "Track health measurements and review changes over time.",
    icon: Activity,
  },
  {
    title: "Medical Image AI",
    description:
      "AI-assisted screening for supported medical-image use cases with explainability support.",
    icon: Image,
  },
];


const workflow = [
  {
    number: "01",
    title: "Describe your needs",
    description:
      "Enter symptoms, health information or choose the healthcare service you need.",
  },
  {
    number: "02",
    title: "Receive assistance",
    description:
      "MediVision organizes relevant health information and AI-assisted insights.",
  },
  {
    number: "03",
    title: "Connect with care",
    description:
      "Find an appropriate specialist and manage an appointment.",
  },
  {
    number: "04",
    title: "Monitor your health",
    description:
      "Maintain records, reminders, measurements, diet and routine information.",
  },
];


export default function HomePage() {
  return (
    <>
      <section
        className="
          border-b
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
            items-center
            gap-12
            px-4
            py-16
            sm:px-6
            sm:py-20
            lg:grid-cols-2
            lg:px-8
            lg:py-24
          "
        >
          <div>
            <SectionBadge>
              AI-assisted healthcare platform
            </SectionBadge>

            <h1
              className="
                mt-6
                max-w-3xl
                text-4xl
                font-bold
                tracking-tight
                text-slate-900
                sm:text-5xl
                lg:text-6xl
              "
            >
              Healthcare support designed around
              your complete care journey.
            </h1>

            <p
              className="
                mt-6
                max-w-2xl
                text-base
                leading-7
                text-slate-500
                sm:text-lg
              "
            >
              MediVision AI brings symptom
              assessment, doctor discovery,
              appointments, medical history,
              reminders, health tracking and
              AI-assisted screening into one
              organized platform.
            </p>

            <div
              className="
                mt-8
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >
              <Link
                to="/register"
                className="
                  inline-flex
                  min-h-[44px]
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-blue-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white

                  transition-all
                  duration-200

                  hover:bg-blue-700
                  active:scale-[0.98]

                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-600
                  focus:ring-offset-2
                "
              >
                Get Started

                <ChevronRight
                  className="h-4 w-4"
                />
              </Link>

              <Link
                to="/services"
                className="
                  inline-flex
                  min-h-[44px]
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700

                  hover:bg-slate-50

                  active:scale-[0.98]

                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-600
                  focus:ring-offset-2
                "
              >
                Explore Services
              </Link>
            </div>

            <div
              className="
                mt-8
                flex
                items-start
                gap-3
                rounded-xl
                border
                border-emerald-200
                bg-emerald-50
                p-4
              "
            >
              <ShieldCheck
                className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                  text-emerald-700
                "
              />

              <p
                className="
                  text-sm
                  leading-6
                  text-emerald-700
                "
              >
                Built around role-based access,
                structured medical records and
                clear separation between AI
                predictions and professional
                clinical diagnosis.
              </p>
            </div>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-4
              sm:p-6
            "
          >
            <ClinicalCard className="p-5">
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div>
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-sky-600
                    "
                  >
                    Care overview
                  </p>

                  <h2
                    className="
                      mt-1
                      text-lg
                      font-semibold
                      text-slate-900
                    "
                  >
                    One platform for your health
                    journey
                  </h2>
                </div>

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-600
                    text-white
                  "
                >
                  <HeartPulse className="h-5 w-5" />
                </div>
              </div>

              <div
                className="
                  mt-6
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                "
              >
                {[
                  "Symptom assessment",
                  "Specialist guidance",
                  "Appointments",
                  "Medical history",
                  "Health tracking",
                  "Medicine reminders",
                ].map((item) => (
                  <div
                    key={item}
                    className="
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      p-3
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-medium
                        text-slate-700
                      "
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </ClinicalCard>

            <div
              className="
                mt-4
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              <ClinicalCard className="p-4">
                <BrainCircuit
                  className="
                    h-5
                    w-5
                    text-sky-600
                  "
                />

                <p
                  className="
                    mt-3
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  AI-assisted
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Decision support with clear
                  safety boundaries.
                </p>
              </ClinicalCard>

              <ClinicalCard className="p-4">
                <Hospital
                  className="
                    h-5
                    w-5
                    text-teal-600
                  "
                />

                <p
                  className="
                    mt-3
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Care connected
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Specialists, facilities and
                  appointments together.
                </p>
              </ClinicalCard>
            </div>
          </div>
        </div>
      </section>

      <section
        className="
          bg-slate-50
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
          <div className="max-w-2xl">
            <SectionBadge>
              Core services
            </SectionBadge>

            <h2
              className="
                mt-4
                text-3xl
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              Essential healthcare tools,
              connected in one system.
            </h2>

            <p
              className="
                mt-4
                text-base
                leading-7
                text-slate-500
              "
            >
              Each service is designed as part of
              the same patient care workflow rather
              than as an isolated tool.
            </p>
          </div>

          <div
            className="
              mt-10
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

                  <h3
                    className="
                      mt-4
                      text-base
                      font-semibold
                      text-slate-900
                    "
                  >
                    {service.title}
                  </h3>

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

      <section
        id="how-it-works"
        className="
          border-y
          border-slate-200
          bg-white
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
          <div className="max-w-2xl">
            <SectionBadge>
              How it works
            </SectionBadge>

            <h2
              className="
                mt-4
                text-3xl
                font-bold
                text-slate-900
              "
            >
              From symptoms to continued health
              management.
            </h2>
          </div>

          <div
            className="
              mt-10
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            {workflow.map((step) => (
              <ClinicalCard
                key={step.number}
                className="p-5"
              >
                <span
                  className="
                    text-sm
                    font-bold
                    text-sky-600
                  "
                >
                  {step.number}
                </span>

                <h3
                  className="
                    mt-4
                    text-base
                    font-semibold
                    text-slate-900
                  "
                >
                  {step.title}
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  {step.description}
                </p>
              </ClinicalCard>
            ))}
          </div>
        </div>
      </section>

      <section
        className="
          bg-slate-50
          py-16
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
          <div
            className="
              rounded-2xl
              border
              border-rose-200
              bg-rose-50
              p-6
              sm:p-8
            "
          >
            <div
              className="
                flex
                flex-col
                gap-5
                sm:flex-row
                sm:items-start
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-rose-200
                  bg-white
                  text-rose-700
                "
              >
                <HeartPulse className="h-5 w-5" />
              </div>

              <div>
                <h2
                  className="
                    text-lg
                    font-semibold
                    text-rose-700
                  "
                >
                  Medical emergency?
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-rose-700
                  "
                >
                  Do not rely on AI assessment for
                  emergency care. Seek immediate
                  professional medical assistance or
                  contact the appropriate emergency
                  service in your area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}