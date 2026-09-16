import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Save,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  completeEncounter,
  getEncounter,
  updateEncounter,
} from "@/features/encounters/api/encounterApi";

import EncounterDiagnosisSection from "@/features/diagnoses/components/EncounterDiagnosisSection";

import EncounterPrescriptionSection from "@/features/prescriptions/components/EncounterPrescriptionSection";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


// ========================================================
// HELPERS
// ========================================================

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  return new Date(
    value
  ).toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}


function formatAppointmentType(type) {
  if (!type) {
    return "Not available";
  }

  return type.replaceAll(
    "_",
    " "
  );
}


// ========================================================
// COMPONENT
// ========================================================

export default function EncounterPage() {
  const {
    encounterId,
  } = useParams();

  const queryClient =
    useQueryClient();


  // ======================================================
  // FORM STATE
  // ======================================================

  const [
    form,
    setForm,
  ] = useState({
    chief_complaint: "",
    subjective_notes: "",
    objective_notes: "",
    assessment_notes: "",
    plan_notes: "",
  });


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  const [
    actionError,
    setActionError,
  ] = useState("");


  // ======================================================
  // LOAD ENCOUNTER
  // ======================================================

  const {
    data: encounter,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "encounter",
      encounterId,
    ],

    queryFn: () =>
      getEncounter(
        encounterId
      ),

    enabled:
      Boolean(
        encounterId
      ),
  });


  // ======================================================
  // COPY ENCOUNTER DATA INTO FORM
  // ======================================================

  useEffect(() => {
    if (!encounter) {
      return;
    }

    setForm({
      chief_complaint:
        encounter.chief_complaint
        ?? "",

      subjective_notes:
        encounter.subjective_notes
        ?? "",

      objective_notes:
        encounter.objective_notes
        ?? "",

      assessment_notes:
        encounter.assessment_notes
        ?? "",

      plan_notes:
        encounter.plan_notes
        ?? "",
    });
  }, [
    encounter,
  ]);


  // ======================================================
  // BUILD NOTES PAYLOAD
  // ======================================================

  function buildPayload() {
    return {
      chief_complaint:
        form.chief_complaint
          .trim()
        || null,

      subjective_notes:
        form.subjective_notes
          .trim()
        || null,

      objective_notes:
        form.objective_notes
          .trim()
        || null,

      assessment_notes:
        form.assessment_notes
          .trim()
        || null,

      plan_notes:
        form.plan_notes
          .trim()
        || null,
    };
  }


  // ======================================================
  // REFRESH ENCOUNTER-RELATED DATA
  // ======================================================

  async function refreshEncounterData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [
          "encounter",
          encounterId,
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "encounter-diagnoses",
          encounterId,
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "encounter-prescription",
          encounterId,
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "doctor-appointments",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "patient-appointments",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "doctor-dashboard",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "patient-dashboard",
        ],
      }),
    ]);
  }


  // ======================================================
  // SAVE CONSULTATION NOTES
  // ======================================================

  const saveMutation =
    useMutation({
      mutationFn:
        updateEncounter,

      onMutate: () => {
        setSuccessMessage("");
        setActionError("");
      },

      onSuccess:
        async () => {
          setSuccessMessage(
            "Consultation notes saved successfully."
          );

          await queryClient
            .invalidateQueries({
              queryKey: [
                "encounter",
                encounterId,
              ],
            });
        },

      onError:
        (mutationError) => {
          setSuccessMessage("");

          setActionError(
            getApiErrorMessage(
              mutationError,
              "Unable to save consultation notes."
            )
          );
        },
    });


  // ======================================================
  // COMPLETE CONSULTATION
  //
  // IMPORTANT:
  // 1. Save current notes
  // 2. Complete Encounter
  // 3. Appointment becomes COMPLETED in backend
  // ======================================================

  const completeMutation =
    useMutation({
      mutationFn:
        async () => {
          // ----------------------------------------------
          // Save any unsaved consultation notes first
          // ----------------------------------------------

          await updateEncounter({
            encounterId,

            payload:
              buildPayload(),
          });


          // ----------------------------------------------
          // Then complete the Encounter
          // ----------------------------------------------

          return completeEncounter(
            encounterId
          );
        },

      onMutate: () => {
        setSuccessMessage("");
        setActionError("");
      },

      onSuccess:
        async () => {
          setSuccessMessage(
            "Consultation completed successfully."
          );

          await refreshEncounterData();
        },

      onError:
        (mutationError) => {
          setSuccessMessage("");

          setActionError(
            getApiErrorMessage(
              mutationError,
              "Unable to complete consultation."
            )
          );
        },
    });


  // ======================================================
  // FORM HANDLERS
  // ======================================================

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

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


  function handleSave(
    event
  ) {
    event.preventDefault();

    if (
      encounter?.is_completed
      || encounter?.ended_at
    ) {
      return;
    }

    saveMutation.mutate({
      encounterId,

      payload:
        buildPayload(),
    });
  }


  function handleComplete() {
    const confirmed =
      window.confirm(
        "Complete this consultation? After completion, the consultation notes, diagnoses and prescription will become read-only."
      );

    if (!confirmed) {
      return;
    }

    completeMutation.mutate();
  }


  // ======================================================
  // LOADING
  // ======================================================

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
          Loading consultation...
        </p>
      </div>
    );
  }


  // ======================================================
  // LOAD ERROR
  // ======================================================

  if (isError) {
    return (
      <div
        className="
          space-y-4
          rounded-xl
          border
          border-rose-200
          bg-rose-50
          p-6
        "
      >
        <h1
          className="
            font-semibold
            text-slate-900
          "
        >
          Unable to load consultation
        </h1>

        <p
          className="
            text-sm
            text-rose-700
          "
        >
          {getApiErrorMessage(
            error,
            "Unable to load this clinical encounter."
          )}
        </p>

        <Link
          to="/appointments"
          className="
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
          <ArrowLeft
            className="h-4 w-4"
          />

          Back to Appointments
        </Link>
      </div>
    );
  }


  // ======================================================
  // SAFETY
  // ======================================================

  if (!encounter) {
    return null;
  }


  // ======================================================
  // DERIVED DATA
  // ======================================================

  const completed =
    encounter.is_completed
    || Boolean(
      encounter.ended_at
    );


  const patient =
    encounter.patient;


  const appointment =
    encounter.appointment;


  const actionPending =
    saveMutation.isPending
    || completeMutation.isPending;


  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div
      className="
        space-y-6
        pb-8
      "
    >

      {/* =============================================== */}
      {/* BACK BUTTON                                     */}
      {/* =============================================== */}

      <Link
        to="/appointments"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-slate-600
          transition

          hover:text-blue-600
        "
      >
        <ArrowLeft
          className="h-4 w-4"
        />

        Back to Appointments
      </Link>


      {/* =============================================== */}
      {/* ENCOUNTER HEADER                                */}
      {/* =============================================== */}

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
            flex-col
            gap-4

            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >
          <div>
            <p
              className="
                text-sm
                font-medium
                text-blue-600
              "
            >
              Clinical Encounter
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
              Consultation
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
              Record consultation observations,
              Doctor-entered diagnoses and
              prescription information for this
              encounter.
            </p>
          </div>


          {/* STATUS */}

          <span
            className={`
              inline-flex
              w-fit
              rounded-full
              border
              px-3
              py-1.5
              text-xs
              font-semibold

              ${
                completed
                  ? `
                    border-emerald-200
                    bg-emerald-50
                    text-emerald-700
                  `
                  : `
                    border-blue-200
                    bg-blue-50
                    text-blue-700
                  `
              }
            `}
          >
            {completed
              ? "COMPLETED"
              : "IN PROGRESS"}
          </span>
        </div>


        {completed
          && encounter.ended_at && (
          <p
            className="
              mt-4
              text-xs
              text-slate-500
            "
          >
            Completed on{" "}
            {formatDateTime(
              encounter.ended_at
            )}
          </p>
        )}
      </section>


      {/* =============================================== */}
      {/* GLOBAL SUCCESS MESSAGE                          */}
      {/* =============================================== */}

      {successMessage && (
        <div
          role="status"
          className="
            rounded-xl
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
      {/* GLOBAL ERROR MESSAGE                            */}
      {/* =============================================== */}

      {actionError && (
        <div
          role="alert"
          className="
            rounded-xl
            border
            border-rose-200
            bg-rose-50
            p-4
            text-sm
            text-rose-700
          "
        >
          {actionError}
        </div>
      )}


      {/* =============================================== */}
      {/* PATIENT + APPOINTMENT                           */}
      {/* =============================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-4

          md:grid-cols-2
        "
      >

        {/* ============================================= */}
        {/* PATIENT CARD                                  */}
        {/* ============================================= */}

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
              items-center
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
              <UserRound
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
                Patient
              </h2>

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Encounter participant
              </p>
            </div>
          </div>


          <div
            className="mt-5"
          >
            <p
              className="
                font-semibold
                text-slate-900
              "
            >
              {
                patient?.first_name
                || "Patient"
              }{" "}
              {
                patient?.last_name
                || ""
              }
            </p>

            {patient?.patient_code && (
              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                {
                  patient.patient_code
                }
              </p>
            )}
          </div>
        </article>


        {/* ============================================= */}
        {/* APPOINTMENT CARD                              */}
        {/* ============================================= */}

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
              items-center
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
              <CalendarClock
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
                Appointment
              </h2>

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Consultation schedule
              </p>
            </div>
          </div>


          <div
            className="mt-5"
          >
            <p
              className="
                text-sm
                font-semibold
                text-slate-900
              "
            >
              {formatDateTime(
                appointment?.start_at
              )}
            </p>


            {/* TYPES */}

            <div
              className="
                mt-3
                flex
                flex-wrap
                gap-2
              "
            >
              {appointment?.appointment_type && (
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
                  {formatAppointmentType(
                    appointment
                      .appointment_type
                  )}
                </span>
              )}

              {encounter?.encounter_type && (
                <span
                  className="
                    rounded-full
                    border
                    border-blue-200
                    bg-blue-50
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    text-blue-700
                  "
                >
                  {formatAppointmentType(
                    encounter
                      .encounter_type
                  )}
                </span>
              )}
            </div>


            {/* BOOKING REASON */}

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
                  Booking Reason
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
                    appointment.reason
                  }
                </p>
              </div>
            )}
          </div>
        </article>
      </section>


      {/* =============================================== */}
      {/* CONSULTATION NOTES                              */}
      {/* =============================================== */}

      <form
        onSubmit={
          handleSave
        }
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
              Consultation Notes
            </h2>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-slate-500
              "
            >
              Record clinical observations and
              consultation information for this
              encounter.
            </p>
          </div>
        </div>


        <div
          className="
            mt-6
            space-y-5
          "
        >

          {/* =========================================== */}
          {/* CHIEF COMPLAINT                             */}
          {/* =========================================== */}

          <div>
            <label
              htmlFor="chief_complaint"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Chief Complaint
            </label>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Main reason for the consultation.
            </p>

            <textarea
              id="chief_complaint"
              name="chief_complaint"
              rows={3}
              maxLength={3000}
              value={
                form.chief_complaint
              }
              onChange={
                handleChange
              }
              disabled={
                completed
                || actionPending
              }
              placeholder="Enter chief complaint"
              className="
                mt-2
                w-full
                resize-y
                rounded-lg
                border
                border-slate-200
                bg-white
                p-3
                text-sm
                text-slate-900

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2

                disabled:cursor-not-allowed
                disabled:bg-slate-50
                disabled:text-slate-500
              "
            />
          </div>


          {/* =========================================== */}
          {/* SUBJECTIVE NOTES                            */}
          {/* =========================================== */}

          <div>
            <label
              htmlFor="subjective_notes"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Subjective Notes
            </label>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Patient-reported symptoms,
              concerns and relevant history.
            </p>

            <textarea
              id="subjective_notes"
              name="subjective_notes"
              rows={5}
              maxLength={10000}
              value={
                form.subjective_notes
              }
              onChange={
                handleChange
              }
              disabled={
                completed
                || actionPending
              }
              placeholder="Enter patient-reported information"
              className="
                mt-2
                w-full
                resize-y
                rounded-lg
                border
                border-slate-200
                bg-white
                p-3
                text-sm
                text-slate-900

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2

                disabled:cursor-not-allowed
                disabled:bg-slate-50
                disabled:text-slate-500
              "
            />
          </div>


          {/* =========================================== */}
          {/* OBJECTIVE NOTES                             */}
          {/* =========================================== */}

          <div>
            <label
              htmlFor="objective_notes"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Objective Notes
            </label>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Clinical observations,
              examination information and
              measurable findings.
            </p>

            <textarea
              id="objective_notes"
              name="objective_notes"
              rows={5}
              maxLength={10000}
              value={
                form.objective_notes
              }
              onChange={
                handleChange
              }
              disabled={
                completed
                || actionPending
              }
              placeholder="Enter clinical observations"
              className="
                mt-2
                w-full
                resize-y
                rounded-lg
                border
                border-slate-200
                bg-white
                p-3
                text-sm
                text-slate-900

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2

                disabled:cursor-not-allowed
                disabled:bg-slate-50
                disabled:text-slate-500
              "
            />
          </div>


          {/* =========================================== */}
          {/* ASSESSMENT NOTES                            */}
          {/* =========================================== */}

          <div>
            <label
              htmlFor="assessment_notes"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Assessment Notes
            </label>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Doctor's clinical assessment and
              reasoning for this encounter.
            </p>

            <textarea
              id="assessment_notes"
              name="assessment_notes"
              rows={5}
              maxLength={10000}
              value={
                form.assessment_notes
              }
              onChange={
                handleChange
              }
              disabled={
                completed
                || actionPending
              }
              placeholder="Enter clinical assessment"
              className="
                mt-2
                w-full
                resize-y
                rounded-lg
                border
                border-slate-200
                bg-white
                p-3
                text-sm
                text-slate-900

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2

                disabled:cursor-not-allowed
                disabled:bg-slate-50
                disabled:text-slate-500
              "
            />
          </div>


          {/* =========================================== */}
          {/* PLAN NOTES                                  */}
          {/* =========================================== */}

          <div>
            <label
              htmlFor="plan_notes"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Plan Notes
            </label>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Follow-up, investigations,
              monitoring or management plan.
            </p>

            <textarea
              id="plan_notes"
              name="plan_notes"
              rows={5}
              maxLength={10000}
              value={
                form.plan_notes
              }
              onChange={
                handleChange
              }
              disabled={
                completed
                || actionPending
              }
              placeholder="Enter consultation plan"
              className="
                mt-2
                w-full
                resize-y
                rounded-lg
                border
                border-slate-200
                bg-white
                p-3
                text-sm
                text-slate-900

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2

                disabled:cursor-not-allowed
                disabled:bg-slate-50
                disabled:text-slate-500
              "
            />
          </div>
        </div>


        {/* ============================================= */}
        {/* SAVE NOTES BUTTON                             */}
        {/* ============================================= */}

        {!completed && (
          <div
            className="
              mt-6
              flex
              justify-end
              border-t
              border-slate-100
              pt-5
            "
          >
            <button
              type="submit"
              disabled={
                actionPending
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
                transition

                hover:bg-slate-50

                active:scale-[0.98]

                disabled:pointer-events-none
                disabled:opacity-60
              "
            >
              <Save
                className="h-4 w-4"
              />

              {saveMutation.isPending
                ? "Saving..."
                : "Save Notes"}
            </button>
          </div>
        )}
      </form>


      {/* =============================================== */}
      {/* DIAGNOSES — PHASE 24                            */}
      {/* =============================================== */}

      <EncounterDiagnosisSection
        encounterId={
          encounterId
        }
        completed={
          completed
        }
      />


      {/* =============================================== */}
      {/* PRESCRIPTION — PHASE 25                         */}
      {/* =============================================== */}

      <EncounterPrescriptionSection
        encounterId={
          encounterId
        }
        completed={
          completed
        }
      />


      {/* =============================================== */}
      {/* COMPLETE CONSULTATION                           */}
      {/* =============================================== */}

      {!completed && (
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
              flex-col
              gap-5

              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div>
              <h2
                className="
                  font-semibold
                  text-slate-900
                "
              >
                Complete Consultation
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
                Review the consultation notes,
                diagnoses and prescription before
                completing this encounter.
                A prescription is optional.
              </p>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                After completion, the clinical
                encounter becomes read-only and
                the associated appointment is
                marked as completed.
              </p>
            </div>


            <button
              type="button"
              disabled={
                actionPending
              }
              onClick={
                handleComplete
              }
              className="
                inline-flex
                min-h-[44px]
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-blue-600
                px-5
                text-sm
                font-semibold
                text-white
                transition

                hover:bg-blue-700

                active:scale-[0.98]

                disabled:pointer-events-none
                disabled:opacity-60
              "
            >
              <CheckCircle2
                className="h-4 w-4"
              />

              {completeMutation.isPending
                ? "Completing..."
                : "Complete Consultation"}
            </button>
          </div>
        </section>
      )}


      {/* =============================================== */}
      {/* COMPLETED ENCOUNTER MESSAGE                     */}
      {/* =============================================== */}

      {completed && (
        <section
          className="
            rounded-xl
            border
            border-emerald-200
            bg-emerald-50
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
            <CheckCircle2
              className="
                mt-0.5
                h-5
                w-5
                shrink-0
                text-emerald-600
              "
            />

            <div>
              <h2
                className="
                  font-semibold
                  text-slate-900
                "
              >
                Consultation Completed
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                This clinical encounter is now
                read-only. The consultation notes,
                Doctor-entered diagnoses and
                prescription remain part of the
                patient's clinical record.
              </p>

              {encounter.ended_at && (
                <p
                  className="
                    mt-2
                    text-xs
                    text-slate-500
                  "
                >
                  Completed on{" "}
                  {formatDateTime(
                    encounter.ended_at
                  )}
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}