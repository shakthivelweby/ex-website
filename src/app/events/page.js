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

  // Transform events data server-side for SSR
  const transformedEvents = eventsList && eventsList.data && eventsList.data.length
    ? eventsList.data.map((event) => ({
      id: event.id,
      title: event.name,
      date: event.starting_date,
      venue: event.location,
      type: "",
      thumImage: event.thumb_image,
      coverImage: event.cover_image,
      price: 100,
      promoted: true,
      interest_count: 245,
    }))
    : [];

  return (
    <ClientWrapper
      allCategories={allCategories}
      allLanguages={allLanguages}
      list={eventsList}
      transformedEvents={transformedEvents}
    />
  );
}