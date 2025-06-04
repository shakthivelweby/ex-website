import apiMiddleware from "@/app/api/apiMiddleware";

export const getScheduledTrips = async (filters) => {
  const response = await apiMiddleware.get(
    `/scheduled-trips?startLongitude=${filters.longitude}&startLatitude=${filters.latitude}&selectedDate=${filters.selectedDate}&duration=${filters.duration}&pax=${filters.pax}&budget=${filters.budget}&destination=${filters.destination}`
  );
  return response.data;
};
