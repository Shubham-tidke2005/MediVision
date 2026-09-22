import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";


function formatDateTime(
  value
) {
  if (!value) {
    return "—";
  }

  return new Intl
    .DateTimeFormat(
      undefined,
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    )
    .format(
      new Date(
        value
      )
    );
}


export default function SOSStatusCard({
  event,
}) {
  if (!event) {
    return null;
  }


  const active =
    event.status
    === "TRIGGERED"
    || event.status
    === "ACKNOWLEDGED";


  return (
    <section
      className={`
        rounded-xl
        border
        p-5
        shadow-sm

        ${
          active
            ? "border-rose-200 bg-rose-50"
            : "border-slate-200 bg-white"
        }
      `}
    >
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl

            ${
              active
                ? "bg-rose-100 text-rose-700"
                : "bg-emerald-50 text-emerald-600"
            }
          `}
        >
          {active
            ? (
              <AlertTriangle
                className="h-6 w-6"
              />
            )
            : (
              <CheckCircle2
                className="h-6 w-6"
              />
            )}
        </div>


        <div
          className="flex-1"
        >
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            SOS Status
          </p>

          <h2
            className={`
              mt-1
              text-xl
              font-bold

              ${
                active
                  ? "text-rose-900"
                  : "text-slate-900"
              }
            `}
          >
            {
              event.status
            }
          </h2>


          <div
            className="
              mt-3
              flex
              items-center
              gap-2
              text-sm
              text-slate-600
            "
          >
            <Clock3
              className="h-4 w-4"
            />

            Triggered{" "}
            {
              formatDateTime(
                event.triggered_at
              )
            }
          </div>
        </div>
      </div>
    </section>
  );
}