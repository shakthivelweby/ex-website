import Image from "next/image";
import Link from "next/link";

const AttractionCard = ({ attraction }) => {
  const {
    title,
    description,
    location,
    city,
    type,
    image,
    price,
    rating,
    reviewCount,
    duration,
    bestTimeToVisit,
    features,
    promoted,
    popular,
    recommended,
    interest_count,
    openingHours,
  } = attraction;

  // Format rating display
  const formatRating = (rating) => {
    if (!rating || rating === 0) return "0.0";
    return rating.toFixed(1);
  };

  // Format price display
  const formatPrice = (price) => {
    if (!price || price === 0) return "Free";
    return `₹${price}`;
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i key={i} className="fi fi-sr-star text-yellow-400 text-sm"></i>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <i
          key="half"
          className="fi fi-sr-star-half text-yellow-400 text-sm"
        ></i>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <i
          key={`empty-${i}`}
          className="fi fi-sr-star text-gray-300 text-sm"
        ></i>
      );
    }

    return stars;
  };

  return (
    <Link href={`/attractions/${attraction.id}`} className="block group">
      <div className="relative flex flex-col h-[400px] overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Background Image */}
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <i className="fi fi-rr-image text-gray-400 text-4xl"></i>
          </div>
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Top Section - Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {popular && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                <span>🔥</span>
                <span>Popular</span>
              </span>
            )}
            {recommended && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                <span>✨</span>
                <span>Recommended</span>
              </span>
            )}
            {promoted && !popular && !recommended && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white">
                <span>⭐</span>
                <span>Featured</span>
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-sm px-2 py-1 rounded-full backdrop-blur-md bg-black/20 text-white hidden">
            <i className="fi fi-sr-star text-yellow-400 text-sm"></i>
            <span className="text-white text-sm font-medium">
              {formatRating(rating)}
            </span>
          </div>
        </div>

        {/* Content Section - Using Flex */}
        <div className="flex flex-col justify-end h-full p-6 relative z-10">
          {/* Title */}
          <div className="mb-3">
            <h3 className="text-base font-semibold text-white leading-tight">
              {title || "Untitled Attraction"}
            </h3>
          </div>
          {/* Divider */}
          <hr className="border-white/30 mb-4" />

          {/* Rating and Price Row */}
          <div className="flex items-center gap-2 justify-between w-full">
            {/* Price */}
            <div className="text-right">
              <span className="text-white font-bold text-lg">
                {formatPrice(price)}{" "}
                <span className="text-xs font-normal text-white/80">
                  / onwards
                </span>
              </span>
            </div>
            {/* Book Now Button */}
            <button className="flex items-center gap-1 text-sm px-3 py-1 rounded-full backdrop-blur-md bg-white/10 text-white border border-white/10">
              Book Now
              <i className="fi fi-rr-arrow-right text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AttractionCard;
