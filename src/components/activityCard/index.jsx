import Image from "next/image";
import Link from "next/link";

const ActivityCard = ({ activity }) => {
  const {
    title,
    image,
    price,
    rating,
    promoted,
    popular,
    recommended,
    city,
    id,
  } = activity;

  return (
    <Link
      key={activity.id}
      href={`/activities/${id}`}
      className="block group overflow-hidden transition-all duration-300"
    >
      <div className="flex flex-col h-full">
        {/* Image Section */}
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
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

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            {recommended && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-600 text-white shadow-lg">
                <span>🔥</span>
                <span>Featured</span>
              </span>
            )}
            {/* {promoted && !popular && !recommended && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white shadow-lg">
                <span>⭐</span>
                <span>Featured</span>
              </span>
            )} */}
          </div>

          {/* Rating Badge */}
          {rating > 0 && (
            <div className="hidden absolute top-3 right-3 z-10">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium shadow-lg">
                <i className="fi fi-sr-star text-yellow-400 text-xs"></i>
                <span>{rating.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-grow pt-2">
          {/* City */}
          {city && (
            <div className="flex items-start text-primary-600 font-medium text-xs capitalize tracking-wide mb-2">
              <i className="fi fi-rr-marker mr-1.5"></i>
              <span className="leading-tight break-words">{city}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-base text-gray-900 leading-tight mb-2 line-clamp-2">
            {title || "Untitled Activity"}
          </h3>

          {/* Bottom Section - Price and Button */}
          <div className="mt-auto pt-1">
            <div className="flex items-start justify-between gap-2">
              {/* Price */}
              <div className="flex items-baseline flex-shrink-0">
                <span className="text-gray-900 font-bold text-lg leading-none">
                  ₹{price || 0}
                </span>
                <span className="text-gray-500 text-xs font-normal ml-1 leading-none">
                  / onwards
                </span>
              </div>
              {/* Book Now Button */}
              <button className="hidden items-center gap-1 text-sm px-4 py-2 rounded-full bg-black text-white hover:bg-black/90 transition-colors font-medium">
                Book Now
                <i className="fi fi-rr-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ActivityCard;

