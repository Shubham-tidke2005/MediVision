import {
  apiClient,
} from "@/api/client";


// ======================================================
// STANDARDIZED SYMPTOM CATALOG
// ======================================================


export async function getSymptoms() {
  const response =
    await apiClient.get(
      "/symptoms"
    );

  return response.data;
}


// ======================================================
// AI SYMPTOM ASSESSMENT
// ======================================================


export async function createSymptomAssessment(
  payload
) {
  const response =
    await apiClient.post(
      "/ai/symptom-assessments",
      payload
    );

  return response.data;
}


// ======================================================
// RECOMMENDED SPECIALTY -> REAL DOCTORS
// ======================================================


export async function getRecommendedDoctors({
  specialtyCode,
  days = 30,
  page = 1,
  pageSize = 12,
}) {
  const response =
    await apiClient.get(
      "/discovery/recommended-doctors",
      {
        params: {
          specialty_code:
            specialtyCode,

          days,

          page,

          page_size:
            pageSize,
        },
      }
    );

  return response.data;
}