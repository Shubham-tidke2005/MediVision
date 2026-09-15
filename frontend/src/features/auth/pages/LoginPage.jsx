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
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  useForm,
} from "react-hook-form";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  loginSchema,
} from "@/features/auth/schemas/authSchemas";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


export default function LoginPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const { login } =
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
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver:
      zodResolver(
        loginSchema
      ),

    defaultValues: {
      email:
        location.state?.email ??
        "",

      password: "",
    },
  });


  const registrationSuccess =
    location.state
      ?.registrationSuccess;


  async function onSubmit(data) {
    setServerError("");

    try {
      await login({
        email:
          data.email
            .trim()
            .toLowerCase(),

        password:
          data.password,
      });

      const destination =
        location.state?.from
          ?.pathname ??
        "/dashboard";

      navigate(
        destination,
        {
          replace: true,
        }
      );
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          "Unable to sign in."
        )
      );
    }
  }


  return (
    <section
      className="
        flex
        min-h-[650px]
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
          max-w-md
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
          Sign in to MediVision
        </h1>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          Access your secure healthcare
          workspace.
        </p>


        {registrationSuccess && (
          <div
            className="
              mt-5
              rounded-lg
              border
              border-emerald-200
              bg-emerald-50
              p-3
              text-sm
              text-emerald-700
            "
          >
            Account created successfully.
            You can now sign in.
          </div>
        )}


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
          <div>
            <label
              htmlFor="email"
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Email address
            </label>

            <div
              className="
                relative
                mt-2
              "
            >
              <Mail
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  py-2
                  pl-10
                  pr-3
                  text-base
                  text-slate-900

                  placeholder:text-slate-400

                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-600
                  focus:ring-offset-2
                "
                placeholder="you@example.com"
              />
            </div>

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
              htmlFor="password"
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
              <LockKeyhole
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                {...register(
                  "password"
                )}
                className="
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  py-2
                  pl-10
                  pr-12
                  text-base
                  text-slate-900

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
                  right-1
                  top-1/2
                  flex
                  min-h-[44px]
                  min-w-[44px]
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-500

                  hover:text-slate-900

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
              ? "Signing in..."
              : "Sign In"}
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
          Don't have an account?{" "}

          <Link
            to="/register"
            className="
              font-semibold
              text-blue-600
              hover:text-blue-700

              focus:outline-none
              focus:ring-2
              focus:ring-blue-600
              focus:ring-offset-2
            "
          >
            Create account
          </Link>
        </p>
      </div>
    </section>
  );
}