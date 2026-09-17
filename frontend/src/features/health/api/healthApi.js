import {
  apiClient,
} from "@/api/client";


export async function getHealthMetricTypes() {
  const response =
    await apiClient.get(
      "/health/metric-types"
    );

  return response.data;
}


export async function getHealthMeasurements(
  days = 90
) {
  const response =
    await apiClient.get(
      "/health/measurements",
      {
        params: {
          days,
        },
      }
    );

  return response.data;
}


export async function addHealthMeasurement(
  payload
) {
  const response =
    await apiClient.post(
      "/health/measurements",
      payload
    );

  return response.data;
}