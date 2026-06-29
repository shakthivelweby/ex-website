import AttractionDetailClient from "./clientWrapper";
import { attractionInfo, getAttractionGallery } from "./service";
import { normalizeCloseoutDates } from "@/utils/closeoutUtils";
import { minDisplayedEntryFeeFromRows } from "@/utils/attractionPricing";

const AttractionDetailPage = async ({ params, searchParams }) => {
  const { id } = await params;

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

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

  const dateSpecificPricing = attraction.attraction?.attraction_ticket_type_prices || null;

  const priceRows = Array.isArray(attraction.attraction?.attraction_ticket_type_prices)
    ? attraction.attraction.attraction_ticket_type_prices
    : [];

  const displayEntryFee = minDisplayedEntryFeeFromRows(priceRows) ?? 0;

  const ticketPrice = priceRows?.[0] || null;
  const currentFullRate = ticketPrice?.full_rate;
  const currentRateType = ticketPrice?.rate_type;
  const currentAdultPrice = ticketPrice?.adult_price;
  const currentChildPrice = ticketPrice?.child_price;

  const formatTime = (timeString) => {
    if (!timeString) return "TBD";
    return timeString;
  };

  const categoryName =
    attraction.attraction?.attraction_category_master?.name ||
    attraction.attraction?.attractionCategoryMaster?.name ||
    attraction.attraction?.attraction_category ||
    null;

  const attractionDetails = {
    id: attraction.attraction.id,
    title: attraction.attraction.name,
    categoryName,
    categories: categoryName ? [categoryName] : [],
    openingTime: new Date(`1970-01-01T${attraction.attraction.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    closingTime: new Date(`1970-01-01T${attraction.attraction.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    closeoutDates: normalizeCloseoutDates(attraction.closeout_dates || []),
    location: attraction.attraction.location,
    address: attraction.attraction.address,
    price: displayEntryFee > 0 ? `₹${displayEntryFee}` : "Free Entry",
    fullRate: currentFullRate,
    rateType: currentRateType,
    adultPrice: currentAdultPrice,
    childPrice: currentChildPrice,
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
    inclusions:
      attraction.attraction?.attraction_inclusions?.map((row) => row.inclusion).filter(Boolean) ||
      attraction.attraction?.attractionInclusions?.map((row) => row.inclusion).filter(Boolean) ||
      [],
    exclusions:
      attraction.attraction?.attraction_exclusions?.map((row) => row.exclusion).filter(Boolean) ||
      attraction.attraction?.attractionExclusions?.map((row) => row.exclusion).filter(Boolean) ||
      [],
    terms: attraction.attraction.terms_and_conditions?.[0]?.description || '',
    mapLink: attraction.map_link,
    latitude: attraction.latitude,
    longitude: attraction.longitude,
    gallery: getGalleryData || []
  };

  return <AttractionDetailClient attractionDetails={attractionDetails} />;
};

export default AttractionDetailPage;
