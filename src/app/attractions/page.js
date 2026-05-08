import ClientWrapper from "./clientWrapper";
import { getAttractionCategories, getAttractionLocations, getAttractions } from "./service";
import { formatTimeTo12Hour } from "@/utils/formatDate";

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
 
  const attractionsFromAPI = await getAttractions(filters);
  
  // Use the API data instead of mock data
  const attractionsArray = attractionsFromAPI?.data?.data || [];
 
  // Transform attractions data server-side for SSR based on actual API response
  const transformedAttractions = attractionsArray.map((attraction) => ({
    // Admin flags may come as "1"/"0" strings, integers, or booleans depending on API serialization
    popular: attraction.popular === "1" || attraction.popular === 1 || attraction.popular === true,
    recommended:
      attraction.recommended === "1" ||
      attraction.recommended === 1 ||
      attraction.recommended === true,
    id: attraction.id,
    title: attraction.name,
    description: attraction.description,
    location: attraction.location,
    city: attraction.city,
    type: attraction.attraction_category_master?.name || attraction.category || "",
    image: attraction.image || attraction.thumb_image || attraction.cover_image,
    price: (() => {
      const rt = attraction.price?.rate_type;
      const base =
        rt === "full"
          ? Number(attraction.price?.full_rate || 0)
          : rt === "pax"
          ? Number(attraction.price?.adult_price || 0)
          : Number(attraction.price?.full_rate || attraction.price || 0);
      const admin = Math.max(0, Number(attraction.price?.admin_charge ?? 0));
      const afterAdmin = base + (base * admin) / 100;
      return Math.round(afterAdmin * 100) / 100;
    })(),
    rating: attraction.rating || 0,
    reviewCount: attraction.review_count || 0,
    duration: formatTimeTo12Hour(attraction.start_time) || "updating",
    bestTimeToVisit: attraction.best_time_to_visit || "Morning",
    features: attraction.features || [],
    promoted:
      attraction.promoted ||
      attraction.popular === "1" ||
      attraction.popular === 1 ||
      attraction.popular === true ||
      attraction.recommended === "1" ||
      attraction.recommended === 1 ||
      attraction.recommended === true ||
      false,
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
