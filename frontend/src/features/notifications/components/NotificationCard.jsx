import {
  Bell,
  CalendarCheck2,
  CalendarX,
  Check,
  Clock3,
  FileText,
  Pill,
  Share2,
} from "lucide-react";


function getNotificationIcon(
  type
) {
  const icons = {
    APPOINTMENT_APPROVED:
      CalendarCheck2,

    APPOINTMENT_REJECTED:
      CalendarX,

    APPOINTMENT_REMINDER:
      Clock3,

    MEDICINE_REMINDER:
      Pill,

    NEW_PRESCRIPTION:
      FileText,

    MEDICAL_ACCESS_SHARED:
      Share2,
  };

  return (
    icons[type]
    ?? Bell
  );
}


function getNotificationLabel(
  type
) {
  const labels = {
    APPOINTMENT_APPROVED:
      "Appointment",

    APPOINTMENT_REJECTED:
      "Appointment",

    APPOINTMENT_REMINDER:
      "Reminder",

    MEDICINE_REMINDER:
      "Medicine",

    NEW_PRESCRIPTION:
      "Prescription",

    MEDICAL_ACCESS_SHARED:
      "Medical Access",
  };

  return (
    labels[type]
    ?? "Notification"
  );
}


function formatDate(
  value
) {
  if (!value) {
    return "";
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


export default function NotificationCard({
  notification,
  markingRead = false,
  onMarkRead,
}) {
  const Icon =
    getNotificationIcon(
      notification
        .notification_type
    );


  return (
    <article
      className={`
        rounded-xl
        border
        p-5
        transition

        ${
          notification.is_read
            ? "border-slate-200 bg-white"
            : "border-blue-200 bg-blue-50"
        }
      `}
    >
      <div
        className="
          flex
          items-start
          gap-4
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
              notification.is_read
                ? "bg-slate-100 text-slate-600"
                : "bg-blue-100 text-blue-700"
            }
          `}
        >
          <Icon
            className="h-5 w-5"
          />
        </div>


        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              flex-col
              gap-2

              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >
            <div>
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <h2
                  className="
                    font-semibold
                    text-slate-900
                  "
                >
                  {
                    notification.title
                  }
                </h2>


                {!notification.is_read
                  && (
                    <span
                      className="
                        h-2
                        w-2
                        rounded-full
                        bg-blue-600
                      "
                      aria-label="Unread"
                    />
                  )}
              </div>


              <p
                className="
                  mt-1
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-blue-600
                "
              >
                {
                  getNotificationLabel(
                    notification
                      .notification_type
                  )
                }
              </p>
            </div>


            <span
              className="
                shrink-0
                text-xs
                text-slate-500
              "
            >
              {
                formatDate(
                  notification
                    .created_at
                )
              }
            </span>
          </div>


          <p
            className="
              mt-3
              text-sm
              leading-6
              text-slate-600
            "
          >
            {
              notification.message
            }
          </p>


          {!notification.is_read
            && (
              <button
                type="button"
                disabled={
                  markingRead
                }
                onClick={() =>
                  onMarkRead(
                    notification.id
                  )
                }
                className="
                  mt-4
                  inline-flex
                  min-h-[36px]
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-blue-200
                  bg-white
                  px-3
                  text-xs
                  font-semibold
                  text-blue-700

                  hover:bg-blue-50

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Check
                  className="h-3.5 w-3.5"
                />

                Mark as read
              </button>
            )}
        </div>
      </div>
    </article>
  );
}