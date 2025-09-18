import apiMiddleware from "./api/apiMiddleware";
import apiServerMiddleware from "./api/serverMiddleware";

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
    const response = await apiServerMiddleware.get("/packages/featured");
    return {
      status: true,
      data: response.data,
      message: "Success"
    };
  } catch (error) {
    console.error('Error fetching featured packages:', error);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch featured packages"
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
    const response = await apiServerMiddleware.get("/destinations/popular");
    return {
      status: true,
      data: response.data,
      message: "Success"
    };
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
    return handleApiError(error, "Failed to fetch home page data");
  }
};


