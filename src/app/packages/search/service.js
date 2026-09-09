import apiServerMiddleware from "@/app/api/serverMiddleware";

export function parseIdList(raw) {
  if (!raw) return [];
  const value = Array.isArray(raw) ? raw.join(",") : String(raw);
  const seen = new Set();

  return value
    .split(",")
    .map((part) => parseInt(part.trim(), 10))
    .filter((id) => {
      if (!Number.isFinite(id) || id <= 0 || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}

export function parseDestinationIds(raw) {
  return parseIdList(raw);
}

export function parseStateIds(raw) {
  return parseIdList(raw);
}

export const getPackagesByDestinations = async (filters = {}) => {
  const {
    destination_ids,
    state_ids,
    tour_type,
    suitable_id,
    sort_by_price,
    price_range_from,
    price_range_to,
    duration,
  } = filters;

  const ids = parseDestinationIds(destination_ids);
  const stateIds = parseStateIds(state_ids);
  if (ids.length === 0 && stateIds.length === 0 && !duration) {
    return { data: [] };
  }

  const response = await apiServerMiddleware.get("/packages", {
    params: {
      destination_ids: ids.length > 0 ? ids.join(",") : undefined,
      state_ids: stateIds.length > 0 ? stateIds.join(",") : undefined,
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
