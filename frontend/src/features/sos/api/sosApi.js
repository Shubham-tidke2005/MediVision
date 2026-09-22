import {
  apiClient,
} from "@/api/client";


export async function getSOSConfig() {
  const response =
    await apiClient.get(
      "/sos/config"
    );

  return response.data;
}


export async function getCurrentSOS() {
  const response =
    await apiClient.get(
      "/sos/events/current"
    );

  return response.data;
}


export async function createSOS(
  payload
) {
  const response =
    await apiClient.post(
      "/sos/events",
      payload
    );

  return response.data;
}


export async function updateSOSStatus(
  eventId,
  status
) {
  const response =
    await apiClient.patch(
      `/sos/events/${eventId}/status`,
      {
        status,
      }
    );

  return response.data;
}


export async function updateSOSLocation(
  eventId,
  location
) {
  const response =
    await apiClient.put(
      `/sos/events/${eventId}/location`,
      {
        latitude:
          location.latitude,

        longitude:
          location.longitude,

        accuracy_m:
          location.accuracy,
      }
    );

  return response.data;
}


export async function recordSOSAction(
  eventId,
  actionType,
  description = null
) {
  const response =
    await apiClient.post(
      `/sos/events/${eventId}/actions`,
      {
        action_type:
          actionType,

        description,
      }
    );

  return response.data;
}