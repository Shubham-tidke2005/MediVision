import {
  useQuery,
} from "@tanstack/react-query";

import {
  Activity,
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileHeart,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getPatientDashboard,
} from "@/features/dashboard/api/patientDashboardApi";

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


export default function PatientDashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "patient-dashboard",
    ],

    queryFn:
      getPatientDashboard,
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
          Loading your dashboard...
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
            "Unable to load patient dashboard."
          )}
        </p>

        <Link
          to="/patient/profile"
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
          Open Patient Profile
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
            Patient Dashboard
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
            Welcome,{" "}
            {data.patient_first_name}
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
            Review your appointments,
            healthcare activity and
            available care options.
          </p>
        </div>


        <Link
          to="/doctors"
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
          <Search
            className="h-4 w-4"
          />

          Find Doctors
        </Link>
      </section>


      {/* =============================================== */}
      {/* PROFILE SUMMARY                                 */}
      {/* =============================================== */}

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
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
              "
            >
              <UserRound
                className="h-5 w-5"
              />
            </div>

            <div>
              <h2
                className="
                  font-semibold
                  text-slate-900
                "
              >
                {
                  data.patient_first_name
                }{" "}
                {
                  data.patient_last_name
                }
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Patient ID:{" "}
                {data.patient_code}
              </p>
            </div>
          </div>


          <Link
            to="/patient/profile"
            className="
              inline-flex
              min-h-[40px]
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
            "
          >
            Edit Profile
          </Link>
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
          description="Appointment requests waiting for doctor confirmation."
        />

        <StatCard
          icon={CalendarCheck2}
          title="Upcoming Approved"
          value={
            stats.upcoming_approved
          }
          description="Approved consultations scheduled for the future."
        />

        <StatCard
          icon={CheckCircle2}
          title="Completed"
          value={
            stats.completed_total
          }
          description="Appointments that have been completed."
        />

        <StatCard
          icon={Stethoscope}
          title="Available Doctors"
          value={
            stats.available_doctors
          }
          description="Verified doctors currently accepting patients."
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
                Your requested and approved
                future appointments.
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
                Find a verified doctor and
                choose an available slot.
              </p>

              <Link
                to="/doctors"
                className="
                  mt-4
                  inline-flex
                  min-h-[40px]
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
                Find Doctors
              </Link>
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
                          <Stethoscope
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
                            Dr.{" "}
                            {
                              appointment.doctor_first_name
                            }{" "}
                            {
                              appointment.doctor_last_name
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
                            appointment.qualification
                          }
                          {" • "}
                          {
                            appointment.doctor_code
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


                        {appointment.reason && (
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
          {/* APPOINTMENT SUMMARY                        */}
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
              Overview of your appointment
              history.
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
                      status={status}
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
          {/* QUICK ACTIONS                              */}
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
                to="/doctors"
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
                  <Search
                    className="h-4 w-4"
                  />

                  Find Doctors
                </span>

                <ArrowRight
                  className="h-4 w-4"
                />
              </Link>


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

                  My Appointments
                </span>

                <ArrowRight
                  className="h-4 w-4"
                />
              </Link>


              <Link
                to="/medical-history"
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
                  <FileHeart
                    className="h-4 w-4"
                  />

                  Medical History
                </span>

                <ArrowRight
                  className="h-4 w-4"
                />
              </Link>


              <Link
                to="/symptom-assessment"
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
                  <Activity
                    className="h-4 w-4"
                  />

                  Symptom Assessment
                </span>

                <ArrowRight
                  className="h-4 w-4"
                />
              </Link>


              <Link
                to="/patient/profile"
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

                  Patient Profile
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