import {
  apiClient,
} from "@/api/client";


export async function getPatientDashboard() {
  const response =
    await apiClient.get(
      "/patients/me/dashboard"
    );

  return response.data;
}