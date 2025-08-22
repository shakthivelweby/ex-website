import ClientWrapper from "@/app/events/[id]/clientWrapper";
import { eventInfo, getDetailsForBooking } from "./service";


const EventDetailPage = async ({ params }) => {
  const { id } = await params;
  const event = await eventInfo(id);
//   prepare data for client wrapper
console.log("event", event);

const lowestPrice = event.data.event_days.reduce((lowestPrice, day) => {
  const dayPrices = day.event_ticket_prices.map(ticket => parseFloat(ticket.price));
  const minDayPrice = Math.min(...dayPrices);
  return Math.min(lowestPrice, minDayPrice);
}, Infinity);

const eventDetails = {
    id: event.data.id,
    title: event.data.name,
    categories: [event.data.event_category_master.name],
    date: new Date(event.data.starting_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) + ' - ' + new Date(event.data.ending_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}),
    time: event.data.event_days[0]?.event_shows[0]?.start_time || 'TBD',
    venue: event.data.location,
    venueAddress: event.data.address,
    price: '₹ ' + lowestPrice,
    image: event.data.images[0]?.image,
    description: event.data.description,
    eventGuide: {
      duration: event.data.duration,
      ticketsNeeded: event.data.chargable_from + ' Yrs & above',
      entryAllowed: event.data.age_limit + ' Yrs & above',
      language: 'English',
      layout: event.data.layout,
      seatingArrangement: event.data.seating_arrangement,
      kidsFriendly: event.data.kids_friendly ? 'Yes' : 'No',
      petsFriendly: event.data.pets_friendly ? 'Yes' : 'No'
    },
    highlights: event.data.event_highlights.map((highlight) => highlight.highlights),
    faqs: event.data.faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer
    })),
    terms: event.data.terms_and_conditions[0]?.description || '',
    eventDays: event.data.event_days,
    freeBooking: event.data.free_booking,
    refundable: event.data.refundable,
    mapLink: event.data.map_link,
    latitude: event.data.latitude,
    longitude: event.data.longitude
  };

 


  return <ClientWrapper eventDetails={eventDetails} />;
};

export default EventDetailPage;