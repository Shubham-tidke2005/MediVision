import {
  apiClient,
} from "@/api/client";


export async function getHealthCategories() {
  const response =
    await apiClient.get(
      "/health-education/categories"
    );


  return response.data;
}


export async function getHealthArticles(
  category = null
) {
  const response =
    await apiClient.get(
      "/health-education/articles",
      {
        params: {
          ...(category
            ? {
                category,
              }
            : {}),
        },
      }
    );


  return response.data;
}


export async function getHealthArticle(
  slug
) {
  const response =
    await apiClient.get(
      `/health-education/articles/${slug}`
    );


  return response.data;
}