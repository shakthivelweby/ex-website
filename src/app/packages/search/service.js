import apiServerMiddleware from "@/app/api/serverMiddleware";

export function parseDestinationIds(raw) {
  if (!raw) return [];
  const value = Array.isArray(raw) ? raw.join(",") : String(raw);
  return value
    .split(",")
    .map((part) => parseInt(part.trim(), 10))
    .filter((id) => Number.isFinite(id) && id > 0);
}

export const getPackagesByDestinations = async (filters = {}) => {
  const {
    destination_ids,
    tour_type,
    suitable_id,
    sort_by_price,
    price_range_from,
    price_range_to,
    duration,
  } = filters;

  const ids = parseDestinationIds(destination_ids);
  if (ids.length === 0 && !duration) {
    return { data: [] };
  }

  const response = await apiServerMiddleware.get("/packages", {
    params: {
      destination_ids: ids.length > 0 ? ids.join(",") : undefined,
      tour_type: tour_type || undefined,
      suitable_id: suitable_id || undefined,
      sort_by_price: sort_by_price || undefined,
      price_range_from: price_range_from || undefined,
      price_range_to: price_range_to || undefined,
      duration: duration || undefined,
    },
  });

  return response.data;
};

export const getAllDestinations = async () => {
  const response = await apiServerMiddleware.get("/state-destinations");
  return response.data;
};

export const getSuitableMasters = async () => {
  const response = await apiServerMiddleware.get("/suitable-masters");
  return response.data;
};
