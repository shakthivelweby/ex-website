import { useQuery } from "@tanstack/react-query";
import { getScheduledTrips, getDestinations } from "./service";

export const useScheduledTrips = (filters) => {
  return useQuery({
    queryKey: [
      "scheduled-trips",
      filters.latitude,
      filters.longitude,
      filters.selectedDate,
      filters.destination,
      filters.budget_from,
      filters.budget_to,
      filters.sort_by_price,
      filters.duration,
      filters.pax
    ],
    queryFn: () => getScheduledTrips(filters),
    enabled:
      !!filters.latitude && !!filters.longitude && !!filters.selectedDate,
  });
};

export const useDestinations = () => {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: () => getDestinations(),
  });
};