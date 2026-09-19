import {
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  AlertTriangle,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Info,
  LoaderCircle,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  createSymptomAssessment,
  getRecommendedDoctors,
  getSymptoms,
} from "@/features/symptomAssessment/api/symptomAssessmentApi";


// ======================================================
// ERROR HELPER
// ======================================================


function getErrorMessage(
  error
) {
  const detail =
    error?.response?.data?.detail;


  if (
    typeof detail
    === "string"
  ) {
    return detail;
  }


  if (
    detail
    && typeof detail
      === "object"
  ) {
    if (
      typeof detail.message
      === "string"
    ) {
      return detail.message;
    }

    return (
      "The request could not be completed."
    );
  }


  return (
    error?.message
    || "Something went wrong."
  );
}


// ======================================================
// FORMAT SPECIALTY
// ======================================================


function formatSpecialtyCode(
  code
) {
  if (!code) {
    return "";
  }


  if (
    code === "ENT"
  ) {
    return "ENT";
  }


  return code
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0)
          .toUpperCase()
        + word.slice(1)
    )
    .join(" ");
}


// ======================================================
// FORMAT SLOT
// ======================================================


function formatSlot(
  value
) {
  if (!value) {
    return "";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }


  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(
    date
  );
}


// ======================================================
// URGENCY STYLES
// ======================================================


function urgencyClasses(
  urgency
) {
  if (
    urgency
    === "EMERGENCY"
  ) {
    return (
      "border-rose-200 "
      + "bg-rose-50 "
      + "text-rose-700"
    );
  }


  if (
    urgency
    === "URGENT"
  ) {
    return (
      "border-amber-200 "
      + "bg-amber-50 "
      + "text-amber-700"
    );
  }


  return (
    "border-emerald-200 "
    + "bg-emerald-50 "
    + "text-emerald-700"
  );
}


// ======================================================
// MAIN PAGE
// ======================================================


export default function SymptomAssessmentPage() {
  const navigate =
    useNavigate();


  const [
    selectedIds,
    setSelectedIds,
  ] = useState([]);


  const [
    duration,
    setDuration,
  ] = useState("");


  const [
    formError,
    setFormError,
  ] = useState("");


  // ====================================================
  // LOAD STANDARDIZED SYMPTOMS
  // ====================================================


  const {
    data:
      symptomsData,

    isLoading:
      symptomsLoading,

    isError:
      symptomsIsError,

    error:
      symptomsError,
  } = useQuery({
    queryKey: [
      "symptoms",
    ],

    queryFn:
      getSymptoms,
  });


  // Support either:
  //
  // [...]
  //
  // or:
  //
  // { items: [...] }

  const symptoms =
    useMemo(
      () => {
        if (
          Array.isArray(
            symptomsData
          )
        ) {
          return symptomsData;
        }


        if (
          Array.isArray(
            symptomsData?.items
          )
        ) {
          return (
            symptomsData.items
          );
        }


        return [];
      },
      [
        symptomsData,
      ]
    );


  // ====================================================
  // AI SYMPTOM ASSESSMENT
  // ====================================================


  const assessmentMutation =
    useMutation({
      mutationFn:
        createSymptomAssessment,

      onMutate: () => {
        setFormError("");
      },
    });


  const assessment =
    assessmentMutation.data;


  // ====================================================
  // PHASE 34
  // AI SPECIALTY -> REAL DATABASE DOCTORS
  //
  // Important:
  // Disable normal Doctor recommendations when the AI
  // marks the situation as EMERGENCY.
  // ====================================================


  const shouldSearchDoctors =
    Boolean(
      assessment
        ?.recommended_specialty
    )
    && assessment
      ?.urgency !== "EMERGENCY";


  const {
    data:
      doctorData,

    isLoading:
      doctorsLoading,

    isError:
      doctorsIsError,

    error:
      doctorsError,
  } = useQuery({
    queryKey: [
      "ai-recommended-doctors",
      assessment
        ?.recommended_specialty,
      30,
    ],

    queryFn: () =>
      getRecommendedDoctors({
        specialtyCode:
          assessment
            .recommended_specialty,

        days: 30,

        page: 1,

        pageSize: 12,
      }),

    enabled:
      shouldSearchDoctors,
  });


  // ====================================================
  // TOGGLE SYMPTOM
  // ====================================================


  function toggleSymptom(
    symptomId
  ) {
    setFormError("");


    setSelectedIds(
      (
        current
      ) => {
        if (
          current.includes(
            symptomId
          )
        ) {
          return current.filter(
            (id) =>
              id
              !== symptomId
          );
        }


        return [
          ...current,
          symptomId,
        ];
      }
    );
  }


  // ====================================================
  // SUBMIT
  // ====================================================


  function handleSubmit(
    event
  ) {
    event.preventDefault();


    setFormError("");


    if (
      selectedIds.length
      === 0
    ) {
      setFormError(
        "Select at least one symptom."
      );

      return;
    }


    if (
      !duration.trim()
    ) {
      setFormError(
        "Enter how long the symptoms have been present."
      );

      return;
    }


    assessmentMutation.mutate({
      symptom_ids:
        selectedIds,

      duration:
        duration.trim(),
    });
  }


  // ====================================================
  // RESET
  // ====================================================


  function handleReset() {
    setSelectedIds(
      []
    );

    setDuration(
      ""
    );

    setFormError(
      ""
    );

    assessmentMutation.reset();
  }


  // ====================================================
  // UI
  // ====================================================


  return (
    <div
      className="
        mx-auto
        max-w-6xl
        space-y-6
      "
    >
      {/* =============================================== */}
      {/* HEADER                                          */}
      {/* =============================================== */}

      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >
        <div
          className="
            flex
            items-start
            gap-4
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              text-blue-600
            "
          >
            <Brain
              className="
                h-6
                w-6
              "
            />
          </div>


          <div>
            <h1
              className="
                text-2xl
                font-semibold
                text-slate-900
              "
            >
              AI Symptom Assessment
            </h1>


            <p
              className="
                mt-1
                max-w-3xl
                text-sm
                leading-6
                text-slate-500
              "
            >
              Select the symptoms you are
              experiencing. MediVision provides
              possible conditions, understandable
              reasoning and a suggested medical
              specialty.
            </p>


            <div
              className="
                mt-3
                flex
                items-start
                gap-2
                text-xs
                leading-5
                text-slate-500
              "
            >
              <Info
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                "
              />

              <span>
                This feature provides AI-assisted
                clinical decision support. It does
                not provide a confirmed diagnosis.
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* =============================================== */}
      {/* SYMPTOM FORM                                    */}
      {/* =============================================== */}

      <form
        onSubmit={
          handleSubmit
        }
        className="
          space-y-6
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
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
            <Search
              className="
                h-5
                w-5
                text-blue-600
              "
            />


            <h2
              className="
                text-lg
                font-semibold
                text-slate-900
              "
            >
              Select your symptoms
            </h2>
          </div>


          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Select all symptoms that
            currently apply to you.
          </p>
        </div>


        {/* --------------------------------------------- */}
        {/* LOADING                                       */}
        {/* --------------------------------------------- */}

        {symptomsLoading && (
          <div
            className="
              flex
              items-center
              gap-2
              rounded-lg
              border
              border-slate-200
              bg-slate-50
              p-4
              text-sm
              text-slate-500
            "
          >
            <LoaderCircle
              className="
                h-4
                w-4
                animate-spin
              "
            />

            Loading symptom catalog...
          </div>
        )}


        {/* --------------------------------------------- */}
        {/* SYMPTOM ERROR                                 */}
        {/* --------------------------------------------- */}

        {symptomsIsError && (
          <div
            className="
              rounded-lg
              border
              border-rose-200
              bg-rose-50
              p-4
              text-sm
              text-rose-700
            "
          >
            {getErrorMessage(
              symptomsError
            )}
          </div>
        )}


        {/* --------------------------------------------- */}
        {/* SYMPTOM BUTTONS                               */}
        {/* --------------------------------------------- */}

        {!symptomsLoading
          && !symptomsIsError
          && (
            <div
              className="
                grid
                gap-3
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {symptoms.map(
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
                      onClick={() =>
                        toggleSymptom(
                          symptom.id
                        )
                      }
                      className={`
                        flex
                        min-h-[50px]
                        items-center
                        justify-between
                        gap-3
                        rounded-lg
                        border
                        px-4
                        py-3
                        text-left
                        text-sm
                        font-medium
                        transition

                        ${
                          selected
                            ? (
                              "border-blue-600 "
                              + "bg-blue-50 "
                              + "text-blue-700"
                            )
                            : (
                              "border-slate-200 "
                              + "bg-white "
                              + "text-slate-700 "
                              + "hover:border-blue-300 "
                              + "hover:bg-slate-50"
                            )
                        }
                      `}
                    >
                      <span>
                        {
                          symptom.name
                        }
                      </span>


                      {selected && (
                        <CheckCircle2
                          className="
                            h-5
                            w-5
                            shrink-0
                            text-blue-600
                          "
                        />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          )}


        {/* --------------------------------------------- */}
        {/* SELECTED COUNT                                */}
        {/* --------------------------------------------- */}

        {selectedIds.length
          > 0
          && (
            <p
              className="
                text-sm
                text-slate-500
              "
            >
              {
                selectedIds.length
              }{" "}
              {
                selectedIds.length
                === 1
                  ? "symptom"
                  : "symptoms"
              }{" "}
              selected.
            </p>
          )}


        {/* --------------------------------------------- */}
        {/* DURATION                                      */}
        {/* --------------------------------------------- */}

        <div
          className="
            max-w-md
          "
        >
          <label
            htmlFor="duration"
            className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-700
            "
          >
            How long have you had
            these symptoms?
          </label>


          <input
            id="duration"
            type="text"
            value={
              duration
            }
            onChange={
              (
                event
              ) => {
                setDuration(
                  event.target.value
                );

                setFormError(
                  ""
                );
              }
            }
            placeholder="Example: 2 days"
            maxLength={100}
            className="
              min-h-[44px]
              w-full
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              text-slate-900
              outline-none
              transition

              placeholder:text-slate-400

              focus:border-blue-600
              focus:ring-2
              focus:ring-blue-100
            "
          />


          <p
            className="
              mt-2
              text-xs
              text-slate-500
            "
          >
            Examples: 6 hours, 2 days,
            1 week.
          </p>
        </div>


        {/* --------------------------------------------- */}
        {/* FORM ERROR                                    */}
        {/* --------------------------------------------- */}

        {formError && (
          <div
            className="
              rounded-lg
              border
              border-rose-200
              bg-rose-50
              p-3
              text-sm
              text-rose-700
            "
          >
            {formError}
          </div>
        )}


        {/* --------------------------------------------- */}
        {/* API ERROR                                     */}
        {/* --------------------------------------------- */}

        {assessmentMutation
          .isError
          && (
            <div
              className="
                rounded-lg
                border
                border-rose-200
                bg-rose-50
                p-3
                text-sm
                text-rose-700
              "
            >
              {getErrorMessage(
                assessmentMutation
                  .error
              )}
            </div>
          )}


        {/* --------------------------------------------- */}
        {/* ACTIONS                                       */}
        {/* --------------------------------------------- */}

        <div
          className="
            flex
            flex-wrap
            gap-3
          "
        >
          <button
            type="submit"
            disabled={
              assessmentMutation
                .isPending
              || symptomsLoading
            }
            className="
              inline-flex
              min-h-[44px]
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-blue-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition

              hover:bg-blue-700

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {assessmentMutation
              .isPending
              ? (
                <>
                  <LoaderCircle
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                  Assessing...
                </>
              )
              : (
                <>
                  <Sparkles
                    className="
                      h-4
                      w-4
                    "
                  />

                  Assess Symptoms
                </>
              )}
          </button>


          {(assessment
            || selectedIds.length
              > 0)
            && (
              <button
                type="button"
                onClick={
                  handleReset
                }
                disabled={
                  assessmentMutation
                    .isPending
                }
                className="
                  min-h-[44px]
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-700
                  transition

                  hover:bg-slate-50

                  disabled:opacity-60
                "
              >
                Reset
              </button>
            )}
        </div>
      </form>


      {/* =============================================== */}
      {/* PHASE 33 + 35 RESULT                            */}
      {/* =============================================== */}

      {assessment && (
        <>
          <section
            className="
              space-y-6
              rounded-xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >
            {/* ----------------------------------------- */}
            {/* RESULT HEADER                             */}
            {/* ----------------------------------------- */}

            <div
              className="
                flex
                flex-wrap
                items-start
                justify-between
                gap-4
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
                  <Brain
                    className="
                      h-5
                      w-5
                      text-blue-600
                    "
                  />


                  <h2
                    className="
                      text-xl
                      font-semibold
                      text-slate-900
                    "
                  >
                    Assessment Result
                  </h2>
                </div>


                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  These are possible
                  conditions, not confirmed
                  diagnoses.
                </p>
              </div>


              <span
                className={`
                  rounded-full
                  border
                  px-3
                  py-1
                  text-xs
                  font-semibold

                  ${urgencyClasses(
                    assessment
                      .urgency
                  )}
                `}
              >
                {
                  assessment
                    .urgency
                }
              </span>
            </div>


            {/* ----------------------------------------- */}
            {/* POSSIBLE CONDITIONS                       */}
            {/* ----------------------------------------- */}

            <div>
              <h3
                className="
                  text-base
                  font-semibold
                  text-slate-900
                "
              >
                Possible conditions
              </h3>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Why these possibilities
                were suggested based on
                your reported symptoms.
              </p>


              <div
                className="
                  mt-4
                  grid
                  gap-4
                "
              >
                {assessment
                  .possible_conditions
                  ?.map(
                    (
                      condition,
                      index
                    ) => (
                      <article
                        key={
                          `${condition.name}-${index}`
                        }
                        className="
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          p-5
                        "
                      >
                        {/* Condition */}

                        <div
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-slate-500
                          "
                        >
                          Possible condition
                        </div>


                        <h4
                          className="
                            mt-1
                            text-lg
                            font-semibold
                            text-slate-900
                          "
                        >
                          {
                            condition.name
                          }
                        </h4>


                        {/* Phase 35 factors */}

                        {condition
                          .relevant_reported_factors
                          ?.length > 0
                          && (
                            <div
                              className="
                                mt-4
                              "
                            >
                              <div
                                className="
                                  text-sm
                                  font-medium
                                  text-slate-700
                                "
                              >
                                Relevant reported
                                factors
                              </div>


                              <div
                                className="
                                  mt-2
                                  flex
                                  flex-wrap
                                  gap-2
                                "
                              >
                                {condition
                                  .relevant_reported_factors
                                  .map(
                                    (
                                      factor
                                    ) => (
                                      <span
                                        key={
                                          factor
                                        }
                                        className="
                                          inline-flex
                                          items-center
                                          gap-1.5
                                          rounded-full
                                          border
                                          border-blue-200
                                          bg-blue-50
                                          px-3
                                          py-1
                                          text-sm
                                          text-blue-700
                                        "
                                      >
                                        <CheckCircle2
                                          className="
                                            h-3.5
                                            w-3.5
                                          "
                                        />

                                        {
                                          factor
                                        }
                                      </span>
                                    )
                                  )}
                              </div>
                            </div>
                          )}


                        {/* Explanation */}

                        <div
                          className="
                            mt-4
                          "
                        >
                          <div
                            className="
                              text-sm
                              font-medium
                              text-slate-700
                            "
                          >
                            Why was this suggested?
                          </div>


                          <p
                            className="
                              mt-1
                              text-sm
                              leading-6
                              text-slate-600
                            "
                          >
                            {
                              condition.reason
                            }
                          </p>
                        </div>
                      </article>
                    )
                  )}
              </div>
            </div>


            {/* ----------------------------------------- */}
            {/* SPECIALTY                                 */}
            {/* ----------------------------------------- */}

            <div
              className="
                rounded-xl
                border
                border-blue-200
                bg-blue-50
                p-5
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
                    rounded-lg
                    bg-white
                    p-2
                    text-blue-600
                  "
                >
                  <Stethoscope
                    className="
                      h-5
                      w-5
                    "
                  />
                </div>


                <div>
                  <div
                    className="
                      text-sm
                      font-medium
                      text-blue-900
                    "
                  >
                    Suggested specialty
                  </div>


                  <div
                    className="
                      mt-1
                      text-xl
                      font-semibold
                      text-blue-700
                    "
                  >
                    {formatSpecialtyCode(
                      assessment
                        .recommended_specialty
                    )}
                  </div>


                  {assessment
                    .specialty_reason
                    && (
                      <div
                        className="
                          mt-3
                        "
                      >
                        <div
                          className="
                            text-sm
                            font-medium
                            text-blue-900
                          "
                        >
                          Why this specialty?
                        </div>


                        <p
                          className="
                            mt-1
                            text-sm
                            leading-6
                            text-blue-800
                          "
                        >
                          {
                            assessment
                              .specialty_reason
                          }
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>


            {/* ----------------------------------------- */}
            {/* EMERGENCY WARNING                         */}
            {/* ----------------------------------------- */}

            {assessment
              .urgency
              === "EMERGENCY"
              && (
                <div
                  className="
                    rounded-xl
                    border
                    border-rose-200
                    bg-rose-50
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <ShieldAlert
                      className="
                        mt-0.5
                        h-6
                        w-6
                        shrink-0
                        text-rose-600
                      "
                    />


                    <div>
                      <h3
                        className="
                          font-semibold
                          text-rose-900
                        "
                      >
                        Seek emergency
                        medical care
                      </h3>


                      <p
                        className="
                          mt-1
                          text-sm
                          leading-6
                          text-rose-800
                        "
                      >
                        This assessment indicates
                        that prompt emergency
                        evaluation may be
                        appropriate. Do not rely
                        on waiting for a routine
                        appointment if immediate
                        medical care is needed.
                      </p>
                    </div>
                  </div>
                </div>
              )}


            {/* ----------------------------------------- */}
            {/* RED FLAGS                                 */}
            {/* ----------------------------------------- */}

            {assessment
              .red_flags
              ?.length > 0
              && (
                <div
                  className="
                    rounded-xl
                    border
                    border-amber-200
                    bg-amber-50
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <AlertTriangle
                      className="
                        mt-0.5
                        h-5
                        w-5
                        shrink-0
                        text-amber-600
                      "
                    />


                    <div>
                      <h3
                        className="
                          font-semibold
                          text-amber-900
                        "
                      >
                        Seek urgent medical
                        care if any of these
                        occur
                      </h3>


                      <ul
                        className="
                          mt-3
                          list-disc
                          space-y-2
                          pl-5
                          text-sm
                          leading-6
                          text-amber-800
                        "
                      >
                        {assessment
                          .red_flags
                          .map(
                            (
                              item,
                              index
                            ) => (
                              <li
                                key={
                                  `${item}-${index}`
                                }
                              >
                                {item}
                              </li>
                            )
                          )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}


            {/* ----------------------------------------- */}
            {/* SAFETY MESSAGE                            */}
            {/* ----------------------------------------- */}

            <div
              className="
                flex
                items-start
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-4
              "
            >
              <Info
                className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                  text-slate-500
                "
              />


              <p
                className="
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                {
                  assessment
                    .safety_message
                }
              </p>
            </div>
          </section>


          {/* ============================================= */}
          {/* PHASE 34 — REAL DOCTOR DISCOVERY              */}
          {/* ============================================= */}

          {assessment
            .urgency
            !== "EMERGENCY"
            && (
              <section
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    flex-wrap
                    items-start
                    justify-between
                    gap-4
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
                        rounded-xl
                        bg-blue-50
                        p-3
                        text-blue-600
                      "
                    >
                      <Stethoscope
                        className="
                          h-5
                          w-5
                        "
                      />
                    </div>


                    <div>
                      <h2
                        className="
                          text-xl
                          font-semibold
                          text-slate-900
                        "
                      >
                        Recommended MediVision
                        Doctors
                      </h2>


                      <p
                        className="
                          mt-1
                          max-w-2xl
                          text-sm
                          leading-6
                          text-slate-500
                        "
                      >
                        The AI recommends only
                        the medical specialty.
                        Doctor profiles and
                        appointment availability
                        below come directly from
                        MediVision&apos;s database.
                      </p>
                    </div>
                  </div>
                </div>


                {/* ------------------------------------- */}
                {/* DOCTOR LOADING                        */}
                {/* ------------------------------------- */}

                {doctorsLoading && (
                  <div
                    className="
                      mt-6
                      flex
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-slate-200
                      bg-slate-50
                      p-4
                      text-sm
                      text-slate-500
                    "
                  >
                    <LoaderCircle
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                    />

                    Finding verified{" "}
                    {formatSpecialtyCode(
                      assessment
                        .recommended_specialty
                    )}{" "}
                    Doctors...
                  </div>
                )}


                {/* ------------------------------------- */}
                {/* DOCTOR ERROR                          */}
                {/* ------------------------------------- */}

                {doctorsIsError && (
                  <div
                    className="
                      mt-6
                      rounded-lg
                      border
                      border-rose-200
                      bg-rose-50
                      p-4
                      text-sm
                      text-rose-700
                    "
                  >
                    {getErrorMessage(
                      doctorsError
                    )}
                  </div>
                )}


                {/* ------------------------------------- */}
                {/* DOCTOR RESULTS                        */}
                {/* ------------------------------------- */}

                {!doctorsLoading
                  && !doctorsIsError
                  && doctorData
                  && (
                    <>
                      <div
                        className="
                          mt-5
                          rounded-lg
                          border
                          border-slate-200
                          bg-slate-50
                          px-4
                          py-3
                          text-sm
                          text-slate-600
                        "
                      >
                        Showing real Doctors
                        for{" "}

                        <span
                          className="
                            font-semibold
                            text-slate-900
                          "
                        >
                          {
                            doctorData
                              .specialty_name
                          }
                        </span>

                        {" · "}

                        <span
                          className="
                            font-medium
                            text-slate-900
                          "
                        >
                          {
                            doctorData.total
                          }
                        </span>

                        {" "}

                        {
                          doctorData.total
                          === 1
                            ? "Doctor"
                            : "Doctors"
                        }
                      </div>


                      {/* No Doctors */}

                      {doctorData
                        .doctors
                        ?.length === 0
                        && (
                          <div
                            className="
                              mt-6
                              rounded-xl
                              border
                              border-slate-200
                              p-8
                              text-center
                            "
                          >
                            <UserRound
                              className="
                                mx-auto
                                h-10
                                w-10
                                text-slate-400
                              "
                            />


                            <h3
                              className="
                                mt-3
                                font-semibold
                                text-slate-900
                              "
                            >
                              No matching verified
                              Doctors are currently
                              available
                            </h3>


                            <p
                              className="
                                mx-auto
                                mt-1
                                max-w-lg
                                text-sm
                                leading-6
                                text-slate-500
                              "
                            >
                              MediVision will not
                              invent a Doctor when
                              no matching database
                              record exists. You can
                              still open the normal
                              Doctor search.
                            </p>


                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  "/doctors"
                                )
                              }
                              className="
                                mt-5
                                inline-flex
                                min-h-[42px]
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                border
                                border-slate-300
                                px-4
                                py-2
                                text-sm
                                font-medium
                                text-slate-700

                                hover:bg-slate-50
                              "
                            >
                              Open Doctor Search

                              <ChevronRight
                                className="
                                  h-4
                                  w-4
                                "
                              />
                            </button>
                          </div>
                        )}


                      {/* Doctor Cards */}

                      {doctorData
                        .doctors
                        ?.length > 0
                        && (
                          <div
                            className="
                              mt-6
                              grid
                              gap-4
                              md:grid-cols-2
                              xl:grid-cols-3
                            "
                          >
                            {doctorData
                              .doctors
                              .map(
                                (
                                  doctor
                                ) => (
                                  <article
                                    key={
                                      doctor.id
                                    }
                                    className="
                                      flex
                                      flex-col
                                      rounded-xl
                                      border
                                      border-slate-200
                                      bg-white
                                      p-5
                                      shadow-sm
                                    "
                                  >
                                    {/* Doctor */}

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
                                          rounded-full
                                          bg-blue-50
                                          text-blue-600
                                        "
                                      >
                                        <UserRound
                                          className="
                                            h-5
                                            w-5
                                          "
                                        />
                                      </div>


                                      <div
                                        className="
                                          min-w-0
                                        "
                                      >
                                        <h3
                                          className="
                                            truncate
                                            font-semibold
                                            text-slate-900
                                          "
                                        >
                                          Dr.{" "}
                                          {
                                            doctor
                                              .first_name
                                          }{" "}
                                          {
                                            doctor
                                              .last_name
                                          }
                                        </h3>


                                        <p
                                          className="
                                            mt-0.5
                                            text-sm
                                            text-slate-500
                                          "
                                        >
                                          {
                                            doctor
                                              .qualification
                                            || "Verified Doctor"
                                          }
                                        </p>


                                        <p
                                          className="
                                            mt-1
                                            text-xs
                                            text-slate-400
                                          "
                                        >
                                          {
                                            doctor
                                              .doctor_code
                                          }
                                        </p>
                                      </div>
                                    </div>


                                    {/* Specialty */}

                                    <div
                                      className="
                                        mt-4
                                        rounded-lg
                                        bg-blue-50
                                        px-3
                                        py-2
                                        text-sm
                                        font-medium
                                        text-blue-700
                                      "
                                    >
                                      {
                                        doctorData
                                          .specialty_name
                                      }
                                    </div>


                                    {/* Slots */}

                                    <div
                                      className="
                                        mt-5
                                        flex-1
                                      "
                                    >
                                      <div
                                        className="
                                          flex
                                          items-center
                                          gap-2
                                          text-sm
                                          font-medium
                                          text-slate-700
                                        "
                                      >
                                        <CalendarDays
                                          className="
                                            h-4
                                            w-4
                                          "
                                        />

                                        Next available
                                        slots
                                      </div>


                                      {doctor
                                        .next_available_slots
                                        ?.length > 0
                                        ? (
                                          <div
                                            className="
                                              mt-3
                                              space-y-2
                                            "
                                          >
                                            {doctor
                                              .next_available_slots
                                              .map(
                                                (
                                                  slot
                                                ) => (
                                                  <div
                                                    key={
                                                      slot.id
                                                    }
                                                    className="
                                                      flex
                                                      items-center
                                                      gap-2
                                                      rounded-lg
                                                      border
                                                      border-slate-200
                                                      bg-slate-50
                                                      px-3
                                                      py-2
                                                      text-sm
                                                      text-slate-600
                                                    "
                                                  >
                                                    <Clock3
                                                      className="
                                                        h-4
                                                        w-4
                                                        shrink-0
                                                        text-slate-400
                                                      "
                                                    />

                                                    {formatSlot(
                                                      slot
                                                        .start_at
                                                    )}
                                                  </div>
                                                )
                                              )}
                                          </div>
                                        )
                                        : (
                                          <p
                                            className="
                                              mt-3
                                              text-sm
                                              leading-6
                                              text-slate-500
                                            "
                                          >
                                            No available
                                            slots found in
                                            the next{" "}
                                            {
                                              doctorData
                                                .search_window_days
                                            }{" "}
                                            days.
                                          </p>
                                        )}
                                    </div>


                                    {/* View / Book */}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        navigate(
                                          `/doctors/${doctor.id}`
                                        )
                                      }
                                      className="
                                        mt-5
                                        inline-flex
                                        min-h-[44px]
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        bg-blue-600
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition

                                        hover:bg-blue-700
                                      "
                                    >
                                      View Doctor & Book

                                      <ChevronRight
                                        className="
                                          h-4
                                          w-4
                                        "
                                      />
                                    </button>
                                  </article>
                                )
                              )}
                          </div>
                        )}
                    </>
                  )}
              </section>
            )}
        </>
      )}
    </div>
  );
}