import Image from "next/image";
import { useState, useEffect } from "react";

const ImageViewer = ({ images, isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger animation after component mounts
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Hide component after animation completes
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-end transition-all duration-300 ease-out ${
        isAnimating ? "bg-black/30 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`h-full bg-white p-4 shadow-2xl relative overflow-auto transition-all duration-300 ease-out ${
          isAnimating
            ? "w-[55%] rounded-l-2xl translate-x-0"
            : "w-0 rounded-l-none translate-x-full"
        }`}
        style={{
          transformOrigin: "right center",
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`w-10 h-10 bg-white border border-gray-300 rounded-full absolute z-10 text-gray-500 flex items-center justify-center top-1/2 transform -translate-y-1/2 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 ${
            isAnimating
              ? "-left-[60px] opacity-100 scale-100"
              : "-left-[20px] opacity-0 scale-75"
          }`}
        >
          ×
        </button>

        {/* Content */}
        <div
          className={`transition-all duration-500 delay-100 ${
            isAnimating
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`transition-all duration-300 ease-out ${
                  isAnimating
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: `${150 + index * 50}ms`,
                }}
              >
                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 group">
                  <Image
                    src={image.image_url}
                    alt={image.image_name}
                    width={350}
                    height={280}
                    className="object-cover w-full h-[280px] transition-transform duration-300 group-hover:scale-105"
                    blurDataURL="/blur.webp"
                    placeholder="blur"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
