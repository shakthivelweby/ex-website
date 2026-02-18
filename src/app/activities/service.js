import apiServerMiddleware from "../api/serverMiddleware";

// get all activity categories
export const getActivityCategories = async () => {
  try {
    const response = await apiServerMiddleware.get("/activity-categories");
    return response.data;
  } catch (error) {
    return {
      data: [],
      success: false,
      message: "Failed to fetch activity categories"
    };
  }
}

// get all locations
export const getActivityLocations = async () => {
  try {
    const response = await apiServerMiddleware.get("/activity-locations");
    return response.data;
  } catch (error) {
    return {
      data: [],
      success: false,
      message: "Failed to fetch activity locations"
    };
  }
}

// Helper function to parse date parameter
const parseDateParameter = (dateParam) => {
  if (!dateParam) return null;

  const today = new Date();

  switch (dateParam) {
    case "today":
      const todayDate = today.toISOString().split('T')[0];
      return todayDate;
    case "tomorrow":
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split('T')[0];
      return tomorrowDate;
    case "weekend":
      // Find next Saturday
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
      const weekend = new Date(today);
      weekend.setDate(today.getDate() + daysUntilSaturday);
      const weekendDate = weekend.toISOString().split('T')[0];
      return weekendDate;
    default:
      // If it's a custom date (YYYY-MM-DD format), return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return dateParam;
      }
      return null;
  }
};

export const list = async (filters = {}) => {
  return getActivities(filters);
}

// get activities with filters
export const getActivities = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.location && filters.location.trim()) {
      params.append("location", filters.location.trim());
    }
    if (filters.category && filters.category.trim()) {
      params.append("category", filters.category.trim());
    }

    if (filters.price_from && !isNaN(filters.price_from)) {
      params.append("price_from", filters.price_from);
    }
    if (filters.price_to && !isNaN(filters.price_to)) {
      params.append("price_to", filters.price_to);
    }

    // Rating filter not yet implemented in backend properly, but we can pass it
    // if (filters.rating && filters.rating.trim()) {
    //   params.append("rating", filters.rating.trim());
    // }

    if (filters.longitude && !isNaN(filters.longitude)) {
      params.append("longitude", filters.longitude);
    }
    if (filters.latitude && !isNaN(filters.latitude)) {
      params.append("latitude", filters.latitude);
    }

    // Parse and add date parameter
    if (filters.date && filters.date.trim()) {
      const parsedDate = parseDateParameter(filters.date);
      if (parsedDate) {
        params.append("date", parsedDate);
      }
    }

    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }

    const queryString = params.toString();
    const url = queryString ? `/activities?${queryString}` : "/activities";

    const response = await apiServerMiddleware.get(url);

    return response.data;
  } catch (error) {
    console.error("API call failed:", error);
    return {
      data: {
        data: [],
        pagination: {}
      },
      success: false,
      message: "Failed to fetch activities"
    };
  }
}

// get activity details by id
export const getActivityDetails = async (activityId) => {
  try {
    const response = await apiServerMiddleware.get(`/activity-details/${activityId}`);
    return response.data;
  } catch (error) {
    return {
      data: null,
      success: false,
      message: "Failed to fetch activity details"
    };
  }
}

// get activity gallery by id
export const getActivityGallery = async (activityId) => {
  try {
    const response = await apiServerMiddleware.get(`/activity-gallery/${activityId}`);
    return response.data;
  } catch (error) {
    return {
      data: [],
      success: false,
      message: "Failed to fetch activity gallery"
    };
  }
}

// Create activity booking
export const createActivityBooking = async (bookingData) => {
  const response = await apiServerMiddleware.post("/create-activity-booking", bookingData);
  return response.data;
}

// Create activity order (payment)
export const createActivityOrder = async (data) => {
  const response = await apiServerMiddleware.post("/create-activity-order", data);
  return response.data;
}

// Verify activity payment
export const verifyActivityPayment = async (data) => {
  const response = await apiServerMiddleware.post("/activity-payment-verify", data);
  return response.data;
}

// Payment failed
export const activityPaymentFailed = async (data) => {
  const response = await apiServerMiddleware.post("/activity-payment-failed", data);
  return response.data;
}
