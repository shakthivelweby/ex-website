import ClientWrapper from "@/app/events/[id]/clientWrapper";
import { eventInfo } from "./service";

const EventDetailPage = async ({ params }) => {
  const { id } = await params;
  const eventResponse = await eventInfo(id);

  if (!eventResponse?.data) {
    return <div>Event not found</div>;
  }

  const event = eventResponse.data;

  // Calculate lowest price from event days
  const lowestPrice = event.event_days?.reduce((lowestPrice, day) => {
    const dayPrices = day.event_ticket_prices?.map(ticket => parseFloat(ticket.price)) || [];
    if (dayPrices.length > 0) {
      const minDayPrice = Math.min(...dayPrices);
      return Math.min(lowestPrice, minDayPrice);
    }
    return lowestPrice;
  }, Infinity) || 0;

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
    time: event.event_days?.[0]?.event_shows?.[0]?.start_time || 'TBD',
    venue: event.location,
    venueAddress: event.address,
    price: lowestPrice > 0 ? `₹${lowestPrice}` : 'Price TBA',
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
    longitude: event.longitude
  };

  return <ClientWrapper eventDetails={eventDetails} />;
};

export default EventDetailPage;