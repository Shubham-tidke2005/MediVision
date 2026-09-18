import {
  apiClient,
} from "@/api/client";


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