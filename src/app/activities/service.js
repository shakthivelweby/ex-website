import apiServerMiddleware from "../api/serverMiddleware";
import apiMiddleware from "../api/apiMiddleware";
import { applyAdminCharge, applyDiscountOnAmount } from "@/utils/attractionPricing";

const PRICE_FILTER_MAX = 10000;

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

const applyClientSideFilters = (responseData, filters) => {
  if (!responseData?.data?.data) return responseData;

  let filteredActivities = responseData.data.data;

  if (filters.rating && !isNaN(parseFloat(filters.rating))) {
    const minRating = parseFloat(filters.rating);
    filteredActivities = filteredActivities.filter(
      (activity) => Number(activity.rating || 0) >= minRating
    );
  }

  const priceFrom = parseFloat(filters.price_from) || 0;
  const priceTo = parseFloat(filters.price_to) || Infinity;

  if (filters.price_from || filters.price_to) {
    filteredActivities = filteredActivities.filter((activity) => {
      if (
        activity.free_booking === true ||
        activity.free_booking === 1 ||
        activity.free_booking === "1"
      ) {
        return priceFrom <= 0;
      }

      const rt = activity.price?.rate_type;
      const adminPct = Number(activity.price?.admin_charge ?? 0);
      const discountPct = Number(activity.price?.discount ?? 0);
      const base =
        rt === "full"
          ? Number(activity.price?.full_rate || 0)
          : rt === "pax"
          ? Number(activity.price?.adult_price || 0)
          : Number(activity.price?.full_rate || activity.price || 0);
      const afterAdmin = applyAdminCharge(base, adminPct);
      const displayPrice = applyDiscountOnAmount(afterAdmin, discountPct);

      return displayPrice >= priceFrom && displayPrice <= priceTo;
    });
  }

  return {
    ...responseData,
    data: {
      ...responseData.data,
      data: filteredActivities,
    },
  };
};

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

    if (filters.price_from && !isNaN(filters.price_from) && filters.price_from !== "0") {
      params.append("price_from", filters.price_from);
    }
    if (filters.price_to && !isNaN(filters.price_to) && filters.price_to !== String(PRICE_FILTER_MAX)) {
      params.append("price_to", filters.price_to);
    }

    if (filters.rating && String(filters.rating).trim()) {
      params.append("rating", String(filters.rating).trim());
    }

    if (filters.longitude && !isNaN(filters.longitude)) {
      params.append("longitude", filters.longitude);
    }
    if (filters.latitude && !isNaN(filters.latitude)) {
      params.append("latitude", filters.latitude);
    }

    // Date range (or legacy single date)
    const dateFrom = filters.date_from || filters.dateFrom;
    const dateTo = filters.date_to || filters.dateTo;

    if (dateFrom) {
      const parsedFrom = parseDateParameter(dateFrom);
      if (parsedFrom) params.append("date_from", parsedFrom);
    }
    if (dateTo) {
      const parsedTo = parseDateParameter(dateTo);
      if (parsedTo) params.append("date_to", parsedTo);
    }
    if (!dateFrom && filters.date && filters.date.trim()) {
      const parsedDate = parseDateParameter(filters.date);
      if (parsedDate) params.append("date", parsedDate);
    }

    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }

    const queryString = params.toString();
    const url = queryString ? `/activities?${queryString}` : "/activities";

    const response = await apiServerMiddleware.get(url);

    return applyClientSideFilters(response.data, filters);
  } catch (error) {
    console.error("API call failed:", error);
    try {
      const fallbackResponse = await apiServerMiddleware.get("/activities");
      return applyClientSideFilters(fallbackResponse.data, filters);
    } catch (fallbackError) {
      return {
        data: {
          data: [],
          pagination: {},
        },
        success: false,
        message: "Failed to fetch activities",
      };
    }
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

// get activity ticket prices for a date
export const getActivityTicketPrices = async (activityId, date) => {
  try {
    const response = await apiServerMiddleware.get(`/activity-ticket-prices/${activityId}`, {
      params: { date },
    });
    return response.data;
  } catch (error) {
    return {
      data: null,
      success: false,
      message: "Failed to fetch activity ticket prices",
    };
  }
};

// Create activity booking
export const createActivityBooking = async (bookingData) => {
  const response = await apiMiddleware.post("/create-activity-booking", bookingData);
  return response.data;
}

// Create activity order (payment)
export const createActivityOrder = async (data) => {
  const response = await apiMiddleware.post("/create-activity-order", data);
  return response.data;
}

// Verify activity payment
export const verifyActivityPayment = async (data) => {
  const response = await apiMiddleware.post("/activity-payment-verify", data, {
    timeout: 60000,
  });
  return response.data;
}

// Payment failed
export const activityPaymentFailed = async (data) => {
  const response = await apiMiddleware.post("/activity-payment-failed", data);
  return response.data;
}
