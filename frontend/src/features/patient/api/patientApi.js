import {
  apiClient,
} from "@/api/client";


export async function getMyPatientProfile() {
  try {
    const response =
      await apiClient.get(
        "/patients/me"
      );

    return response.data;
  } catch (error) {
    if (
      error.response?.status === 404
    ) {
      return null;
    }

    throw error;
  }
}


export async function createMyPatientProfile(
  payload
) {
  const response =
    await apiClient.post(
      "/patients/me",
      payload
    );

  return response.data;
}


export async function updateMyPatientProfile(
  payload
) {
  const response =
    await apiClient.patch(
      "/patients/me",
      payload
    );

  return response.data;
}