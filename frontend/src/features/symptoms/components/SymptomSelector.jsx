import {
  useMemo,
  useState,
} from "react";

import {
  Search,
} from "lucide-react";


export default function SymptomSelector({
  symptoms = [],
  selectedIds = [],
  onChange,
  disabled = false,
}) {
  const [
    search,
    setSearch,
  ] = useState("");


  const filteredSymptoms =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return symptoms;
        }

        return symptoms.filter(
          (
            symptom
          ) =>
            symptom.name
              .toLowerCase()
              .includes(
                query
              )
            ||
            symptom.code
              .toLowerCase()
              .includes(
                query
              )
        );
      },
      [
        symptoms,
        search,
      ]
    );


  function toggleSymptom(
    symptomId
  ) {
    if (
      disabled
    ) {
      return;
    }

    const exists =
      selectedIds.includes(
        symptomId
      );

    if (exists) {
      onChange(
        selectedIds.filter(
          (
            id
          ) =>
            id
            !== symptomId
        )
      );

      return;
    }

    onChange([
      ...selectedIds,
      symptomId,
    ]);
  }


  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >
      <div>
        <h2
          className="
            font-semibold
            text-slate-900
          "
        >
          Select your symptoms
        </h2>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-slate-500
          "
        >
          Select all symptoms that
          currently apply.
        </p>
      </div>


      <div
        className="
          relative
          mt-5
        "
      >
        <Search
          className="
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
          type="search"
          value={
            search
          }
          onChange={
            (
              event
            ) =>
              setSearch(
                event.target.value
              )
          }
          placeholder="Search symptoms..."
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


      <div
        className="
          mt-5
          grid
          grid-cols-1
          gap-3

          sm:grid-cols-2

          lg:grid-cols-3
        "
      >
        {filteredSymptoms.map(
          (
            symptom
          ) => {
            const selected =
              selectedIds.includes(
                symptom.id
              );

            return (
              <button
                key={
                  symptom.id
                }
                type="button"
                disabled={
                  disabled
                }
                onClick={() =>
                  toggleSymptom(
                    symptom.id
                  )
                }
                className={`
                  rounded-lg
                  border
                  p-4
                  text-left
                  transition

                  ${
                    selected
                      ? `
                        border-blue-600
                        bg-blue-50
                      `
                      : `
                        border-slate-200
                        bg-white
                        hover:border-slate-300
                        hover:bg-slate-50
                      `
                  }

                  disabled:pointer-events-none
                  disabled:opacity-60
                `}
              >
                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <input
                    type="checkbox"
                    checked={
                      selected
                    }
                    readOnly
                    tabIndex={-1}
                    className="
                      mt-1
                      h-4
                      w-4
                      accent-blue-600
                    "
                  />

                  <div>
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-slate-900
                      "
                    >
                      {symptom.name}
                    </p>

                    {symptom.description && (
                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-slate-500
                        "
                      >
                        {
                          symptom.description
                        }
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          }
        )}
      </div>


      {filteredSymptoms.length === 0 && (
        <p
          className="
            mt-5
            text-sm
            text-slate-500
          "
        >
          No matching symptoms found.
        </p>
      )}


      <div
        className="
          mt-5
          border-t
          border-slate-200
          pt-4
        "
      >
        <p
          className="
            text-sm
            text-slate-600
          "
        >
          Selected:
          {" "}
          <strong>
            {selectedIds.length}
          </strong>
        </p>
      </div>
    </div>
  );
}