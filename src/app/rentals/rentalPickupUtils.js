export const extractRentalPickupRows = (rental) => {
  if (!rental || typeof rental !== "object") return [];

  if (Array.isArray(rental.pickup_locations)) return rental.pickup_locations;
  if (Array.isArray(rental.pickupLocations)) return rental.pickupLocations;

  const nested = rental.data;
  if (nested && typeof nested === "object") {
    if (Array.isArray(nested.pickup_locations)) return nested.pickup_locations;
    if (Array.isArray(nested.pickupLocations)) return nested.pickupLocations;
  }

  return [];
};

export const normalizeRentalPickupOptions = (rental) => {
  const rows = extractRentalPickupRows(rental);
  const normalized = rows
    .map((row, index) => ({
      id: row.id ?? `loc-${index}`,
      name: String(row.name || "").trim(),
      latitude: row.latitude ?? "",
      longitude: row.longitude ?? "",
      is_primary: Boolean(row.is_primary),
    }))
    .filter((row) => row.name);

  if (normalized.length) {
    return normalized.sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  }

  const name = String(rental?.location || "").trim();
  if (!name) return [];

  return [
    {
      id: "primary",
      name,
      latitude: rental?.latitude ?? "",
      longitude: rental?.longitude ?? "",
      is_primary: true,
    },
  ];
};

export const findPickupOption = (options, name) => {
  const query = String(name || "").trim();
  if (!query) return null;
  return options.find((opt) => opt.name === query) || null;
};

export const getDefaultPickupOption = (options, preferredName) => {
  if (!Array.isArray(options) || !options.length) return null;
  return (
    findPickupOption(options, preferredName) ||
    options.find((opt) => opt.is_primary) ||
    options[0]
  );
};
