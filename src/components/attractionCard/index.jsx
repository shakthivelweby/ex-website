import Image from "next/image";
import Link from "next/link";

const AttractionCard = ({ attraction }) => {
  const {
    title,
    location,
    type,
    image,
    price,
    duration,
    popular,
    recommended,
    interest_count,
  } = attraction;

  // Format price display
  const formatPrice = (price) => {
    if (!price || price === 0) return "Free";
    return `₹${price} onwards`;
  };

  return (
    <Link href={`/attractions/${attraction.id}`} className="block group">
      <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Status Badges (match events) */}
        {(popular || recommended) && (
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="flex flex-row flex-wrap items-center gap-2">
              {popular && (
                <span className="relative inline-flex items-center gap-2 pl-2.5 pr-4 py-1 text-[11px] font-semibold text-gray-900 bg-white/90 backdrop-blur-md border border-black/10 shadow-sm whitespace-nowrap rounded-l-md rounded-r-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="leading-none">Popular</span>
                  <span
                    aria-hidden="true"
                    className="absolute right-[-7px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-l-[7px] border-l-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]"
                  />
                </span>
              )}

              {recommended && (
                <span
                  title="ExploreWorld Recommended"
                  className="relative inline-flex items-center gap-2 pl-2.5 pr-4 py-1 text-[11px] font-semibold text-gray-900 bg-white/90 backdrop-blur-md border border-black/10 shadow-sm whitespace-nowrap rounded-l-md rounded-r-sm max-w-[190px]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                  <span className="leading-none truncate">
                    ExploreWorld Recommended
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute right-[-7px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-l-[7px] border-l-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]"
                  />
                </span>
              )}
            </div>
          </div>
        )}

        {/* Image (match events) */}
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
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <i className="fi fi-rr-image text-gray-400 text-4xl"></i>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Interest Count Overlay (match events) */}
          {interest_count > 50 && (
            <div className="absolute bottom-4 left-4 z-10">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-black/40 text-white backdrop-blur-md border border-white/15">
                <span className="w-2 h-2 rounded-full bg-white/80" />
                <span>{interest_count}+ people interested</span>
              </span>
            </div>
          )}
        </div>

        {/* Content (match events spacing) */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Type / Timing */}
          <p className="text-primary-600 font-medium text-sm mb-2">
            {type || duration || "Attraction"}
          </p>

          {/* Title */}
          <h3 className="font-medium text-base text-gray-800 line-clamp-2 mb-2 transition-colors">
            {title || "Untitled Attraction"}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 mb-3">
            <i className="fi fi-rr-marker text-gray-400 text-sm"></i>
            <p className="text-gray-600 text-sm line-clamp-1">
              {location || "Location TBA"}
            </p>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600 font-medium text-sm">
              {price && price > 0 ? formatPrice(price) : "Price TBA"}
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

export default AttractionCard;
