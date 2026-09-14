import { apiClient } from "@/api/client";

export async function getBackendHealth() {
  const response = await apiClient.get(
    "/health"
  );

  return response.data;
}