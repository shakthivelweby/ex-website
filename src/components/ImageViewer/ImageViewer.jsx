import Image from "next/image";
import { useState, useEffect } from "react";

const ImageViewer = ({ images, isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
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
      className={`fixed inset-0 z-50 flex items-center lg:items-center lg:justify-end transition-all duration-300 ease-out ${
        isAnimating ? "bg-black/80 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={handleBackdropClick}
    >
      {/* Content Container */}
      <div
        className={`relative w-full h-full lg:h-screen lg:w-[55%] bg-white/95 backdrop-blur-md lg:rounded-l-2xl overflow-hidden transition-all duration-300 ease-out ${
          isAnimating 
            ? "translate-y-0 lg:translate-x-0 opacity-100" 
            : "translate-y-full lg:translate-y-0 lg:translate-x-full opacity-0"
        }`}
        style={{
          transformOrigin: "right center"
        }}
      >
        {/* Desktop Close Button */}
        <button
          onClick={handleClose}
          className={`hidden lg:flex w-10 h-10 bg-white border border-gray-300 rounded-full absolute z-10 text-gray-500 items-center justify-center -left-[60px] top-1/2 transform -translate-y-1/2 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 ${
            isAnimating
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75"
          }`}
        >
          ×
        </button>

        {/* Header - Mobile Only */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">All photos</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            <i className="fi fi-rr-cross text-lg"></i>
          </button>
        </div>

        {/* Images Grid */}
        <div className="p-3 lg:p-4 overflow-y-auto max-h-[calc(100vh-48px)] lg:max-h-screen">
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2.5 lg:gap-4 transition-all duration-500 delay-100 ${
              isAnimating
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
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
                <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 group">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={image.image_url}
                      alt={image.image_name || "Travel package image"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 25vw"
                      blurDataURL="/blur.webp"
                      placeholder="blur"
                    />
                  </div>
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
