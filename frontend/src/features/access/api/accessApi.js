import {
  apiClient,
} from "@/api/client";


export async function getAccessGrants() {
  const response =
    await apiClient.get(
      "/patients/me/access-grants"
    );

  return response.data;
}


export async function shareMedicalRecords({
  doctorId,
  scope,
  expiresAt = null,
}) {
  const response =
    await apiClient.put(
      `/patients/me/access-grants/${doctorId}`,
      {
        scope,
        expires_at:
          expiresAt,
      }
    );

  return response.data;
}


export async function revokeMedicalAccess(
  doctorId
) {
  await apiClient.delete(
    `/patients/me/access-grants/${doctorId}`
  );
}


export async function getSharedPatients() {
  const response =
    await apiClient.get(
      "/doctors/me/shared-patients"
    );

  return response.data;
}


export async function getSharedPatientHistory(
  patientId
) {
  const response =
    await apiClient.get(
      `/doctors/me/patients/${patientId}/history`
    );

  return response.data;
}