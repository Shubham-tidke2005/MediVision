import {
  apiClient,
} from "@/api/client";


export async function getDiscoverySpecialties() {
  const response =
    await apiClient.get(
      "/discovery/specialties"
    );

  return response.data;
}


export async function getDoctors({
  search,
  specialtyId,
  city,
  page = 1,
  pageSize = 12,
}) {
  const response =
    await apiClient.get(
      "/discovery/doctors",
      {
        params: {
          search:
            search || undefined,

          specialty_id:
            specialtyId
            || undefined,

          city:
            city || undefined,

          page,

          page_size:
            pageSize,
        },
      }
    );

  return response.data;
}


export async function getDoctorDetails(
  doctorId
) {
  const response =
    await apiClient.get(
      `/discovery/doctors/${doctorId}`
    );

  return response.data;
}


export async function getDoctorAvailableSlots(
  doctorId,
  days = 7
) {
  const response =
    await apiClient.get(
      `/discovery/doctors/${doctorId}/slots`,
      {
        params: {
          days,
        },
      }
    );

  return response.data;
}