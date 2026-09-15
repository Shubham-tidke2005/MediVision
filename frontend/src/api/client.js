import axios from "axios";

import {
  AUTH_UNAUTHORIZED_EVENT,
  clearAccessToken,
  getAccessToken,
} from "@/lib/authToken";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;


export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});


apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error.response?.status;

    const requestUrl =
      String(error.config?.url ?? "");

    const isLoginRequest =
      requestUrl.includes("/auth/login");

    if (
      status === 401 &&
      !isLoginRequest
    ) {
      clearAccessToken();

      window.dispatchEvent(
        new Event(
          AUTH_UNAUTHORIZED_EVENT
        )
      );
    }

    return Promise.reject(error);
  }
);