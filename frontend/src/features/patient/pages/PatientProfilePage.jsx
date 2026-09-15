import {
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  CircleCheck,
} from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";

import {
  createMyPatientProfile,
  getMyPatientProfile,
  updateMyPatientProfile,
} from "@/features/patient/api/patientApi";

import PatientProfileForm from "@/features/patient/components/PatientProfileForm";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


function buildPayload(data) {
  const clean = (value) => {
    const trimmed =
      value?.trim?.();

    return trimmed
      ? trimmed
      : null;
  };


  const address = {
    address_line1:
      clean(data.address_line1),

    address_line2:
      clean(data.address_line2),

    city:
      clean(data.city),

    district:
      clean(data.district),

    state:
      clean(data.state),

    postal_code:
      clean(data.postal_code),

    country:
      clean(data.country),
  };


  const hasAddress =
    Object.values(
      address
    ).some(Boolean);


  return {
    first_name:
      data.first_name.trim(),

    last_name:
      data.last_name.trim(),

    date_of_birth:
      data.date_of_birth,

    gender:
      clean(data.gender),

    blood_group:
      clean(data.blood_group),

    height_cm:
      data.height_cm ??
      null,

    emergency_notes:
      clean(
        data.emergency_notes
      ),

    address:
      hasAddress
        ? address
        : undefined,
  };
}


export default function PatientProfilePage() {
  const {
    user,
  } = useAuth();

  const queryClient =
    useQueryClient();

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "patient-profile",
    ],

    queryFn:
      getMyPatientProfile,
  });


  const saveMutation =
    useMutation({
      mutationFn:
        async (payload) => {
          if (profile) {
            return updateMyPatientProfile(
              payload
            );
          }

          return createMyPatientProfile(
            payload
          );
        },

      onSuccess:
        async () => {
          await queryClient.invalidateQueries({
            queryKey: [
              "patient-profile",
            ],
          });

          setErrorMessage("");

          setMessage(
            profile
              ? "Profile updated successfully."
              : "Patient profile created successfully."
          );
        },

      onError:
        (mutationError) => {
          setMessage("");

          setErrorMessage(
            getApiErrorMessage(
              mutationError,
              "Unable to save patient profile."
            )
          );
        },
    });


  async function handleSubmit(
    data
  ) {
    setMessage("");
    setErrorMessage("");

    const payload =
      buildPayload(data);

    await saveMutation.mutateAsync(
      payload
    );
  }


  if (isLoading) {
    return (
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
        <p
          className="
            text-sm
            text-slate-500
          "
        >
          Loading patient profile...
        </p>
      </div>
    );
  }


  if (isError) {
    return (
      <div
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
          "Unable to load patient profile."
        )}
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <PageHeader
        title={
          profile
            ? "My Profile"
            : "Complete Your Profile"
        }
        description={
          profile
            ? "Review and maintain your personal healthcare information."
            : "Complete your patient information before using healthcare features."
        }
        action={
          profile ? (
            <StatusBadge
              variant="success"
            >
              Profile active
            </StatusBadge>
          ) : (
            <StatusBadge
              variant="warning"
            >
              Profile incomplete
            </StatusBadge>
          )
        }
      />


      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
        "
      >
        <p
          className="
            text-xs
            font-medium
            uppercase
            tracking-wide
            text-slate-500
          "
        >
          Account
        </p>

        <div
          className="
            mt-2
            flex
            flex-col
            gap-1
            sm:flex-row
            sm:items-center
            sm:gap-3
          "
        >
          <p
            className="
              text-sm
              font-semibold
              text-slate-900
            "
          >
            {user.email}
          </p>

          {profile && (
            <span
              className="
                text-xs
                text-slate-500
              "
            >
              Patient ID:{" "}
              {profile.patient_code}
            </span>
          )}
        </div>
      </div>


      {message && (
        <div
          role="status"
          className="
            flex
            items-start
            gap-3
            rounded-lg
            border
            border-emerald-200
            bg-emerald-50
            p-4
            text-sm
            text-emerald-700
          "
        >
          <CircleCheck
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
            "
          />

          {message}
        </div>
      )}


      {errorMessage && (
        <div
          role="alert"
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
          {errorMessage}
        </div>
      )}


      <PatientProfileForm
        profile={profile}
        onSubmit={
          handleSubmit
        }
        submitting={
          saveMutation.isPending
        }
      />
    </div>
  );
}