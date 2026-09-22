import {
  apiClient,
} from "@/api/client";


export async function getAdminDashboard() {
  const response =
    await apiClient.get(
      "/admin/dashboard"
    );

  return response.data;
}


async function getCollection(
  path
) {
  const response =
    await apiClient.get(
      path,
      {
        params: {
          limit: 100,
          offset: 0,
        },
      }
    );

  return response.data;
}


export const getAdminUsers =
  () =>
    getCollection(
      "/admin/users"
    );

export const getAdminPatients =
  () =>
    getCollection(
      "/admin/patients"
    );

export const getAdminDoctors =
  () =>
    getCollection(
      "/admin/doctors"
    );

export const getAdminSpecialties =
  () =>
    getCollection(
      "/admin/specialties"
    );

export const getAdminFacilities =
  () =>
    getCollection(
      "/admin/facilities"
    );

export const getAdminAppointments =
  () =>
    getCollection(
      "/admin/appointments"
    );

export const getAdminHealthArticles =
  () =>
    getCollection(
      "/admin/health-articles"
    );

export const getAdminAIAssessments =
  () =>
    getCollection(
      "/admin/ai-assessments"
    );

export const getAdminSOSEvents =
  () =>
    getCollection(
      "/admin/sos"
    );


export async function updateUserActive(
  userId,
  isActive
) {
  const response =
    await apiClient.patch(
      `/admin/users/${userId}/active`,
      {
        is_active:
          isActive,
      }
    );

  return response.data;
}


export async function updateDoctorVerification(
  doctorId,
  verificationStatus
) {
  const response =
    await apiClient.patch(
      `/admin/doctors/${doctorId}/verification`,
      {
        verification_status:
          verificationStatus,
      }
    );

  return response.data;
}


export async function createSpecialty(
  payload
) {
  const response =
    await apiClient.post(
      "/admin/specialties",
      payload
    );

  return response.data;
}


export async function updateSpecialty(
  specialtyId,
  payload
) {
  const response =
    await apiClient.put(
      `/admin/specialties/${specialtyId}`,
      payload
    );

  return response.data;
}


export async function createFacility(
  payload
) {
  const response =
    await apiClient.post(
      "/admin/facilities",
      payload
    );

  return response.data;
}


export async function updateFacility(
  facilityId,
  payload
) {
  const response =
    await apiClient.put(
      `/admin/facilities/${facilityId}`,
      payload
    );

  return response.data;
}


export async function createHealthArticle(
  payload
) {
  const response =
    await apiClient.post(
      "/admin/health-articles",
      payload
    );

  return response.data;
}


export async function updateHealthArticle(
  articleId,
  payload
) {
  const response =
    await apiClient.put(
      `/admin/health-articles/${articleId}`,
      payload
    );

  return response.data;
}
