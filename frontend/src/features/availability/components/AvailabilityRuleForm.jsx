import {
  useState,
} from "react";

import {
  Clock3,
  Plus,
} from "lucide-react";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


const weekdays = [
  {
    value: 0,
    label: "Monday",
  },
  {
    value: 1,
    label: "Tuesday",
  },
  {
    value: 2,
    label: "Wednesday",
  },
  {
    value: 3,
    label: "Thursday",
  },
  {
    value: 4,
    label: "Friday",
  },
  {
    value: 5,
    label: "Saturday",
  },
  {
    value: 6,
    label: "Sunday",
  },
];


const inputClassName = `
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

  disabled:cursor-not-allowed
  disabled:bg-slate-50
  disabled:text-slate-500
`;


const initialForm = {
  day_of_week: "0",
  start_time: "09:00",
  end_time: "13:00",
  slot_duration_minutes: "30",
  valid_from: "",
  valid_until: "",
};


export default function AvailabilityRuleForm({
  onSubmit,
  submitting = false,
}) {
  const [
    form,
    setForm,
  ] = useState({
    ...initialForm,
  });


  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  // ======================================================
  // UPDATE FORM
  // ======================================================

  function update(
    event
  ) {
    const {
      name,
      value,
    } = event.target;


    setErrorMessage("");
    setSuccessMessage("");


    setForm(
      (
        current
      ) => ({
        ...current,

        [name]:
          value,
      })
    );
  }


  // ======================================================
  // VALIDATION
  // ======================================================

  function validateForm() {
    // --------------------------------------------------
    // Start / end time required
    // --------------------------------------------------

    if (
      !form.start_time
      || !form.end_time
    ) {
      return (
        "Start time and end time are required."
      );
    }


    // --------------------------------------------------
    // End must be after start
    // --------------------------------------------------

    if (
      form.start_time
      >= form.end_time
    ) {
      return (
        "End time must be later than start time."
      );
    }


    // --------------------------------------------------
    // Slot duration
    // --------------------------------------------------

    const slotDuration =
      Number(
        form.slot_duration_minutes
      );


    if (
      !Number.isFinite(
        slotDuration
      )
      || slotDuration <= 0
    ) {
      return (
        "Please select a valid slot duration."
      );
    }


    // --------------------------------------------------
    // Calculate availability length
    // --------------------------------------------------

    const [
      startHour,
      startMinute,
    ] = form.start_time
      .split(":")
      .map(Number);


    const [
      endHour,
      endMinute,
    ] = form.end_time
      .split(":")
      .map(Number);


    const startMinutes =
      (
        startHour * 60
      )
      + startMinute;


    const endMinutes =
      (
        endHour * 60
      )
      + endMinute;


    const availabilityMinutes =
      endMinutes
      - startMinutes;


    if (
      slotDuration
      > availabilityMinutes
    ) {
      return (
        "Slot duration cannot be longer "
        + "than the availability period."
      );
    }


    // --------------------------------------------------
    // Valid until cannot be before valid from
    // --------------------------------------------------

    if (
      form.valid_from
      && form.valid_until
      && form.valid_until
        < form.valid_from
    ) {
      return (
        "Valid until date cannot be earlier "
        + "than valid from date."
      );
    }


    return null;
  }


  // ======================================================
  // SUBMIT
  // ======================================================

  async function handleSubmit(
    event
  ) {
    event.preventDefault();


    if (
      submitting
    ) {
      return;
    }


    setErrorMessage("");
    setSuccessMessage("");


    // --------------------------------------------------
    // Frontend validation
    // --------------------------------------------------

    const validationError =
      validateForm();


    if (
      validationError
    ) {
      setErrorMessage(
        validationError
      );

      return;
    }


    // --------------------------------------------------
    // Keep payload exactly compatible with Phase 17 API
    // --------------------------------------------------

    const payload = {
      day_of_week:
        Number(
          form.day_of_week
        ),

      start_time:
        `${form.start_time}:00`,

      end_time:
        `${form.end_time}:00`,

      slot_duration_minutes:
        Number(
          form.slot_duration_minutes
        ),

      valid_from:
        form.valid_from
        || null,

      valid_until:
        form.valid_until
        || null,

      timezone:
        "Asia/Kolkata",
    };


    // --------------------------------------------------
    // IMPORTANT:
    // Catch backend 409 Conflict here.
    //
    // This fixes:
    // Uncaught (in promise) AxiosError
    // --------------------------------------------------

    try {
      await onSubmit(
        payload
      );


      setSuccessMessage(
        "Availability rule added successfully."
      );


      // Optional:
      // Reset form after successful creation.
      setForm({
        ...initialForm,
      });

    } catch (
      error
    ) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to add availability rule."
        )
      );
    }
  }


  // ======================================================
  // UI
  // ======================================================

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >

      {/* =============================================== */}
      {/* HEADER                                          */}
      {/* =============================================== */}

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
          <Clock3
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
            Add weekly availability
          </h2>

          <p
            className="
              mt-1
              text-sm
              leading-6
              text-slate-500
            "
          >
            Define when patients can
            later book appointment slots.
          </p>
        </div>
      </div>


      {/* =============================================== */}
      {/* ERROR                                           */}
      {/* =============================================== */}

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
            leading-6
            text-rose-700
          "
        >
          {errorMessage}
        </div>
      )}


      {/* =============================================== */}
      {/* SUCCESS                                         */}
      {/* =============================================== */}

      {successMessage && (
        <div
          role="status"
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
          {successMessage}
        </div>
      )}


      {/* =============================================== */}
      {/* FIELDS                                          */}
      {/* =============================================== */}

      <div
        className="
          mt-6
          grid
          grid-cols-1
          gap-4

          md:grid-cols-2

          xl:grid-cols-3
        "
      >

        {/* ============================================= */}
        {/* DAY                                           */}
        {/* ============================================= */}

        <div>
          <label
            htmlFor="day_of_week"
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Day
          </label>

          <select
            id="day_of_week"
            name="day_of_week"
            value={
              form.day_of_week
            }
            onChange={
              update
            }
            disabled={
              submitting
            }
            className={`
              mt-2
              ${inputClassName}
            `}
          >
            {weekdays.map(
              (
                day
              ) => (
                <option
                  key={
                    day.value
                  }
                  value={
                    day.value
                  }
                >
                  {
                    day.label
                  }
                </option>
              )
            )}
          </select>
        </div>


        {/* ============================================= */}
        {/* START TIME                                    */}
        {/* ============================================= */}

        <div>
          <label
            htmlFor="start_time"
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Start time
          </label>

          <input
            id="start_time"
            name="start_time"
            type="time"
            value={
              form.start_time
            }
            onChange={
              update
            }
            disabled={
              submitting
            }
            className={`
              mt-2
              ${inputClassName}
            `}
          />
        </div>


        {/* ============================================= */}
        {/* END TIME                                      */}
        {/* ============================================= */}

        <div>
          <label
            htmlFor="end_time"
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            End time
          </label>

          <input
            id="end_time"
            name="end_time"
            type="time"
            value={
              form.end_time
            }
            onChange={
              update
            }
            disabled={
              submitting
            }
            className={`
              mt-2
              ${inputClassName}
            `}
          />
        </div>


        {/* ============================================= */}
        {/* SLOT DURATION                                 */}
        {/* ============================================= */}

        <div>
          <label
            htmlFor="slot_duration_minutes"
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Slot duration
          </label>

          <select
            id="slot_duration_minutes"
            name="slot_duration_minutes"
            value={
              form.slot_duration_minutes
            }
            onChange={
              update
            }
            disabled={
              submitting
            }
            className={`
              mt-2
              ${inputClassName}
            `}
          >
            <option value="15">
              15 minutes
            </option>

            <option value="20">
              20 minutes
            </option>

            <option value="30">
              30 minutes
            </option>

            <option value="45">
              45 minutes
            </option>

            <option value="60">
              60 minutes
            </option>
          </select>
        </div>


        {/* ============================================= */}
        {/* VALID FROM                                    */}
        {/* ============================================= */}

        <div>
          <label
            htmlFor="valid_from"
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Valid from
          </label>

          <input
            id="valid_from"
            name="valid_from"
            type="date"
            value={
              form.valid_from
            }
            onChange={
              update
            }
            disabled={
              submitting
            }
            className={`
              mt-2
              ${inputClassName}
            `}
          />

          <p
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
            Optional. Leave empty if the
            rule can start immediately.
          </p>
        </div>


        {/* ============================================= */}
        {/* VALID UNTIL                                   */}
        {/* ============================================= */}

        <div>
          <label
            htmlFor="valid_until"
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Valid until
          </label>

          <input
            id="valid_until"
            name="valid_until"
            type="date"
            value={
              form.valid_until
            }
            onChange={
              update
            }
            disabled={
              submitting
            }
            min={
              form.valid_from
              || undefined
            }
            className={`
              mt-2
              ${inputClassName}
            `}
          />

          <p
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
            Optional. Leave empty for no
            predefined end date.
          </p>
        </div>
      </div>


      {/* =============================================== */}
      {/* INFORMATION                                     */}
      {/* =============================================== */}

      <div
        className="
          mt-5
          rounded-lg
          border
          border-slate-200
          bg-slate-50
          p-4
        "
      >
        <p
          className="
            text-sm
            font-semibold
            text-slate-700
          "
        >
          Availability rules
        </p>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-slate-500
          "
        >
          The same Doctor should not have
          conflicting availability periods.
          If the selected day, time and
          effective dates conflict with an
          existing rule, the server may reject
          the request with a conflict message.
        </p>
      </div>


      {/* =============================================== */}
      {/* SUBMIT                                          */}
      {/* =============================================== */}

      <div
        className="
          mt-5
          flex
          justify-end
        "
      >
        <button
          type="submit"
          disabled={
            submitting
          }
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

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
            focus:ring-offset-2

            disabled:pointer-events-none
            disabled:opacity-60
          "
        >
          <Plus
            className="h-4 w-4"
          />

          {submitting
            ? "Adding..."
            : "Add Availability"}
        </button>
      </div>
    </form>
  );
}