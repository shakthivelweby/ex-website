export const VEHICLE_CATEGORY_SLUG = "vehicles";

export function isVehicleCategorySlug(slug) {
  const s = String(slug || "").trim().toLowerCase();
  return !s || s === VEHICLE_CATEGORY_SLUG || s === "vehicle";
}

/** Drop fuel/transmission/seats when filtering non-vehicle categories. */
export function normalizeRentalFilters(filters = {}) {
  if (isVehicleCategorySlug(filters.category)) {
    return filters;
  }
  return {
    ...filters,
    transmission: "",
    fuel_type: "",
    seats: "",
  };
}
