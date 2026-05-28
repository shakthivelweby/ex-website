import apiServerMiddleware from "../api/serverMiddleware";

/** Laravel successResponse wraps payload in { message, data, status } */
function unwrapList(body) {
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;
  return [];
}

const getExploreData = async () => {
  try {
    const response = await apiServerMiddleware.get("/countries-and-states");
    const body = response?.data ?? {};
    const rows = unwrapList(body);
    return {
      ...body,
      data: rows,
      status: body?.status ?? true,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("getExploreData failed:", error?.message || error);
    }
    return { data: [], status: false, message: error?.message || "Failed" };
  }
};

const getFeaturedDestinations = async () => {
  try {
    const response = await apiServerMiddleware.get("/featured-destinations");
    const body = response?.data ?? {};
    const rows = unwrapList(body);
    return {
      ...body,
      data: rows,
      status: body?.status ?? true,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("getFeaturedDestinations failed:", error?.message || error);
    }
    return { data: [], status: false, message: error?.message || "Failed" };
  }
};

const getPackageCount = async (countryId) => {
  try {
    const response = await apiMiddleware.get("/packages", {
      params: {
        country_id: countryId,
      },
    });
    if (Array.isArray(response.data)) {
      return response.data.length;
    }
    if (Array.isArray(response.data?.data)) {
      return response.data.data.length;
    }
    if (response.data?.total !== undefined) {
      return response.data.total;
    }
    if (response.data?.count !== undefined) {
      return response.data.count;
    }
    return 0;
  } catch (error) {
    console.error(`Error fetching package count for country ${countryId}:`, error.message);
    return 0;
  }
};

export { getExploreData, getFeaturedDestinations, getPackageCount };
