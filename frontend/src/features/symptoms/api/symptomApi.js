import {
  apiClient,
} from "@/api/client";


export async function getSymptoms() {
  const response =
    await apiClient.get(
      "/symptoms"
    );

  return response.data;
}