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
  mobileLayout = 'list'
}) => {
  // Slot availability configuration
  const slotConfig = {
    sold: {
      bg: "bg-gray-900/90",
      text: "text-gray-100",
      icon: "fi fi-rr-cross-circle",
      label: "Sold Out"
    },
    critical: {
      bg: "bg-red-600/90",
      text: "text-white",
      icon: "fi fi-rr-flame",
      label: `${slotsAvailable} seats left`
    },
    limited: {
      bg: "bg-yellow-500/90",
      text: "text-white",
      icon: "fi fi-rr-time-quarter-past",
      label: `${slotsAvailable} seats left`
    },
    available: {
      bg: "bg-emerald-600/90",
      text: "text-white",
      icon: "fi fi-rr-check",
      label: "Booking Open"
    }
  };

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
      {/* Mobile List View */}
      <div className={`${mobileLayout === 'list' ? 'block' : 'hidden'} md:hidden`}>
        <div className="relative overflow-hidden rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.1)] p-2 ">
          {isCertified && (
            <div className="text-xs text-green-600 font-semibold flex-1 mb-4">
              <i className="fi fi-rr-shield-check text-sm mr-1"></i>
              Explore World Assured
            </div>
          )}
          <div className="flex items-start">
            {/* Image Section */}
            <div className="relative w-[30%] overflow-hidden rounded-xl">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={400}
                height={400}
                className="h-[110px] w-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
              
              {/* Duration Tag */}
              <div className="absolute top-2 left-2 bg-white font-semibold  text-gray-900 text-[12px] px-2 py-0.5 rounded-full">
                {duration}
              </div>

            
            </div>

            {/* Content Section */}
            <div className="flex-1 px-3 flex flex-col  ">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 flex-col" >
                  <h3 className="flex-1 text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                    {title}
                  </h3>
                 
                </div>

              
              </div>

              <div className="mt-auto pt-2  border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Starting</div>
                    <div className="text-lg font-semibold text-gray-900">₹{price.toLocaleString()}<span className="text-xs font-normal text-gray-500">/ per person</span></div>
                  </div>
                 
                </div>
              </div>
              <button className=" mt-2 flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700">
                Explore
                <i className="fi fi-rr-arrow-right text-[9px] group-hover:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </div>
          
          {(startingFrom || slotStatus) && (
            <div className="   border-t border-gray-100 mt-2 bg-gray-100/50 p-2 py-1 rounded-lg">
             
              <div className="flex items-center justify-between">
            {startingFrom && (
              <div className="text-xs text-gray-900">
                <div className="text-[10px]"> Trip Starts from</div>
                <div className="flex items-center gap-1  font-semibold text-sm">
               
                 {startingFrom}
                </div>
              </div>
            )}

            {slotStatus && (
              <div className={`inline-flex items-center gap-1 ${slotStatus.bg} ${slotStatus.text} text-xs px-2 py-1 rounded-full`}>
                <i className={`${slotStatus.icon} text-[9px]`}></i>
                {slotStatus.label}
              </div>
            )}
              </div>
              </div>
            )}
        </div>
      </div>

      {/* Mobile Grid & Desktop View */}
      <div className={`${mobileLayout === 'grid' ? 'block' : 'hidden'} md:block`}>
        <div className="relative bg-white overflow-hidden rounded-xl group shadow-[0_0_10px_rgba(0,0,0,0.1)]">
          {/* Image Section */}
          <div className="relative">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={400}
              height={400}
              className="w-full aspect-[16/14] object-cover group-hover:scale-110 transition-transform duration-700 rounded-xl"
            />
            <div className="absolute w-full bg-gradient-to-t from-black/100 via-black/70 to-transparent rounded-xl h-[60%] bottom-0" ></div>

            {/* {isCertified && (
              <div className="flex-shrink-0 bg-white text-gray-900 p-2 rounded-full w-[30px] h-[30px] flex items-center justify-center absolute top-2 right-2">
                <i className="fi fi-rr-shield-check text-sm"></i>
              </div>
            )} */}

            {slotStatus && (
              <div className={`absolute top-2 left-2 flex items-center gap-1 ${slotStatus.bg} ${slotStatus.text} text-xs px-3 py-1 rounded-full backdrop-blur-md`}>
                <i className={`${slotStatus.icon} text-xs`}></i>
                {slotStatus.label}
              </div>
            )}

            {/* Duration */}
            <div className="absolute top-2 right-2 bg-white text-gray-900 text-xs px-3 py-1 rounded-full">
              {duration}
            </div>

            {/* Overlay Content */}
            <div className="absolute inset-x-0 bottom-0 p-4">
              {/* Title & Certified Badge */}

              {/* Location */}
              {startingFrom && (
                <div className="flex items-center gap-1.5 text-white/90 text-sm mb-3">
                  <i className="fi fi-rr-marker"></i>
                  <span className="font-medium">From {startingFrom}</span>
                </div>
              )}

              <div className="flex items-start gap-2 mb-2 flex-col">
                <h3 className="flex-1 text-white text-[16px] font-semibold leading-snug line-clamp-2">
                  {title}
                </h3>

                {isCertified && (
                  <div className="text-xs text-green-500 font-medium">
                    <i className="fi fi-rr-shield-check text-sm mr-1"></i>
                    Explore World Assured
                  </div>
                )}
               
              </div>

             

              {/* Bottom Row */}
              <div className="flex items-center justify-between border-t border-white/20 pt-2">
                <div className="flex items-center gap-2 justify-between w-full">
                        
                  <div className="text-left">
                    {/* <div className="text-white/80 text-sm">Starting</div> */}
                    <div className="text-white text-xl font-semibold">₹{price.toLocaleString()}<span className="text-xs font-normal text-white/80 relative -top-[2px] ml-1">/ per person</span></div>
                  </div>
               
                    <div className="flex items-center gap-1 text-sm px-3 py-1 rounded-full backdrop-blur-md bg-white/10 text-white backdrop-blur-md border border-white/10">
                        Explore
                        <i className="fi fi-rr-arrow-right text-sm"></i>
                    </div>
                
                </div>

             

              </div>
            </div>
          </div>

          {/* View Details Button */}
        </div>
      </div>
    </Link>
  );
};

export default PackageCard;