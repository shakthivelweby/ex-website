import { useQuery } from "@tanstack/react-query";
import { searchService } from "./service";
import { getFeaturedDestinations } from "../explore/service";

export const useSearch = (searchQuery) => {
  return useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => searchService.search(searchQuery),
    enabled: !!searchQuery,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFeaturedDestinations = () => {
  return useQuery({
    queryKey: ["featured-destinations"],
    queryFn: getFeaturedDestinations,
  });
};

export const useAllDestinations = (enabled = true) => {
  return useQuery({
    queryKey: ["all-destinations"],
    queryFn: () => searchService.getAllDestinations(),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
};

export const useSuitableMasters = (enabled = true) => {
  return useQuery({
    queryKey: ["suitable-masters"],
    queryFn: () => searchService.getSuitableMasters(),
    enabled,
    staleTime: 1000 * 60 * 30,
  });
};

export const useEventCategories = (enabled = true) => {
  return useQuery({
    queryKey: ["event-categories"],
    queryFn: () => searchService.getEventCategories(),
    enabled,
    staleTime: 1000 * 60 * 30,
  });
};

export const useEventLanguages = (enabled = true) => {
  return useQuery({
    queryKey: ["event-languages"],
    queryFn: () => searchService.getEventLanguages(),
    enabled,
    staleTime: 1000 * 60 * 30,
  });
};

export const useAttractionCategories = (enabled = true) => {
  return useQuery({
    queryKey: ["attraction-categories"],
    queryFn: () => searchService.getAttractionCategories(),
    enabled,
    staleTime: 1000 * 60 * 30,
  });
};

export const useActivityCategories = (enabled = true) => {
  return useQuery({
    queryKey: ["activity-categories"],
    queryFn: () => searchService.getActivityCategories(),
    enabled,
    staleTime: 1000 * 60 * 30,
  });
};

export const useRentalCategories = (enabled = true) => {
  return useQuery({
    queryKey: ["rental-categories"],
    queryFn: () => searchService.getRentalCategories(),
    enabled,
    staleTime: 1000 * 60 * 30,
  });
};