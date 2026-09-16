import {
  apiClient,
} from "@/api/client";


export async function getMedicalDocuments() {
  const response =
    await apiClient.get(
      "/patients/me/documents"
    );

  return response.data;
}


export async function uploadMedicalDocument({
  documentType,
  file,
}) {
  const formData =
    new FormData();

  formData.append(
    "document_type",
    documentType
  );

  formData.append(
    "file",
    file
  );


  /*
   * Do NOT manually set:
   *
   * Content-Type: multipart/form-data
   *
   * Axios/browser must add the multipart
   * boundary automatically.
   */

  const response =
    await apiClient.post(
      "/patients/me/documents",
      formData
    );

  return response.data;
}


export async function downloadMedicalDocument(
  document
) {
  const response =
    await apiClient.get(
      `/patients/me/documents/${document.id}/download`,
      {
        responseType: "blob",
      }
    );


  const blobUrl =
    URL.createObjectURL(
      response.data
    );


  const link =
    window.document.createElement(
      "a"
    );


  link.href =
    blobUrl;

  link.download =
    document.filename;


  window.document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    blobUrl
  );
}