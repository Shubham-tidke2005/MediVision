import {
  apiClient,
} from "@/api/client";


export async function startEncounter(
  appointmentId,
  payload = {}
) {
  const response =
    await apiClient.post(
      `/encounters/appointments/${appointmentId}/start`,
      payload
    );

  return response.data;
}


export async function getEncounter(
  encounterId
) {
  const response =
    await apiClient.get(
      `/encounters/${encounterId}`
    );

  return response.data;
}


export async function updateEncounter({
  encounterId,
  payload,
}) {
  const response =
    await apiClient.patch(
      `/encounters/${encounterId}`,
      payload
    );

  return response.data;
}


export async function completeEncounter(
  encounterId
) {
  const response =
    await apiClient.post(
      `/encounters/${encounterId}/complete`
    );

  return response.data;
}