import {
  useQuery,
} from "@tanstack/react-query";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  IndianRupee,
  MapPin,
  Stethoscope,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getDoctorAvailableSlots,
  getDoctorDetails,
} from "@/features/discovery/api/discoveryApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";

import BookAppointmentPanel
  from "@/features/appointments/components/BookAppointmentPanel";



export default function DoctorDetailPage() {
  const {
    doctorId,
  } = useParams();


  const {
    data: doctor,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "doctor-detail",
      doctorId,
    ],

    queryFn: () =>
      getDoctorDetails(
        doctorId
      ),

    enabled:
      Boolean(doctorId),
  });


  const {
    data: slots = [],
  } = useQuery({
    queryKey: [
      "doctor-available-slots",
      doctorId,
    ],

    queryFn: () =>
      getDoctorAvailableSlots(
        doctorId,
        7
      ),

    enabled:
      Boolean(
        doctorId
        && doctor
      ),
  });


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
          Loading doctor profile...
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
          border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >
        <p
          className="
            text-sm
            text-slate-700
          "
        >
          {getApiErrorMessage(
            error,
            "Unable to load doctor profile."
          )}
        </p>

        <Link
          to="/doctors"
          className="
            mt-4
            inline-flex
            text-sm
            font-semibold
            text-blue-600
            hover:text-blue-700
          "
        >
          Back to doctors
        </Link>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <Link
        to="/doctors"
        className="
          inline-flex
          min-h-[44px]
          items-center
          gap-2
          text-sm
          font-semibold
          text-slate-600

          hover:text-slate-900
        "
      >
        <ArrowLeft
          className="h-4 w-4"
        />

        Back to Doctors
      </Link>


      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >
          <div
            className="
              flex
              items-start
              gap-4
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-sky-50
                text-sky-700
              "
            >
              <Stethoscope
                className="h-7 w-7"
              />
            </div>


            <div>
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <h1
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                  "
                >
                  Dr.{" "}
                  {doctor.first_name}{" "}
                  {doctor.last_name}
                </h1>

                <span
                  className="
                    inline-flex
                    items-center
                    gap-1
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
                  <BadgeCheck
                    className="h-3.5 w-3.5"
                  />

                  Verified
                </span>
              </div>


              <p
                className="
                  mt-2
                  text-sm
                  text-slate-500
                "
              >
                {doctor.qualification}
              </p>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Registration:{" "}
                {
                  doctor.registration_number
                }
              </p>
            </div>
          </div>
        </div>


        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-4
            md:grid-cols-3
          "
        >
          <div
            className="
              rounded-lg
              bg-slate-50
              p-4
            "
          >
            <CalendarClock
              className="
                h-5
                w-5
                text-sky-600
              "
            />

            <p
              className="
                mt-2
                text-sm
                font-semibold
                text-slate-900
              "
            >
              {
                doctor.experience_years
              }{" "}
              years
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Professional experience
            </p>
          </div>


          <div
            className="
              rounded-lg
              bg-slate-50
              p-4
            "
          >
            <IndianRupee
              className="
                h-5
                w-5
                text-sky-600
              "
            />

            <p
              className="
                mt-2
                text-sm
                font-semibold
                text-slate-900
              "
            >
              {doctor.default_consultation_fee
                ?? "Not specified"}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Default consultation fee
            </p>
          </div>


          <div
            className="
              rounded-lg
              bg-slate-50
              p-4
            "
          >
            <MapPin
              className="
                h-5
                w-5
                text-sky-600
              "
            />

            <p
              className="
                mt-2
                text-sm
                font-semibold
                text-slate-900
              "
            >
              {[
                doctor.location?.city,
                doctor.location?.state,
              ]
                .filter(Boolean)
                .join(", ")
                || "Not specified"}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Location
            </p>
          </div>
        </div>


        <div className="mt-6">
          <h2
            className="
              text-sm
              font-semibold
              text-slate-900
            "
          >
            Specialties
          </h2>

          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-2
            "
          >
            {doctor.specialties.map(
              (specialty) => (
                <span
                  key={specialty.id}
                  className="
                    rounded-full
                    bg-sky-50
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-sky-700
                  "
                >
                  {specialty.name}
                  {specialty.is_primary
                    ? " • Primary"
                    : ""}
                </span>
              )
            )}
          </div>
        </div>


        {doctor.bio && (
          <div className="mt-6">
            <h2
              className="
                text-sm
                font-semibold
                text-slate-900
              "
            >
              About
            </h2>

            <p
              className="
                mt-2
                max-w-3xl
                text-sm
                leading-6
                text-slate-600
              "
            >
              {doctor.bio}
            </p>
          </div>
        )}
      </section>


      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >
        <h2
          className="
            text-base
            font-semibold
            text-slate-900
          "
        >
          Available appointments
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          Upcoming available slots for
          the next 7 days.
        </p>


        {slots.length === 0 ? (
          <div
            className="
              mt-5
              rounded-lg
              bg-slate-50
              p-5
              text-sm
              text-slate-500
            "
          >
            No appointment slots are
            currently available.
          </div>
        ) : (
          <div
            className="
              mt-5
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-3
              lg:grid-cols-4
            "
          >
            {slots.map(
              (slot) => (
                <div
                  key={slot.id}
                  className="
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    p-3
                    text-center
                  "
                >
                  <p
                    className="
                      text-xs
                      font-medium
                      text-slate-500
                    "
                  >
                    {new Date(
                      slot.start_at
                    ).toLocaleDateString(
                      undefined,
                      {
                        weekday:
                          "short",
                        day:
                          "numeric",
                        month:
                          "short",
                      }
                    )}
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-semibold
                      text-slate-900
                    "
                  >
                    {new Date(
                      slot.start_at
                    ).toLocaleTimeString(
                      [],
                      {
                        hour:
                          "2-digit",
                        minute:
                          "2-digit",
                      }
                    )}
                  </p>
                </div>
              )
            )}
          </div>
        )}


        <BookAppointmentPanel
            doctorId={doctorId}
            slots={slots}
        />
        
      </section>
    </div>
  );
}