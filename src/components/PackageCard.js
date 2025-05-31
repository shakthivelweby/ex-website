import Image from "next/image";
import Link from "next/link";

const PackageCard = ({
  imageSrc = "/test.avif",
  imageAlt = "Package Image",
  isCertified = false,
  duration = "6N 7D",
  title = "Manali - Shimla - Himachal Tour Package",
  startingFrom = "Delhi",
  slotsAvailable = 10,
  price = 17000,
  packageId = "default-package",
}) => {
  let slotElement = null;
  if (slotsAvailable <= 0) {
    slotElement = (
      <div className="bg-[#F0E6D5] text-[#77460D] py-1 px-3 rounded-full text-xs font-medium">
        Sold Out
      </div>
    );
  } else if (slotsAvailable < 10) {
    slotElement = (
      <div className="bg-[#FFEBEE] text-[#D32F2F] py-1 px-3 rounded-full text-xs font-medium">
        {slotsAvailable} Slots Available
      </div>
    );
  } else if (slotsAvailable < 30) {
    slotElement = (
      <div className="bg-[#FFF3E0] text-[#E65100] py-1 px-3 rounded-full text-xs font-medium">
        {slotsAvailable} Slots Available
      </div>
    );
  } else {
    slotElement = (
      <div className="bg-[#E8F5E9] text-[#2E7D32] py-1 px-3 rounded-full text-xs font-medium">
        {slotsAvailable} Slots Available
      </div>
    );
  }

  return (
    <Link href={`/package/${packageId}`} className="block">
      <div className="bg-white rounded-3xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300">
        <div className="relative p-2 rounded-2xl group">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={400}
            height={400}
            blurDataURL="/blur.webp"
            placeholder="blur"
            className="w-full h-[270px] object-cover rounded-2xl"
          />
          {isCertified && (
            <div className="absolute top-3 left-3 bg-white text-gray-900 rounded-full py-1 px-3 text-xs font-medium flex items-center justify-center gap-1">
              <i className="fi fi-rr-badge-check"></i> Certified
            </div>
          )}
          <div className="absolute top-3 right-3 bg-gray-900 text-white rounded-full py-1 px-3 text-xs font-medium">
            {duration}
          </div>
          {/* <div className="absolute right-3 top-1/2 bg-white text-gray-900 rounded-full p-1 shadow-md w-8 h-8 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 transform -translate-y-1/2">
            <i className="fi fi-rr-angle-right text-sm"></i>
          </div> */}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 text-base mb-2">{title}</h3>
          <p className="text-xs text-primary-600 mb-2 flex items-center">
            <i className="fi fi-rr-marker mr-1"></i> Starting from{" "}
            {startingFrom}
          </p>
          <div className="flex justify-between items-center">
            {slotElement}
            <div className="text-right text-gray-900">
              <span className="text-sm font-bold">
                ₹ {price.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">/ Person</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PackageCard;
