import AttractionDetailClient from "./clientWrapper";
import { attractionInfo, getAttractionGallery, getTicketPricesForDateServer } from "./service";

const AttractionDetailPage = async ({ params, searchParams }) => {
  const { id } = await params;
  
  // Get today's date as default for pricing
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  
  // Get date from search params if available, otherwise use today
  const resolvedSearchParams = await searchParams;
  const selectedDate = resolvedSearchParams.date || todayString;

  const attractionResponse = await attractionInfo(id);  
  const galleryResponse = await getAttractionGallery(id);
  
  if (!attractionResponse?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Attraction not found</h1>
          <p className="text-gray-600">The attraction with ID {id} could not be found.</p>
        </div>
      </div>
    );
  }

  const attraction = attractionResponse.data;
  const getGalleryData = galleryResponse?.data || [];
  
  // Use default pricing from attraction data for initial load
  // Date-specific pricing will be fetched client-side when user changes date
  const dateSpecificPricing = attraction.attraction?.attraction_ticket_type_prices || null;
  
  console.log("Using attraction_ticket_type_prices for initial pricing:", dateSpecificPricing);

  

  // Calculate lowest price and get full price structure
  const lowestPrice = attraction.price || 0;
  const priceStructure = attraction.price;
  
  // Compute the displayed entry fee from ticket price rows.
  // Detail page: show base + admin charge only (no discount here).
  const priceRows = Array.isArray(attraction.attraction?.attraction_ticket_type_prices)
    ? attraction.attraction.attraction_ticket_type_prices
    : [];

  const applyAdminChargeOnly = (amountRaw, adminPctRaw) => {
    const amount = Number(amountRaw || 0);
    const admin = Math.max(0, Number(adminPctRaw || 0));
    const afterAdmin = amount + (amount * admin) / 100;
    return Math.round(afterAdmin * 100) / 100;
  };

  const computeDisplayEntryFee = () => {
    // Pick the lowest meaningful displayed unit among rows (after admin charge).
    const candidates = [];
    for (const row of priceRows) {
      const rate = row?.rate_type;
      const adminPct = row?.admin_charge ?? 0;

      if (rate === "full") {
        const base = Number(row?.full_rate || 0);
        if (base > 0) candidates.push(applyAdminChargeOnly(base, adminPct));
      } else if (rate === "pax") {
        const adult = Number(row?.adult_price || 0);
        // For pax we show "starting from" adult price
        if (adult > 0) candidates.push(applyAdminChargeOnly(adult, adminPct));
      } else {
        const base = Number(row?.full_rate || row?.adult_price || 0);
        if (base > 0) candidates.push(applyAdminChargeOnly(base, adminPct));
      }
    }

    if (candidates.length) {
      return Math.min(...candidates);
    }

    // Fallback to attraction.price if no rows exist
    const baseFallback = Number(lowestPrice || 0);
    if (baseFallback > 0) return baseFallback;
    return 0;
  };

  const displayEntryFee = computeDisplayEntryFee();

  // Keep the first row (if any) for passing raw prices into the client wrapper (booking page uses full list).
  const ticketPrice = priceRows?.[0] || null;
  const currentFullRate = ticketPrice?.full_rate;
  const currentRateType = ticketPrice?.rate_type;
  const currentAdultPrice = ticketPrice?.adult_price;
  const currentChildPrice = ticketPrice?.child_price;

  // Format opening and closing times
  const formatTime = (timeString) => {
    if (!timeString) return "TBD";
    return timeString;
  };



  const attractionDetails = {
    id: attraction.attraction.id,
    title: attraction.attraction.name,
    categories: [attraction.attraction_category_master?.name || "Attraction"],
    openingTime: new Date(`1970-01-01T${attraction.attraction.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    closingTime: new Date(`1970-01-01T${attraction.attraction.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    closeoutDates: attraction.closeout_dates || [],
    // openingTime: attraction.attraction.start_time,
    // closingTime: attraction.attraction.end_time,
    location: attraction.attraction.location,
    address: attraction.attraction.address,
    // Display price including admin charge only (discount applied only during booking/checkout)
    price: displayEntryFee > 0 ? `₹${displayEntryFee}` : "Free Entry",
    fullRate: currentFullRate,
    rateType: currentRateType,
    adultPrice: currentAdultPrice,
    childPrice: currentChildPrice,
    // Add date-specific pricing data
    dateSpecificPricing: dateSpecificPricing,
    selectedDate: selectedDate,
    image: attraction.attraction.cover_image || attraction.attraction.thumb_image,
    description: attraction.attraction.description,
    attractionGuide: {
      duration: attraction.duration || 'TBD',
      bestTimeToVisit: attraction.best_time_to_visit || 'TBD',
      kidsFriendly: attraction.attraction.kids_friendly ? 'Yes' : 'No',
      petsFriendly: attraction.attraction.pets_friendly ? 'Yes' : 'No',
      features: attraction.features || [],
      rating: attraction.rating || 0,
      reviewCount: attraction.review_count || 0
    },
    faqs: attraction.attraction.faqs?.map((faq) => ({
      question: faq.question,
      answer: faq.answer
    })) || [],
    terms: attraction.attraction.terms_and_conditions?.[0]?.description || '',
    mapLink: attraction.map_link,
    latitude: attraction.latitude,
    longitude: attraction.longitude,
    gallery: getGalleryData || []  };



  return <AttractionDetailClient attractionDetails={attractionDetails} />;
};

export default AttractionDetailPage;
