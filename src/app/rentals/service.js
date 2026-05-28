import apiServerMiddleware from "../api/serverMiddleware";
import { normalizeRentalFilters } from "./rentalFilterUtils";

export const getRentals = async (filters = {}) => {
  try {
    const normalized = normalizeRentalFilters(filters);
    const params = new URLSearchParams();
    if (normalized.search && String(normalized.search).trim()) params.append("search", String(normalized.search).trim());
    if (normalized.date && /^\d{4}-\d{2}-\d{2}$/.test(String(normalized.date))) params.append("date", String(normalized.date));
    const hasCoords =
      normalized.latitude !== "" &&
      normalized.latitude !== undefined &&
      normalized.latitude !== null &&
      normalized.longitude !== "" &&
      normalized.longitude !== undefined &&
      normalized.longitude !== null;
    if (!hasCoords && normalized.location && String(normalized.location).trim()) {
      params.append("location", String(normalized.location).trim());
    }
    if (normalized.latitude !== "" && normalized.latitude !== undefined && normalized.latitude !== null) params.append("latitude", String(normalized.latitude));
    if (normalized.longitude !== "" && normalized.longitude !== undefined && normalized.longitude !== null) params.append("longitude", String(normalized.longitude));
    if (hasCoords) {
      const r = normalized.radius_km !== undefined && normalized.radius_km !== null && String(normalized.radius_km) !== "" ? String(normalized.radius_km) : "5";
      params.append("radius_km", r);
    }
    if (normalized.category && String(normalized.category).trim()) params.append("category", String(normalized.category).trim());
    if (normalized.sub_category && String(normalized.sub_category).trim()) params.append("sub_category", String(normalized.sub_category).trim());
    if (normalized.transmission && String(normalized.transmission).trim()) params.append("transmission", String(normalized.transmission).trim());
    if (normalized.fuel_type && String(normalized.fuel_type).trim()) params.append("fuel_type", String(normalized.fuel_type).trim());
    if (normalized.seats && String(normalized.seats).trim()) params.append("seats", String(normalized.seats).trim());
    if (normalized.price_from !== "" && normalized.price_from !== undefined && normalized.price_from !== null) params.append("price_from", String(normalized.price_from));
    if (normalized.price_to !== "" && normalized.price_to !== undefined && normalized.price_to !== null) params.append("price_to", String(normalized.price_to));
    params.append("per_page", String(normalized.per_page || 100));

    const response = await apiServerMiddleware.get(`/rentals?${params.toString()}`);
    const body = response.data;
    const items = body?.data?.data ?? (Array.isArray(body?.data) ? body.data : []);
    return {
      ...body,
      data: {
        ...(typeof body?.data === "object" && body?.data !== null && !Array.isArray(body.data) ? body.data : {}),
        data: items,
      },
      success: body?.status !== false,
    };
  } catch (error) {
    console.warn("[rentals] getRentals failed:", error?.message || error);
    return {
      data: { data: [] },
      success: false,
      message: error?.response?.data?.message || "Failed to fetch rentals",
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

