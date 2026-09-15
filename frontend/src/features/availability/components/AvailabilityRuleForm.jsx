import {
  useState,
} from "react";

import {
  Clock3,
  Plus,
} from "lucide-react";


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
`;


export default function AvailabilityRuleForm({
  onSubmit,
  submitting,
}) {
  const [
    form,
    setForm,
  ] = useState({
    day_of_week: "0",
    start_time: "09:00",
    end_time: "13:00",
    slot_duration_minutes: "30",
    valid_from: "",
    valid_until: "",
  });


  function update(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    await onSubmit({
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
        form.valid_from ||
        null,

      valid_until:
        form.valid_until ||
        null,

      timezone:
        "Asia/Kolkata",
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
              text-slate-500
            "
          >
            Define when patients can
            later book appointment slots.
          </p>
        </div>
      </div>


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
        <div>
          <label
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Day
          </label>

          <select
            name="day_of_week"
            value={
              form.day_of_week
            }
            onChange={update}
            className={`
              mt-2
              ${inputClassName}
            `}
          >
            {weekdays.map(
              (day) => (
                <option
                  key={day.value}
                  value={day.value}
                >
                  {day.label}
                </option>
              )
            )}
          </select>
        </div>


        <div>
          <label
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Start time
          </label>

          <input
            name="start_time"
            type="time"
            value={
              form.start_time
            }
            onChange={update}
            className={`
              mt-2
              ${inputClassName}
            `}
          />
        </div>


        <div>
          <label
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            End time
          </label>

          <input
            name="end_time"
            type="time"
            value={
              form.end_time
            }
            onChange={update}
            className={`
              mt-2
              ${inputClassName}
            `}
          />
        </div>


        <div>
          <label
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Slot duration
          </label>

          <select
            name="slot_duration_minutes"
            value={
              form.slot_duration_minutes
            }
            onChange={update}
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


        <div>
          <label
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Valid from
          </label>

          <input
            name="valid_from"
            type="date"
            value={
              form.valid_from
            }
            onChange={update}
            className={`
              mt-2
              ${inputClassName}
            `}
          />
        </div>


        <div>
          <label
            className="
              text-sm
              font-semibold
              text-slate-700
            "
          >
            Valid until
          </label>

          <input
            name="valid_until"
            type="date"
            value={
              form.valid_until
            }
            onChange={update}
            className={`
              mt-2
              ${inputClassName}
            `}
          />
        </div>
      </div>


      <div
        className="
          mt-5
          flex
          justify-end
        "
      >
        <button
          type="submit"
          disabled={submitting}
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

            hover:bg-blue-700
            active:scale-[0.98]

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
            focus:ring-offset-2

            disabled:opacity-60
          "
        >
          <Plus className="h-4 w-4" />

          Add Availability
        </button>
      </div>
    </form>
  );
}