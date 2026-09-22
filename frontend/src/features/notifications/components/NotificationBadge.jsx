import {
  useQuery,
} from "@tanstack/react-query";

import {
  Bell,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getUnreadNotificationCount,
} from "@/features/notifications/api/notificationsApi";


export default function NotificationBadge() {
  const {
    data,
  } = useQuery({
    queryKey: [
      "notification-unread-count",
    ],

    queryFn:
      getUnreadNotificationCount,

    refetchInterval:
      60000,

    refetchOnWindowFocus:
      true,
  });


  const unreadCount =
    data?.unread_count
    ?? 0;


  const displayCount =
    unreadCount > 99
      ? "99+"
      : unreadCount;


  return (
    <Link
      to="/notifications"
      aria-label={
        unreadCount > 0
          ? `${unreadCount} unread notifications`
          : "Notifications"
      }
      className="
        relative
        inline-flex
        h-10
        w-10
        items-center
        justify-center
        rounded-lg
        border
        border-slate-200
        bg-white
        text-slate-600

        hover:bg-slate-50
        hover:text-blue-600
      "
    >
      <Bell
        className="h-5 w-5"
      />


      {unreadCount > 0
        && (
          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              min-h-[18px]
              min-w-[18px]
              items-center
              justify-center
              rounded-full
              bg-rose-600
              px-1
              text-[10px]
              font-bold
              text-white
            "
          >
            {
              displayCount
            }
          </span>
        )}
    </Link>
  );
}