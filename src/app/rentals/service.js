import apiServerMiddleware from "../api/serverMiddleware";

export const getRentals = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search && String(filters.search).trim()) params.append("search", String(filters.search).trim());
    // Date filter: backend will exclude rentals already booked/blocked on that date.
    if (filters.date && /^\d{4}-\d{2}-\d{2}$/.test(String(filters.date))) params.append("date", String(filters.date));
    const hasCoords =
      filters.latitude !== "" &&
      filters.latitude !== undefined &&
      filters.latitude !== null &&
      filters.longitude !== "" &&
      filters.longitude !== undefined &&
      filters.longitude !== null;
    // If we have coordinates, prefer radius-based filtering over string matching (so nearby vehicles show up).
    if (!hasCoords && filters.location && String(filters.location).trim()) {
      params.append("location", String(filters.location).trim());
    }
    if (filters.latitude !== "" && filters.latitude !== undefined && filters.latitude !== null) params.append("latitude", String(filters.latitude));
    if (filters.longitude !== "" && filters.longitude !== undefined && filters.longitude !== null) params.append("longitude", String(filters.longitude));
    if (hasCoords) {
      const r = filters.radius_km !== undefined && filters.radius_km !== null && String(filters.radius_km) !== "" ? String(filters.radius_km) : "5";
      params.append("radius_km", r);
    }
    if (filters.category && String(filters.category).trim()) params.append("category", String(filters.category).trim()); // slug
    if (filters.sub_category && String(filters.sub_category).trim()) params.append("sub_category", String(filters.sub_category).trim()); // slug
    if (filters.transmission && String(filters.transmission).trim()) params.append("transmission", String(filters.transmission).trim());
    if (filters.fuel_type && String(filters.fuel_type).trim()) params.append("fuel_type", String(filters.fuel_type).trim());
    if (filters.seats && String(filters.seats).trim()) params.append("seats", String(filters.seats).trim());
    if (filters.price_from !== "" && filters.price_from !== undefined && filters.price_from !== null) params.append("price_from", String(filters.price_from));
    if (filters.price_to !== "" && filters.price_to !== undefined && filters.price_to !== null) params.append("price_to", String(filters.price_to));
    if (filters.per_page) params.append("per_page", String(filters.per_page));

    const url = params.toString() ? `/rentals?${params.toString()}` : "/rentals";
    const response = await apiServerMiddleware.get(url);
    return response.data;
  } catch (error) {
    return {
      data: { data: [] },
      success: false,
      message: "Failed to fetch rentals",
    };
  }
};

export const getRentalCategories = async () => {
  try {
    const response = await apiServerMiddleware.get("/rental-categories");
    return response.data;
  } catch (error) {
    return { data: [], success: false, message: "Failed to fetch rental categories" };
  }
};

export const getRentalSubCategories = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.category && String(filters.category).trim()) params.append("category", String(filters.category).trim()); // category slug
    if (filters.category_id) params.append("category_id", String(filters.category_id));
    const url = params.toString() ? `/rental-sub-categories?${params.toString()}` : "/rental-sub-categories";
    const response = await apiServerMiddleware.get(url);
    return response.data;
  } catch (error) {
    return { data: [], success: false, message: "Failed to fetch rental sub categories" };
  }
};

export const getRentalDetails = async (id) => {
  try {
    const response = await apiServerMiddleware.get(`/rental-details/${id}`);
    return response.data;
  } catch (error) {
    return { data: null, success: false, message: "Failed to fetch rental details" };
  }
};

