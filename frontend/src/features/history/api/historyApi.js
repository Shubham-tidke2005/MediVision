import {
  apiClient,
} from "@/api/client";


export async function getPatientHistory() {
  const response =
    await apiClient.get(
      "/patients/me/history"
    );

  return response.data;
}