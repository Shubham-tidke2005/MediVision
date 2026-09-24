import { apiClient } from "@/api/client";

export async function getDoctorPatientRecords({ search = "", limit = 50, offset = 0 } = {}) {
  const response = await apiClient.get(
    "/doctor/patient-records",
    {
      params: {
        search: search || undefined,
        limit,
        offset,
      },
    }
  );

  return response.data;
}

export async function getDoctorPatientRecord(patientId) {
  const response = await apiClient.get(
    `/doctor/patient-records/${patientId}`
  );

  return response.data;
}
