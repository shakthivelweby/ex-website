import AttractionDetailClient from "./clientWrapper";
import { attractionInfo, getAttractionGallery } from "./service";

const AttractionDetailPage = async ({ params }) => {
  const { id } = await params;
  const attractionResponse = await attractionInfo(id);
  const galleryResponse = await getAttractionGallery(id);

  const getGalleryData = galleryResponse?.data?.attraction_images;

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

  // Calculate lowest price
  const lowestPrice = attraction.price || 0;

  // Format opening and closing times
  const formatTime = (timeString) => {
    if (!timeString) return "TBD";
    return timeString;
  };

  const attractionDetails = {
    id: attraction.id,
    title: attraction.name,
    categories: [attraction.attraction_category_master?.name || "Attraction"],
    openingTime: formatTime(attraction.opening_hours?.split(' - ')[0]),
    closingTime: formatTime(attraction.opening_hours?.split(' - ')[1]),
    location: attraction.location,
    address: attraction.address,
    price: lowestPrice > 0 ? `₹${lowestPrice}` : 'Free Entry',
    image: attraction.cover_image || attraction.thumb_image,
    description: attraction.description,
    attractionGuide: {
      duration: attraction.duration || 'TBD',
      bestTimeToVisit: attraction.best_time_to_visit || 'TBD',
      features: attraction.features || [],
      rating: attraction.rating || 0,
      reviewCount: attraction.review_count || 0
    },
    faqs: attraction.faqs?.map((faq) => ({
      question: faq.question,
      answer: faq.answer
    })) || [],
    terms: attraction.terms_and_conditions?.[0]?.description || '',
    mapLink: attraction.map_link,
    latitude: attraction.latitude,
    longitude: attraction.longitude,
    gallery: getGalleryData || []
  };

  return <AttractionDetailClient attractionDetails={attractionDetails} />;
};

export default AttractionDetailPage;
