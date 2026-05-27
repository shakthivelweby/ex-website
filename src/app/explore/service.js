import apiMiddleware from "../api/apiMiddleware";

const getExploreData = async () => {
  try {
    const response = await apiMiddleware.get("/countries-and-states");
    return response.data;
  } catch (error) {
    console.error("Error fetching explore data:", error.message);
    return { data: [], status: false, message: error.message };
  }
};

const getFeaturedDestinations = async () => {
  try {
    const response = await apiMiddleware.get("/featured-destinations");
    return response.data;
  } catch (error) {
    console.error("Error fetching featured destinations:", error.message);
    return { data: [], status: false, message: error.message };
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
