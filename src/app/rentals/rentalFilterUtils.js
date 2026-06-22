export const VEHICLE_CATEGORY_SLUG = "vehicles";

export function isVehicleCategorySlug(slug) {
  const s = String(slug || "").trim().toLowerCase();
  return !s || s === VEHICLE_CATEGORY_SLUG || s === "vehicle";
}

/** True when rental is a vehicle/bike listing (category slug or vehicle specs on item). */
export function isVehicleRental(rental) {
  const slug = String(rental?.category?.slug || "").trim().toLowerCase();
  if (slug === VEHICLE_CATEGORY_SLUG || slug === "vehicle") return true;
  if (rental?.transmission || rental?.fuel_type || rental?.seats) return true;
  const units = Array.isArray(rental?.units) ? rental.units : [];
  return units.some((u) => u?.transmission || u?.fuel_type || u?.seats);
}

/** Drop fuel/transmission/seats when filtering non-vehicle categories. */
export function normalizeRentalFilters(filters = {}) {
  const dateFrom =
    filters.date_from && /^\d{4}-\d{2}-\d{2}$/.test(String(filters.date_from))
      ? String(filters.date_from)
      : filters.date && /^\d{4}-\d{2}-\d{2}$/.test(String(filters.date))
        ? String(filters.date)
        : "";
  const dateTo =
    filters.date_to && /^\d{4}-\d{2}-\d{2}$/.test(String(filters.date_to))
      ? String(filters.date_to)
      : dateFrom;

  const base = {
    ...filters,
    date_from: dateFrom,
    date_to: dateTo && dateFrom && dateTo < dateFrom ? dateFrom : dateTo,
    date: "",
  };

  if (isVehicleCategorySlug(base.category)) {
    return base;
  }
  return {
    ...base,
    transmission: "",
    fuel_type: "",
    seats: "",
  };
}
