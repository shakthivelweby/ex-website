import { useQuery } from "@tanstack/react-query";
import { getScheduledTrips, getDestinations } from "./service";

export const useScheduledTrips = (filters, isInitialized = true) => {
  // Query should be enabled when selectedDate is set AND at least one destination filter is set
  const hasSelectedDate = Boolean(
    filters?.selectedDate != null && filters?.selectedDate !== ""
  );
  const hasDestinationFilter = Boolean(
    (filters?.country_id && filters?.country_id !== "") ||
      (filters?.state_id && filters?.state_id !== "") ||
      (filters?.destination_id && filters?.destination_id !== "")
  );

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
      filters.pax,
    ],
    queryFn: () => getScheduledTrips(filters),
    enabled: isInitialized && hasSelectedDate && hasDestinationFilter,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useDestinations = () => {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: () => getDestinations(),
  });
};
