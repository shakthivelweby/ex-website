import ClientWrapper from "./clientWrapper";
import { getActivityCategories, getActivityLocations, list, getActivities } from "./service";
import { formatTimeTo12Hour } from "@/utils/formatDate";

export default async function Activities({ searchParams }) {
  const allCategories = await getActivityCategories();

  // console.log("Page.js - allCategories.data:", allCategories?.data);
  
  const allLocations = await getActivityLocations();

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

  const activitiesList = await list(filters);
  
  // Test the new getActivities API
  const activitiesFromAPI = await getActivities(filters); 
  
  // Use the API data instead of mock data
  const activitiesArray = activitiesFromAPI?.data?.data || [];

  console.log("Server-side: Checking activities for start_time", activitiesArray);

  

  
  // Transform activities data server-side for SSR based on actual API response
  const transformedActivities = activitiesArray.map((activity) => ({
    id: activity.id,
    title: activity.name,
    description: activity.description,
    location: activity.location,
    city: activity.city,
    type: activity.activity_category_master?.name || activity.category || "",
    image: activity.image || activity.thumb_image || activity.cover_image,
    price: activity.price?.rate_type === "full" 
      ? activity.price?.full_rate 
      : activity.price?.rate_type === "pax" 
        ? activity.price?.adult_price 
        : activity.price?.full_rate || activity.price || 0,
    rating: activity.rating || 0,
    reviewCount: activity.review_count || 0,
    duration: formatTimeTo12Hour(activity.start_time) || "updating",
    bestTimeToVisit: activity.best_time_to_visit || "Morning",
    features: activity.features || [],
    promoted: activity.promoted || activity.popular === "1" || activity.recommended === "1" || false,
    popular: activity.popular === "1",
    recommended: activity.recommended === "1",
    interest_count: activity.interest_count || 0,
    openingHours: activity.opening_hours || "9:00 AM - 6:00 PM",
    address: activity.address || "",
    coordinates: {
      latitude: activity.latitude || 0,
      longitude: activity.longitude || 0,
    },
  })) || [];

  return (
    <ClientWrapper
      searchParams={resolvedSearchParams}
      initialActivities={transformedActivities}
      initialCategories={allCategories?.data || []}
      initialLocations={allLocations?.data || []}
    />
  );
}

