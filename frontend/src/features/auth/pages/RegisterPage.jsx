import {
  useState,
} from "react";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  Eye,
  EyeOff,
  HeartPulse,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  useForm,
} from "react-hook-form";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ROLES,
} from "@/constants/roles";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  registerSchema,
} from "@/features/auth/schemas/authSchemas";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


export default function RegisterPage() {
  const navigate =
    useNavigate();

  const { register: registerUser } =
    useAuth();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    serverError,
    setServerError,
  ] = useState("");


  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver:
      zodResolver(
        registerSchema
      ),

    defaultValues: {
      role:
        ROLES.PATIENT,

      email: "",

      phone_number: "",

      password: "",

      confirmPassword: "",
    },
  });


  const selectedRole =
    watch("role");


  async function onSubmit(data) {
    setServerError("");

    try {
      await registerUser({
        role:
          data.role,

        email:
          data.email
            .trim()
            .toLowerCase(),

        phone_number:
          data.phone_number
            ?.trim() || null,

        password:
          data.password,
      });

      navigate(
        "/login",
        {
          replace: true,

          state: {
            registrationSuccess:
              true,

            email:
              data.email
                .trim()
                .toLowerCase(),
          },
        }
      );
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          "Unable to create account."
        )
      );
    }
  }


  return (
    <section
      className="
        flex
        items-center
        justify-center
        px-4
        py-12
        sm:px-6
      "
    >
      <div
        className="
          w-full
          max-w-xl
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
          sm:p-8
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-blue-600
            text-white
          "
        >
          <HeartPulse
            className="h-6 w-6"
          />
        </div>

        <h1
          className="
            mt-6
            text-2xl
            font-bold
            tracking-tight
            text-slate-900
          "
        >
          Create your account
        </h1>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          Choose your account type
          and join MediVision AI.
        </p>


        {serverError && (
          <div
            role="alert"
            className="
              mt-5
              rounded-lg
              border
              border-rose-200
              bg-rose-50
              p-3
              text-sm
              text-rose-700
            "
          >
            {serverError}
          </div>
        )}


        <form
          onSubmit={
            handleSubmit(
              onSubmit
            )
          }
          className="
            mt-6
            space-y-5
          "
          noValidate
        >
          <fieldset>
            <legend
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              I am registering as
            </legend>

            <div
              className="
                mt-3
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
              "
            >
              <label
                className={`
                  flex
                  min-h-[72px]
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-xl
                  border
                  p-4
                  transition-all
                  duration-200

                  ${
                    selectedRole ===
                    ROLES.PATIENT
                      ? `
                        border-blue-600
                        bg-blue-50
                      `
                      : `
                        border-slate-200
                        bg-white
                        hover:border-slate-300
                      `
                  }
                `}
              >
                <input
                  type="radio"
                  value={
                    ROLES.PATIENT
                  }
                  {...register("role")}
                  className="sr-only"
                />

                <UserRound
                  className="
                    h-5
                    w-5
                    text-sky-600
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
                    Patient
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
                    Manage your care
                    journey.
                  </p>
                </div>
              </label>


              <label
                className={`
                  flex
                  min-h-[72px]
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-xl
                  border
                  p-4
                  transition-all
                  duration-200

                  ${
                    selectedRole ===
                    ROLES.DOCTOR
                      ? `
                        border-blue-600
                        bg-blue-50
                      `
                      : `
                        border-slate-200
                        bg-white
                        hover:border-slate-300
                      `
                  }
                `}
              >
                <input
                  type="radio"
                  value={
                    ROLES.DOCTOR
                  }
                  {...register("role")}
                  className="sr-only"
                />

                <Stethoscope
                  className="
                    h-5
                    w-5
                    text-teal-600
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
                    Doctor
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
                    Create a professional
                    account.
                  </p>
                </div>
              </label>
            </div>
          </fieldset>


          <div>
            <label
              htmlFor="register-email"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Email
            </label>

            <input
              id="register-email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="
                mt-2
                min-h-[44px]
                w-full
                rounded-lg
                border
                border-slate-200
                px-3
                text-base
                text-slate-900

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2
              "
            />

            {errors.email && (
              <p
                className="
                  mt-2
                  text-sm
                  text-rose-700
                "
              >
                {errors.email.message}
              </p>
            )}
          </div>


          <div>
            <label
              htmlFor="phone-number"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Phone number
              <span
                className="
                  ml-1
                  font-normal
                  text-slate-500
                "
              >
                (optional)
              </span>
            </label>

            <input
              id="phone-number"
              type="tel"
              autoComplete="tel"
              {...register(
                "phone_number"
              )}
              className="
                mt-2
                min-h-[44px]
                w-full
                rounded-lg
                border
                border-slate-200
                px-3
                text-base
                text-slate-900

                focus:outline-none
                focus:ring-2
                focus:ring-blue-600
                focus:ring-offset-2
              "
            />

            {errors.phone_number && (
              <p
                className="
                  mt-2
                  text-sm
                  text-rose-700
                "
              >
                {
                  errors
                    .phone_number
                    .message
                }
              </p>
            )}
          </div>


          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >
            <div>
              <label
                htmlFor="register-password"
                className="
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Password
              </label>

              <div
                className="
                  relative
                  mt-2
                "
              >
                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  {...register(
                    "password"
                  )}
                  className="
                    min-h-[44px]
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    px-3
                    pr-11
                    text-base

                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-600
                    focus:ring-offset-2
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) =>
                        !value
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="
                    absolute
                    right-0
                    top-0
                    flex
                    min-h-[44px]
                    min-w-[44px]
                    items-center
                    justify-center
                    text-slate-500

                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-600
                  "
                >
                  {showPassword ? (
                    <EyeOff
                      className="h-4 w-4"
                    />
                  ) : (
                    <Eye
                      className="h-4 w-4"
                    />
                  )}
                </button>
              </div>

              {errors.password && (
                <p
                  className="
                    mt-2
                    text-sm
                    text-rose-700
                  "
                >
                  {
                    errors.password
                      .message
                  }
                </p>
              )}
            </div>


            <div>
              <label
                htmlFor="confirm-password"
                className="
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Confirm password
              </label>

              <input
                id="confirm-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                {...register(
                  "confirmPassword"
                )}
                className="
                  mt-2
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  px-3
                  text-base

                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-600
                  focus:ring-offset-2
                "
              />

              {errors.confirmPassword && (
                <p
                  className="
                    mt-2
                    text-sm
                    text-rose-700
                  "
                >
                  {
                    errors
                      .confirmPassword
                      .message
                  }
                </p>
              )}
            </div>
          </div>


          <button
            type="submit"
            disabled={isSubmitting}
            className="
              inline-flex
              min-h-[44px]
              w-full
              items-center
              justify-center
              rounded-lg
              bg-blue-600
              px-4
              py-2
              text-sm
              font-semibold
              text-white

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
            {isSubmitting
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>


        <p
          className="
            mt-6
            text-center
            text-sm
            text-slate-500
          "
        >
          Already have an account?{" "}

          <Link
            to="/login"
            className="
              font-semibold
              text-blue-600
              hover:text-blue-700
            "
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}