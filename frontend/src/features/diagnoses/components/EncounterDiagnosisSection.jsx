import {
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Plus,
  Search,
  Stethoscope,
  Trash2,
} from "lucide-react";

import {
  addEncounterDiagnosis,
  createDiagnosis,
  deleteEncounterDiagnosis,
  getEncounterDiagnoses,
  searchDiagnoses,
} from "@/features/diagnoses/api/diagnosisApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


function DiagnosisTypeBadge({
  type,
}) {
  const styles = {
    PRIMARY:
      "border-blue-200 bg-blue-50 text-blue-700",

    SECONDARY:
      "border-sky-200 bg-sky-50 text-sky-700",

    SUSPECTED:
      "border-amber-200 bg-amber-50 text-amber-700",
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
          styles[type]
          ?? "border-slate-200 bg-slate-50 text-slate-600"
        }
      `}
    >
      {type}
    </span>
  );
}


export default function EncounterDiagnosisSection({
  encounterId,
  completed,
}) {
  const queryClient =
    useQueryClient();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedDiagnosisId,
    setSelectedDiagnosisId,
  ] = useState("");

  const [
    diagnosisType,
    setDiagnosisType,
  ] = useState(
    "PRIMARY"
  );

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    newDiagnosisName,
    setNewDiagnosisName,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");


  const {
    data:
      encounterDiagnoses = [],
  } = useQuery({
    queryKey: [
      "encounter-diagnoses",
      encounterId,
    ],

    queryFn: () =>
      getEncounterDiagnoses(
        encounterId
      ),
  });


  const {
    data:
      catalog = [],
    isLoading:
      catalogLoading,
  } = useQuery({
    queryKey: [
      "diagnosis-catalog",
      search,
    ],

    queryFn: () =>
      searchDiagnoses(
        search
      ),
  });


  const selectedDiagnosis =
    useMemo(
      () =>
        catalog.find(
          (item) =>
            item.id
            === selectedDiagnosisId
        ),
      [
        catalog,
        selectedDiagnosisId,
      ]
    );


  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "encounter-diagnoses",
          encounterId,
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "diagnosis-catalog",
        ],
      }),
    ]);
  }


  const addMutation =
    useMutation({
      mutationFn:
        addEncounterDiagnosis,

      onMutate: () => {
        setErrorMessage("");
        setMessage("");
      },

      onSuccess:
        async () => {
          setMessage(
            "Diagnosis added to encounter."
          );

          setSelectedDiagnosisId("");
          setNotes("");

          await refresh();
        },

      onError:
        (error) => {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "Unable to add diagnosis."
            )
          );
        },
    });


  const createMutation =
    useMutation({
      mutationFn:
        createDiagnosis,

      onMutate: () => {
        setErrorMessage("");
        setMessage("");
      },

      onSuccess:
        async (
          diagnosis
        ) => {
          setNewDiagnosisName("");

          setSelectedDiagnosisId(
            diagnosis.id
          );

          setSearch(
            diagnosis.name
          );

          setMessage(
            "Diagnosis added to the catalog. You can now attach it to this encounter."
          );

          await refresh();
        },

      onError:
        (error) => {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "Unable to create diagnosis."
            )
          );
        },
    });


  const deleteMutation =
    useMutation({
      mutationFn:
        deleteEncounterDiagnosis,

      onMutate: () => {
        setErrorMessage("");
        setMessage("");
      },

      onSuccess:
        async () => {
          setMessage(
            "Diagnosis removed from encounter."
          );

          await refresh();
        },

      onError:
        (error) => {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "Unable to remove diagnosis."
            )
          );
        },
    });


  function handleAdd(
    event
  ) {
    event.preventDefault();

    if (
      !selectedDiagnosisId
    ) {
      setErrorMessage(
        "Please select a diagnosis."
      );

      return;
    }

    addMutation.mutate({
      encounterId,

      payload: {
        diagnosis_id:
          selectedDiagnosisId,

        diagnosis_type:
          diagnosisType,

        notes:
          notes.trim()
          || null,
      },
    });
  }


  function handleCreateDiagnosis() {
    const name =
      newDiagnosisName.trim();

    if (name.length < 2) {
      setErrorMessage(
        "Enter a valid diagnosis name."
      );

      return;
    }

    createMutation.mutate({
      name,
      code: null,
      description: null,
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
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-sky-50
            text-sky-600
          "
        >
          <Stethoscope
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
            Diagnoses
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Record Doctor-entered diagnoses
            associated with this clinical
            encounter.
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


      {/* CURRENT DIAGNOSES */}

      <div
        className="
          mt-6
          space-y-3
        "
      >
        {encounterDiagnoses.length
        === 0 ? (
          <div
            className="
              rounded-lg
              border
              border-dashed
              border-slate-200
              p-5
              text-center
            "
          >
            <p
              className="
                text-sm
                text-slate-500
              "
            >
              No diagnoses recorded yet.
            </p>
          </div>
        ) : (
          encounterDiagnoses.map(
            (
              item
            ) => (
              <article
                key={
                  item.id
                }
                className="
                  rounded-lg
                  border
                  border-slate-200
                  p-4
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-3

                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                  "
                >
                  <div>
                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      "
                    >
                      <h3
                        className="
                          font-semibold
                          text-slate-900
                        "
                      >
                        {
                          item
                            .diagnosis
                            .name
                        }
                      </h3>

                      <DiagnosisTypeBadge
                        type={
                          item
                            .diagnosis_type
                        }
                      />
                    </div>

                    {item
                      .diagnosis
                      .code && (
                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-500
                        "
                      >
                        Code:{" "}
                        {
                          item
                            .diagnosis
                            .code
                        }
                      </p>
                    )}

                    {item.notes && (
                      <p
                        className="
                          mt-3
                          text-sm
                          leading-6
                          text-slate-600
                        "
                      >
                        {item.notes}
                      </p>
                    )}
                  </div>


                  {!completed && (
                    <button
                      type="button"
                      disabled={
                        deleteMutation
                          .isPending
                      }
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            "Remove this diagnosis from the encounter?"
                          );

                        if (
                          confirmed
                        ) {
                          deleteMutation
                            .mutate(
                              item.id
                            );
                        }
                      }}
                      className="
                        inline-flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-slate-200
                        text-slate-500

                        hover:bg-slate-50
                        hover:text-rose-600

                        disabled:opacity-60
                      "
                      aria-label="Remove diagnosis"
                    >
                      <Trash2
                        className="h-4 w-4"
                      />
                    </button>
                  )}
                </div>
              </article>
            )
          )
        )}
      </div>


      {/* ADD DIAGNOSIS */}

      {!completed && (
        <form
          onSubmit={
            handleAdd
          }
          className="
            mt-6
            space-y-5
            border-t
            border-slate-200
            pt-6
          "
        >
          <div>
            <label
              htmlFor="diagnosis-search"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Search diagnosis
            </label>

            <div
              className="
                relative
                mt-2
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
                id="diagnosis-search"
                value={search}
                onChange={(
                  event
                ) => {
                  setSearch(
                    event
                      .target
                      .value
                  );

                  setSelectedDiagnosisId(
                    ""
                  );
                }}
                placeholder="Search diagnosis..."
                className="
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  pl-10
                  pr-3
                  text-sm

                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-600
                  focus:ring-offset-2
                "
              />
            </div>
          </div>


          <div>
            <label
              htmlFor="diagnosis-id"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Diagnosis
            </label>

            <select
              id="diagnosis-id"
              value={
                selectedDiagnosisId
              }
              onChange={(
                event
              ) =>
                setSelectedDiagnosisId(
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

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2
              "
            >
              <option value="">
                {catalogLoading
                  ? "Loading..."
                  : "Select diagnosis"}
              </option>

              {catalog.map(
                (
                  diagnosis
                ) => (
                  <option
                    key={
                      diagnosis.id
                    }
                    value={
                      diagnosis.id
                    }
                  >
                    {
                      diagnosis.name
                    }
                    {
                      diagnosis.code
                        ? ` (${diagnosis.code})`
                        : ""
                    }
                  </option>
                )
              )}
            </select>

            {selectedDiagnosis && (
              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                Selected:{" "}
                {
                  selectedDiagnosis.name
                }
              </p>
            )}
          </div>


          <div>
            <label
              htmlFor="diagnosis-type"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Diagnosis type
            </label>

            <select
              id="diagnosis-type"
              value={
                diagnosisType
              }
              onChange={(
                event
              ) =>
                setDiagnosisType(
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

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2
              "
            >
              <option value="PRIMARY">
                Primary
              </option>

              <option value="SECONDARY">
                Secondary
              </option>

              <option value="SUSPECTED">
                Suspected
              </option>
            </select>
          </div>


          <div>
            <label
              htmlFor="diagnosis-notes"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Diagnosis notes
            </label>

            <textarea
              id="diagnosis-notes"
              rows="3"
              value={notes}
              onChange={(
                event
              ) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Optional clinical context for this diagnosis"
              className="
                mt-2
                w-full
                rounded-lg
                border
                border-slate-200
                p-3
                text-sm

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
              addMutation.isPending
              || !selectedDiagnosisId
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

              hover:bg-blue-700

              disabled:pointer-events-none
              disabled:opacity-60
            "
          >
            <Plus
              className="h-4 w-4"
            />

            {addMutation.isPending
              ? "Adding..."
              : "Add Diagnosis"}
          </button>


          {/* CREATE CUSTOM CATALOG ENTRY */}

          <div
            className="
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
              Diagnosis not in the catalog?
            </p>

            <div
              className="
                mt-3
                flex
                flex-col
                gap-3

                sm:flex-row
              "
            >
              <input
                value={
                  newDiagnosisName
                }
                onChange={(
                  event
                ) =>
                  setNewDiagnosisName(
                    event.target.value
                  )
                }
                placeholder="Enter diagnosis name"
                className="
                  min-h-[44px]
                  flex-1
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm

                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-600
                  focus:ring-offset-2
                "
              />

              <button
                type="button"
                disabled={
                  createMutation
                    .isPending
                }
                onClick={
                  handleCreateDiagnosis
                }
                className="
                  inline-flex
                  min-h-[44px]
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-sm
                  font-semibold
                  text-slate-700

                  hover:bg-slate-100

                  disabled:opacity-60
                "
              >
                <Plus
                  className="h-4 w-4"
                />

                Add to Catalog
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}