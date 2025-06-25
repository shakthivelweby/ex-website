import Accordion from "@/components/Accordion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import Image from "next/image";
import { useEffect, useState } from "react";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
                      <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={12}
                        slidesPerView={'auto'}
                        centeredSlides={true}
                        navigation={true}
                        pagination={{ clickable: true }}
                        autoplay={{
                          delay: 3000,
                          disableOnInteraction: false,
                        }}
                        loop={true}
                        speed={500}
                        breakpoints={{
                          640: {
                            slidesPerView: 'auto',
                            spaceBetween: 16,
                            centeredSlides: true,
                          },
                          1024: {
                            slidesPerView: 'auto',
                            spaceBetween: 20,
                            centeredSlides: true,
                          },
                        }}
                        className="attraction-swiper"
                      >
                        {day.attractions.map((attr) => {
                          const { id, name, image_url } = attr.attraction;

                          return (
                            <SwiperSlide key={attr.id} className="w-[85%] sm:w-[45%] lg:w-[30%]">
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
                            </SwiperSlide>
                          );
                        })}
                      </Swiper>
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
              {day.foods.length > 0 && (
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
              )}
            </div>
          </Accordion>
        );
      })}

      {/* Add Swiper styles */}
      <style jsx global>{`
        .attraction-swiper {
          padding: 1rem 0 3rem 0 !important;
          overflow: visible !important;
        }
        .attraction-swiper .swiper-button-next,
        .attraction-swiper .swiper-button-prev {
          color: #000;
          background: white;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .attraction-swiper .swiper-button-next:after,
        .attraction-swiper .swiper-button-prev:after {
          font-size: 1rem;
        }
        .attraction-swiper .swiper-pagination-bullet-active {
          background: #000;
        }
        .attraction-swiper .swiper-slide {
          transition: all 0.3s ease;
          opacity: 0.5;
        }
        .attraction-swiper .swiper-slide-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default ItinearyTab;
