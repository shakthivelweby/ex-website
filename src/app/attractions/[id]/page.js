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
  
  // Fetch date-specific pricing on server-side
  let dateSpecificPricing = null;
  try {
    const pricingResponse = await getTicketPricesForDateServer(id, selectedDate);
    dateSpecificPricing = pricingResponse?.data?.ticket_prices || null;
    console.log("Date-specific pricing loaded for date:", selectedDate, "Data:", dateSpecificPricing);
  } catch (error) {
    console.error("Error fetching date-specific pricing:", error);
    // Continue with fallback pricing
  }


  const getGalleryData = galleryResponse?.data || [];

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
  console.log("Attraction data to check full rate:", attraction.attraction);

  

  // Calculate lowest price and get full price structure
  const lowestPrice = attraction.price || 0;
  const priceStructure = attraction.price;
  
  // Get pricing information from attraction_ticket_type_prices if available
  const ticketPrice = attraction.attraction.attraction_ticket_type_prices?.[0];
  const fullRate = ticketPrice?.full_rate;
  const rateType = ticketPrice?.rate_type;
  const adultPrice = ticketPrice?.adult_price;
  const childPrice = ticketPrice?.child_price;
  
  // Use date-specific pricing if available, otherwise fall back to default pricing
  const currentTicketData = dateSpecificPricing?.[0] || ticketPrice;
  const currentFullRate = currentTicketData?.full_rate || fullRate;
  const currentRateType = currentTicketData?.rate_type || rateType;
  const currentAdultPrice = currentTicketData?.adult_price || adultPrice;
  const currentChildPrice = currentTicketData?.child_price || childPrice;

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
    price: currentRateType === "full" 
      ? (currentFullRate ? `₹${currentFullRate}` : (lowestPrice > 0 ? `₹${lowestPrice}` : 'Free Entry'))
      : currentRateType === "pax" 
        ? (currentAdultPrice ? `₹${currentAdultPrice}` : (lowestPrice > 0 ? `₹${lowestPrice}` : 'Free Entry'))
        : (currentFullRate ? `₹${currentFullRate}` : (lowestPrice > 0 ? `₹${lowestPrice}` : 'Free Entry')),
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
