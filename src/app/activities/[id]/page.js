import ActivityDetailClient from "./clientWrapper";
import { getActivityDetails, getActivityGallery } from "../service";

// Force dynamic rendering to prevent build-time API calls
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ActivityDetailPage = async ({ params }) => {
  const { id } = await params;
  let activityResponse = null;
  let galleryResponse = null;

  try {
    activityResponse = await getActivityDetails(id);
  } catch (error) {
    console.error("Error fetching activity details:", error);
  }

  try {
    galleryResponse = await getActivityGallery(id);
  } catch (error) {
    console.error("Error fetching activity gallery:", error);
  }

  // Extract data from backend response structure: { success, data: { activity, current_pricing, ... } }
  let activityData = activityResponse?.data;
  let activity = activityData?.activity;

  if (!activity) {
    return <div>Activity not found</div>;
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

  // Detail page display: base ticket price only (admin charge is informational).
  const applyAdminOnly = (amountRaw, adminRaw) => {
    const amount = Number(amountRaw || 0);
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    return Math.round(amount * 100) / 100;
  };

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
  const ticketOptions = Array.isArray(activity.activity_ticket_types)
    ? activity.activity_ticket_types.map((ticket) => {
    const priceObj = ticket.current_price;
    const rateType = priceObj?.rate_type || 'pax';
    const base = rateType === 'full' ? priceObj?.full_rate : priceObj?.adult_price;
    const adminPct =
      priceObj?.admin_charge ??
      priceObj?.admin_charge_percentage ??
      priceObj?.adminCharge ??
      0;
    const priceWithAdmin = applyAdminOnly(base || 0, adminPct);

    return {
      id: ticket.id,
      type: ticket.name, // or ticket_type_label
      name: ticket.name,
      description: ticket.description,
      // Keep raw/base prices for comparisons + selection (do NOT include admin here).
      price: Number(base || 0),
      // Convenience field for UI when we want base+admin (detail page "starting from").
      price_with_admin: priceWithAdmin || 0,
      originalPrice: 0, // Backend doesn't seem to have original price separate yet
      rateType: rateType,
      child_price: priceObj?.child_price || 0,
      discount: priceObj?.discount ?? priceObj?.discount_percentage ?? priceObj?.discountPercent ?? 0,
      admin_charge: adminPct,
      guide_rate: priceObj?.guide_rate ?? 0,
      features: [], // derived from inclusions?
      briefDetails: ticket.description,
      inclusions: Array.isArray(ticket.inclusions) ? ticket.inclusions.map((i) => i.inclusion).filter(Boolean) : [],
      exclusions: Array.isArray(ticket.exclusions) ? ticket.exclusions.map((e) => e.exclusion).filter(Boolean) : [],
      itineraries: Array.isArray(ticket.itineraries)
        ? ticket.itineraries.map((s) => ({
            step_number: s.step_number,
            title: s.title,
            time: s.time,
            description: s.description,
          }))
        : [],
      cancellationPolicy: '', // Placeholder or specific policy
    };
  })
    : [];

  const activityDetails = {
    id: activity.id,
    title: activity.name,
    categories: [activity.activity_category?.name || activity.activityCategory?.name || "Activity"],
    location: activity.location || activity.city,
    address: activity.address || "",
    price:
      bestPrice > 0
        ? `₹${applyAdminOnly(bestPrice, activityData?.current_pricing?.admin_charge ?? 0)}`
        : 'Price TBA',
    image: activity.cover_image || activity.thumb_image || activity.image,
    description: activity.description || "",
    activityGuide: {
      duration: activity.duration ? `${activity.duration} hours` : 'TBD',
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
    time_slot_based: activity.time_slot_based === 1 || activity.time_slot_based === "1" || activity.time_slot_based === true,
    time_slot_pricing: Array.isArray(activityData?.time_slot_pricing) ? activityData.time_slot_pricing : [],
    seasonal_dates: Array.isArray(activityData?.seasonal_dates) ? activityData.seasonal_dates : [],
    closeout_dates: Array.isArray(activityData?.closeout_dates) ? activityData.closeout_dates : [],
    current_pricing: activityData?.current_pricing || null,
    cancellation_policies: Array.isArray(activityData?.cancellation_policies) ? activityData.cancellation_policies : [],
  };

  return <ActivityDetailClient activityDetails={activityDetails} />;
};

export default ActivityDetailPage;
