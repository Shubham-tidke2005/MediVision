import {
  CalendarClock,
  Stethoscope,
  UserRound,
} from "lucide-react";

import StatusBadge from "@/components/common/StatusBadge";


function getStatusVariant(
  status
) {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return "success";

    case "REQUESTED":
      return "warning";

    case "REJECTED":
    case "CANCELLED":
    case "NO_SHOW":
      return "neutral";

    default:
      return "info";
  }
}


export default function AppointmentCard({
  appointment,
  role,
  onApprove,
  onReject,
  onCancel,
  onComplete,
  onNoShow,
  pending,
}) {
  const start =
    new Date(
      appointment.slot.start_at
    );


  return (
    <article
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
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            {role === "PATIENT" ? (
              <Stethoscope
                className="
                  h-5
                  w-5
                  text-sky-600
                "
              />
            ) : (
              <UserRound
                className="
                  h-5
                  w-5
                  text-sky-600
                "
              />
            )}

            <h2
              className="
                font-semibold
                text-slate-900
              "
            >
              {role === "PATIENT"
                ? `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`
                : `${appointment.patient.first_name} ${appointment.patient.last_name}`}
            </h2>
          </div>


          <div
            className="
              mt-3
              flex
              items-center
              gap-2
              text-sm
              text-slate-500
            "
          >
            <CalendarClock
              className="h-4 w-4"
            />

            <span>
              {start.toLocaleDateString(
                undefined,
                {
                  weekday:
                    "short",
                  day:
                    "numeric",
                  month:
                    "short",
                  year:
                    "numeric",
                }
              )}
              {" • "}
              {start.toLocaleTimeString(
                [],
                {
                  hour:
                    "2-digit",
                  minute:
                    "2-digit",
                }
              )}
            </span>
          </div>


          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            {
              appointment.appointment_type
            }
          </p>


          {appointment.reason && (
            <p
              className="
                mt-3
                text-sm
                text-slate-700
              "
            >
              <span className="font-semibold">
                Reason:
              </span>{" "}
              {appointment.reason}
            </p>
          )}
        </div>


        <StatusBadge
          variant={
            getStatusVariant(
              appointment.status
            )
          }
        >
          {
            appointment.status
          }
        </StatusBadge>
      </div>


      <div
        className="
          mt-5
          flex
          flex-wrap
          gap-2
        "
      >
        {role === "PATIENT"
          && [
            "REQUESTED",
            "APPROVED",
          ].includes(
            appointment.status
          ) && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              onCancel(
                appointment
              )
            }
            className="
              min-h-[44px]
              rounded-lg
              border
              border-slate-200
              px-4
              text-sm
              font-semibold
              text-slate-700

              hover:bg-slate-50

              disabled:opacity-60
            "
          >
            Cancel Appointment
          </button>
        )}


        {role === "DOCTOR"
          && appointment.status
          === "REQUESTED" && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                onApprove(
                  appointment
                )
              }
              className="
                min-h-[44px]
                rounded-lg
                bg-blue-600
                px-4
                text-sm
                font-semibold
                text-white

                hover:bg-blue-700

                disabled:opacity-60
              "
            >
              Approve
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={() =>
                onReject(
                  appointment
                )
              }
              className="
                min-h-[44px]
                rounded-lg
                border
                border-slate-200
                px-4
                text-sm
                font-semibold
                text-slate-700

                hover:bg-slate-50

                disabled:opacity-60
              "
            >
              Reject
            </button>
          </>
        )}


        {role === "DOCTOR"
          && appointment.status
          === "APPROVED" && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                onComplete(
                  appointment
                )
              }
              className="
                min-h-[44px]
                rounded-lg
                bg-blue-600
                px-4
                text-sm
                font-semibold
                text-white

                hover:bg-blue-700
              "
            >
              Complete
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={() =>
                onNoShow(
                  appointment
                )
              }
              className="
                min-h-[44px]
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
              No Show
            </button>
          </>
        )}
      </div>
    </article>
  );
}