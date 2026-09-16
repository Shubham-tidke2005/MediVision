import {
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useNavigate,
} from "react-router-dom";

import PageHeader from "@/components/common/PageHeader";

import AppointmentCard from "@/features/appointments/components/AppointmentCard";

import {
  approveAppointment,
  cancelAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  markAppointmentNoShow,
  rejectAppointment,
} from "@/features/appointments/api/appointmentApi";

import {
  startEncounter,
} from "@/features/encounters/api/encounterApi";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  ROLES,
} from "@/constants/roles";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


export default function AppointmentsPage() {
  const {
    user,
  } = useAuth();

  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const [
    actionError,
    setActionError,
  ] = useState("");


  // ======================================================
  // ROLE CHECKS
  // ======================================================

  const isPatient =
    user?.role
    === ROLES.PATIENT;

  const isDoctor =
    user?.role
    === ROLES.DOCTOR;


  // ======================================================
  // QUERY KEY
  // ======================================================

  const queryKey =
    isPatient
      ? [
          "patient-appointments",
        ]
      : [
          "doctor-appointments",
        ];


  // ======================================================
  // LOAD APPOINTMENTS
  // ======================================================

  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,

    queryFn:
      isPatient
        ? getPatientAppointments
        : getDoctorAppointments,

    enabled:
      isPatient
      || isDoctor,
  });


  // ======================================================
  // REFRESH RELATED DATA
  // ======================================================

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey,
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "patient-dashboard",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "doctor-dashboard",
        ],
      }),

      queryClient.invalidateQueries({
        queryKey: [
          "doctor-available-slots",
        ],
      }),
    ]);
  }


  // ======================================================
  // APPROVE APPOINTMENT
  // ======================================================

  const approveMutation =
    useMutation({
      mutationFn:
        approveAppointment,

      onMutate: () => {
        setActionError("");
      },

      onSuccess:
        async () => {
          await refresh();
        },

      onError:
        (mutationError) => {
          setActionError(
            getApiErrorMessage(
              mutationError,
              "Unable to approve appointment."
            )
          );
        },
    });


  // ======================================================
  // REJECT APPOINTMENT
  // ======================================================

  const rejectMutation =
    useMutation({
      mutationFn:
        ({
          id,
          reason,
        }) =>
          rejectAppointment(
            id,
            reason
          ),

      onMutate: () => {
        setActionError("");
      },

      onSuccess:
        async () => {
          await refresh();
        },

      onError:
        (mutationError) => {
          setActionError(
            getApiErrorMessage(
              mutationError,
              "Unable to reject appointment."
            )
          );
        },
    });


  // ======================================================
  // CANCEL APPOINTMENT
  // ======================================================

  const cancelMutation =
    useMutation({
      mutationFn:
        ({
          id,
          reason,
        }) =>
          cancelAppointment(
            id,
            reason
          ),

      onMutate: () => {
        setActionError("");
      },

      onSuccess:
        async () => {
          await refresh();
        },

      onError:
        (mutationError) => {
          setActionError(
            getApiErrorMessage(
              mutationError,
              "Unable to cancel appointment."
            )
          );
        },
    });


  // ======================================================
  // NO SHOW
  // ======================================================

  const noShowMutation =
    useMutation({
      mutationFn:
        markAppointmentNoShow,

      onMutate: () => {
        setActionError("");
      },

      onSuccess:
        async () => {
          await refresh();
        },

      onError:
        (mutationError) => {
          setActionError(
            getApiErrorMessage(
              mutationError,
              "Unable to mark appointment as no-show."
            )
          );
        },
    });


  // ======================================================
  // START CONSULTATION / ENCOUNTER
  // IMPORTANT: THIS HOOK MUST STAY INSIDE THE COMPONENT
  // ======================================================

  const startEncounterMutation =
    useMutation({
      mutationFn:
        ({
          appointmentId,
          chiefComplaint,
        }) =>
          startEncounter(
            appointmentId,
            {
              chief_complaint:
                chiefComplaint
                || null,
            }
          ),

      onMutate: () => {
        setActionError("");
      },

      onSuccess:
        (encounter) => {
          navigate(
            `/doctor/encounters/${encounter.id}`
          );
        },

      onError:
        (mutationError) => {
          setActionError(
            getApiErrorMessage(
              mutationError,
              "Unable to start consultation."
            )
          );
        },
    });


  // ======================================================
  // GLOBAL ACTION PENDING STATE
  // ======================================================

  const pending =
    approveMutation.isPending
    || rejectMutation.isPending
    || cancelMutation.isPending
    || noShowMutation.isPending
    || startEncounterMutation.isPending;


  // ======================================================
  // ROLE SAFETY
  // ======================================================

  if (
    !isPatient
    && !isDoctor
  ) {
    return (
      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >
        <h1
          className="
            font-semibold
            text-slate-900
          "
        >
          Appointments unavailable
        </h1>

        <p
          className="
            mt-2
            text-sm
            text-slate-500
          "
        >
          Appointment management is currently
          available only for Patient and Doctor
          accounts.
        </p>
      </div>
    );
  }


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
      {/* HEADER                                          */}
      {/* =============================================== */}

      <PageHeader
        title="Appointments"
        description={
          isPatient
            ? "Review and manage your healthcare appointments."
            : "Review appointment requests, scheduled consultations and patient visits."
        }
      />


      {/* =============================================== */}
      {/* ACTION ERROR                                    */}
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
      {/* LOADING                                         */}
      {/* =============================================== */}

      {isLoading && (
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
            Loading appointments...
          </p>
        </div>
      )}


      {/* =============================================== */}
      {/* QUERY ERROR                                     */}
      {/* =============================================== */}

      {isError && (
        <div
          role="alert"
          className="
            rounded-xl
            border
            border-rose-200
            bg-rose-50
            p-5
            text-sm
            text-rose-700
          "
        >
          {getApiErrorMessage(
            error,
            "Unable to load appointments."
          )}
        </div>
      )}


      {/* =============================================== */}
      {/* EMPTY STATE                                     */}
      {/* =============================================== */}

      {!isLoading
        && !isError
        && appointments.length
        === 0 && (
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
          <h2
            className="
              font-semibold
              text-slate-900
            "
          >
            No appointments yet
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            {isPatient
              ? "Find a verified doctor and choose an available appointment slot."
              : "Patient appointment requests will appear here."}
          </p>
        </div>
      )}


      {/* =============================================== */}
      {/* APPOINTMENT LIST                                */}
      {/* =============================================== */}

      {!isLoading
        && !isError
        && appointments.length
        > 0 && (
        <div
          className="
            space-y-4
          "
        >
          {appointments.map(
            (
              appointment
            ) => (
              <AppointmentCard
                key={
                  appointment.id
                }

                appointment={
                  appointment
                }

                role={
                  user.role
                }

                pending={
                  pending
                }


                // ======================================
                // DOCTOR: APPROVE
                // ======================================

                onApprove={(
                  item
                ) => {
                  approveMutation.mutate(
                    item.id
                  );
                }}


                // ======================================
                // DOCTOR: REJECT
                // ======================================

                onReject={(
                  item
                ) => {
                  const reason =
                    window.prompt(
                      "Reason for rejection (optional):"
                    );

                  // User pressed Cancel
                  if (
                    reason === null
                  ) {
                    return;
                  }

                  rejectMutation.mutate({
                    id:
                      item.id,

                    reason:
                      reason.trim()
                      || null,
                  });
                }}


                // ======================================
                // PATIENT: CANCEL
                // ======================================

                onCancel={(
                  item
                ) => {
                  const reason =
                    window.prompt(
                      "Reason for cancellation (optional):"
                    );

                  // User pressed Cancel
                  if (
                    reason === null
                  ) {
                    return;
                  }

                  cancelMutation.mutate({
                    id:
                      item.id,

                    reason:
                      reason.trim()
                      || null,
                  });
                }}


                // ======================================
                // DOCTOR: START CONSULTATION
                // ======================================

                onStartConsultation={(
                  item
                ) => {
                  startEncounterMutation.mutate({
                    appointmentId:
                      item.id,

                    chiefComplaint:
                      item.reason
                      || null,
                  });
                }}


                // ======================================
                // DOCTOR: NO SHOW
                // ======================================

                onNoShow={(
                  item
                ) => {
                  const confirmed =
                    window.confirm(
                      "Mark this patient as no-show?"
                    );

                  if (
                    !confirmed
                  ) {
                    return;
                  }

                  noShowMutation.mutate(
                    item.id
                  );
                }}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}