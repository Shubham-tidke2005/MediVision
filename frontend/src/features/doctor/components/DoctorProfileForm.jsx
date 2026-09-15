import {
  useEffect,
} from "react";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  BadgeCheck,
  GraduationCap,
  MapPin,
  Save,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  useForm,
} from "react-hook-form";

import {
  doctorProfileSchema,
} from "@/features/doctor/schemas/doctorSchema";


const inputClassName = `
  mt-2
  min-h-[44px]
  w-full
  rounded-lg
  border
  border-slate-200
  bg-white
  px-3
  text-base
  text-slate-900

  placeholder:text-slate-400

  focus:outline-none
  focus:ring-2
  focus:ring-blue-600
  focus:ring-offset-2
`;


function FieldError({
  error,
}) {
  if (!error) {
    return null;
  }

  return (
    <p
      className="
        mt-1.5
        text-sm
        text-rose-700
      "
    >
      {error.message}
    </p>
  );
}


function getDefaultValues(
  profile
) {
  const selectedSpecialties =
    profile?.specialties?.map(
      (item) =>
        String(item.id)
    ) ?? [];

  const primarySpecialty =
    profile?.specialties?.find(
      (item) =>
        item.is_primary
    );

  return {
    first_name:
      profile?.first_name ?? "",

    last_name:
      profile?.last_name ?? "",

    registration_number:
      profile?.registration_number ??
      "",

    qualification:
      profile?.qualification ?? "",

    experience_years:
      profile?.experience_years ??
      "",

    default_consultation_fee:
      profile?.default_consultation_fee ??
      "",

    bio:
      profile?.bio ?? "",

    specialty_ids:
      selectedSpecialties,

    primary_specialty_id:
      primarySpecialty
        ? String(
            primarySpecialty.id
          )
        : "",

    is_accepting_patients:
      profile
        ?.is_accepting_patients ??
      false,

    address_line1:
      profile?.address
        ?.address_line1 ?? "",

    address_line2:
      profile?.address
        ?.address_line2 ?? "",

    city:
      profile?.address
        ?.city ?? "",

    district:
      profile?.address
        ?.district ?? "",

    state:
      profile?.address
        ?.state ?? "",

    postal_code:
      profile?.address
        ?.postal_code ?? "",

    country:
      profile?.address
        ?.country ?? "India",
  };
}


export default function DoctorProfileForm({
  profile,
  specialties,
  onSubmit,
  submitting,
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: {
      errors,
    },
  } = useForm({
    resolver:
      zodResolver(
        doctorProfileSchema
      ),

    defaultValues:
      getDefaultValues(
        profile
      ),
  });


  useEffect(() => {
    reset(
      getDefaultValues(
        profile
      )
    );
  }, [
    profile,
    reset,
  ]);


  const selectedSpecialties =
    watch(
      "specialty_ids"
    ) ?? [];


  const isVerified =
    profile?.verification_status
    === "VERIFIED";


  return (
    <form
      onSubmit={
        handleSubmit(
          onSubmit
        )
      }
      className="space-y-6"
      noValidate
    >
      {/* Personal */}

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
              Personal information
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Basic information shown
              in your professional
              profile.
            </p>
          </div>
        </div>


        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          "
        >
          <div>
            <label
              htmlFor="doctor-first-name"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              First name
            </label>

            <input
              id="doctor-first-name"
              {...register(
                "first_name"
              )}
              className={
                inputClassName
              }
            />

            <FieldError
              error={
                errors.first_name
              }
            />
          </div>


          <div>
            <label
              htmlFor="doctor-last-name"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Last name
            </label>

            <input
              id="doctor-last-name"
              {...register(
                "last_name"
              )}
              className={
                inputClassName
              }
            />

            <FieldError
              error={
                errors.last_name
              }
            />
          </div>
        </div>
      </section>


      {/* Professional */}

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
              items-center
              justify-center
              rounded-lg
              bg-sky-50
              text-sky-600
            "
          >
            <GraduationCap
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
              Professional details
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Information used during
              professional verification.
            </p>
          </div>
        </div>


        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          "
        >
          <div>
            <label
              htmlFor="registration-number"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Registration number
            </label>

            <input
              id="registration-number"
              {...register(
                "registration_number"
              )}
              className={
                inputClassName
              }
            />

            <FieldError
              error={
                errors
                  .registration_number
              }
            />
          </div>


          <div>
            <label
              htmlFor="qualification"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Qualification
            </label>

            <input
              id="qualification"
              {...register(
                "qualification"
              )}
              placeholder="e.g. MBBS, MD"
              className={
                inputClassName
              }
            />

            <FieldError
              error={
                errors.qualification
              }
            />
          </div>


          <div>
            <label
              htmlFor="experience-years"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Experience
              <span
                className="
                  ml-1
                  font-normal
                  text-slate-500
                "
              >
                (years)
              </span>
            </label>

            <input
              id="experience-years"
              type="number"
              min="0"
              max="80"
              {...register(
                "experience_years"
              )}
              className={
                inputClassName
              }
            />

            <FieldError
              error={
                errors
                  .experience_years
              }
            />
          </div>


          <div>
            <label
              htmlFor="consultation-fee"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Default consultation fee
            </label>

            <input
              id="consultation-fee"
              type="number"
              min="0"
              step="0.01"
              {...register(
                "default_consultation_fee"
              )}
              className={
                inputClassName
              }
            />

            <FieldError
              error={
                errors
                  .default_consultation_fee
              }
            />
          </div>


          <div className="md:col-span-2">
            <label
              htmlFor="doctor-bio"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Professional bio
            </label>

            <textarea
              id="doctor-bio"
              rows="4"
              {...register("bio")}
              className="
                mt-2
                w-full
                rounded-lg
                border
                border-slate-200
                bg-white
                p-3
                text-base
                text-slate-900

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2
              "
              placeholder="Brief professional description..."
            />
          </div>
        </div>
      </section>


      {/* Specialties */}

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
              Specialties
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Select one or more
              specialties and choose
              one primary specialty.
            </p>
          </div>
        </div>


        <div
          className="
            mt-6
            space-y-3
          "
        >
          {specialties.map(
            (specialty) => {
              const id =
                String(
                  specialty.id
                );

              const selected =
                selectedSpecialties
                  .includes(id);

              return (
                <div
                  key={
                    specialty.id
                  }
                  className="
                    flex
                    flex-col
                    gap-3
                    rounded-lg
                    border
                    border-slate-200
                    p-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <label
                    className="
                      flex
                      min-h-[44px]
                      cursor-pointer
                      items-center
                      gap-3
                    "
                  >
                    <input
                      type="checkbox"
                      value={id}
                      {...register(
                        "specialty_ids"
                      )}
                      className="
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
                        {
                          specialty.name
                        }
                      </p>

                      {specialty.description && (
                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-500
                          "
                        >
                          {
                            specialty.description
                          }
                        </p>
                      )}
                    </div>
                  </label>


                  <label
                    className={`
                      flex
                      min-h-[44px]
                      items-center
                      gap-2
                      text-sm
                      font-medium

                      ${
                        selected
                          ? "text-slate-700"
                          : "text-slate-400"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      value={id}
                      disabled={
                        !selected
                      }
                      {...register(
                        "primary_specialty_id"
                      )}
                      className="
                        h-4
                        w-4
                        accent-blue-600
                      "
                    />

                    Primary
                  </label>
                </div>
              );
            }
          )}
        </div>


        <FieldError
          error={
            errors.specialty_ids
          }
        />

        <FieldError
          error={
            errors
              .primary_specialty_id
          }
        />
      </section>


      {/* Address */}

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
              items-center
              justify-center
              rounded-lg
              bg-sky-50
              text-sky-600
            "
          >
            <MapPin
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
              Address
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Professional contact
              location information.
            </p>
          </div>
        </div>


        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          "
        >
          <div className="md:col-span-2">
            <label
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Address line 1
            </label>

            <input
              {...register(
                "address_line1"
              )}
              className={
                inputClassName
              }
            />
          </div>


          <div className="md:col-span-2">
            <label
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Address line 2
            </label>

            <input
              {...register(
                "address_line2"
              )}
              className={
                inputClassName
              }
            />
          </div>


          <div>
            <label className="text-sm font-semibold text-slate-700">
              City
            </label>

            <input
              {...register("city")}
              className={
                inputClassName
              }
            />
          </div>


          <div>
            <label className="text-sm font-semibold text-slate-700">
              District
            </label>

            <input
              {...register(
                "district"
              )}
              className={
                inputClassName
              }
            />
          </div>


          <div>
            <label className="text-sm font-semibold text-slate-700">
              State
            </label>

            <input
              {...register("state")}
              className={
                inputClassName
              }
            />
          </div>


          <div>
            <label className="text-sm font-semibold text-slate-700">
              Postal code
            </label>

            <input
              {...register(
                "postal_code"
              )}
              className={
                inputClassName
              }
            />
          </div>


          <div>
            <label className="text-sm font-semibold text-slate-700">
              Country
            </label>

            <input
              {...register(
                "country"
              )}
              className={
                inputClassName
              }
            />
          </div>
        </div>
      </section>


      {/* Accepting patients */}

      {profile && (
        <section
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
            <BadgeCheck
              className="
                mt-1
                h-5
                w-5
                shrink-0
                text-sky-600
              "
            />

            <div className="flex-1">
              <label
                className="
                  flex
                  min-h-[44px]
                  items-center
                  gap-3
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                <input
                  type="checkbox"
                  disabled={!isVerified}
                  {...register(
                    "is_accepting_patients"
                  )}
                  className="
                    h-4
                    w-4
                    accent-blue-600
                  "
                />

                Accepting new patients
              </label>

              {!isVerified && (
                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  This option becomes
                  available after your
                  professional profile
                  is verified.
                </p>
              )}
            </div>
          </div>
        </section>
      )}


      <div
        className="
          sticky
          bottom-4
          flex
          justify-end
        "
      >
        <button
          type="submit"
          disabled={submitting}
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
            shadow-sm

            transition-all
            duration-200

            hover:bg-blue-700
            active:scale-[0.98]

            focus:outline-none
            focus:ring-2
            focus:ring-blue-600
            focus:ring-offset-2

            disabled:pointer-events-none
            disabled:opacity-60
          "
        >
          <Save className="h-4 w-4" />

          {submitting
            ? "Saving..."
            : profile
              ? "Save Changes"
              : "Complete Profile"}
        </button>
      </div>
    </form>
  );
}