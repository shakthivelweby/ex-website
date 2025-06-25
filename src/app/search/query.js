import { useQuery } from "@tanstack/react-query";
import { searchService } from "./service";
import { getFeaturedDestinations } from "../explore/service";

export const useSearch = (searchQuery) => {
  return useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => searchService.search(searchQuery),
    enabled: !!searchQuery && searchQuery.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFeaturedDestinations = () => {
  return useQuery({
    queryKey: ["featured-destinations"],
    queryFn: getFeaturedDestinations,
  });
}; 