import Image from "next/image";
import { useState, useEffect } from "react";
import Popup from "@/components/Popup";

const ImageViewer = ({ images, isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset animation state when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure popup is mounted
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <i className="fi fi-rr-picture text-lg"></i>
          <span>Gallery</span>
          <span className="text-sm font-normal text-gray-500">({images.length} photos)</span>
        </div>
      }
      pos="bottom"
      draggable={true}
      className="w-full lg:w-[55%] h-[80vh] lg:h-screen rounded-t-3xl lg:rounded-l-2xl"
      pannelStyle="bg-white/95 backdrop-blur-md lg:ml-auto"
    >
      <div className="p-3 lg:p-4 overflow-y-auto h-full">
        <div className="flex flex-col gap-3 lg:gap-4">
          {images.map((image, index) => (
            <div 
              key={image.id} 
              className={`transition-all duration-500 ease-out transform ${
                isAnimating 
                  ? "translate-y-0 opacity-100 scale-100" 
                  : "translate-y-8 opacity-0 scale-95"
              }`}
              style={{
                transitionDelay: `${index * 75}ms`
              }}
            >
              <div className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={image.image_url}
                    alt={image.image_name || "Travel package image"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    blurDataURL="/blur.webp"
                    placeholder="blur"
                    priority={index < 4}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Popup>
  );
};

export default ImageViewer;
