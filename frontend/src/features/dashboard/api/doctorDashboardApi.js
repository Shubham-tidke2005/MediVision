import {
  apiClient,
} from "@/api/client";


export async function getDoctorDashboard() {
  const response =
    await apiClient.get(
      "/doctors/me/dashboard"
    );

  return response.data;
}