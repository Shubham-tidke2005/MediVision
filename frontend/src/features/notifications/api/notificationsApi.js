import {
  apiClient,
} from "@/api/client";


export async function getNotifications({
  unreadOnly = false,
  limit = 50,
  offset = 0,
} = {}) {
  const response =
    await apiClient.get(
      "/notifications",
      {
        params: {
          unread_only:
            unreadOnly,

          limit,

          offset,
        },
      }
    );

  return response.data;
}


export async function getUnreadNotificationCount() {
  const response =
    await apiClient.get(
      "/notifications/unread-count"
    );

  return response.data;
}


export async function markNotificationRead(
  notificationId
) {
  const response =
    await apiClient.patch(
      `/notifications/${notificationId}/read`
    );

  return response.data;
}


export async function markAllNotificationsRead() {
  const response =
    await apiClient.post(
      "/notifications/read-all"
    );

  return response.data;
}