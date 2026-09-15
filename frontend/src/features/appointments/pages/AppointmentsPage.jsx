import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import PageHeader from "@/components/common/PageHeader";

import AppointmentCard from "@/features/appointments/components/AppointmentCard";

import {
  approveAppointment,
  cancelAppointment,
  completeAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  markAppointmentNoShow,
  rejectAppointment,
} from "@/features/appointments/api/appointmentApi";

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

  const queryClient =
    useQueryClient();


  const isPatient =
    user.role
    === ROLES.PATIENT;

  const isDoctor =
    user.role
    === ROLES.DOCTOR;


  const queryKey =
    isPatient
      ? [
          "patient-appointments",
        ]
      : [
          "doctor-appointments",
        ];


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


  async function refresh() {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey,
    }),

    queryClient.invalidateQueries({
      queryKey: [
        "doctor-dashboard",
      ],
    }),
  ]);
}


  const approveMutation =
    useMutation({
      mutationFn:
        approveAppointment,

      onSuccess:
        refresh,
    });


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

      onSuccess:
        refresh,
    });


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

      onSuccess:
        async () => {
          await refresh();

          await queryClient
            .invalidateQueries({
              queryKey: [
                "doctor-available-slots",
              ],
            });
        },
    });


  const completeMutation =
    useMutation({
      mutationFn:
        completeAppointment,

      onSuccess:
        refresh,
    });


  const noShowMutation =
    useMutation({
      mutationFn:
        markAppointmentNoShow,

      onSuccess:
        refresh,
    });


  const pending =
    approveMutation.isPending
    || rejectMutation.isPending
    || cancelMutation.isPending
    || completeMutation.isPending
    || noShowMutation.isPending;


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
        <p
          className="
            text-sm
            text-slate-500
          "
        >
          Appointment management for
          this account type is not
          available in this phase.
        </p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description={
          isPatient
            ? "Review and manage your healthcare appointments."
            : "Review patient appointment requests and scheduled consultations."
        }
      />


      {isLoading && (
        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-8
            text-center
            shadow-sm
          "
        >
          <p className="text-sm text-slate-500">
            Loading appointments...
          </p>
        </div>
      )}


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
            p-8
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


      <div className="space-y-4">
        {appointments.map(
          (appointment) => (
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
              onApprove={(
                item
              ) =>
                approveMutation.mutate(
                  item.id
                )
              }
              onReject={(
                item
              ) => {
                const reason =
                  window.prompt(
                    "Reason for rejection (optional):"
                  );

                rejectMutation.mutate({
                  id:
                    item.id,

                  reason:
                    reason
                    || null,
                });
              }}
              onCancel={(
                item
              ) => {
                const reason =
                  window.prompt(
                    "Reason for cancellation (optional):"
                  );

                cancelMutation.mutate({
                  id:
                    item.id,

                  reason:
                    reason
                    || null,
                });
              }}
              onComplete={(
                item
              ) =>
                completeMutation.mutate(
                  item.id
                )
              }
              onNoShow={(
                item
              ) =>
                noShowMutation.mutate(
                  item.id
                )
              }
            />
          )
        )}
      </div>
    </div>
  );
}