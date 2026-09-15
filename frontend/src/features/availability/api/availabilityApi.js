import {
  apiClient,
} from "@/api/client";


const BASE =
  "/doctors/me/availability";


export async function getAvailabilityRules() {
  const response =
    await apiClient.get(
      `${BASE}/rules`
    );

  return response.data;
}


export async function createAvailabilityRule(
  payload
) {
  const response =
    await apiClient.post(
      `${BASE}/rules`,
      payload
    );

  return response.data;
}


export async function deleteAvailabilityRule(
  ruleId
) {
  await apiClient.delete(
    `${BASE}/rules/${ruleId}`
  );
}


export async function getDoctorTimeOff() {
  const response =
    await apiClient.get(
      `${BASE}/time-off`
    );

  return response.data;
}


export async function createDoctorTimeOff(
  payload
) {
  const response =
    await apiClient.post(
      `${BASE}/time-off`,
      payload
    );

  return response.data;
}


export async function deleteDoctorTimeOff(
  id
) {
  await apiClient.delete(
    `${BASE}/time-off/${id}`
  );
}


export async function generateDoctorSlots(
  days = 30
) {
  const response =
    await apiClient.post(
      `${BASE}/slots/generate`,
      {
        days,
      }
    );

  return response.data;
}


export async function getDoctorSlots(
  days = 30
) {
  const response =
    await apiClient.get(
      `${BASE}/slots`,
      {
        params: {
          days,
        },
      }
    );

  return response.data;
}