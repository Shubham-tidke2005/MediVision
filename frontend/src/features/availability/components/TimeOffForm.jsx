import {
  useState,
} from "react";

import {
  CalendarOff,
  Plus,
} from "lucide-react";


export default function TimeOffForm({
  onSubmit,
  submitting,
}) {
  const [
    form,
    setForm,
  ] = useState({
    start_at: "",
    end_at: "",
    reason: "",
  });


  function update(
    event
  ) {
    setForm(
      (current) => ({
        ...current,
        [event.target.name]:
          event.target.value,
      })
    );
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    await onSubmit({
      start_at:
        new Date(
          form.start_at
        ).toISOString(),

      end_at:
        new Date(
          form.end_at
        ).toISOString(),

      reason:
        form.reason.trim()
        || null,
    });

    setForm({
      start_at: "",
      end_at: "",
      reason: "",
    });
  }


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
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        <CalendarOff
          className="
            mt-1
            h-5
            w-5
            text-sky-600
          "
        />

        <div>
          <h2
            className="
              font-semibold
              text-slate-900
            "
          >
            Time off
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Block leave, holidays or
            other unavailable periods.
          </p>
        </div>
      </div>


      <div
        className="
          mt-5
          space-y-4
        "
      >
        <input
          type="datetime-local"
          name="start_at"
          required
          value={
            form.start_at
          }
          onChange={update}
          className="
            min-h-[44px]
            w-full
            rounded-lg
            border
            border-slate-200
            px-3

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
          "
        />

        <input
          type="datetime-local"
          name="end_at"
          required
          value={
            form.end_at
          }
          onChange={update}
          className="
            min-h-[44px]
            w-full
            rounded-lg
            border
            border-slate-200
            px-3

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
          "
        />

        <input
          name="reason"
          value={
            form.reason
          }
          onChange={update}
          placeholder="Reason (optional)"
          className="
            min-h-[44px]
            w-full
            rounded-lg
            border
            border-slate-200
            px-3

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
          "
        />

        <button
          disabled={submitting}
          className="
            inline-flex
            min-h-[44px]
            items-center
            gap-2
            rounded-lg
            bg-blue-600
            px-4
            text-sm
            font-semibold
            text-white

            hover:bg-blue-700
          "
        >
          <Plus className="h-4 w-4" />

          Add Time Off
        </button>
      </div>
    </form>
  );
}