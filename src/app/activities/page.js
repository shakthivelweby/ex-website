import ClientWrapper from "./clientWrapper";
import { getActivityCategories, getActivityLocations, list, getActivities } from "./service";
import { formatTimeTo12Hour } from "@/utils/formatDate";

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Activities({ searchParams }) {
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

  // Fetch data with error handling
  let allCategories = { data: [] };
  let allLocations = { data: [] };
  let activitiesFromAPI = { data: { data: [] } };

  try {
    allCategories = await getActivityCategories();
  } catch (error) {
    console.error("Error fetching activity categories:", error);
  }

  try {
    allLocations = await getActivityLocations();
  } catch (error) {
    console.error("Error fetching activity locations:", error);
  }

  try {
    activitiesFromAPI = await getActivities(filters);
  } catch (error) {
    console.error("Error fetching activities list:", error);
  }

  const activitiesArray = activitiesFromAPI?.data?.data || [];

  

  
  // Transform activities data server-side for SSR based on actual API response
  const transformedActivities = activitiesArray.map((activity) => ({
    id: activity.id,
    title: activity.name,
    description: activity.description,
    location: activity.location,
    city: activity.city,
    type: activity.activity_category_master?.name || activity.category || "",
    image: activity.image || activity.thumb_image || activity.cover_image,
    price: (() => {
      const rt = activity.price?.rate_type;
      const base =
        rt === "full"
          ? Number(activity.price?.full_rate || 0)
          : rt === "pax"
          ? Number(activity.price?.adult_price || 0)
          : Number(activity.price?.full_rate || activity.price || 0);
      const admin = Math.max(0, Number(activity.price?.admin_charge ?? 0));
      const afterAdmin = base + (base * admin) / 100;
      return Math.round(afterAdmin * 100) / 100;
    })(),
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

