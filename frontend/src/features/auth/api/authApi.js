import {
  apiClient,
} from "@/api/client";


export async function loginRequest(
  credentials
) {
  const response =
    await apiClient.post(
      "/auth/login",
      credentials
    );

  return response.data;
}


export async function registerRequest(
  payload
) {
  const response =
    await apiClient.post(
      "/auth/register",
      payload
    );

  return response.data;
}


export async function getCurrentUserRequest() {
  const response =
    await apiClient.get(
      "/auth/me"
    );

  return response.data;
}