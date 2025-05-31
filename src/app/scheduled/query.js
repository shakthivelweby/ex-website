import { useQuery } from "@tanstack/react-query";
import { getScheduledTrips } from "../services/scheduled/service";

export const useScheduledTrips = (filters) => {
  return useQuery({
    queryKey: [
      "scheduled-trips",
      filters.latitude,
      filters.longitude,
      filters.selectedDate,
    ],
    queryFn: () => getScheduledTrips(filters),
    enabled:
      !!filters.latitude && !!filters.longitude && !!filters.selectedDate,
  });
};
