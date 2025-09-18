import Image from "next/image";
import { useState, useEffect } from "react";
import Popup from "@/components/Popup";
import { motion, AnimatePresence } from "framer-motion";

const ImageViewer = ({ images, isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
      setSelectedImage(null);
    }
  }, [isOpen]);

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title={
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-lg font-medium text-gray-800"
        >
          <i className="fi fi-rr-picture text-lg"></i>
          <span>Gallery</span>
          <span className="text-sm font-normal text-gray-500">({images.length} photos)</span>
        </motion.div>
      }
      pos="right"
      draggable={true}
      className="w-full lg:w-[55%] h-[80vh] lg:h-screen "
      pannelStyle="bg-white/95 backdrop-blur-md lg:ml-auto "
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-3 lg:p-4 overflow-y-auto h-full"
      >
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="flex flex-col gap-3 lg:gap-4"
        >
          {images.map((image, index) => (
            <motion.div 
              key={image.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedImage(image)}
              className="cursor-pointer"
            >
              <motion.div 
                className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden"
                layoutId={`image-${image.id}`}
              >
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
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300" 
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              layoutId={`image-${selectedImage.id}`}
              className="relative w-full max-w-5xl aspect-[16/9] rounded-xl overflow-hidden"
            >
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.image_name || "Travel package image"}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <i className="fi fi-rr-cross text-lg"></i>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Popup>
  );
};

export default ImageViewer;
