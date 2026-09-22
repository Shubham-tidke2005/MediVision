import {
  ContactRound,
  Hospital,
  MapPin,
  PhoneCall,
} from "lucide-react";


export default function SOSActions({
  event,
  config,

  sharingLocation,
  findingHospitals,

  onCallEmergency,
  onCallContact,
  onShareLocation,
  onFindHospitals,
}) {
  return (
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
      <h2
        className="
          text-lg
          font-bold
          text-slate-900
        "
      >
        Immediate Actions
      </h2>


      <div
        className="
          mt-5
          grid
          grid-cols-1
          gap-3

          sm:grid-cols-2
        "
      >
        <button
          type="button"
          onClick={
            onCallEmergency
          }
          className="
            flex
            min-h-[70px]
            items-center
            gap-3
            rounded-xl
            bg-rose-600
            p-4
            text-left
            text-white

            hover:bg-rose-700
          "
        >
          <PhoneCall
            className="
              h-6
              w-6
              shrink-0
            "
          />

          <div>
            <p
              className="font-bold"
            >
              Call{" "}
              {
                config
                  ?.emergency_service_label
                || "Emergency Service"
              }
            </p>

            <p
              className="
                mt-1
                text-xs
                text-rose-100
              "
            >
              {
                config
                  ?.emergency_phone_number
                || ""
              }
            </p>
          </div>
        </button>


        <button
          type="button"
          disabled={
            !event
              ?.emergency_contact_phone
          }
          onClick={
            onCallContact
          }
          className="
            flex
            min-h-[70px]
            items-center
            gap-3
            rounded-xl
            border
            border-slate-200
            bg-white
            p-4
            text-left
            text-slate-900

            hover:bg-slate-50

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <ContactRound
            className="
              h-6
              w-6
              shrink-0
              text-blue-600
            "
          />

          <div>
            <p
              className="font-bold"
            >
              Emergency Contact
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              {
                event
                  ?.emergency_contact_name
                || "No contact provided"
              }
            </p>
          </div>
        </button>


        <button
          type="button"
          disabled={
            sharingLocation
          }
          onClick={
            onShareLocation
          }
          className="
            flex
            min-h-[70px]
            items-center
            gap-3
            rounded-xl
            border
            border-slate-200
            bg-white
            p-4
            text-left
            text-slate-900

            hover:bg-slate-50

            disabled:opacity-50
          "
        >
          <MapPin
            className="
              h-6
              w-6
              shrink-0
              text-blue-600
            "
          />

          <div>
            <p
              className="font-bold"
            >
              {sharingLocation
                ? "Getting Location..."
                : event
                    ?.share_location
                  ? "Refresh Location"
                  : "Share My Location"}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Optional location sharing
            </p>
          </div>
        </button>


        <button
          type="button"
          disabled={
            findingHospitals
          }
          onClick={
            onFindHospitals
          }
          className="
            flex
            min-h-[70px]
            items-center
            gap-3
            rounded-xl
            border
            border-slate-200
            bg-white
            p-4
            text-left
            text-slate-900

            hover:bg-slate-50

            disabled:opacity-50
          "
        >
          <Hospital
            className="
              h-6
              w-6
              shrink-0
              text-blue-600
            "
          />

          <div>
            <p
              className="font-bold"
            >
              Nearby Hospitals
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Find hospitals near you
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}