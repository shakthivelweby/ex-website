import AttractionDetailClient from "./clientWrapper";
import { attractionInfo, getAttractionGallery } from "./service";

const AttractionDetailPage = async ({ params }) => {
  const { id } = await params;

  const attractionResponse = await attractionInfo(id);  const galleryResponse = await getAttractionGallery(id);


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
  console.log("Attraction data:", attraction);

  // Calculate lowest price
  const lowestPrice = attraction.price || 0;

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
    // openingTime: attraction.attraction.start_time,
    // closingTime: attraction.attraction.end_time,
    location: attraction.attraction.location,
    address: attraction.attraction.address,
    price: lowestPrice > 0 ? `₹${lowestPrice}` : 'Free Entry',
    image: attraction.attraction.cover_image || attraction.attraction.thumb_image,
    description: attraction.attraction.description,
    attractionGuide: {
      duration: attraction.duration || 'TBD',
      bestTimeToVisit: attraction.best_time_to_visit || 'TBD',
      kidsFriendly: attraction.attraction.kids_friendly || 'Yes',
      petsFriendly: attraction.attraction.pets_friendly || 'No',
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
