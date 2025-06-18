"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { useState, useEffect } from "react";

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
          <Slider
            dots={false}
            infinite={true}
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
            autoplay={true}
            autoplaySpeed={4000}
            pauseOnHover={true}
            arrows={false}
            centerMode={true}
            centerPadding="20px"
            className="gallery-slider !px-0"
          >
            {images.map((image, index) => (
              <div key={index} className="relative h-[250px] sm:h-[350px] px-2">
                <div className="h-full w-full relative overflow-hidden rounded-lg">
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
            ))}
          </Slider>
          
          {/* Sticky See All Photos Button */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <button
              onClick={onViewAllClick}
              className="bg-black bg-opacity-50 backdrop-blur-sm w-[85%] h-10 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer pointer-events-auto shadow-lg"
            >
              <i className="fi fi-rr-picture text-base mr-2"></i>
              <span>See all photos ({images.length})</span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-[250px] sm:h-[350px]">
          <p className="text-gray-800">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default mobileCarousel;
