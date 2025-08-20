import ClientWrapper from "@/app/events/[id]/clientWrapper";
import { eventInfo } from "./service";


const EventDetailPage = async ({ params }) => {
  const { id } = await params;
  const event = await eventInfo(id);
//   prepare data for client wrapper
console.log("event", event);

const lowestPrice = event.data.event_pricings.reduce((lowestPrice, pricing) => {
  const dayPrices = pricing.day_prices.map(day => parseFloat(day.price));
  const minDayPrice = Math.min(...dayPrices);
  return Math.min(lowestPrice, minDayPrice);
}, Infinity);


const eventDetails = {
    id: event.data.id,
    title: event.data.name,
    subtitle: 'Global Indoor Theme Park',
    tagline: '100+ REAL LIFE ROLE-PLAY PROFESSIONS',
    categories: ['Music Shows', 'Concerts'],
    date: new Date(event.data.starting_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) + ' - ' + new Date(event.data.ending_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}),
    time: '10:00 PM onwards',
    venue:  event.data.location,
    venueAddress: '3V98+PQC, Bandra Kurla Complex Rd, G Block BKC, MMRDA Area, Kalina, Bandra East, Mumbai, Maharashtra 400051, India',
    price: '₹ ' + lowestPrice,
    image: event.data.images[0].image,
    offer: 'Get 50% off up to ₹500',
    description: event.data.description,
    eventGuide: {
      duration: event.data.duration,
      ticketsNeeded: event.data.chargable_from + ' Yrs & above',
      entryAllowed: event.data.age_limit + ' Yrs & above',
      language: 'English',
      genres: 'Pop, Rock, Latin'
    },
    highlights: [
      'Interactive role-playing activities',
      'Safe and supervised environment',
      'Educational and fun experience',
      'Professional staff and mentors',
      'State-of-the-art facilities',
      'Real-life work environments'
    ],
    faqs: event.data.faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer
    })),
    terms: event.data.terms_and_conditions[0].description,
  };

 


  return <ClientWrapper eventDetails={eventDetails} />;
};

export default EventDetailPage;