import apiMiddleware from "./api/apiMiddleware";
import apiServerMiddleware from "./api/serverMiddleware";

function parseWebApiPayload(responseData) {
  let payload = responseData;

  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      const jsonStart = payload.lastIndexOf("{");
      if (jsonStart !== -1) {
        try {
          payload = JSON.parse(payload.slice(jsonStart));
        } catch {
          payload = null;
        }
      } else {
        payload = null;
      }
    }
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  return payload;
}

function normalizeListData(responseData) {
  const payload = parseWebApiPayload(responseData);
  const data = payload?.data;

  return {
    status: payload?.status ?? true,
    data: Array.isArray(data) ? data : [],
    message: payload?.message || "Success",
  };
}

function normalizeObjectData(responseData, fallback = {}) {
  const payload = parseWebApiPayload(responseData);
  const data = payload?.data;

  return {
    status: payload?.status ?? true,
    data: data && typeof data === "object" && !Array.isArray(data) ? data : fallback,
    message: payload?.message || "Success",
  };
}

export const getFeaturedDestinations = async () => {
  try {
    const response = await apiServerMiddleware.get("/destinations/featured");
    return {
      status: true,
      data: response.data,
      message: "Success"
    };
  } catch (error) {
    console.error('Error fetching featured destinations:', error);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch featured destinations"
    };
  }
};

export const getFeaturedPackages = async () => {
  try {
    const response = await apiServerMiddleware.get("/trending-packages");
    return normalizeListData(response.data);
  } catch (error) {
    console.error("Error fetching featured packages:", error);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch featured packages",
    };
  }
};

export const getUpcomingEvents = async () => {
  try {
    const response = await apiServerMiddleware.get("/events/upcoming");
    return {
      status: true,
      data: response.data,
      message: "Success"
    };
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch upcoming events"
    };
  }
};

export const getPopularDestinations = async () => {
  try {
    const response = await apiServerMiddleware.get("/popular-destinations");
    return normalizeListData(response.data);
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch popular destinations"
    };
  }
};

export const getDestinationCategories = async () => {
  try {
    const response = await apiServerMiddleware.get("/categories/destinations");
    return {
      status: true,
      data: response.data,
      message: "Success"
    };
  } catch (error) {
    console.error('Error fetching destination categories:', error);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch destination categories"
    };
  }
};

export const getPackageCategories = async () => {
  try {
    const response = await apiServerMiddleware.get("/categories/packages");
    return {
      status: true,
      data: response.data,
      message: "Success"
    };
  } catch (error) {
    console.error('Error fetching package categories:', error);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch package categories"
    };
  }
};

export const getEventCategories = async () => {
  try {
    const response = await apiServerMiddleware.get("/categories/events");
    return {
      status: true,
      data: response.data,
      message: "Success"
    };
  } catch (error) {
    console.error('Error fetching event categories:', error);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch event categories"
    };
  }
};

// Get current data for home page
export const getCurrentHomeData = async () => {
  try {
    const response = await apiServerMiddleware.get("/home/current-data");
    return {
      message: "Home page data fetched successfully",
      data: response.data,
      status: true
    };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return {
      status: false,
      data: {},
      message: error.message || "Failed to fetch home page data"
    };
  }
};

export const getTrendingPackages = async () => {
  try {
    const response = await apiServerMiddleware.get("/trending-packages");
    return normalizeListData(response.data);
  } catch (error) {
    console.error('Error fetching trending packages:', error);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch trending packages"
    };
  }
};

export const getTrendingEvents = async () => {
  try {
    const response = await apiServerMiddleware.get("/trending-events");
    return normalizeListData(response.data);
  } catch (error) {
    console.error('Error fetching trending events:', error);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch trending events"
    };
  }
};

export const getTrendingAttractions = async () => {
  try {
    const response = await apiServerMiddleware.get("/trending-attractions");
    return normalizeListData(response.data);
  } catch (error) {
    console.error('Error fetching trending attractions:', error);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch trending attractions"
    };
  }
};

export const getHomeData = async () => {
  try {
    const response = await apiServerMiddleware.get("/home-data");
    return normalizeObjectData(response.data);
  } catch (error) {
    console.error('Error fetching home data:', error);
    return {
      status: false,
      data: {},
      message: error.message || "Failed to fetch home data"
    };
  }
};


