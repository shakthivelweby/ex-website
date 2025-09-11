import ClientWrapper from "./clientWrapper";
import { getAttractionCategories, getLanguages, list } from "./service";

export default async function Attractions({ searchParams }) {
  const allCategories = await getAttractionCategories();
  const allLanguages = await getLanguages();

  // Extract filters from search params
  const filters = {
    date: searchParams.date || "",
    language: searchParams.language || "",
    category: searchParams.category || "",
    price_from: searchParams.price_from || "",
    price_to: searchParams.price_to || "",
    longitude: searchParams.longitude || "",
    latitude: searchParams.latitude || "",
  };

  const attractionsList = await list(filters);

  // Transform attractions data server-side for SSR based on actual API response
  const transformedAttractions = attractionsList?.data?.map((attraction) => ({
    id: attraction.id,
    title: attraction.name,
    date: attraction.opening_date,
    venue: attraction.location,
    type: attraction.attraction_category_master?.name || "",
    image: attraction.thumb_image || attraction.cover_image,
    price: (() => {
      if (attraction.attraction_prices && attraction.attraction_prices.length > 0) {
        const prices = attraction.attraction_prices
          .map((price) => parseFloat(price.price))
          .filter((price) => !isNaN(price));

        if (prices.length > 0) {
          return Math.min(...prices);
        }
      }
      return 150;
    })(),
    attractionPrices: attraction.attraction_prices || [],
    totalSlots: (() => {
      if (attraction.attraction_prices && attraction.attraction_prices.length > 0) {
        return attraction.attraction_prices.reduce(
          (total, price) => total + (price.available_slots || 0),
          0
        );
      }
      return 0;
    })(),
    availableSlots: (() => {
      if (attraction.attraction_prices && attraction.attraction_prices.length > 0) {
        return attraction.attraction_prices.reduce(
          (total, price) => total + (price.available_slots || 0),
          0
        );
      }
      return 0;
    })(),
    duration: attraction.duration || "2-3 hours",
    rating: attraction.rating || 4.5,
    promoted: true,
    interest_count: 180,
  })) || [];

  return (
    <ClientWrapper
      searchParams={searchParams}
      initialAttractions={transformedAttractions}
      initialCategories={allCategories?.data || []}
      initialLanguages={allLanguages?.data || []}
    />
  );
}
