import {
  BadgeCheck,
  CalendarClock,
  IndianRupee,
  MapPin,
  Stethoscope,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


export default function DoctorCard({
  doctor,
}) {
  const primarySpecialty =
    doctor.specialties.find(
      (item) =>
        item.is_primary
    );


  const locationText = [
    doctor.location?.city,
    doctor.location?.state,
  ]
    .filter(Boolean)
    .join(", ");


  return (
    <article
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm

        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:shadow-md
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-sky-50
              text-sky-700
            "
          >
            <Stethoscope
              className="h-6 w-6"
            />
          </div>


          <div className="min-w-0">
            <h2
              className="
                truncate
                text-base
                font-semibold
                text-slate-900
              "
            >
              Dr. {doctor.first_name}{" "}
              {doctor.last_name}
            </h2>

            <p
              className="
                mt-1
                truncate
                text-sm
                text-slate-500
              "
            >
              {doctor.qualification}
            </p>
          </div>
        </div>


        <span
          className="
            inline-flex
            shrink-0
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


      <div
        className="
          mt-5
          space-y-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            text-sm
            text-slate-600
          "
        >
          <Stethoscope
            className="
              h-4
              w-4
              text-slate-400
            "
          />

          <span>
            {primarySpecialty?.name
              ?? "General practice"}
          </span>
        </div>


        <div
          className="
            flex
            items-center
            gap-2
            text-sm
            text-slate-600
          "
        >
          <CalendarClock
            className="
              h-4
              w-4
              text-slate-400
            "
          />

          <span>
            {doctor.experience_years}{" "}
            years experience
          </span>
        </div>


        {locationText && (
          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              text-slate-600
            "
          >
            <MapPin
              className="
                h-4
                w-4
                text-slate-400
              "
            />

            <span>
              {locationText}
            </span>
          </div>
        )}


        {doctor.default_consultation_fee
          !== null && (
          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              text-slate-600
            "
          >
            <IndianRupee
              className="
                h-4
                w-4
                text-slate-400
              "
            />

            <span>
              {
                doctor.default_consultation_fee
              }{" "}
              consultation
            </span>
          </div>
        )}
      </div>


      <div
        className="
          mt-5
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
                bg-slate-100
                px-2.5
                py-1
                text-xs
                font-medium
                text-slate-600
              "
            >
              {specialty.name}
            </span>
          )
        )}
      </div>


      <Link
        to={`/doctors/${doctor.id}`}
        className="
          mt-5
          inline-flex
          min-h-[44px]
          w-full
          items-center
          justify-center
          rounded-lg
          bg-blue-600
          px-4
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
        "
      >
        View Profile
      </Link>
    </article>
  );
}