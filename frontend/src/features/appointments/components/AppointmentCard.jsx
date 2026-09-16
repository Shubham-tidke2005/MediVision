import {
  CalendarClock,
  Stethoscope,
  UserRound,
} from "lucide-react";


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
        w-fit
        items-center
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
      {status?.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}


function formatDate(
  value
) {
  if (!value) {
    return "Date unavailable";
  }

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


function formatTime(
  value
) {
  if (!value) {
    return "--";
  }

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


function formatAppointmentType(
  type
) {
  if (!type) {
    return "";
  }

  return type.replaceAll(
    "_",
    " "
  );
}


export default function AppointmentCard({
  appointment,
  role,
  onApprove,
  onReject,
  onCancel,
  onStartConsultation,
  onNoShow,
  pending,
}) {
  const isPatient =
    role === "PATIENT";

  const isDoctor =
    role === "DOCTOR";


  const startAt =
    appointment?.slot?.start_at;

  const endAt =
    appointment?.slot?.end_at;


  const patientName =
    appointment?.patient
      ? `${appointment.patient.first_name ?? ""} ${appointment.patient.last_name ?? ""}`.trim()
      : "Patient";


  const doctorName =
    appointment?.doctor
      ? `Dr. ${appointment.doctor.first_name ?? ""} ${appointment.doctor.last_name ?? ""}`.trim()
      : "Doctor";


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

        sm:p-6
      "
    >

      {/* =============================================== */}
      {/* TOP SECTION                                     */}
      {/* =============================================== */}

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

          {/* PERSON */}

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
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-sky-50
                text-sky-600
              "
            >
              {isPatient ? (
                <Stethoscope
                  className="h-5 w-5"
                />
              ) : (
                <UserRound
                  className="h-5 w-5"
                />
              )}
            </div>


            <div
              className="
                min-w-0
                flex-1
              "
            >
              <h2
                className="
                  truncate
                  font-semibold
                  text-slate-900
                "
              >
                {isPatient
                  ? doctorName
                  : patientName}
              </h2>


              {isPatient
                && appointment?.doctor?.qualification && (
                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  {
                    appointment
                      .doctor
                      .qualification
                  }
                </p>
              )}


              {isDoctor
                && appointment?.patient?.patient_code && (
                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Patient ID:{" "}
                  {
                    appointment
                      .patient
                      .patient_code
                  }
                </p>
              )}
            </div>
          </div>


          {/* DATE / TIME */}

          <div
            className="
              mt-5
              flex
              items-start
              gap-3
            "
          >
            <CalendarClock
              className="
                mt-0.5
                h-4
                w-4
                shrink-0
                text-slate-400
              "
            />

            <div>
              <p
                className="
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                {formatDate(
                  startAt
                )}
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                {formatTime(
                  startAt
                )}
                {" – "}
                {formatTime(
                  endAt
                )}
              </p>
            </div>
          </div>


          {/* APPOINTMENT TYPE */}

          {appointment?.appointment_type && (
            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-2
              "
            >
              <span
                className="
                  inline-flex
                  rounded-full
                  border
                  border-slate-200
                  bg-slate-50
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  text-slate-600
                "
              >
                {formatAppointmentType(
                  appointment.appointment_type
                )}
              </span>
            </div>
          )}


          {/* REASON */}

          {appointment?.reason && (
            <div
              className="
                mt-4
                rounded-lg
                bg-slate-50
                p-3
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Reason
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-slate-700
                "
              >
                {
                  appointment.reason
                }
              </p>
            </div>
          )}


          {/* PATIENT NOTES */}

          {appointment?.patient_notes && (
            <div
              className="
                mt-3
                rounded-lg
                border
                border-slate-200
                bg-white
                p-3
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Patient Notes
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-slate-700
                "
              >
                {
                  appointment
                    .patient_notes
                }
              </p>
            </div>
          )}
        </div>


        {/* STATUS */}

        <AppointmentStatusBadge
          status={
            appointment?.status
          }
        />
      </div>


      {/* =============================================== */}
      {/* ACTIONS                                         */}
      {/* =============================================== */}

      <div
        className="
          mt-6
          flex
          flex-wrap
          gap-3
          border-t
          border-slate-100
          pt-5
        "
      >

        {/* ============================================= */}
        {/* PATIENT ACTIONS                               */}
        {/* ============================================= */}

        {isPatient
          && [
            "REQUESTED",
            "APPROVED",
          ].includes(
            appointment?.status
          ) && (
          <button
            type="button"
            disabled={
              pending
            }
            onClick={() =>
              onCancel?.(
                appointment
              )
            }
            className="
              inline-flex
              min-h-[44px]
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              font-semibold
              text-slate-700
              transition

              hover:bg-slate-50

              active:scale-[0.98]

              disabled:pointer-events-none
              disabled:opacity-60
            "
          >
            Cancel Appointment
          </button>
        )}


        {/* ============================================= */}
        {/* DOCTOR — REQUESTED                            */}
        {/* ============================================= */}

        {isDoctor
          && appointment?.status
          === "REQUESTED" && (
          <>
            <button
              type="button"
              disabled={
                pending
              }
              onClick={() =>
                onApprove?.(
                  appointment
                )
              }
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
                transition

                hover:bg-blue-700

                active:scale-[0.98]

                disabled:pointer-events-none
                disabled:opacity-60
              "
            >
              Approve
            </button>


            <button
              type="button"
              disabled={
                pending
              }
              onClick={() =>
                onReject?.(
                  appointment
                )
              }
              className="
                inline-flex
                min-h-[44px]
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-semibold
                text-slate-700
                transition

                hover:bg-slate-50

                active:scale-[0.98]

                disabled:pointer-events-none
                disabled:opacity-60
              "
            >
              Reject
            </button>
          </>
        )}


        {/* ============================================= */}
        {/* DOCTOR — APPROVED                             */}
        {/* ============================================= */}

        {isDoctor
          && appointment?.status
          === "APPROVED" && (
          <>
            <button
              type="button"
              disabled={
                pending
              }
              onClick={() =>
                onStartConsultation?.(
                  appointment
                )
              }
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
                transition

                hover:bg-blue-700

                active:scale-[0.98]

                disabled:pointer-events-none
                disabled:opacity-60
              "
            >
              {pending
                ? "Please wait..."
                : "Start Consultation"}
            </button>


            <button
              type="button"
              disabled={
                pending
              }
              onClick={() =>
                onNoShow?.(
                  appointment
                )
              }
              className="
                inline-flex
                min-h-[44px]
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-semibold
                text-slate-700
                transition

                hover:bg-slate-50

                active:scale-[0.98]

                disabled:pointer-events-none
                disabled:opacity-60
              "
            >
              No Show
            </button>
          </>
        )}


        {/* ============================================= */}
        {/* FINAL STATUS MESSAGE                          */}
        {/* ============================================= */}

        {[
          "COMPLETED",
          "CANCELLED",
          "REJECTED",
          "NO_SHOW",
        ].includes(
          appointment?.status
        ) && (
          <p
            className="
              self-center
              text-sm
              text-slate-500
            "
          >
            No further appointment actions
            are available.
          </p>
        )}
      </div>
    </article>
  );
}