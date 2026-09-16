import {
  apiClient,
} from "@/api/client";


export async function getMedications() {
  const response =
    await apiClient.get(
      "/patients/me/medications"
    );

  return response.data;
}


export async function addManualMedication(
  payload
) {
  const response =
    await apiClient.post(
      "/patients/me/medications/manual",
      payload
    );

  return response.data;
}


export async function addMedicationSchedule({
  medicationId,
  timeOfDay,
}) {
  const response =
    await apiClient.post(
      `/patients/me/medications/${medicationId}/schedules`,
      {
        time_of_day:
          `${timeOfDay}:00`,

        timezone:
          "Asia/Kolkata",
      }
    );

  return response.data;
}


export async function getMedicationDoses(
  targetDate
) {
  const response =
    await apiClient.get(
      "/patients/me/medications/doses",
      {
        params: {
          target_date:
            targetDate,
        },
      }
    );

  return response.data;
}


export async function recordDoseStatus({
  scheduleId,
  scheduledFor,
  status,
}) {
  const response =
    await apiClient.put(
      `/patients/me/medications/schedules/${scheduleId}/dose`,
      {
        status,
      },
      {
        params: {
          scheduled_for:
            scheduledFor,
        },
      }
    );

  return response.data;
}


export async function getMedicationAdherence(
  days = 30
) {
  const response =
    await apiClient.get(
      "/patients/me/medications/adherence",
      {
        params: {
          days,
        },
      }
    );

  return response.data;
}