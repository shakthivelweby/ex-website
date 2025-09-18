import { useQuery } from "@tanstack/react-query";
import { getScheduledTrips, getDestinations } from "./service";

export const useScheduledTrips = (filters) => {
  return useQuery({
    queryKey: [
      "scheduled-trips",
      filters.latitude,
      filters.longitude,
      filters.selectedDate,
      filters.country_id,
      filters.state_id,
      filters.destination_id,
      filters.budget_from,
      filters.budget_to,
      filters.sort_by_price,
      filters.duration,
      filters.pax
    ],
    queryFn: () => getScheduledTrips(filters),
    enabled: Boolean(
      filters?.latitude != null && 
      filters?.longitude != null && 
      filters?.selectedDate != null
    ),
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
};

export const useDestinations = () => {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: () => getDestinations(),
  });
};