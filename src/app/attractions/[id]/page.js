import AttractionDetailClient from "./clientWrapper";
import { attractionInfo, getAttractionGallery, getTicketPricesForDateServer } from "./service";
import { normalizeCloseoutDates } from "@/utils/closeoutUtils";
import { formatAttractionDisplayPrice, minDisplayedEntryFeeFromRows } from "@/utils/attractionPricing";

const AttractionDetailPage = async ({ params, searchParams }) => {
  const { id } = await params;

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const resolvedSearchParams = await searchParams;
  const selectedDate = resolvedSearchParams.date || todayString;

  const [attractionResponse, galleryResponse, ticketPricesResponse] = await Promise.all([
    attractionInfo(id, selectedDate),
    getAttractionGallery(id),
    getTicketPricesForDateServer(id, selectedDate),
  ]);

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

  const payload = attractionResponse.data;
  const attraction = payload.attraction;
  const getGalleryData = galleryResponse?.data || [];
  const freeBooking = Boolean(attraction?.free_booking);

  const dateSpecificPricing =
    ticketPricesResponse?.data?.ticket_prices ||
    (payload.current_pricing ? [payload.current_pricing] : []);

  const displayEntryFee = freeBooking
    ? 0
    : minDisplayedEntryFeeFromRows(dateSpecificPricing) ?? 0;

  const primaryPriceRow = dateSpecificPricing?.[0] || payload.current_pricing || null;

  const categoryName =
    attraction?.attraction_category_master?.name ||
    attraction?.attractionCategoryMaster?.name ||
    attraction?.attraction_category ||
    null;

  const attractionDetails = {
    id: attraction.id,
    title: attraction.name,
    categoryName,
    categories: categoryName ? [categoryName] : [],
    openingTime: attraction.start_time
      ? new Date(`1970-01-01T${attraction.start_time}`).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : null,
    closingTime: attraction.end_time
      ? new Date(`1970-01-01T${attraction.end_time}`).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : null,
    closeoutDates: normalizeCloseoutDates(payload.closeout_dates || []),
    seasonalDates: payload.seasonal_dates || [],
    location: attraction.location,
    address: attraction.address,
    price: formatAttractionDisplayPrice(dateSpecificPricing, { freeBooking }),
    freeBooking,
    paxRequirement: Boolean(attraction.pax_requirement),
    chargableFrom: attraction.chargable_from ?? null,
    fullRate: primaryPriceRow?.full_rate,
    rateType: primaryPriceRow?.rate_type,
    adultPrice: primaryPriceRow?.adult_price,
    childPrice: primaryPriceRow?.child_price,
    dateSpecificPricing,
    selectedDate,
    image: attraction.cover_image || attraction.thumb_image,
    description: attraction.description,
    attractionGuide: {
      kidsFriendly: attraction.kids_friendly ? "Yes" : "No",
      petsFriendly: attraction.pets_friendly ? "Yes" : "No",
      wheelchairAccessible: attraction.wheelchair_accessible ? "Yes" : "No",
    },
    faqs:
      attraction.faqs?.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
      })) || [],
    inclusions:
      attraction?.attraction_inclusions?.map((row) => row.inclusion).filter(Boolean) ||
      attraction?.attractionInclusions?.map((row) => row.inclusion).filter(Boolean) ||
      [],
    exclusions:
      attraction?.attraction_exclusions?.map((row) => row.exclusion).filter(Boolean) ||
      attraction?.attractionExclusions?.map((row) => row.exclusion).filter(Boolean) ||
      [],
    terms: attraction.terms_and_conditions?.[0]?.description || "",
    mapLink: attraction.map_link,
    latitude: attraction.latitude,
    longitude: attraction.longitude,
    gallery: getGalleryData || [],
  };

  return <AttractionDetailClient attractionDetails={attractionDetails} />;
};

export default AttractionDetailPage;
