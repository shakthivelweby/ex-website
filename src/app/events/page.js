import ClientWrapper from "./clientWrapper";
import { getEventCategories, getLanguages, list } from "./service";

export default async function Events({ searchParams }) {
  const allCategories = await getEventCategories();
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

  const eventsList = await list(filters);

  // Transform events data server-side for SSR based on actual API response
  const transformedEvents = eventsList?.data?.map((event) => ({
    id: event.id,
    title: event.name,
    date: event.starting_date,
    venue: event.location,
    type: event.event_category_master?.name || "",
    image: event.thumb_image || event.cover_image,
    price: (() => {
      if (event.event_days && event.event_days.length > 0) {
        const prices = event.event_days
          .flatMap((day) => day.event_ticket_prices)
          .map((price) => parseFloat(price.price))
          .filter((price) => !isNaN(price));

        if (prices.length > 0) {
          return Math.min(...prices);
        }
      }
      return 100;
    })(),
    eventDays: event.event_days || [],
    totalShows: (() => {
      if (event.event_days && event.event_days.length > 0) {
        return event.event_days.reduce(
          (total, day) => total + (day.event_shows?.length || 0),
          0
        );
      }
      return 0;
    })(),
    availableSlots: (() => {
      if (event.event_days && event.event_days.length > 0) {
        return event.event_days.reduce((total, day) => {
          const daySlots =
            day.event_ticket_prices?.reduce(
              (dayTotal, price) =>
                dayTotal + (price.available_slots || 0),
              0
            ) || 0;
          return total + daySlots;
        }, 0);
      }
      return 0;
    })(),
    dateRange: (() => {
      if (event.event_days && event.event_days.length > 0) {
        const dates = event.event_days.map((day) => day.date).sort();
        if (dates.length === 1) {
          return dates[0];
        } else {
          return `${dates[0]} to ${dates[dates.length - 1]}`;
        }
      }
      return event.starting_date || "";
    })(),
    promoted: true,
    interest_count: 245,
  })) || [];

  return (
    <ClientWrapper
      searchParams={searchParams}
      initialEvents={transformedEvents}
      initialCategories={allCategories?.data || []}
      initialLanguages={allLanguages?.data || []}
    />
  );
}