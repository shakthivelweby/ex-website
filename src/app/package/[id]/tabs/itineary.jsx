import Accordion from "@/components/Accordion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { useEffect, useState } from "react";

const ItinearyTab = ({ packageData, activeTab }) => {
  const [isClient, setIsClient] = useState(false);
  const { itineraries } = packageData.data;

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      className={`prose max-w-none text-gray-800 ${
        activeTab === "itinerary" ? "block" : "hidden"
      }`}
    >
      {itineraries.map((day, index) => {
        const { id, description, destination, day_number } = day;
        return (
          <Accordion
            key={id}
            title={`Day ${day_number} - ${destination}`}
            defaultOpen={index === 0 ? true : false}
          >
            <div className="">
              {day.attractions?.length > 0 ? (
                <>
                  <h4 className="text-[15px] font-medium text-gray-800 mb-3">
                    <i className="fi fi-br-map-marker-check text-primary-500 mr-2"></i>
                    Attraction / Activity
                  </h4>
                  <div className="mb-8 w-full">
                    {isClient ? (
                      <Slider
                        dots={true}
                        infinite={true}
                        speed={500}
                        slidesToShow={3}
                        slidesToScroll={1}
                        autoplay={true}
                        autoplaySpeed={3000}
                        centerMode={false}
                        variableWidth={false}
                        arrows={true}
                        responsive={[
                          {
                            breakpoint: 1024,
                            settings: {
                              slidesToShow: 2,
                              slidesToScroll: 1,
                              infinite: true,
                              dots: true,
                              arrows: true,
                              centerMode: false,
                            },
                          },
                          {
                            breakpoint: 768,
                            settings: {
                              slidesToShow: 1,
                              slidesToScroll: 1,
                              initialSlide: 0,
                              centerMode: false,
                              arrows: true,
                              centerPadding: "0",
                            },
                          },
                        ]}
                        className="attraction-slider"
                      >
                        {day.attractions.map((attr) => {
                          const { id, name, image_url } = attr.attraction;

                          return (
                            <div className="px-2 w-full" key={attr.id}>
                              <div className="flex flex-col h-full">
                                <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                  <Image
                                    src={image_url}
                                    alt={name}
                                    fill
                                    blurDataURL="/blur.webp"
                                    placeholder="blur"
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-gray-800">
                                  {name}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </Slider>
                    ) : (
                      <div className="flex items-center justify-center h-40">
                        {day.attractions?.length > 0 &&
                          day.attractions.map((attr) => {
                            const { id, name, image_url } = attr.attraction;
                            return (
                              <div className="px-2 w-full" key={attr.id}>
                                <div className="flex flex-col h-full">
                                  <div className="relative h-40 rounded-lg overflow-hidden mb-2">
                                    <Image
                                      src={image_url}
                                      alt={name}
                                      fill
                                      blurDataURL="/blur.webp"
                                      placeholder="blur"
                                      className="object-cover"
                                    />
                                  </div>
                                  <p className="font-medium text-gray-800">
                                    {name}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </>
              ) : null}

              <div>
                <div
                  className="itineary-description"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>

              {/* Meal Inclusion Display */}
              <div className="grid grid-cols-2 md:grid-cols-3 rounded-lg overflow-hidden mt-6 bg-[#f7f7f7] p-2">
                {day.foods.map((fd) => {
                  const { name, icon_url } = fd.food;
                  return (
                    <div
                      key={fd.id}
                      className="py-0 px-0 md:py-3 md:px-4 md:flex items-center justify-center md:border-r border-gray-200"
                    >
                      <div className="flex ">
                        <img src={icon_url} alt={name} className="w-5 h-5" />
                        <div className="ml-2">
                          <div className="font-medium text-sm">{name}</div>
                          <div className="text-sm text-gray-600">Included</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Accordion>
        );
      })}
    </div>
  );
};

export default ItinearyTab;
