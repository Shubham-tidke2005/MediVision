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
  createMyDoctorProfile,
  getDoctorSpecialties,
  getMyDoctorProfile,
  updateMyDoctorProfile,
} from "@/features/doctor/api/doctorApi";

import DoctorProfileForm from "@/features/doctor/components/DoctorProfileForm";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


function clean(
  value
) {
  if (
    typeof value !==
    "string"
  ) {
    return value;
  }

  const trimmed =
    value.trim();

  return trimmed
    ? trimmed
    : null;
}


function buildPayload(
  data,
  profile
) {
  const address = {
    address_line1:
      clean(
        data.address_line1
      ),

    address_line2:
      clean(
        data.address_line2
      ),

    city:
      clean(data.city),

    district:
      clean(
        data.district
      ),

    state:
      clean(data.state),

    postal_code:
      clean(
        data.postal_code
      ),

    country:
      clean(data.country),
  };


  const hasAddress =
    Object.values(
      address
    ).some(Boolean);


  const specialties =
    data.specialty_ids.map(
      (id) => ({
        specialty_id:
          Number(id),

        is_primary:
          String(id) ===
          String(
            data.primary_specialty_id
          ),
      })
    );


  const payload = {
    first_name:
      data.first_name.trim(),

    last_name:
      data.last_name.trim(),

    registration_number:
      data.registration_number
        .trim()
        .toUpperCase(),

    qualification:
      data.qualification.trim(),

    experience_years:
      data.experience_years,

    default_consultation_fee:
      data.default_consultation_fee
      ?? null,

    bio:
      clean(data.bio),

    specialties,

    address:
      hasAddress
        ? address
        : undefined,
  };


  if (profile) {
    payload.is_accepting_patients =
      Boolean(
        data.is_accepting_patients
      );
  }


  return payload;
}


function getVerificationVariant(
  status
) {
  if (status === "VERIFIED") {
    return "success";
  }

  if (status === "PENDING") {
    return "warning";
  }

  return "neutral";
}


export default function DoctorProfilePage() {
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
    isLoading:
      profileLoading,

    isError:
      profileError,

    error:
      profileQueryError,
  } = useQuery({
    queryKey: [
      "doctor-profile",
    ],

    queryFn:
      getMyDoctorProfile,
  });


  const {
    data: specialties = [],
    isLoading:
      specialtiesLoading,

    isError:
      specialtiesError,
  } = useQuery({
    queryKey: [
      "doctor-specialties",
    ],

    queryFn:
      getDoctorSpecialties,
  });


  const saveMutation =
    useMutation({
      mutationFn:
        async (payload) => {
          if (profile) {
            return (
              updateMyDoctorProfile(
                payload
              )
            );
          }

          return (
            createMyDoctorProfile(
              payload
            )
          );
        },

      onSuccess:
        async () => {
          await queryClient
            .invalidateQueries({
              queryKey: [
                "doctor-profile",
              ],
            });

          setErrorMessage("");

          setMessage(
            profile
              ? "Doctor profile updated successfully."
              : "Doctor profile created successfully and submitted for verification."
          );
        },

      onError:
        (error) => {
          setMessage("");

          setErrorMessage(
            getApiErrorMessage(
              error,
              "Unable to save doctor profile."
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
      buildPayload(
        data,
        profile
      );

    await saveMutation.mutateAsync(
      payload
    );
  }


  if (
    profileLoading ||
    specialtiesLoading
  ) {
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
          Loading doctor profile...
        </p>
      </div>
    );
  }


  if (
    profileError ||
    specialtiesError
  ) {
    return (
      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-5
          text-sm
          text-slate-700
          shadow-sm
        "
      >
        {profileError
          ? getApiErrorMessage(
              profileQueryError,
              "Unable to load doctor profile."
            )
          : "Unable to load specialties."}
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <PageHeader
        title={
          profile
            ? "Doctor Profile"
            : "Complete Doctor Profile"
        }
        description={
          profile
            ? "Manage your professional information, specialties and practice details."
            : "Complete your professional profile before clinical features become available."
        }
        action={
          profile ? (
            <StatusBadge
              variant={
                getVerificationVariant(
                  profile.verification_status
                )
              }
            >
              {
                profile.verification_status
              }
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
          Doctor account
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
              Doctor ID:{" "}
              {
                profile.doctor_code
              }
            </span>
          )}
        </div>
      </div>


      {profile?.verification_status
        === "PENDING" && (
        <div
          className="
            rounded-lg
            border
            border-amber-200
            bg-amber-50
            p-4
            text-sm
            leading-6
            text-amber-700
          "
        >
          Your professional profile is
          awaiting verification. Clinical
          actions that require a verified
          Doctor account remain unavailable
          until review is complete.
        </div>
      )}


      {profile?.verification_status
        === "VERIFIED" && (
        <div
          className="
            rounded-lg
            border
            border-emerald-200
            bg-emerald-50
            p-4
            text-sm
            leading-6
            text-emerald-700
          "
        >
          Your professional profile is
          verified.
        </div>
      )}


      {profile?.verification_status
        === "REJECTED" && (
        <div
          className="
            rounded-lg
            border
            border-slate-200
            bg-slate-100
            p-4
            text-sm
            leading-6
            text-slate-700
          "
        >
          Your professional verification
          was not approved. Review your
          professional information before
          resubmission.
        </div>
      )}


      {profile?.verification_status
        === "SUSPENDED" && (
        <div
          className="
            rounded-lg
            border
            border-amber-200
            bg-amber-50
            p-4
            text-sm
            leading-6
            text-amber-700
          "
        >
          This Doctor profile is currently
          suspended and cannot perform
          verified clinical actions.
        </div>
      )}


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
            border-slate-200
            bg-slate-100
            p-4
            text-sm
            text-slate-700
          "
        >
          {errorMessage}
        </div>
      )}


      <DoctorProfileForm
        profile={profile}
        specialties={
          specialties
        }
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