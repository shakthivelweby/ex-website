import apiMiddleware from "@/app/api/apiMiddleware";

export const getScheduledTrips = async (filters) => {
  // Clean and validate the filters
  const cleanFilters = {
    startLongitude: filters.longitude || '',
    startLatitude: filters.latitude || '',
    selectedDate: filters.selectedDate || '',
    country_id: filters.country_id || '',
    state_id: filters.state_id || '',
    destination_id: filters.destination_id || '',
    price_range_from: filters.budget_from || '',
    price_range_to: filters.budget_to || '',
    sort_by_price: filters.sort_by_price || '',
    duration: filters.duration || '',
    total_pax: filters.pax || ''
  };

  // if (cleanFilters.country_id == "") { 
  //   delete cleanFilters.country_id;
  // }else if (cleanFilters.state_id == "") { 
  //   delete cleanFilters.state_id;
  // }else if (cleanFilters.destination_id == "") { 
  //   delete cleanFilters.destination_id;
  // }

  // Convert all values to strings and remove any [object Object]
  const queryParams = new URLSearchParams();
  Object.entries(cleanFilters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const response = await apiMiddleware.get(`/scheduled-trips?${queryParams.toString()}`);
  return response.data;
};

export const getDestinations = async () => {
  const response = await apiMiddleware.get("/state-destinations");
  return response.data;
};

