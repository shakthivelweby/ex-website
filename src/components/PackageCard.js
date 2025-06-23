import Image from "next/image";
import Link from "next/link";

const PackageCard = ({
  imageSrc,
  imageAlt,
  isCertified = false,
  duration,
  title,
  startingFrom,
  slotsAvailable = 10,
  price,
  packageId,
  date,
  mobileLayout = 'list' // 'list' or 'grid'
}) => {
  // Slot availability configuration
  const slotConfig = {
    sold: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      icon: "fi fi-rr-cross-circle",
      label: "Sold Out",
      dot: "bg-gray-400",
      border: "border-gray-200"
    },
    critical: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: "fi fi-rr-flame",
      label: `Only ${slotsAvailable} left`,
      dot: "bg-red-500",
      border: "border-red-200"
    },
    limited: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      icon: "fi fi-rr-time-quarter-past",
      label: `${slotsAvailable} slots left`,
      dot: "bg-yellow-500",
      border: "border-yellow-200"
    },
    available: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: "fi fi-rr-check-circle",
      label: "Available",
      dot: "bg-green-500",
      border: "border-green-200"
    }
  };

  // Determine slot status
  const getSlotStatus = () => {
    if (slotsAvailable === null) return null;
    if (slotsAvailable <= 0) return slotConfig.sold;
    if (slotsAvailable < 10) return slotConfig.critical;
    if (slotsAvailable < 30) return slotConfig.limited;
    return slotConfig.available;
  };

  const slotStatus = getSlotStatus();

  return (
    <Link href={`/package/${packageId}?date=${date}`} className="block group">
      <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
        {/* Mobile Layout - List View */}
        <div className={`${mobileLayout === 'list' ? 'flex' : 'hidden'} md:hidden`}>
          {/* Image Container - Mobile List */}
          <div className="relative overflow-hidden w-[100px] h-[120px] flex-shrink-0 m-3">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={400}
              height={400}
              blurDataURL="/blur.webp"
              placeholder="blur"
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/30 rounded-xl" />
            
            {/* Duration badge - Mobile */}
            <div className="absolute top-2 left-2">
              <div className="bg-white/95 text-gray-800 rounded-full py-0.5 px-2 text-[10px] font-medium shadow-sm backdrop-blur-sm">
                {duration}
              </div>
            </div>

            {/* Certified badge - Mobile */}
            {isCertified && (
              <div className="absolute bottom-2 left-2">
                <div className="bg-primary-500 text-white rounded-full p-1.5 shadow-sm">
                  <i className="fi fi-rr-shield-check text-[10px]"></i>
                </div>
              </div>
            )}
          </div>

          {/* Content - Mobile List */}
          <div className="flex-1 py-3 pr-3 flex flex-col min-w-0">
            {/* Title */}
            <h3 className="font-medium text-gray-900 text-[15px] line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
              {title}
            </h3>

            {/* Location */}
            {startingFrom && (
              <div className="flex items-center text-gray-500 text-xs mt-1">
                <i className="fi fi-rr-marker text-primary-500 text-[10px] mr-1"></i>
                <span className="truncate font-medium">From {startingFrom}</span>
              </div>
            )}

            {/* Price */}
            <div className="mt-auto">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-medium">Starts at</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-gray-900">₹{price.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-500 font-medium">/ Per pax</span>
                </div>
              </div>

              {/* View Details Link - Mobile */}
              <div className="flex items-center justify-between mt-1.5">
                <div className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors flex items-center gap-1 group/btn">
                  Explore
                  <i className="fi fi-rr-arrow-small-right text-xs group-hover/btn:translate-x-0.5 transition-transform"></i>
                </div>

                {/* Availability Status - Mobile List */}
                {slotStatus && (
                  <div className={`${slotStatus.bg} ${slotStatus.text} px-2.5 py-1.5 rounded-full text-[10px] font-medium flex items-center gap-1.5 border ${slotStatus.border} shadow-sm`}>
                    <i className={`${slotStatus.icon} text-[10px]`}></i>
                    {slotStatus.label}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Grid View */}
        <div className={`${mobileLayout === 'grid' ? 'block' : 'hidden'} md:hidden`}>
          {/* Image Container - Mobile Grid */}
          <div className="relative overflow-hidden aspect-[16/9]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={400}
              height={400}
              blurDataURL="/blur.webp"
              placeholder="blur"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="bg-white/95 text-gray-900 rounded-full py-1 px-3 text-sm font-medium shadow-lg backdrop-blur-sm">
                {duration}
              </div>

              {isCertified && (
                <div className="bg-primary-500 text-white rounded-full p-2 shadow-lg">
                  <i className="fi fi-rr-shield-check text-sm"></i>
                </div>
              )}
            </div>
            
            {startingFrom && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center text-white">
                  <i className="fi fi-rr-marker text-white text-sm mr-2"></i>
                  <span className="truncate text-base font-medium">From {startingFrom}</span>
                </div>
              </div>
            )}
          </div>

          {/* Content - Mobile Grid */}
          <div className="p-5">
            <h3 className="font-medium text-gray-900 text-lg mb-3 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
              {title}
            </h3>

            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 font-medium -mb-0.5">Starts at</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 font-medium">/ Per pax</span>
                  </div>
                </div>

                <div className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors flex items-center gap-1.5 group/btn">
                  Explore
                  <i className="fi fi-rr-arrow-small-right text-sm group-hover/btn:translate-x-0.5 transition-transform"></i>
                </div>
              </div>

              {slotStatus && (
                <div className={`${slotStatus.bg} ${slotStatus.text} px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 border ${slotStatus.border} shadow-sm`}>
                  <i className={`${slotStatus.icon} text-sm`}></i>
                  {slotStatus.label}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop/Tablet Layout - Vertical */}
        <div className="hidden md:block">
          {/* Image Container - Desktop */}
          <div className="relative overflow-hidden aspect-[4/3]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={400}
              height={400}
              blurDataURL="/blur.webp"
              placeholder="blur"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Modern gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              {/* Left side - Duration */}
              <div className="bg-white/95 text-gray-900 rounded-full py-1 px-2.5 text-xs font-medium shadow-lg backdrop-blur-sm">
                {duration}
              </div>

              {/* Right side - Certification */}
              {isCertified && (
                <div className="bg-primary-500 text-white rounded-full p-1.5 shadow-lg">
                  <i className="fi fi-rr-shield-check text-[12px]"></i>
                </div>
              )}
            </div>
            
            {/* Bottom location */}
            {startingFrom && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center text-white">
                  <i className="fi fi-rr-marker text-white text-[12px] mr-1.5"></i>
                  <span className="truncate text-sm font-medium">From {startingFrom}</span>
                </div>
              </div>
            )}
          </div>

          {/* Content Section - Desktop */}
          <div className="p-4">
            {/* Title */}
            <h3 className="font-medium text-gray-900 text-lg mb-2 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
              {title}
            </h3>

            <div className="space-y-2">
              {/* Price and View Details Row */}
              <div className="flex  items-end justify-between">
                {/* Price Section */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium -mb-0.5">Starts at</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 font-medium">/ Per pax</span>
                  </div>
                </div>

                {/* View Details Link - Desktop */}
                <div className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors flex items-center gap-1 group/btn">
                  Explore
                  <i className="fi fi-rr-arrow-small-right text-xs group-hover/btn:translate-x-0.5 transition-transform"></i>
                </div>
              </div>

              {/* Status Row */}
              {slotStatus && (
                <div className={`${slotStatus.bg} ${slotStatus.text} px-2.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border ${slotStatus.border} shadow-sm`}>
                  <i className={`${slotStatus.icon} text-xs`}></i>
                  {slotStatus.label}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PackageCard;