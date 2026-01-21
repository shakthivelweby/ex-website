import apiMiddleware from "@/app/api/apiMiddleware";

export const getScheduledTrips = async (filters) => {
  // Build query parameters - only include non-empty values
  const queryParams = new URLSearchParams();

  // selectedDate is required
  if (filters.selectedDate) {
    queryParams.append('selectedDate', filters.selectedDate);
  }

  // Destination filters - only include one (country_id, state_id, or destination_id)
  if (filters.destination_id) {
    queryParams.append('destination_id', filters.destination_id);
  } else if (filters.state_id) {
    queryParams.append('state_id', filters.state_id);
  } else if (filters.country_id) {
    queryParams.append('country_id', filters.country_id);
  }

  // Price range filters
  if (filters.budget_from) {
    queryParams.append('price_range_from', filters.budget_from);
  }
  if (filters.budget_to) {
    queryParams.append('price_range_to', filters.budget_to);
  }

  // Sort by price - ensure it's a valid value
  if (filters.sort_by_price && (filters.sort_by_price === 'asc' || filters.sort_by_price === 'desc')) {
    queryParams.append('sort_by_price', filters.sort_by_price);
  }

  // Duration filter
  if (filters.duration) {
    queryParams.append('duration', filters.duration);
  }

  // Total pax filter
  if (filters.pax) {
    queryParams.append('total_pax', filters.pax);
  }

  // Location filters - only include if both are provided
  if (filters.longitude && filters.latitude) {
    queryParams.append('startLongitude', filters.longitude);
    queryParams.append('startLatitude', filters.latitude);
  }

  const response = await apiMiddleware.get(`/scheduled-trips?${queryParams.toString()}`);
  return response.data;
};

export const getDestinations = async () => {
  const response = await apiMiddleware.get("/state-destinations");
  return response.data;
};

export const getEarliestAvailableDate = async (filters) => {
  // Build query parameters - only include destination filters
  const queryParams = new URLSearchParams();

  // Destination filters - only include one (country_id, state_id, or destination_id)
  if (filters.destination_id) {
    queryParams.append('destination_id', filters.destination_id);
  } else if (filters.state_id) {
    queryParams.append('state_id', filters.state_id);
  } else if (filters.country_id) {
    queryParams.append('country_id', filters.country_id);
  }

  // Duration filter
  if (filters.duration) {
    queryParams.append('duration', filters.duration);
  }

  // Total pax filter
  if (filters.pax) {
    queryParams.append('total_pax', filters.pax);
  }

  const response = await apiMiddleware.get(`/earliest-available-date?${queryParams.toString()}`);
  return response.data;
};

