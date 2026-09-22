import {
  useQuery,
} from "@tanstack/react-query";

import {
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Settings2,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getDoctorDashboard,
} from "@/features/dashboard/api/doctorDashboardApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


function StatCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <article
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:shadow-md
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-sm
              font-medium
              text-slate-500
            "
          >
            {title}
          </p>

          <p
            className="
              mt-2
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            {value}
          </p>

          <p
            className="
              mt-2
              text-xs
              leading-5
              text-slate-500
            "
          >
            {description}
          </p>
        </div>

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-sky-50
            text-sky-600
          "
        >
          <Icon
            className="h-5 w-5"
          />
        </div>
      </div>
    </article>
  );
}


function AppointmentStatusBadge({
  status,
}) {
  const styles = {
    REQUESTED:
      "border-amber-200 bg-amber-50 text-amber-700",

    APPROVED:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    REJECTED:
      "border-slate-200 bg-slate-100 text-slate-600",

    CANCELLED:
      "border-slate-200 bg-slate-100 text-slate-600",

    COMPLETED:
      "border-blue-200 bg-blue-50 text-blue-700",

    NO_SHOW:
      "border-rose-200 bg-rose-50 text-rose-700",
  };


  return (
    <span
      className={`
        inline-flex
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold

        ${
          styles[status]
          ?? "border-slate-200 bg-slate-50 text-slate-600"
        }
      `}
    >
      {status.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}


function formatAppointmentDate(
  value
) {
  return new Date(
    value
  ).toLocaleDateString(
    undefined,
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


function formatAppointmentTime(
  value
) {
  return new Date(
    value
  ).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


export default function DoctorDashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "doctor-dashboard",
    ],

    queryFn:
      getDoctorDashboard,
  });


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
          shadow-sm
        "
      >
        <p
          className="
            text-sm
            text-slate-500
          "
        >
          Loading doctor dashboard...
        </p>
      </div>
    );
  }


  if (isError) {
    return (
      <div
        className="
          space-y-4
          rounded-xl
          border
          border-rose-200
          bg-rose-50
          p-6
        "
      >
        <h1
          className="
            text-lg
            font-semibold
            text-slate-900
          "
        >
          Unable to load dashboard
        </h1>

        <p
          className="
            text-sm
            text-rose-700
          "
        >
          {getApiErrorMessage(
            error,
            "Unable to load doctor dashboard."
          )}
        </p>

        <Link
          to="/doctor/profile"
          className="
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
          "
        >
          Open Doctor Profile
        </Link>
      </div>
    );
  }


  const {
    stats,
    upcoming_appointments:
      upcomingAppointments = [],
    appointment_status_counts:
      statusCounts = {},
  } = data;


  const verified =
    data.verification_status
    === "VERIFIED";


  return (
    <div
      className="
        space-y-6
        pb-8
      "
    >

      {/* =============================================== */}
      {/* HEADER                                          */}
      {/* =============================================== */}

      <section
        className="
          flex
          flex-col
          gap-4

          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div>
          <p
            className="
              text-sm
              font-medium
              text-blue-600
            "
          >
            Doctor Dashboard
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
            Welcome, Dr.{" "}
            {data.doctor_first_name}{" "}
            {data.doctor_last_name}
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
            "
          >
            Review appointment requests,
            upcoming consultations and your
            current availability.
          </p>
        </div>


        <Link
          to="/appointments"
          className="
            inline-flex
            min-h-[44px]
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-blue-600
            px-4
            text-sm
            font-semibold
            text-white
            transition

            hover:bg-blue-700
            active:scale-[0.98]
          "
        >
          Manage Appointments

          <ArrowRight
            className="h-4 w-4"
          />
        </Link>
      </section>


      {/* =============================================== */}
      {/* VERIFICATION STATUS                             */}
      {/* =============================================== */}

      <section
        className={`
          rounded-xl
          border
          p-5

          ${
            verified
              ? `
                border-emerald-200
                bg-emerald-50
              `
              : `
                border-amber-200
                bg-amber-50
              `
          }
        `}
      >
        <div
          className="
            flex
            flex-col
            gap-4

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <ShieldCheck
              className={`
                mt-0.5
                h-5
                w-5
                shrink-0

                ${
                  verified
                    ? "text-emerald-600"
                    : "text-amber-600"
                }
              `}
            />

            <div>
              <h2
                className="
                  font-semibold
                  text-slate-900
                "
              >
                Professional Verification
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-600
                "
              >
                Current status:{" "}
                <span
                  className="font-semibold"
                >
                  {
                    data.verification_status
                  }
                </span>
              </p>
            </div>
          </div>


          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <span
              className="
                rounded-full
                border
                border-slate-200
                bg-white
                px-3
                py-1.5
                text-xs
                font-semibold
                text-slate-600
              "
            >
              {
                data.is_accepting_patients
                  ? "Accepting Patients"
                  : "Not Accepting Patients"
              }
            </span>

            <Link
              to="/doctor/profile"
              className="
                rounded-full
                border
                border-slate-200
                bg-white
                px-3
                py-1.5
                text-xs
                font-semibold
                text-blue-600

                hover:bg-slate-50
              "
            >
              View Profile
            </Link>
          </div>
        </div>
      </section>


      {/* =============================================== */}
      {/* STAT CARDS                                      */}
      {/* =============================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-4

          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatCard
          icon={Clock3}
          title="Pending Requests"
          value={
            stats.pending_requests
          }
          description="Appointment requests waiting for your decision."
        />

        <StatCard
          icon={CalendarCheck2}
          title="Upcoming Approved"
          value={
            stats.upcoming_approved
          }
          description="Approved consultations scheduled in the future."
        />

        <StatCard
          icon={CheckCircle2}
          title="Completed"
          value={
            stats.completed_total
          }
          description="Appointments marked as completed."
        />

        <StatCard
          icon={CalendarDays}
          title="Available Slots"
          value={
            stats.available_slots_next_7_days
          }
          description="Open appointment slots during the next 7 days."
        />
      </section>


      {/* =============================================== */}
      {/* MAIN GRID                                       */}
      {/* =============================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-6

          xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]
        "
      >

        {/* ============================================= */}
        {/* UPCOMING APPOINTMENTS                         */}
        {/* ============================================= */}

        <section
          className="
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-slate-200
              p-5
            "
          >
            <div>
              <h2
                className="
                  font-semibold
                  text-slate-900
                "
              >
                Upcoming Appointments
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Your next appointment
                requests and approved
                consultations.
              </p>
            </div>

            <Link
              to="/appointments"
              className="
                shrink-0
                text-sm
                font-semibold
                text-blue-600

                hover:text-blue-700
              "
            >
              View all
            </Link>
          </div>


          {upcomingAppointments.length
            === 0 ? (
            <div
              className="
                px-5
                py-12
                text-center
              "
            >
              <CalendarClock
                className="
                  mx-auto
                  h-8
                  w-8
                  text-slate-300
                "
              />

              <h3
                className="
                  mt-3
                  font-semibold
                  text-slate-900
                "
              >
                No upcoming appointments
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                New appointment requests
                will appear here.
              </p>
            </div>
          ) : (
            <div
              className="
                divide-y
                divide-slate-100
              "
            >
              {upcomingAppointments.map(
                (
                  appointment
                ) => (
                  <article
                    key={
                      appointment.id
                    }
                    className="
                      p-5
                      transition

                      hover:bg-slate-50
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        gap-4

                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                      "
                    >
                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <UserRound
                            className="
                              h-4
                              w-4
                              shrink-0
                              text-sky-600
                            "
                          />

                          <h3
                            className="
                              truncate
                              font-semibold
                              text-slate-900
                            "
                          >
                            {
                              appointment
                                .patient_first_name
                            }{" "}
                            {
                              appointment
                                .patient_last_name
                            }
                          </h3>
                        </div>


                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-500
                          "
                        >
                          {
                            appointment
                              .patient_code
                          }
                        </p>


                        <div
                          className="
                            mt-3
                            flex
                            flex-wrap
                            gap-x-5
                            gap-y-2
                            text-sm
                            text-slate-600
                          "
                        >
                          <span>
                            {
                              formatAppointmentDate(
                                appointment.start_at
                              )
                            }
                          </span>

                          <span>
                            {
                              formatAppointmentTime(
                                appointment.start_at
                              )
                            }
                            {" – "}
                            {
                              formatAppointmentTime(
                                appointment.end_at
                              )
                            }
                          </span>

                          <span>
                            {
                              appointment
                                .appointment_type
                                .replaceAll(
                                  "_",
                                  " "
                                )
                            }
                          </span>
                        </div>


                        {appointment.reason
                          && (
                            <p
                              className="
                                mt-3
                                line-clamp-2
                                text-sm
                                text-slate-500
                              "
                            >
                              <span
                                className="
                                  font-medium
                                  text-slate-700
                                "
                              >
                                Reason:
                              </span>{" "}
                              {
                                appointment.reason
                              }
                            </p>
                          )}
                      </div>


                      <AppointmentStatusBadge
                        status={
                          appointment.status
                        }
                      />
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>


        {/* ============================================= */}
        {/* RIGHT COLUMN                                  */}
        {/* ============================================= */}

        <div
          className="space-y-6"
        >

          {/* =========================================== */}
          {/* STATUS BREAKDOWN                           */}
          {/* =========================================== */}

          <section
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <h2
              className="
                font-semibold
                text-slate-900
              "
            >
              Appointment Summary
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Status breakdown across your
              appointments.
            </p>


            <div
              className="
                mt-5
                space-y-4
              "
            >
              {[
                "REQUESTED",
                "APPROVED",
                "COMPLETED",
                "CANCELLED",
                "REJECTED",
                "NO_SHOW",
              ].map(
                (
                  status
                ) => (
                  <div
                    key={status}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <AppointmentStatusBadge
                      status={
                        status
                      }
                    />

                    <span
                      className="
                        text-sm
                        font-bold
                        text-slate-900
                      "
                    >
                      {
                        statusCounts[
                          status
                        ] ?? 0
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          </section>


          {/* =========================================== */}
          {/* QUICK ACTIONS                               */}
          {/* =========================================== */}

          <section
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <h2
              className="
                font-semibold
                text-slate-900
              "
            >
              Quick Actions
            </h2>


            <div
              className="
                mt-4
                space-y-2
              "
            >
              <Link
                to="/appointments"
                className="
                  flex
                  min-h-[48px]
                  items-center
                  justify-between
                  rounded-lg
                  border
                  border-slate-200
                  px-4
                  text-sm
                  font-medium
                  text-slate-700
                  transition

                  hover:border-blue-200
                  hover:bg-blue-50
                  hover:text-blue-700
                "
              >
                <span
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <CalendarCheck2
                    className="h-4 w-4"
                  />

                  Appointments
                </span>

                <ArrowRight
                  className="h-4 w-4"
                />
              </Link>


              <Link
                to="/doctor/availability"
                className="
                  flex
                  min-h-[48px]
                  items-center
                  justify-between
                  rounded-lg
                  border
                  border-slate-200
                  px-4
                  text-sm
                  font-medium
                  text-slate-700
                  transition

                  hover:border-blue-200
                  hover:bg-blue-50
                  hover:text-blue-700
                "
              >
                <span
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <Settings2
                    className="h-4 w-4"
                  />

                  Manage Availability
                </span>

                <ArrowRight
                  className="h-4 w-4"
                />
              </Link>


              <Link
                to="/doctor/profile"
                className="
                  flex
                  min-h-[48px]
                  items-center
                  justify-between
                  rounded-lg
                  border
                  border-slate-200
                  px-4
                  text-sm
                  font-medium
                  text-slate-700
                  transition

                  hover:border-blue-200
                  hover:bg-blue-50
                  hover:text-blue-700
                "
              >
                <span
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <Stethoscope
                    className="h-4 w-4"
                  />

                  Doctor Profile
                </span>

                <ArrowRight
                  className="h-4 w-4"
                />
              </Link>


              <Link
                to="/doctor/patients"
                className="
                  flex
                  min-h-[48px]
                  items-center
                  justify-between
                  rounded-lg
                  border
                  border-slate-200
                  px-4
                  text-sm
                  font-medium
                  text-slate-700
                  transition

                  hover:border-blue-200
                  hover:bg-blue-50
                  hover:text-blue-700
                "
              >
                <span
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <UserRound
                    className="h-4 w-4"
                  />

                  Patient Records
                </span>

                <ArrowRight
                  className="h-4 w-4"
                />
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}