import {
  apiClient,
} from "@/api/client";


export async function getAdminAuditLogs({
  action = "",
  resourceType = "",
  resourceId = "",
  userId = "",
  limit = 50,
  offset = 0,
} = {}) {
  const params = {
    limit,
    offset,
  };

  if (action) {
    params.action = action;
  }

  if (resourceType) {
    params.resource_type =
      resourceType;
  }

  if (resourceId) {
    params.resource_id =
      resourceId;
  }

  if (userId) {
    params.user_id =
      userId;
  }

  const response =
    await apiClient.get(
      "/admin/audit-logs",
      {
        params,
      }
    );

  return response.data;
}
