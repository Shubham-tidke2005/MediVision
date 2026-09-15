import {
  Search,
} from "lucide-react";


export default function DoctorFilters({
  search,
  setSearch,
  specialtyId,
  setSpecialtyId,
  city,
  setCity,
  specialties,
  onApply,
  onClear,
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
      "
    >
      <div
        className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        <div className="relative">
          <label
            htmlFor="doctor-search"
            className="sr-only"
          >
            Search doctors
          </label>

          <Search
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            id="doctor-search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search doctor..."
            className="
              min-h-[44px]
              w-full
              rounded-lg
              border
              border-slate-200
              bg-white
              pl-10
              pr-3
              text-sm
              text-slate-900

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          />
        </div>


        <select
          value={specialtyId}
          onChange={(event) =>
            setSpecialtyId(
              event.target.value
            )
          }
          className="
            min-h-[44px]
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
          <option value="">
            All specialties
          </option>

          {specialties.map(
            (specialty) => (
              <option
                key={specialty.id}
                value={
                  specialty.id
                }
              >
                {specialty.name}
              </option>
            )
          )}
        </select>


        <input
          value={city}
          onChange={(event) =>
            setCity(
              event.target.value
            )
          }
          placeholder="City"
          className="
            min-h-[44px]
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
        />


        <div
          className="
            flex
            gap-2
          "
        >
          <button
            type="submit"
            className="
              min-h-[44px]
              flex-1
              rounded-lg
              bg-blue-600
              px-4
              text-sm
              font-semibold
              text-white

              hover:bg-blue-700
              active:scale-[0.98]
            "
          >
            Search
          </button>

          <button
            type="button"
            onClick={onClear}
            className="
              min-h-[44px]
              rounded-lg
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              font-semibold
              text-slate-700

              hover:bg-slate-50
            "
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}