"use client";
import Image from "next/image";

const StayTab = ({ packageData, activeTab, selectedStayCategory }) => {

  const stays = packageData.data.stays.filter(
    (stay) => stay.stay_category_id == selectedStayCategory.stay_category_id
  );

  const HotelCard = ({ hotel_name, image_url, location, website }) => {
    return (
      <div className="flex gap-4 bg-[#f7f7f7] p-2 rounded-2xl">
        <div className="relative flex-shrink-0 w-28 h-32">
          <Image
            src={image_url}
            alt={hotel_name}
            className="w-full h-full object-cover rounded-2xl"
            width={112}
            height={112}
            blurDataURL="/blur.webp"
            placeholder="blur"
          />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-medium text-gray-800 mb-2">
            {hotel_name}
          </h4>
          <div className="mb-2">
            <div>
              <div className="flex items-center mb-1">
                <i className="fi fi-rr-marker text-gray-700 mr-2 flex-shrink-0 text-sm"></i>
                <p className="text-gray-800 text-xs font-medium mb-0">
                  Location
                </p>
              </div>
              <p className="text-gray-800 text-sm font-medium">{location}</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center mb-1">
              <i className="fi fi-rr-globe text-gray-800 mr-2 flex-shrink-0 text-sm"></i>
              <p className="text-gray-700 text-xs font-medium mb-0">Website</p>
            </div>
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 flex items-center text-sm font-medium"
            >
              {website}
              <i className="fi fi-rr-arrow-up-right-from-square text-gray-800 ml-1 text-xs"></i>
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
      <div className=" text-sm  py-2 mb-4 text-center font-medium text-gray-500    bg-yellow-100 flex items-center justify-center gap-2">
        <i className="fi fi-rr-info"></i> &nbsp; All Stays will be subject to
        availability or similar category hotels will be provided
      </div>

      {stays.length > 0 &&
        stays.map((stay, index) => {
          const { id, destination, duration, package_stay_hotels } = stay;
          return (
            <div className="mb-10" key={id}>
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center bg-gray-100 rounded-full p-2">
                  <i className="fi fi-rr-marker text-gray-800 mr-2 text-sm"></i>
                  <h3 className="text-sm font-medium text-gray-800 mb-0">
                    {destination}
                  </h3>
                </div>
                <div className="border-t border-dashed border-gray-400 my-2 flex-1 mx-4"></div>
                <div className="flex items-center justify-center text-gray-700 bg-gray-100 rounded-full p-2">
                  <i className="fi fi-rr-moon text-gray-800 mr-1 text-sm"></i>
                  <span className="font-medium text-sm">{duration} Nights</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {package_stay_hotels.length > 0 ? (
                  package_stay_hotels.map((obj) => {
                    const { id, hotel_name, image_url, location, website } =
                      obj.hotel;
                    return (
                      <HotelCard
                        key={id}
                        hotel_name={hotel_name}
                        image_url={image_url}
                        location={location}
                        website={website}
                      />
                    );
                  })
                ) : (
                  <div className="text-gray-700 text-sm">
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
