import {
  apiClient,
} from "@/api/client";


export async function searchDiagnoses(
  search = ""
) {
  const response =
    await apiClient.get(
      "/diagnoses",
      {
        params: {
          search:
            search || undefined,
        },
      }
    );

  return response.data;
}


export async function createDiagnosis(
  payload
) {
  const response =
    await apiClient.post(
      "/diagnoses",
      payload
    );

  return response.data;
}


export async function getEncounterDiagnoses(
  encounterId
) {
  const response =
    await apiClient.get(
      `/diagnoses/encounters/${encounterId}`
    );

  return response.data;
}


export async function addEncounterDiagnosis({
  encounterId,
  payload,
}) {
  const response =
    await apiClient.post(
      `/diagnoses/encounters/${encounterId}`,
      payload
    );

  return response.data;
}


export async function updateEncounterDiagnosis({
  encounterDiagnosisId,
  payload,
}) {
  const response =
    await apiClient.patch(
      `/diagnoses/encounter-diagnoses/${encounterDiagnosisId}`,
      payload
    );

  return response.data;
}


export async function deleteEncounterDiagnosis(
  encounterDiagnosisId
) {
  await apiClient.delete(
    `/diagnoses/encounter-diagnoses/${encounterDiagnosisId}`
  );
}