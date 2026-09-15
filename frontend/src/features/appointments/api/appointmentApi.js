import {
  apiClient,
} from "@/api/client";


export async function requestAppointment(
  payload
) {
  const response =
    await apiClient.post(
      "/appointments",
      payload
    );

  return response.data;
}


export async function getPatientAppointments() {
  const response =
    await apiClient.get(
      "/appointments/patient"
    );

  return response.data;
}


export async function getDoctorAppointments() {
  const response =
    await apiClient.get(
      "/appointments/doctor"
    );

  return response.data;
}


export async function cancelAppointment(
  appointmentId,
  reason = null
) {
  const response =
    await apiClient.patch(
      `/appointments/${appointmentId}/cancel`,
      {
        reason,
      }
    );

  return response.data;
}


export async function approveAppointment(
  appointmentId
) {
  const response =
    await apiClient.patch(
      `/appointments/${appointmentId}/approve`
    );

  return response.data;
}


export async function rejectAppointment(
  appointmentId,
  reason = null
) {
  const response =
    await apiClient.patch(
      `/appointments/${appointmentId}/reject`,
      {
        reason,
      }
    );

  return response.data;
}


export async function completeAppointment(
  appointmentId
) {
  const response =
    await apiClient.patch(
      `/appointments/${appointmentId}/complete`
    );

  return response.data;
}


export async function markAppointmentNoShow(
  appointmentId
) {
  const response =
    await apiClient.patch(
      `/appointments/${appointmentId}/no-show`
    );

  return response.data;
}