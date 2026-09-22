import {
  apiClient,
} from "@/api/client";


export async function screenMedicalImage({
  file,
  disclaimerAccepted,
}) {
  const formData =
    new FormData();

  formData.append(
    "image",
    file
  );

  formData.append(
    "disclaimer_accepted",
    String(
      disclaimerAccepted
    )
  );

  const response =
    await apiClient.post(
      "/medical-image/screen",
      formData
    );

  return response.data;
}


export async function getMedicalImageAnalyses({
  limit = 20,
  offset = 0,
} = {}) {
  const response =
    await apiClient.get(
      "/medical-image/analyses",
      {
        params: {
          limit,
          offset,
        },
      }
    );

  return response.data;
}
