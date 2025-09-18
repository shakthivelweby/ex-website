"use client";
import Image from "next/image";

const StayTab = ({ packageData, activeTab, selectedStayCategory }) => {

  const stays = packageData.data.stays.filter(
    (stay) => stay.stay_category_id == selectedStayCategory.stay_category_id
  );

  const HotelCard = ({ hotel_name, image_url, location, website }) => {
    return (
      <div className="flex gap-3 bg-[#f7f7f7] hover:bg-gray-100 transition-colors duration-300 p-2 lg:p-3 rounded-xl w-full group">
        <div className="relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 sm:w-24 sm:h-24 overflow-hidden rounded-xl">
          <Image
            src={image_url}
            alt={hotel_name}
            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
            width={96}
            height={96}
            blurDataURL="/blur.webp"
            placeholder="blur"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-2 truncate">
            {hotel_name}
          </h4>
          <div className="mb-2">
            <div className="flex items-center gap-1.5">
              <i className="fi fi-rr-marker text-gray-700 flex-shrink-0 text-sm"></i>
              <p className="text-gray-800 text-sm font-normal truncate">{location}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <i className="fi fi-rr-globe text-gray-800 flex-shrink-0 text-sm"></i>
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 text-sm font-normal truncate hover:text-primary-500 transition-colors flex items-center gap-1"
            >
              {website}
              <i className="fi fi-rr-arrow-up-right-from-square text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`prose max-w-none text-gray-800 ${
        activeTab === "stay" ? "block" : "hidden"
      }`}
    >
      <div className="text-xs sm:text-sm py-2 mb-4 text-center font-normal text-yellow-700 bg-yellow-100 flex items-center justify-center gap-2">
        <i className="fi fi-rr-info"></i> All Stays will be subject to
        availability or similar category hotels will be provided
      </div>

      {stays.length > 0 &&
        stays.map((stay, index) => {
          const { id, destination, duration, package_stay_hotels } = stay;
          return (
            <div className="mb-8" key={id}>
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center bg-gray-100 rounded-full p-2">
                  <i className="fi fi-rr-marker text-gray-800 mr-1.5 text-xs sm:text-sm"></i>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-0">
                    {destination}
                  </h3>
                </div>
                <div className="border-t border-dashed border-gray-400 my-2 flex-1 mx-4"></div>
                <div className="flex items-center justify-center text-gray-700 bg-gray-100 rounded-full p-2">
                  <i className="fi fi-rr-moon text-gray-800 mr-1 text-xs sm:text-sm"></i>
                  <span className="font-medium text-xs sm:text-sm">{duration} Nights</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
                {package_stay_hotels.length > 0 ? (
                  package_stay_hotels.map((obj, index) => {
                    const { id, hotel_name, image_url, location, website } =
                      obj.hotel;
                    return (
                      <div key={id} className="flex-1 min-w-0 max-w-sm flex flex-col sm:flex-row items-stretch gap-4">
                        <HotelCard
                          hotel_name={hotel_name}
                          image_url={image_url}
                          location={location}
                          website={website}
                        />
                        {index < package_stay_hotels.length - 1 && (
                          <div className="flex sm:flex-col items-center justify-center gap-2 py-1 sm:py-0">
                            <div className="h-[1px] sm:h-12 w-full sm:w-[1px] bg-gradient-to-r sm:bg-gradient-to-b from-transparent via-gray-300 to-transparent flex-1"></div>
                            <span className="text-gray-500 font-medium text-xs sm:text-sm bg-gray-100 px-3 py-0.5 rounded-full">OR</span>
                            <div className="h-[1px] sm:h-12 w-full sm:w-[1px] bg-gradient-to-r sm:bg-gradient-to-b from-transparent via-gray-300 to-transparent flex-1"></div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-700 text-xs sm:text-sm">
                    No hotels found for this stay category
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default StayTab;
