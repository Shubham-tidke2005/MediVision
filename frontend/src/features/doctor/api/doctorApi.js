import {
  apiClient,
} from "@/api/client";


export async function getMyDoctorProfile() {
  try {
    const response =
      await apiClient.get(
        "/doctors/me"
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


export async function createMyDoctorProfile(
  payload
) {
  const response =
    await apiClient.post(
      "/doctors/me",
      payload
    );

  return response.data;
}


export async function updateMyDoctorProfile(
  payload
) {
  const response =
    await apiClient.patch(
      "/doctors/me",
      payload
    );

  return response.data;
}


export async function getDoctorSpecialties() {
  const response =
    await apiClient.get(
      "/doctors/specialties"
    );

  return response.data;
}