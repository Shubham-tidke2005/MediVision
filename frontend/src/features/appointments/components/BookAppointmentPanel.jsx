import {
  useState,
} from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  CalendarCheck,
} from "lucide-react";

import {
  requestAppointment,
} from "@/features/appointments/api/appointmentApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


export default function BookAppointmentPanel({
  doctorId,
  slots,
}) {
  const queryClient =
    useQueryClient();

  const [
    selectedSlotId,
    setSelectedSlotId,
  ] = useState("");

  const [
    appointmentType,
    setAppointmentType,
  ] = useState("IN_PERSON");

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    patientNotes,
    setPatientNotes,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const mutation =
    useMutation({
      mutationFn:
        requestAppointment,

      onSuccess:
        async () => {
          setErrorMessage("");

          setMessage(
            "Appointment request submitted successfully."
          );

          setSelectedSlotId("");
          setReason("");
          setPatientNotes("");

          await Promise.all([
            queryClient
              .invalidateQueries({
                queryKey: [
                  "doctor-available-slots",
                  doctorId,
                ],
              }),

            queryClient
              .invalidateQueries({
                queryKey: [
                  "patient-appointments",
                ],
              }),
          ]);
        },

      onError:
        (error) => {
          setMessage("");

          setErrorMessage(
            getApiErrorMessage(
              error,
              "Unable to request appointment."
            )
          );
        },
    });


  function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (!selectedSlotId) {
      setErrorMessage(
        "Please select an appointment slot."
      );

      return;
    }

    mutation.mutate({
      slot_id:
        selectedSlotId,

      appointment_type:
        appointmentType,

      reason:
        reason.trim()
        || null,

      patient_notes:
        patientNotes.trim()
        || null,
    });
  }


  return (
    <section
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        sm:p-6
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
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            bg-sky-50
            text-sky-600
          "
        >
          <CalendarCheck
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
            Request Appointment
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Select an available slot
            and submit an appointment
            request.
          </p>
        </div>
      </div>


      {message && (
        <div
          className="
            mt-5
            rounded-lg
            border
            border-emerald-200
            bg-emerald-50
            p-4
            text-sm
            text-emerald-700
          "
        >
          {message}
        </div>
      )}


      {errorMessage && (
        <div
          role="alert"
          className="
            mt-5
            rounded-lg
            border
            border-rose-200
            bg-rose-50
            p-4
            text-sm
            text-rose-700
          "
        >
          {errorMessage}
        </div>
      )}


      <form
        onSubmit={
          handleSubmit
        }
        className="
          mt-6
          space-y-5
        "
      >
        <div>
          <p
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Available slots
          </p>

          {slots.length === 0 ? (
            <p
              className="
                mt-3
                rounded-lg
                bg-slate-50
                p-4
                text-sm
                text-slate-500
              "
            >
              No appointment slots
              are currently available.
            </p>
          ) : (
            <div
              className="
                mt-3
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                lg:grid-cols-4
              "
            >
              {slots.map(
                (slot) => {
                  const selected =
                    selectedSlotId
                    === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() =>
                        setSelectedSlotId(
                          slot.id
                        )
                      }
                      className={`
                        min-h-[64px]
                        rounded-lg
                        border
                        p-3
                        text-left
                        transition-all
                        duration-200

                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-600
                        focus:ring-offset-2

                        ${
                          selected
                            ? `
                              border-blue-600
                              bg-blue-50
                            `
                            : `
                              border-slate-200
                              bg-white
                              hover:border-blue-300
                            `
                        }
                      `}
                    >
                      <p
                        className="
                          text-xs
                          text-slate-500
                        "
                      >
                        {new Date(
                          slot.start_at
                        ).toLocaleDateString(
                          undefined,
                          {
                            weekday:
                              "short",
                            day:
                              "numeric",
                            month:
                              "short",
                          }
                        )}
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-semibold
                          text-slate-900
                        "
                      >
                        {new Date(
                          slot.start_at
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        )}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>


        <div>
          <label
            htmlFor="appointment-type"
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Appointment type
          </label>

          <select
            id="appointment-type"
            value={
              appointmentType
            }
            onChange={(event) =>
              setAppointmentType(
                event.target.value
              )
            }
            className="
              mt-2
              min-h-[44px]
              w-full
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              text-slate-900

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          >
            <option value="IN_PERSON">
              In Person
            </option>

            <option value="ONLINE">
              Online
            </option>

            <option value="PHONE">
              Phone
            </option>
          </select>
        </div>


        <div>
          <label
            htmlFor="appointment-reason"
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Reason for appointment
          </label>

          <input
            id="appointment-reason"
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value
              )
            }
            maxLength={500}
            placeholder="Brief reason for consultation"
            className="
              mt-2
              min-h-[44px]
              w-full
              rounded-lg
              border
              border-slate-200
              px-3

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          />
        </div>


        <div>
          <label
            htmlFor="patient-notes"
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Additional notes
          </label>

          <textarea
            id="patient-notes"
            rows="4"
            value={
              patientNotes
            }
            onChange={(event) =>
              setPatientNotes(
                event.target.value
              )
            }
            maxLength={3000}
            placeholder="Optional information for the doctor"
            className="
              mt-2
              w-full
              rounded-lg
              border
              border-slate-200
              p-3

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          />
        </div>


        <button
          type="submit"
          disabled={
            mutation.isPending
            || !selectedSlotId
          }
          className="
            inline-flex
            min-h-[44px]
            items-center
            justify-center
            rounded-lg
            bg-blue-600
            px-5
            text-sm
            font-semibold
            text-white

            hover:bg-blue-700
            active:scale-[0.98]

            disabled:pointer-events-none
            disabled:opacity-60

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
            focus:ring-offset-2
          "
        >
          {mutation.isPending
            ? "Requesting..."
            : "Request Appointment"}
        </button>
      </form>
    </section>
  );
}