import Image from "next/image";
import Link from "next/link";

const EventCard = ({ event }) => {
  const {
    title,
    date,
    venue,
    type,
    image,
    price,
    promoted,
    interest_count,
    totalShows,
    availableSlots,
    dateRange,
  } = event;

  return (
    <Link href="#" className="block group">
      <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Promoted Tag */}
        {promoted && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
              <span>🔥</span>
              <span>Featured</span>
            </span>
          </div>
        )}

        {/* Background Image */}
        <div className="relative w-full h-[350px] overflow-hidden shrink-0">
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
              <div className="text-center text-gray-500">
                <i className="fi fi-rr-picture text-4xl mb-2 block"></i>
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Interest Count Overlay */}
          {interest_count > 50 && (
            <div className="absolute bottom-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-black/50 text-white backdrop-blur-sm">
                <span>👍</span>
                <span>{interest_count}+ people interested</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Date and Time */}
          <p className="text-primary-600 font-medium text-sm mb-2">
            {dateRange || date}
          </p>

          {/* Title */}
          <h3 className="font-medium text-base text-gray-800 line-clamp-2 mb-2 transition-colors">
            {title}
          </h3>

          {/* Event Type/Category */}
          {type && (
            <div className="flex items-center gap-2 mb-2">
              <i className="fi fi-rr-tag text-gray-400 text-sm"></i>
              <p className="text-gray-500 text-sm">{type}</p>
            </div>
          )}

          {/* Venue */}
          <div className="flex items-center gap-2 mb-2">
            <i className="fi fi-rr-marker text-gray-400 text-sm"></i>
            <p className="text-gray-600 text-sm line-clamp-1">{venue}</p>
          </div>

          {/* Event Details */}
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
            {totalShows > 0 && (
              <div className="flex items-center gap-1">
                <i className="fi fi-rr-play text-gray-400"></i>
                <span>{totalShows} shows</span>
              </div>
            )}
            {availableSlots > 0 && (
              <div className="flex items-center gap-1">
                <i className="fi fi-rr-ticket text-gray-400"></i>
                <span>{availableSlots} slots</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600 font-medium text-sm">
              {typeof price === "string" ? price : `₹${price} onwards`}
            </p>
            <button className="text-sm text-primary-600 font-medium hover:text-primary-700">
              Book Now <i className="fi fi-rr-arrow-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
