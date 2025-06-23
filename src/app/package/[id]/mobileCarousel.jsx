"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import Image from "next/image";
import { useState, useEffect } from "react";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const mobileCarousel = ({ packageData, onViewAllClick }) => {
  const { images } = packageData.data;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="md:hidden relative">
      {isClient ? (
        <>
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={10}
            slidesPerView={1.2}
            centeredSlides={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="w-full package-swiper"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index} className="w-[85%]">
                <div className="relative h-[250px] sm:h-[350px]">
                  <div className="h-full w-full relative overflow-hidden rounded-xl">
                    <Image
                      src={image.image_url}
                      alt={image.image_name}
                      fill
                      sizes="(max-width: 640px) 100vw, 640px"
                      className="object-cover"
                      priority={index === 0}
                      blurDataURL="/blur.webp"
                      placeholder="blur"
                    />
                    {index === 0 && images.isCertified && (
                      <span className="absolute top-4 left-4 bg-white text-gray-800 border border-gray-200 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z"
                            stroke="#10B981"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M16 9L10.5 14.5L8 12"
                            stroke="#10B981"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Certified
                      </span>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Clean White Button with Simple Icon */}
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={onViewAllClick}
              className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg hover:bg-white/95 transition-all duration-200 border border-white/20"
            >
             
              <span className="text-[11px] font-semibold text-gray-800">
                {images.length}+ photos
              </span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-[250px] sm:h-[350px]">
          <p className="text-gray-800">Loading...</p>
        </div>
      )}

      <style jsx global>{`
        .package-swiper {
          overflow: visible;
          padding: 0.5rem 0;
        }
        .package-swiper .swiper-slide {
          transition: all 0.3s ease;
          opacity: 0.5;
        }
        .package-swiper .swiper-slide-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default mobileCarousel;
