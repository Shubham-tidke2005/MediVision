import {
  apiClient,
} from "@/api/client";


// ======================================================
// CREATE DIET PLAN
// ======================================================


export async function createDietPlan(
  payload
) {
  console.log(
    "Diet request payload:",
    payload
  );


  try {
    const response =
      await apiClient.post(
        "/diet/plans",
        payload
      );


    return response.data;
  }
  catch (error) {
    console.error(
      "Diet API error:",
      error.response?.data
    );


    throw error;
  }
}


// ======================================================
// GET CURRENT DIET PLAN
// ======================================================


export async function getCurrentDietPlan() {
  const response =
    await apiClient.get(
      "/diet/plans/current"
    );


  return response.data;
}


// ======================================================
// GET ALL DIET PLANS
// ======================================================


export async function getDietPlans() {
  const response =
    await apiClient.get(
      "/diet/plans"
    );


  return response.data;
}


// ======================================================
// GET ONE DIET PLAN
// ======================================================


export async function getDietPlan(
  planId
) {
  const response =
    await apiClient.get(
      `/diet/plans/${planId}`
    );


  return response.data;
}