import ClientWrapper from "./clientWrapper";
import { getAttractionCategories, getAttractionLocations, list } from "./service";

export default async function Attractions({ searchParams }) {
  const allCategories = await getAttractionCategories();
  const allLocations = await getAttractionLocations();

  // Await searchParams before accessing its properties
  const resolvedSearchParams = await searchParams;

  // Extract filters from search params
  const filters = {
    date: resolvedSearchParams.date || "",
    location: resolvedSearchParams.location || "",
    category: resolvedSearchParams.category || "",
    rating: resolvedSearchParams.rating || "",
    price_from: resolvedSearchParams.price_from || "",
    price_to: resolvedSearchParams.price_to || "",
    longitude: resolvedSearchParams.longitude || "",
    latitude: resolvedSearchParams.latitude || "",
  };

  const attractionsList = await list(filters);

  // Transform attractions data server-side for SSR based on actual API response
  const transformedAttractions = attractionsList?.data?.map((attraction) => ({
    id: attraction.id,
    title: attraction.name,
    description: attraction.description,
    location: attraction.location,
    city: attraction.city,
    type: attraction.attraction_category_master?.name || "",
    image: attraction.thumb_image || attraction.cover_image,
    price: attraction.price || 0,
    rating: attraction.rating || 0,
    reviewCount: attraction.review_count || 0,
    duration: attraction.duration || "2-3 hours",
    bestTimeToVisit: attraction.best_time_to_visit || "Morning",
    features: attraction.features || [],
    promoted: attraction.promoted || false,
    interest_count: attraction.interest_count || 0,
    openingHours: attraction.opening_hours || "9:00 AM - 6:00 PM",
    address: attraction.address || "",
    coordinates: {
      latitude: attraction.latitude || 0,
      longitude: attraction.longitude || 0,
    },
  })) || [];

  return (
    <ClientWrapper
      searchParams={resolvedSearchParams}
      initialAttractions={transformedAttractions}
      initialCategories={allCategories?.data || []}
      initialLocations={allLocations?.data || []}
    />
  );
}
