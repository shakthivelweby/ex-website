import EventDetailClient from "./clientWrapper";
import { eventInfo, getEventGallery } from "./service";

const EventDetailPage = async ({ params }) => {
  const { id } = await params;
  const eventResponse = await eventInfo(id);
  const galleryResponse = await getEventGallery(id);

  const getGalleryData = galleryResponse?.data?.event_images 



  //console.log('Gallery Data new :', getGalleryData);



  if (!eventResponse?.data) {
    return <div>Event not found</div>;
  }

  const event = eventResponse.data;

  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== "string") return null;
    const [hours, minutes] = timeString.split(":");
    if (!hours || !minutes) return null;
    const hour = Number.parseInt(hours, 10);
    if (Number.isNaN(hour)) return null;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Calculate lowest displayed unit for detail page.
  // Detail page: show base + admin charge only (no discount here).
  const allPrices =
    event.event_days
      ?.flatMap((day) => day?.event_ticket_prices || [])
      .map((t) => {
        const base = Number.parseFloat(t?.price);
        const admin = Math.max(0, Number.parseFloat(t?.admin_charge ?? 0));
        if (!Number.isFinite(base) || base <= 0) return null;
        const afterAdmin = base + (base * admin) / 100;
        return Math.round(afterAdmin * 100) / 100;
      })
      .filter((p) => Number.isFinite(p) && p > 0) || [];

  const lowestPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;

  // Compute a friendly time label from shows (earliest start time)
  const allStartTimes =
    event.event_days
      ?.flatMap((day) => day?.event_shows || [])
      .map((s) => s?.start_time)
      .filter(Boolean) || [];

  const uniqueFormattedTimes = Array.from(
    new Set(allStartTimes.map((t) => formatTime(t)).filter(Boolean))
  );

  const timeLabel =
    uniqueFormattedTimes.length === 0
      ? "TBD"
      : uniqueFormattedTimes.length === 1
      ? uniqueFormattedTimes[0]
      : `${uniqueFormattedTimes[0]} +${uniqueFormattedTimes.length - 1} more`;




  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date TBA";
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return "Date TBA";
    }
  };

  const eventDetails = {
    id: event.id,
    title: event.name,
    categories: [event.event_category_master?.name || "Event"],
    date: event.ending_date 
      ? `${formatDate(event.starting_date)} - ${formatDate(event.ending_date)}`
      : formatDate(event.starting_date),
    time: timeLabel,
    venue: event.location,
    venueAddress: event.address,
    price: lowestPrice ? `₹${lowestPrice}` : "Price TBA",
    image: event.cover_image || event.thumb_image,
    description: event.description,
    eventGuide: {
      duration: event.duration || 'TBD',
      ticketsNeeded: event.chargable_from ? `${event.chargable_from} Yrs & above` : 'TBD',
      entryAllowed: event.age_limit ? `${event.age_limit} Yrs & above` : 'TBD',
      language: 'English',
      layout: event.layout || 'TBD',
      seatingArrangement: event.seating_arrangement || 'TBD',
      kidsFriendly: event.kids_friendly ? 'Yes' : 'No',
      petsFriendly: event.pets_friendly ? 'Yes' : 'No'
    },
    highlights: event.event_highlights?.map((highlight) => highlight.highlights) || [],
    faqs: event.faqs?.map((faq) => ({
      question: faq.question,
      answer: faq.answer
    })) || [],
    terms: event.terms_and_conditions?.[0]?.description || '',
    eventDays: event.event_days || [],
    freeBooking: event.free_booking,
    refundable: event.refundable,
    mapLink: event.map_link,
    latitude: event.latitude,
    longitude: event.longitude,
    gallery: getGalleryData || []
  };

  return <EventDetailClient eventDetails={eventDetails} />;
};

export default EventDetailPage;