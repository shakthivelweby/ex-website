import ActivityDetailClient from "./clientWrapper";
import { getActivityDetails, getActivityGallery } from "../service";

// Dummy/Mock Activity Data for testing
const getDummyActivityData = (id) => {
  const dummyActivities = {
    1: {
      id: 1,
      name: "River Rafting Adventure",
      description: `<p>Experience the thrill of white water rafting...</p>`,
      location: "Jammu and Kashmir",
      city: "Jammu and Kashmir",
      address: "Rishikesh, Jammu and Kashmir, India",
      activity_category_master: { name: "Adventure Sports", slug: "adventure-sports" },
      cover_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200",
      thumb_image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      price: { rate_type: "pax", adult_price: 2500, full_rate: 2500 },
      rating: 4.8,
      review_count: 342,
      start_time: "09:00:00",
      duration: "2-3 hours",
      best_time_to_visit: "Morning (6 AM - 10 AM)",
      opening_hours: "9:00 AM - 6:00 PM",
      features: ["Safety Equipment", "Expert Guide", "Photography", "Refreshments", "Certificate"],
      activity_highlights: [],
      faqs: [],
      terms_and_conditions: [],
      latitude: 30.0869,
      longitude: 78.2676,
      map_link: "",
      promoted: true,
      popular: "1",
      recommended: "0"
    },
    // Add other dummies or keep minimal for fallback
  };
  return dummyActivities[id] || dummyActivities[1];
};

const ActivityDetailPage = async ({ params }) => {
  const { id } = await params;
  const activityResponse = await getActivityDetails(id);
  const galleryResponse = await getActivityGallery(id);

  // Extract data from backend response structure: { success, data: { activity, current_pricing, ... } }
  let activityData = activityResponse?.data;
  let activity = activityData?.activity;

  // Fallback to dummy if API fails
  if (!activity) {
    console.log("API failed or returned no data, using dummy content");
    activity = getDummyActivityData(parseInt(id) || 1);
  }

  // Gallery
  let gallery = galleryResponse?.data || [];
  // If no API gallery, maybe use dummy or activity images?
  // Let's rely on API responding with empty array if no gallery.

  // Best Price (from lowest option or current_pricing from controller)
  let bestPrice = 0;
  if (activityData?.current_pricing) {
    if (activityData.current_pricing.rate_type === 'full') {
      bestPrice = activityData.current_pricing.full_rate;
    } else {
      bestPrice = activityData.current_pricing.adult_price;
    }
  } else if (activity.price) {
    // Checking if activity.price is object from dummy or direct from API (API doesn't return price object directly on activity, but dummy does)
    if (activity.price.rate_type) {
      bestPrice = activity.price.rate_type === 'full' ? activity.price.full_rate : activity.price.adult_price;
    }
  }

  // Format time helper
  const formatTime = (timeString) => {
    if (!timeString) return "TBD";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    } catch {
      return "TBD";
    }
  };

  // Map Ticket Options
  // API returns activity.activity_ticket_types with attached current_price
  const ticketOptions = activity.activity_ticket_types ? activity.activity_ticket_types.map(ticket => {
    const priceObj = ticket.current_price;
    const rateType = priceObj?.rate_type || 'pax';
    const price = rateType === 'full' ? priceObj?.full_rate : priceObj?.adult_price;

    return {
      id: ticket.id,
      type: ticket.name, // or ticket_type_label
      name: ticket.name,
      description: ticket.description,
      price: price || 0,
      originalPrice: 0, // Backend doesn't seem to have original price separate yet
      rateType: rateType,
      child_price: priceObj?.child_price || 0,
      features: [], // derived from inclusions?
      briefDetails: ticket.description,
      inclusion: ticket.inclusions ? ticket.inclusions.map(i => i.name) : [],
      exclusion: ticket.exclusions ? ticket.exclusions.map(e => e.name) : [],
      itinerary: ticket.itineraries ? ticket.itineraries.map(step => `<div><strong>${step.title}</strong>: ${step.description}</div>`).join('') : '',
      cancellationPolicy: '', // Placeholder or specific policy
    };
  }) : [];

  const activityDetails = {
    id: activity.id,
    title: activity.name,
    categories: [activity.activity_category?.name || "Activity"],
    location: activity.location || activity.city,
    address: activity.address || "",
    price: bestPrice > 0 ? `₹${bestPrice}` : 'Price TBA',
    image: activity.cover_image || activity.thumb_image || activity.image,
    description: activity.description || "",
    activityGuide: {
      duration: activity.duration ? `${activity.duration} hours` : 'TBD', // Assuming duration is int hours
      startTime: formatTime(activity.start_time), // Assuming start_time exists
      bestTimeToVisit: activity.best_time_to_visit || 'TBD',
      openingHours: activity.opening_hours || 'TBD',
    },
    features: activity.features || [], // API might not return features array directly ?
    highlights: activity.activity_highlights?.map((highlight) => highlight.highlights) || [],
    faqs: activity.faqs?.map((faq) => ({
      question: faq.question,
      answer: faq.answer
    })) || [],
    terms: activity.terms_and_conditions?.[0]?.description || '',
    rating: activity.rating || 0,
    reviewCount: activity.review_count || 0,
    latitude: activity.latitude,
    longitude: activity.longitude,
    mapLink: activity.map_link,
    gallery: gallery.length > 0 ? gallery : (activity.gallery_images || []), // activity.gallery_images from with('galleryImages')
    promoted: activity.promoted || false,
    popular: activity.popular === "1" || activity.popular === 1,
    recommended: activity.recommended === "1" || activity.recommended === 1,
    ticketOptions: ticketOptions.length > 0 ? ticketOptions : [],
  };

  return <ActivityDetailClient activityDetails={activityDetails} />;
};

export default ActivityDetailPage;
