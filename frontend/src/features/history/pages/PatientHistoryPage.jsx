import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  AlertTriangle,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  Info,
  Pill,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";

import {
  getPatientHistory,
} from "@/features/history/api/historyApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


// ======================================================
// DATE
// ======================================================


function formatDate(
  value
) {
  if (!value) {
    return "";
  }


  return new Date(
    value
  ).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}


// ======================================================
// TIME
// ======================================================


function formatTime(
  value
) {
  if (!value) {
    return "";
  }


  return new Date(
    value
  ).toLocaleTimeString(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


// ======================================================
// FORMAT ENUM / CODE
// ======================================================


function formatType(
  value
) {
  if (!value) {
    return "";
  }


  return value
    .replaceAll(
      "_",
      " "
    );
}


// ======================================================
// DIAGNOSIS BADGE
// ======================================================


function DiagnosisBadge({
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
      {formatType(
        type
      )}
    </span>
  );
}


// ======================================================
// URGENCY BADGE
// ======================================================


function UrgencyBadge({
  urgency,
}) {
  const styles = {
    ROUTINE:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    URGENT:
      "border-amber-200 bg-amber-50 text-amber-700",

    EMERGENCY:
      "border-rose-200 bg-rose-50 text-rose-700",
  };


  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold

        ${
          styles[urgency]
          ?? "border-slate-200 bg-slate-50 text-slate-600"
        }
      `}
    >
      {formatType(
        urgency
      )}
    </span>
  );
}


// ======================================================
// CONSULTATION EVENT
// ======================================================


function ConsultationEvent({
  event,
}) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);


  const data =
    event.consultation;


  const doctor =
    data?.doctor;


  const appointment =
    data?.appointment;


  const encounter =
    data?.encounter;


  const diagnoses =
    data?.diagnoses
    ?? [];


  const prescription =
    data?.prescription;


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
              bg-blue-50
              text-blue-600
            "
          >
            <Stethoscope
              className="h-5 w-5"
            />
          </div>


          <div>
            <p
              className="
                text-sm
                font-semibold
                text-slate-900
              "
            >
              Doctor Consultation
            </p>


            <p
              className="
                mt-1
                text-sm
                text-slate-600
              "
            >
              Dr.{" "}
              {doctor?.first_name}{" "}
              {doctor?.last_name}
            </p>


            {doctor?.qualification && (
              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                "
              >
                {
                  doctor.qualification
                }
              </p>
            )}
          </div>
        </div>


        <div
          className="
            text-left

            sm:text-right
          "
        >
          <p
            className="
              text-sm
              font-semibold
              text-slate-900
            "
          >
            {formatDate(
              event.occurred_at
            )}
          </p>


          <p
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
            {formatTime(
              event.occurred_at
            )}
          </p>
        </div>
      </div>


      {/* APPOINTMENT BADGES */}

      <div
        className="
          mt-4
          flex
          flex-wrap
          gap-2
        "
      >
        {appointment
          ?.appointment_type && (
          <span
            className="
              rounded-full
              border
              border-slate-200
              bg-slate-50
              px-2.5
              py-1
              text-xs
              font-semibold
              text-slate-600
            "
          >
            {formatType(
              appointment
                .appointment_type
            )}
          </span>
        )}


        {appointment?.status && (
          <span
            className="
              rounded-full
              border
              border-emerald-200
              bg-emerald-50
              px-2.5
              py-1
              text-xs
              font-semibold
              text-emerald-700
            "
          >
            {formatType(
              appointment.status
            )}
          </span>
        )}
      </div>


      {/* REASON */}

      {appointment?.reason && (
        <div
          className="
            mt-4
            rounded-lg
            bg-slate-50
            p-3
          "
        >
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Reason
          </p>


          <p
            className="
              mt-1
              text-sm
              text-slate-700
            "
          >
            {
              appointment.reason
            }
          </p>
        </div>
      )}


      {/* SUMMARY */}

      <div
        className="
          mt-4
          grid
          grid-cols-1
          gap-3

          sm:grid-cols-2
        "
      >
        <div
          className="
            rounded-lg
            border
            border-slate-200
            p-3
          "
        >
          <p
            className="
              text-xs
              text-slate-500
            "
          >
            Diagnoses
          </p>


          <p
            className="
              mt-1
              font-semibold
              text-slate-900
            "
          >
            {
              diagnoses.length
            }
          </p>
        </div>


        <div
          className="
            rounded-lg
            border
            border-slate-200
            p-3
          "
        >
          <p
            className="
              text-xs
              text-slate-500
            "
          >
            Prescription
          </p>


          <p
            className="
              mt-1
              font-semibold
              text-slate-900
            "
          >
            {prescription
              ? `${
                  prescription
                    .items
                    ?.length
                  ?? 0
                } medicine(s)`
              : "None"}
          </p>
        </div>
      </div>


      {/* EXPAND */}

      <button
        type="button"
        onClick={() =>
          setExpanded(
            (
              current
            ) => !current
          )
        }
        className="
          mt-4
          inline-flex
          min-h-[40px]
          items-center
          gap-2
          text-sm
          font-semibold
          text-blue-600

          hover:text-blue-700
        "
      >
        {expanded
          ? (
            <>
              <ChevronUp
                className="h-4 w-4"
              />

              Hide details
            </>
          )
          : (
            <>
              <ChevronDown
                className="h-4 w-4"
              />

              View details
            </>
          )}
      </button>


      {expanded && (
        <div
          className="
            mt-4
            space-y-5
            border-t
            border-slate-100
            pt-5
          "
        >
          {/* ENCOUNTER */}

          {encounter && (
            <div>
              <h3
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                Consultation Notes
              </h3>


              {encounter
                .chief_complaint && (
                <div className="mt-3">
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-slate-500
                    "
                  >
                    Chief Complaint
                  </p>


                  <p
                    className="
                      mt-1
                      whitespace-pre-wrap
                      text-sm
                      leading-6
                      text-slate-700
                    "
                  >
                    {
                      encounter
                        .chief_complaint
                    }
                  </p>
                </div>
              )}


              {encounter
                .assessment_notes && (
                <div className="mt-3">
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-slate-500
                    "
                  >
                    Assessment
                  </p>


                  <p
                    className="
                      mt-1
                      whitespace-pre-wrap
                      text-sm
                      leading-6
                      text-slate-700
                    "
                  >
                    {
                      encounter
                        .assessment_notes
                    }
                  </p>
                </div>
              )}


              {encounter
                .plan_notes && (
                <div className="mt-3">
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-slate-500
                    "
                  >
                    Plan
                  </p>


                  <p
                    className="
                      mt-1
                      whitespace-pre-wrap
                      text-sm
                      leading-6
                      text-slate-700
                    "
                  >
                    {
                      encounter
                        .plan_notes
                    }
                  </p>
                </div>
              )}
            </div>
          )}


          {/* DIAGNOSES */}

          {diagnoses.length > 0 && (
            <div>
              <h3
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                Doctor Diagnoses
              </h3>


              <div
                className="
                  mt-3
                  space-y-3
                "
              >
                {diagnoses.map(
                  (
                    diagnosis
                  ) => (
                    <div
                      key={
                        diagnosis.id
                      }
                      className="
                        rounded-lg
                        border
                        border-slate-200
                        p-3
                      "
                    >
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >
                        <p
                          className="
                            text-sm
                            font-semibold
                            text-slate-900
                          "
                        >
                          {
                            diagnosis.name
                          }
                        </p>


                        <DiagnosisBadge
                          type={
                            diagnosis
                              .diagnosis_type
                          }
                        />
                      </div>


                      {diagnosis
                        .notes && (
                        <p
                          className="
                            mt-2
                            text-sm
                            leading-6
                            text-slate-600
                          "
                        >
                          {
                            diagnosis.notes
                          }
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}


          {/* PRESCRIPTION */}

          {prescription && (
            <div>
              <h3
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                <Pill
                  className="h-4 w-4"
                />

                Prescription
              </h3>


              <div
                className="
                  mt-3
                  space-y-3
                "
              >
                {prescription
                  .items
                  ?.map(
                    (
                      item
                    ) => (
                      <div
                        key={
                          item.id
                        }
                        className="
                          rounded-lg
                          border
                          border-slate-200
                          p-3
                        "
                      >
                        <p
                          className="
                            font-semibold
                            text-slate-900
                          "
                        >
                          {
                            item
                              .medicine
                              .name
                          }
                        </p>


                        <div
                          className="
                            mt-2
                            flex
                            flex-wrap
                            gap-x-5
                            gap-y-1
                            text-sm
                            text-slate-600
                          "
                        >
                          {item
                            .strength && (
                            <span>
                              Strength:{" "}
                              {
                                item
                                  .strength
                              }
                            </span>
                          )}


                          <span>
                            Dose:{" "}
                            {
                              item.dose
                            }
                          </span>


                          <span>
                            Frequency:{" "}
                            {
                              item
                                .frequency
                            }
                          </span>


                          {item
                            .duration_days && (
                            <span>
                              Duration:{" "}
                              {
                                item
                                  .duration_days
                              }{" "}
                              days
                            </span>
                          )}
                        </div>


                        {item
                          .instructions && (
                          <p
                            className="
                              mt-2
                              text-sm
                              text-slate-600
                            "
                          >
                            {
                              item
                                .instructions
                            }
                          </p>
                        )}
                      </div>
                    )
                  )}
              </div>


              {prescription
                .general_instructions && (
                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  {
                    prescription
                      .general_instructions
                  }
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}


// ======================================================
// DOCUMENT EVENT
// ======================================================


function DocumentEvent({
  event,
}) {
  const document =
    event.document;


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
          <FileText
            className="h-5 w-5"
          />
        </div>


        <div>
          <p
            className="
              font-semibold
              text-slate-900
            "
          >
            {document?.title
              || formatType(
                document
                  ?.document_type
              )
              || "Medical Document"}
          </p>


          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            {formatDate(
              event.occurred_at
            )}

            {" · "}

            {formatTime(
              event.occurred_at
            )}
          </p>


          {document
            ?.description && (
            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-600
              "
            >
              {
                document.description
              }
            </p>
          )}
        </div>
      </div>
    </article>
  );
}


// ======================================================
// PHASE 36 — AI ASSESSMENT EVENT
// ======================================================


function AssessmentEvent({
  event,
}) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);


  const assessment =
    event.assessment;


  const symptoms =
    assessment
      ?.reported_symptoms
    ?? [];


  const conditions =
    assessment
      ?.possible_conditions
    ?? [];


  const redFlags =
    assessment
      ?.red_flags
    ?? [];


  const urgency =
    assessment
      ?.urgency;


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
      {/* =============================================== */}
      {/* HEADER                                          */}
      {/* =============================================== */}

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
              bg-teal-50
              text-teal-600
            "
          >
            <BrainCircuit
              className="h-5 w-5"
            />
          </div>


          <div>
            <p
              className="
                font-semibold
                text-slate-900
              "
            >
              AI-assisted Symptom Assessment
            </p>


            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              {formatDate(
                event.occurred_at
              )}

              {" · "}

              {formatTime(
                event.occurred_at
              )}
            </p>
          </div>
        </div>


        {urgency && (
          <UrgencyBadge
            urgency={
              urgency
            }
          />
        )}
      </div>


      {/* =============================================== */}
      {/* REPORTED SYMPTOMS                               */}
      {/* =============================================== */}

      {symptoms.length > 0 && (
        <div
          className="
            mt-5
          "
        >
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Reported symptoms
          </p>


          <div
            className="
              mt-2
              flex
              flex-wrap
              gap-2
            "
          >
            {symptoms.map(
              (
                symptom
              ) => (
                <span
                  key={
                    symptom.id
                    ?? symptom.code
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    py-1
                    text-sm
                    text-slate-700
                  "
                >
                  <CheckCircle2
                    className="
                      h-3.5
                      w-3.5
                      text-teal-600
                    "
                  />

                  {
                    symptom.name
                  }
                </span>
              )
            )}
          </div>
        </div>
      )}


      {/* =============================================== */}
      {/* DURATION                                        */}
      {/* =============================================== */}

      {assessment
        ?.duration && (
        <div
          className="
            mt-4
            flex
            items-center
            gap-2
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

          <span>
            Duration:{" "}
            <span
              className="
                font-medium
                text-slate-800
              "
            >
              {
                assessment.duration
              }
            </span>
          </span>
        </div>
      )}


      {/* =============================================== */}
      {/* QUICK SUMMARY                                   */}
      {/* =============================================== */}

      <div
        className="
          mt-5
          grid
          gap-3

          sm:grid-cols-2
        "
      >
        <div
          className="
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            p-3
          "
        >
          <p
            className="
              text-xs
              text-slate-500
            "
          >
            Possible conditions
          </p>


          <p
            className="
              mt-1
              font-semibold
              text-slate-900
            "
          >
            {
              conditions.length
            }
          </p>
        </div>


        <div
          className="
            rounded-lg
            border
            border-slate-200
            bg-slate-50
            p-3
          "
        >
          <p
            className="
              text-xs
              text-slate-500
            "
          >
            Suggested specialty
          </p>


          <p
            className="
              mt-1
              font-semibold
              text-slate-900
            "
          >
            {
              assessment
                ?.recommended_specialty_name
              || "Not available"
            }
          </p>
        </div>
      </div>


      {/* =============================================== */}
      {/* EMERGENCY                                       */}
      {/* =============================================== */}

      {urgency
        === "EMERGENCY"
        && (
          <div
            className="
              mt-4
              flex
              items-start
              gap-3
              rounded-lg
              border
              border-rose-200
              bg-rose-50
              p-4
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
              <p
                className="
                  text-sm
                  font-semibold
                  text-rose-900
                "
              >
                Emergency-level assessment
              </p>


              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-rose-700
                "
              >
                This saved assessment indicated
                that prompt emergency medical
                evaluation may have been
                appropriate at the time.
              </p>
            </div>
          </div>
        )}


      {/* =============================================== */}
      {/* EXPAND BUTTON                                   */}
      {/* =============================================== */}

      <button
        type="button"
        onClick={() =>
          setExpanded(
            (
              current
            ) => !current
          )
        }
        className="
          mt-5
          inline-flex
          min-h-[40px]
          items-center
          gap-2
          text-sm
          font-semibold
          text-teal-600

          hover:text-teal-700
        "
      >
        {expanded
          ? (
            <>
              <ChevronUp
                className="h-4 w-4"
              />

              Hide assessment details
            </>
          )
          : (
            <>
              <ChevronDown
                className="h-4 w-4"
              />

              View assessment details
            </>
          )}
      </button>


      {/* =============================================== */}
      {/* EXPANDED DETAILS                                */}
      {/* =============================================== */}

      {expanded && (
        <div
          className="
            mt-4
            space-y-6
            border-t
            border-slate-100
            pt-5
          "
        >
          {/* ------------------------------------------- */}
          {/* POSSIBLE CONDITIONS                         */}
          {/* ------------------------------------------- */}

          {conditions.length > 0 && (
            <section>
              <h3
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                Possible Conditions
              </h3>


              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                These were AI-generated
                possibilities and are not
                confirmed diagnoses.
              </p>


              <div
                className="
                  mt-3
                  space-y-3
                "
              >
                {conditions.map(
                  (
                    condition,
                    index
                  ) => (
                    <div
                      key={
                        `${condition.name}-${index}`
                      }
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
                          font-semibold
                          text-slate-900
                        "
                      >
                        {
                          condition.name
                        }
                      </p>


                      {condition
                        .relevant_reported_factors
                        ?.length > 0
                        && (
                          <div
                            className="
                              mt-3
                            "
                          >
                            <p
                              className="
                                text-xs
                                font-semibold
                                text-slate-500
                              "
                            >
                              Relevant reported
                              factors
                            </p>


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
                                        rounded-full
                                        border
                                        border-teal-200
                                        bg-teal-50
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-medium
                                        text-teal-700
                                      "
                                    >
                                      {
                                        factor
                                      }
                                    </span>
                                  )
                                )}
                            </div>
                          </div>
                        )}


                      {condition
                        .reason && (
                        <div
                          className="
                            mt-3
                          "
                        >
                          <p
                            className="
                              text-xs
                              font-semibold
                              text-slate-500
                            "
                          >
                            Why was this suggested?
                          </p>


                          <p
                            className="
                              mt-1
                              text-sm
                              leading-6
                              text-slate-700
                            "
                          >
                            {
                              condition.reason
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </section>
          )}


          {/* ------------------------------------------- */}
          {/* SPECIALTY                                   */}
          {/* ------------------------------------------- */}

          {assessment
            ?.recommended_specialty_name
            && (
              <section
                className="
                  rounded-xl
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
                      shrink-0
                      text-blue-600
                    "
                  />


                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-blue-600
                      "
                    >
                      Suggested specialty
                    </p>


                    <p
                      className="
                        mt-1
                        font-semibold
                        text-blue-900
                      "
                    >
                      {
                        assessment
                          .recommended_specialty_name
                      }
                    </p>


                    {assessment
                      .specialty_reason
                      && (
                        <>
                          <p
                            className="
                              mt-3
                              text-xs
                              font-semibold
                              text-blue-700
                            "
                          >
                            Why this specialty?
                          </p>


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
                        </>
                      )}
                  </div>
                </div>
              </section>
            )}


          {/* ------------------------------------------- */}
          {/* RED FLAGS                                   */}
          {/* ------------------------------------------- */}

          {redFlags.length > 0 && (
            <section
              className="
                rounded-xl
                border
                border-amber-200
                bg-amber-50
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
                      text-sm
                      font-semibold
                      text-amber-900
                    "
                  >
                    Warning signs to watch for
                  </h3>


                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-amber-700
                    "
                  >
                    Seek appropriate medical
                    care if these warning signs
                    occur.
                  </p>


                  <ul
                    className="
                      mt-3
                      list-disc
                      space-y-1.5
                      pl-5
                      text-sm
                      leading-6
                      text-amber-800
                    "
                  >
                    {redFlags.map(
                      (
                        flag,
                        index
                      ) => (
                        <li
                          key={
                            `${flag}-${index}`
                          }
                        >
                          {flag}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </section>
          )}


          {/* ------------------------------------------- */}
          {/* SAFETY MESSAGE                              */}
          {/* ------------------------------------------- */}

          {assessment
            ?.safety_message
            && (
              <section
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


                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-800
                    "
                  >
                    About this assessment
                  </p>


                  <p
                    className="
                      mt-1
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
            )}


          {/* ------------------------------------------- */}
          {/* AI DISTINCTION                              */}
          {/* ------------------------------------------- */}

          <div
            className="
              rounded-lg
              border
              border-teal-100
              bg-teal-50
              p-3
            "
          >
            <p
              className="
                text-xs
                leading-5
                text-teal-800
              "
            >
              This record contains an
              AI-assisted symptom assessment.
              Possible conditions shown here
              are separate from diagnoses
              entered by a qualified Doctor
              during a consultation.
            </p>
          </div>
        </div>
      )}
    </article>
  );
}


// ======================================================
// PAGE
// ======================================================


export default function PatientHistoryPage() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "patient-medical-history",
    ],

    queryFn:
      getPatientHistory,
  });


  // ====================================================
  // LOADING
  // ====================================================

  if (isLoading) {
    return (
      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-10
          text-center
          shadow-sm
        "
      >
        <p
          className="
            text-sm
            text-slate-500
          "
        >
          Loading medical history...
        </p>
      </div>
    );
  }


  // ====================================================
  // ERROR
  // ====================================================

  if (isError) {
    return (
      <div
        className="
          rounded-xl
          border
          border-rose-200
          bg-rose-50
          p-5
        "
      >
        <p
          className="
            text-sm
            text-rose-700
          "
        >
          {getApiErrorMessage(
            error,
            "Unable to load medical history."
          )}
        </p>
      </div>
    );
  }


  const events =
    data?.events
    ?? [];


  // ====================================================
  // UI
  // ====================================================

  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      {/* =============================================== */}
      {/* HEADER                                          */}
      {/* =============================================== */}

      <section>
        <p
          className="
            text-sm
            font-semibold
            text-blue-600
          "
        >
          Patient Records
        </p>


        <h1
          className="
            mt-1
            text-2xl
            font-bold
            tracking-tight
            text-slate-900

            sm:text-3xl
          "
        >
          Medical History
        </h1>


        <p
          className="
            mt-2
            max-w-2xl
            text-sm
            leading-6
            text-slate-500
          "
        >
          Review previous consultations,
          Doctor diagnoses, prescriptions,
          medical documents and AI-assisted
          symptom assessments in one timeline.
        </p>


        {events.length > 0 && (
          <p
            className="
              mt-2
              text-xs
              text-slate-400
            "
          >
            {
              data?.total_events
              ?? events.length
            }{" "}
            {
              (
                data?.total_events
                ?? events.length
              ) === 1
                ? "record"
                : "records"
            }
          </p>
        )}
      </section>


      {/* =============================================== */}
      {/* EMPTY                                           */}
      {/* =============================================== */}

      {events.length === 0 ? (
        <section
          className="
            rounded-xl
            border
            border-dashed
            border-slate-200
            bg-white
            p-10
            text-center
          "
        >
          <CalendarClock
            className="
              mx-auto
              h-8
              w-8
              text-slate-400
            "
          />


          <h2
            className="
              mt-3
              font-semibold
              text-slate-900
            "
          >
            No medical history yet
          </h2>


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
            Your consultations, medical
            documents and AI-assisted symptom
            assessments will appear here over
            time.
          </p>
        </section>
      ) : (
        // ===============================================
        // TIMELINE
        // ===============================================

        <div
          className="
            relative
            space-y-5

            before:absolute
            before:bottom-0
            before:left-[19px]
            before:top-0
            before:w-px
            before:bg-slate-200

            sm:before:left-[23px]
          "
        >
          {events.map(
            (
              event
            ) => (
              <div
                key={
                  event.id
                }
                className="
                  relative
                  pl-12

                  sm:pl-14
                "
              >
                {/* Timeline point */}

                <div
                  className={`
                    absolute
                    left-[12px]
                    top-6
                    h-4
                    w-4
                    rounded-full
                    border-4
                    border-white
                    shadow-sm

                    sm:left-[16px]

                    ${
                      event.event_type
                      === "AI_ASSESSMENT"
                        ? "bg-teal-600"

                        : event.event_type
                          === "DOCUMENT"
                          ? "bg-sky-600"

                          : "bg-blue-600"
                    }
                  `}
                />


                {/* Consultation */}

                {event.event_type
                  === "CONSULTATION"
                  && (
                    <ConsultationEvent
                      event={
                        event
                      }
                    />
                  )}


                {/* Medical Document */}

                {event.event_type
                  === "DOCUMENT"
                  && (
                    <DocumentEvent
                      event={
                        event
                      }
                    />
                  )}


                {/* Phase 36 AI history */}

                {event.event_type
                  === "AI_ASSESSMENT"
                  && (
                    <AssessmentEvent
                      event={
                        event
                      }
                    />
                  )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}