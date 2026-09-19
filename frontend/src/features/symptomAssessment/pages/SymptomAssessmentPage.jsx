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
  Clock3,
  LoaderCircle,
  Search,
  ShieldAlert,
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
// HELPERS
// ======================================================


function getErrorMessage(
  error
) {
  return (
    error?.response?.data?.detail
    || error?.message
    || "Something went wrong."
  );
}


function formatSpecialtyCode(
  code
) {
  if (!code) {
    return "";
  }

  if (code === "ENT") {
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


function formatSlot(
  value
) {
  if (!value) {
    return "";
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
    new Date(
      value
    )
  );
}


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
// PAGE
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
  // SYMPTOM CATALOG
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
  // AI ASSESSMENT
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
  // REAL DOCTOR SEARCH
  // ====================================================


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
      Boolean(
        assessment
          ?.recommended_specialty
      ),
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
              id !== symptomId
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


    if (
      selectedIds.length === 0
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


  return (
    <div
      className="
        mx-auto
        max-w-6xl
        space-y-6
      "
    >
      {/* =============================================== */}
      {/* PAGE HEADER                                     */}
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
              rounded-xl
              bg-blue-50
              p-3
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
              Select your symptoms and
              MediVision will provide an
              AI-assisted assessment with
              possible conditions and a
              recommended medical specialty.
            </p>
          </div>
        </div>
      </section>


      {/* =============================================== */}
      {/* FORM                                            */}
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
              Select symptoms
            </h2>
          </div>


          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Choose all symptoms that
            currently apply.
          </p>
        </div>


        {symptomsLoading && (
          <div
            className="
              flex
              items-center
              gap-2
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

            Loading symptoms...
          </div>
        )}


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
                    selectedIds
                      .includes(
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
                        min-h-[48px]
                        items-center
                        justify-between
                        rounded-lg
                        border
                        px-4
                        py-3
                        text-left
                        text-sm
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
                              + "hover:border-blue-300"
                            )
                        }
                      `}
                    >
                      <span>
                        {symptom.name}
                      </span>


                      {selected && (
                        <CheckCircle2
                          className="
                            h-5
                            w-5
                            shrink-0
                          "
                        />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          )}


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
              ) =>
                setDuration(
                  event.target.value
                )
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

              focus:border-blue-600
              focus:ring-2
              focus:ring-blue-100
            "
          />
        </div>


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


        {assessmentMutation.isError
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
                assessmentMutation.error
              )}
            </div>
          )}


        <button
          type="submit"
          disabled={
            assessmentMutation
              .isPending
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
            font-medium
            text-white

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
                <Brain
                  className="
                    h-4
                    w-4
                  "
                />

                Assess Symptoms
              </>
            )}
        </button>
      </form>


      {/* =============================================== */}
      {/* ASSESSMENT RESULT                               */}
      {/* =============================================== */}

      {assessment && (
        <>
          <section
            className="
              space-y-5
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
                items-center
                justify-between
                gap-3
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-semibold
                    text-slate-900
                  "
                >
                  Assessment Result
                </h2>


                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Possible conditions,
                  not a confirmed diagnosis.
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
                    assessment.urgency
                  )}
                `}
              >
                {assessment.urgency}
              </span>
            </div>


            {/* Possible conditions */}

            <div>
              <h3
                className="
                  font-medium
                  text-slate-900
                "
              >
                Possible conditions
              </h3>


              <div
                className="
                  mt-3
                  grid
                  gap-3
                "
              >
                {assessment
                  .possible_conditions
                  .map(
                    (
                      condition
                    ) => (
                      <div
                        key={
                          condition.name
                        }
                        className="
                          rounded-lg
                          border
                          border-slate-200
                          bg-slate-50
                          p-4
                        "
                      >
                        <div
                          className="
                            font-medium
                            text-slate-900
                          "
                        >
                          {
                            condition.name
                          }
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
                    )
                  )}
              </div>
            </div>


            {/* Specialty */}

            <div
              className="
                rounded-lg
                border
                border-blue-200
                bg-blue-50
                p-4
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <Stethoscope
                  className="
                    mt-0.5
                    h-5
                    w-5
                    text-blue-600
                  "
                />


                <div>
                  <div
                    className="
                      text-sm
                      font-medium
                      text-blue-900
                    "
                  >
                    Recommended specialty
                  </div>


                  <div
                    className="
                      mt-1
                      text-lg
                      font-semibold
                      text-blue-700
                    "
                  >
                    {formatSpecialtyCode(
                      assessment
                        .recommended_specialty
                    )}
                  </div>
                </div>
              </div>
            </div>


            {/* Emergency */}

            {assessment.urgency
              === "EMERGENCY"
              && (
                <div
                  className="
                    rounded-lg
                    border
                    border-rose-200
                    bg-rose-50
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      gap-3
                    "
                  >
                    <ShieldAlert
                      className="
                        mt-0.5
                        h-5
                        w-5
                        shrink-0
                        text-rose-600
                      "
                    />


                    <div>
                      <div
                        className="
                          font-semibold
                          text-rose-800
                        "
                      >
                        Emergency assessment
                      </div>


                      <p
                        className="
                          mt-1
                          text-sm
                          leading-6
                          text-rose-700
                        "
                      >
                        Seek emergency medical
                        care promptly. Do not rely
                        on waiting for a routine
                        appointment when urgent
                        emergency care is needed.
                      </p>
                    </div>
                  </div>
                </div>
              )}


            {/* Red flags */}

            {assessment
              .red_flags
              ?.length > 0
              && (
                <div
                  className="
                    rounded-lg
                    border
                    border-amber-200
                    bg-amber-50
                    p-4
                  "
                >
                  <div
                    className="
                      flex
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
                          font-medium
                          text-amber-900
                        "
                      >
                        Seek urgent medical
                        care if any of these occur
                      </h3>


                      <ul
                        className="
                          mt-2
                          list-disc
                          space-y-1
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
                              item
                            ) => (
                              <li
                                key={
                                  item
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


            {/* Safety */}

            <div
              className="
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                p-4
                text-sm
                leading-6
                text-slate-600
              "
            >
              {
                assessment
                  .safety_message
              }
            </div>
          </section>


          {/* ============================================= */}
          {/* REAL DOCTORS                                  */}
          {/* ============================================= */}

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
                gap-3
              "
            >
              <Stethoscope
                className="
                  mt-0.5
                  h-6
                  w-6
                  text-blue-600
                "
              />


              <div>
                <h2
                  className="
                    text-xl
                    font-semibold
                    text-slate-900
                  "
                >
                  Available MediVision Doctors
                </h2>


                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  These Doctors come from the
                  MediVision database. They are
                  not generated by the AI.
                </p>
              </div>
            </div>


            {doctorsLoading && (
              <div
                className="
                  mt-6
                  flex
                  items-center
                  gap-2
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

                Finding verified Doctors...
              </div>
            )}


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


            {!doctorsLoading
              && !doctorsIsError
              && doctorData
              && (
                <>
                  <div
                    className="
                      mt-4
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
                    Specialty:
                    {" "}

                    <span
                      className="
                        font-medium
                        text-slate-900
                      "
                    >
                      {
                        doctorData
                          .specialty_name
                      }
                    </span>

                    {" · "}

                    {
                      doctorData.total
                    }

                    {
                      doctorData.total === 1
                        ? " Doctor"
                        : " Doctors"
                    }
                  </div>


                  {doctorData
                    .doctors
                    .length === 0
                    ? (
                      <div
                        className="
                          mt-6
                          rounded-lg
                          border
                          border-slate-200
                          p-6
                          text-center
                        "
                      >
                        <UserRound
                          className="
                            mx-auto
                            h-8
                            w-8
                            text-slate-400
                          "
                        />


                        <p
                          className="
                            mt-3
                            font-medium
                            text-slate-900
                          "
                        >
                          No matching verified
                          Doctors are currently
                          available.
                        </p>


                        <p
                          className="
                            mt-1
                            text-sm
                            text-slate-500
                          "
                        >
                          You can still use the
                          normal Doctor search.
                        </p>


                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              "/doctors"
                            )
                          }
                          className="
                            mt-4
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
                        </button>
                      </div>
                    )
                    : (
                      <div
                        className="
                          mt-6
                          grid
                          gap-4
                          md:grid-cols-2
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
                                  rounded-xl
                                  border
                                  border-slate-200
                                  p-5
                                "
                              >
                                <div
                                  className="
                                    flex
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


                                  <div>
                                    <h3
                                      className="
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
                                        || (
                                          "Verified Doctor"
                                        )
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


                                <div
                                  className="
                                    mt-5
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

                                    Next available slots
                                  </div>


                                  {doctor
                                    .next_available_slots
                                    .length > 0
                                    ? (
                                      <div
                                        className="
                                          mt-2
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
                                          mt-2
                                          text-sm
                                          text-slate-500
                                        "
                                      >
                                        No available slots
                                        in the next{" "}
                                        {
                                          doctorData
                                            .search_window_days
                                        }{" "}
                                        days.
                                      </p>
                                    )}
                                </div>


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
                                    min-h-[42px]
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    bg-blue-600
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    text-white

                                    hover:bg-blue-700
                                  "
                                >
                                  <Stethoscope
                                    className="
                                      h-4
                                      w-4
                                    "
                                  />

                                  View Doctor & Book
                                </button>
                              </article>
                            )
                          )}
                      </div>
                    )}
                </>
              )}
          </section>
        </>
      )}
    </div>
  );
}