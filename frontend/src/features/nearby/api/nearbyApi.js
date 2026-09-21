import {
  apiClient,
} from "@/api/client";


export async function getNearbyHealthcare({
  latitude,
  longitude,
  radiusKm = 5,
  facilityType = "ALL",
  openNow = false,
  timezone = "UTC",
}) {
  const response =
    await apiClient.get(
      "/nearby/healthcare",
      {
        params: {
          latitude,
          longitude,

          radius_km:
            radiusKm,

          open_now:
            openNow,

          timezone,

          ...(facilityType
            && facilityType !== "ALL"
            ? {
                facility_type:
                  facilityType,
              }
            : {}),
        },
      }
    );

  return response.data;
}