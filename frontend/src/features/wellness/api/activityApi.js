import {
  apiClient,
} from "@/api/client";


function getLocalDate() {
  const now =
    new Date();


  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;
}


export async function createActivityPlan(
  payload
) {
  const response =
    await apiClient.post(
      "/activity/plans",
      payload
    );


  return response.data;
}


export async function getCurrentActivityPlan() {
  const response =
    await apiClient.get(
      "/activity/plans/current"
    );


  return response.data;
}


export async function getActivityPlans() {
  const response =
    await apiClient.get(
      "/activity/plans"
    );


  return response.data;
}


export async function getTodayRoutine() {
  const response =
    await apiClient.get(
      "/activity/today",
      {
        params: {
          target_date:
            getLocalDate(),
        },
      }
    );


  return response.data;
}


export async function updateActivityLog({
  itemId,
  status,
}) {
  const response =
    await apiClient.put(
      `/activity/items/${itemId}/log`,
      {
        status,
      },
      {
        params: {
          log_date:
            getLocalDate(),
        },
      }
    );


  return response.data;
}