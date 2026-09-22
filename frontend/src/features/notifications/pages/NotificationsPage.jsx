import {
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Bell,
  CheckCheck,
  Inbox,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/api/notificationsApi";

import NotificationCard
  from "@/features/notifications/components/NotificationCard";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


export default function NotificationsPage() {
  const queryClient =
    useQueryClient();


  const [
    unreadOnly,
    setUnreadOnly,
  ] = useState(false);


  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "notifications",
      unreadOnly,
    ],

    queryFn: () =>
      getNotifications({
        unreadOnly,
        limit:
          50,
        offset:
          0,
      }),

    refetchOnWindowFocus:
      true,
  });


  const markReadMutation =
    useMutation({
      mutationFn:
        markNotificationRead,

      onSuccess: () => {
        queryClient
          .invalidateQueries({
            queryKey: [
              "notifications",
            ],
          });

        queryClient
          .invalidateQueries({
            queryKey: [
              "notification-unread-count",
            ],
          });
      },
    });


  const markAllMutation =
    useMutation({
      mutationFn:
        markAllNotificationsRead,

      onSuccess: () => {
        queryClient
          .invalidateQueries({
            queryKey: [
              "notifications",
            ],
          });

        queryClient
          .invalidateQueries({
            queryKey: [
              "notification-unread-count",
            ],
          });
      },
    });


  const notifications =
    data?.items
    ?? [];


  const unreadCount =
    data?.unread_count
    ?? 0;


  return (
    <div
      className="
        mx-auto
        max-w-5xl
        space-y-6
        pb-10
      "
    >
      {/* HEADER */}

      <section
        className="
          flex
          flex-col
          gap-4

          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-2
              text-blue-600
            "
          >
            <Bell
              className="h-5 w-5"
            />

            <span
              className="
                text-sm
                font-semibold
              "
            >
              Notification Center
            </span>
          </div>


          <h1
            className="
              mt-2
              text-2xl
              font-bold
              tracking-tight
              text-slate-900

              sm:text-3xl
            "
          >
            Notifications
          </h1>


          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            Review appointment updates,
            medicine reminders,
            prescriptions and healthcare
            activity.
          </p>
        </div>


        <div
          className="
            flex
            flex-wrap
            gap-2
          "
        >
          <button
            type="button"
            onClick={() =>
              refetch()
            }
            disabled={
              isFetching
            }
            className="
              inline-flex
              min-h-[40px]
              items-center
              gap-2
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              font-semibold
              text-slate-700

              hover:bg-slate-50

              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`
                h-4
                w-4

                ${
                  isFetching
                    ? "animate-spin"
                    : ""
                }
              `}
            />

            Refresh
          </button>


          <button
            type="button"
            onClick={() =>
              markAllMutation.mutate()
            }
            disabled={
              unreadCount === 0
              || markAllMutation
                .isPending
            }
            className="
              inline-flex
              min-h-[40px]
              items-center
              gap-2
              rounded-lg
              bg-blue-600
              px-3
              text-sm
              font-semibold
              text-white

              hover:bg-blue-700

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {markAllMutation
              .isPending
              ? (
                <LoaderCircle
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                />
              )
              : (
                <CheckCheck
                  className="h-4 w-4"
                />
              )}

            Mark all as read
          </button>
        </div>
      </section>


      {/* SUMMARY */}

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
            flex-wrap
            items-center
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-sm
                text-slate-500
              "
            >
              Unread notifications
            </p>

            <p
              className="
                mt-1
                text-3xl
                font-bold
                text-slate-900
              "
            >
              {
                unreadCount
              }
            </p>
          </div>


          <div
            className="
              flex
              rounded-lg
              border
              border-slate-200
              bg-slate-50
              p-1
            "
          >
            <button
              type="button"
              onClick={() =>
                setUnreadOnly(
                  false
                )
              }
              className={`
                rounded-md
                px-4
                py-2
                text-sm
                font-semibold

                ${
                  !unreadOnly
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600"
                }
              `}
            >
              All
            </button>


            <button
              type="button"
              onClick={() =>
                setUnreadOnly(
                  true
                )
              }
              className={`
                rounded-md
                px-4
                py-2
                text-sm
                font-semibold

                ${
                  unreadOnly
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600"
                }
              `}
            >
              Unread
            </button>
          </div>
        </div>
      </section>


      {/* LOADING */}

      {isLoading
        && (
          <section
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              p-12
              text-center
            "
          >
            <LoaderCircle
              className="
                mx-auto
                h-7
                w-7
                animate-spin
                text-blue-600
              "
            />

            <p
              className="
                mt-3
                text-sm
                text-slate-500
              "
            >
              Loading notifications...
            </p>
          </section>
        )}


      {/* ERROR */}

      {isError
        && (
          <section
            className="
              rounded-xl
              border
              border-rose-200
              bg-rose-50
              p-5
              text-sm
              text-rose-700
            "
          >
            {
              getApiErrorMessage(
                error,
                "Unable to load notifications."
              )
            }
          </section>
        )}


      {/* MARK ALL ERROR */}

      {markAllMutation.isError
        && (
          <section
            className="
              rounded-xl
              border
              border-rose-200
              bg-rose-50
              p-4
              text-sm
              text-rose-700
            "
          >
            Unable to mark notifications
            as read.
          </section>
        )}


      {/* EMPTY */}

      {!isLoading
        && !isError
        && notifications.length
        === 0
        && (
          <section
            className="
              rounded-xl
              border
              border-dashed
              border-slate-300
              bg-white
              px-6
              py-14
              text-center
            "
          >
            <Inbox
              className="
                mx-auto
                h-10
                w-10
                text-slate-300
              "
            />

            <h2
              className="
                mt-4
                font-semibold
                text-slate-900
              "
            >
              {unreadOnly
                ? "No unread notifications"
                : "No notifications yet"}
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              {unreadOnly
                ? "You have read all currently available notifications."
                : "Healthcare updates and reminders will appear here."}
            </p>
          </section>
        )}


      {/* LIST */}

      {!isLoading
        && !isError
        && notifications.length
        > 0
        && (
          <section
            className="
              space-y-3
            "
          >
            {notifications.map(
              (
                notification
              ) => (
                <NotificationCard
                  key={
                    notification.id
                  }

                  notification={
                    notification
                  }

                  markingRead={
                    markReadMutation
                      .isPending
                  }

                  onMarkRead={
                    (
                      notificationId
                    ) =>
                      markReadMutation
                        .mutate(
                          notificationId
                        )
                  }
                />
              )
            )}
          </section>
        )}
    </div>
  );
}