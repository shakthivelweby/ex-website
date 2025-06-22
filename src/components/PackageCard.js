import Image from "next/image";
import Link from "next/link";

const PackageCard = ({
  imageSrc,
  imageAlt,
  isCertified = false,
  duration,
  title,
  startingFrom,
  slotsAvailable,
  price,
  packageId,
  date,
}) => {
  // Slot availability configuration with clean minimal design
  const slotConfig = {
    sold: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      icon: "fi-rr-cross-small",
      label: "Sold Out",
      dot: "bg-gray-400"
    },
    critical: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: "fi-rr-exclamation",
      label: `Only ${slotsAvailable}`,
      dot: "bg-red-500"
    },
    limited: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      icon: "fi-rr-time-quarter-past",
      label: `${slotsAvailable} left`,
      dot: "bg-yellow-500"
    },
    available: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: "fi-rr-check",
      label: "Available",
      dot: "bg-green-500"
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
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-primary-100/20 hover:border-primary-200 transition-all duration-300 group-hover:-translate-y-1">
        
        {/* Mobile Layout - Horizontal */}
        <div className="flex md:hidden">
          {/* Image Container - Mobile */}
          <div className="relative overflow-hidden w-20 h-20 flex-shrink-0 rounded-xl m-2">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={400}
              height={400}
              blurDataURL="/blur.webp"
              placeholder="blur"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-xl"
            />
            
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30 rounded-xl" />
            
            {/* Duration badge - Mobile */}
            <div className="absolute bottom-1 right-1">
              <div className="bg-white/95 text-gray-800 rounded-lg py-0.5 px-1.5 text-[9px] font-bold shadow-sm backdrop-blur-sm">
                {duration}
              </div>
            </div>
          </div>

          {/* Content - Mobile */}
          <div className="flex-1 py-3 pr-3 flex flex-col justify-between">
            {/* Top section */}
            <div className="space-y-1">
              {/* Title and Certified */}
              <div className="flex items-start gap-2">
                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors flex-1">
                  {title}
                </h3>
                {isCertified && (
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-4 h-4 bg-primary-100 rounded-full flex items-center justify-center">
                      <i className="fi fi-rr-shield-check text-primary-600 text-[8px]"></i>
                    </div>
                  </div>
                )}
              </div>
              
              {startingFrom && (

                < div className="flex items-center text-gray-500 text-xs">
                  <div className="w-3 h-3 bg-gray-100 rounded-full flex items-center justify-center mr-1.5">
                    <i className="fi fi-rr-marker text-gray-400 text-[8px]"></i>
                  </div>
                  <span className="truncate font-medium">From {startingFrom}</span>
                </div>
              )}
             
            </div>

            {/* Bottom section */}
            <div className="flex items-center justify-between mt-2">
              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-gray-900">₹{price.toLocaleString()}</span>
                <span className="text-[8px] text-gray-400 font-normal">/ Per pax</span>
              </div>
              
              {/* Availability Status */}
              {slotStatus && (
              <div className={`${slotStatus.bg} ${slotStatus.text} px-2.5 py-1 rounded-lg text-[9px] font-semibold flex items-center gap-1.5`}>
                <div className={`w-1.5 h-1.5 ${slotStatus.dot} rounded-full`}></div>
                {slotStatus.label}
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop/Tablet Layout - Vertical */}
        <div className="hidden md:block">
          {/* Image Container - Desktop */}
          <div className="relative overflow-hidden aspect-square">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={400}
              height={400}
              blurDataURL="/blur.webp"
              placeholder="blur"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Modern gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              {/* Left side - Certification */}
              <div>
                {isCertified && (
                  <div className="bg-white/95 text-gray-900 rounded-full py-1 px-2.5 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                    <div className="w-3 h-3 bg-primary-500 rounded-full flex items-center justify-center">
                      <i className="fi fi-rr-shield-check text-white text-[8px]"></i>
                    </div>
                    <span>Verified</span>
                  </div>
                )}
              </div>
              
              {/* Right side - Duration */}
              <div className="bg-gray-900/90 text-white rounded-full py-1 px-2.5 text-xs font-bold backdrop-blur-sm shadow-lg">
                {duration}
              </div>
            </div>
            
            {/* Bottom location */}
            {startingFrom && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center text-white">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mr-2 backdrop-blur-sm">
                  <i className="fi fi-rr-marker text-white text-[10px]"></i>
                </div>
                <span className="truncate text-sm font-semibold">From {startingFrom}</span>
              </div>
            </div>
            )}
          </div>

          {/* Content Section - Desktop */}
          <div className="p-4">
            {/* Title */}
            <h3 className="tracking-tight font-semibold text-gray-900 text-base mb-3 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
              {title}
            </h3>

            {/* Price and Status Row */}
            <div className="flex items-center justify-between mb-3">
              {/* Price */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-gray-900">₹{price.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 font-normal">/Per pax</span>
                </div>
              </div>
              
              {/* Availability Status - Desktop Clean */}
              {slotStatus && (
              <div className={`${slotStatus.bg} ${slotStatus.text} px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border border-gray-200`}>
                <div className={`w-2 h-2 ${slotStatus.dot} rounded-full`}></div>
                <span>{slotStatus.label}</span>
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