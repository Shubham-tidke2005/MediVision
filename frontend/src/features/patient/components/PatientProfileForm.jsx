import {
  useEffect,
} from "react";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useForm,
} from "react-hook-form";

import {
  HeartPulse,
  MapPin,
  Save,
  UserRound,
} from "lucide-react";

import {
  patientProfileSchema,
} from "@/features/patient/schemas/patientSchema";


const bloodGroups = [
  "",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];


const genders = [
  {
    value: "",
    label: "Prefer not to specify",
  },
  {
    value: "MALE",
    label: "Male",
  },
  {
    value: "FEMALE",
    label: "Female",
  },
  {
    value: "OTHER",
    label: "Other",
  },
  {
    value: "PREFER_NOT_TO_SAY",
    label: "Prefer not to say",
  },
];


function getDefaultValues(profile) {
  return {
    first_name:
      profile?.first_name ?? "",

    last_name:
      profile?.last_name ?? "",

    date_of_birth:
      profile?.date_of_birth ?? "",

    gender:
      profile?.gender ?? "",

    blood_group:
      profile?.blood_group ?? "",

    height_cm:
      profile?.height_cm ?? "",

    emergency_notes:
      profile?.emergency_notes ?? "",

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


export default function PatientProfileForm({
  profile,
  onSubmit,
  submitting,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } = useForm({
    resolver:
      zodResolver(
        patientProfileSchema
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
      {/* Personal information */}

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
            <UserRound
              className="h-5 w-5"
            />
          </div>

          <div>
            <h2
              className="
                text-base
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
              Basic information used
              throughout your healthcare
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
              htmlFor="first_name"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              First name
            </label>

            <input
              id="first_name"
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
              htmlFor="last_name"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Last name
            </label>

            <input
              id="last_name"
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


          <div>
            <label
              htmlFor="date_of_birth"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Date of birth
            </label>

            <input
              id="date_of_birth"
              type="date"
              {...register(
                "date_of_birth"
              )}
              className={
                inputClassName
              }
            />

            <FieldError
              error={
                errors
                  .date_of_birth
              }
            />
          </div>


          <div>
            <label
              htmlFor="gender"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Gender
            </label>

            <select
              id="gender"
              {...register(
                "gender"
              )}
              className={
                inputClassName
              }
            >
              {genders.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                )
              )}
            </select>
          </div>


          <div>
            <label
              htmlFor="blood_group"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Blood group
            </label>

            <select
              id="blood_group"
              {...register(
                "blood_group"
              )}
              className={
                inputClassName
              }
            >
              {bloodGroups.map(
                (group) => (
                  <option
                    key={
                      group ||
                      "none"
                    }
                    value={group}
                  >
                    {group ||
                      "Not specified"}
                  </option>
                )
              )}
            </select>
          </div>


          <div>
            <label
              htmlFor="height_cm"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Height
              <span
                className="
                  ml-1
                  font-normal
                  text-slate-500
                "
              >
                (cm)
              </span>
            </label>

            <input
              id="height_cm"
              type="number"
              min="20"
              max="300"
              step="0.1"
              {...register(
                "height_cm"
              )}
              className={
                inputClassName
              }
            />

            <FieldError
              error={
                errors.height_cm
              }
            />
          </div>
        </div>
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
              shrink-0
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
                text-base
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
              Your address information
              can later support nearby
              healthcare services.
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
              htmlFor="address_line1"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Address line 1
            </label>

            <input
              id="address_line1"
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
              htmlFor="address_line2"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Address line 2
            </label>

            <input
              id="address_line2"
              {...register(
                "address_line2"
              )}
              className={
                inputClassName
              }
            />
          </div>


          <div>
            <label
              htmlFor="city"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              City
            </label>

            <input
              id="city"
              {...register("city")}
              className={
                inputClassName
              }
            />
          </div>


          <div>
            <label
              htmlFor="district"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              District
            </label>

            <input
              id="district"
              {...register(
                "district"
              )}
              className={
                inputClassName
              }
            />
          </div>


          <div>
            <label
              htmlFor="state"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              State
            </label>

            <input
              id="state"
              {...register("state")}
              className={
                inputClassName
              }
            />
          </div>


          <div>
            <label
              htmlFor="postal_code"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Postal code
            </label>

            <input
              id="postal_code"
              {...register(
                "postal_code"
              )}
              className={
                inputClassName
              }
            />
          </div>


          <div>
            <label
              htmlFor="country"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Country
            </label>

            <input
              id="country"
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


      {/* Emergency information */}

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
            <HeartPulse
              className="h-5 w-5"
            />
          </div>

          <div className="flex-1">
            <h2
              className="
                text-base
                font-semibold
                text-slate-900
              "
            >
              Emergency information
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Optional notes relevant
              during emergency care.
            </p>

            <textarea
              rows="4"
              {...register(
                "emergency_notes"
              )}
              className="
                mt-4
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
              placeholder="Optional emergency notes..."
            />
          </div>
        </div>
      </section>


      {/* Submit */}

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
          <Save
            className="h-4 w-4"
          />

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