"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AttractionCard({ attraction }) {
  const {
    id,
    title,
    venue,
    type,
    image,
    price,
    duration,
    rating,
    availableSlots,
    promoted,
    interest_count,
  } = attraction;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100"
    >
      <Link href={`/attraction/${id}`} className="block">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image || "/fallback-cover.webp"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {promoted && (
              <span className="bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                Popular
              </span>
            )}
            {type && (
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                {type}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <i className="fi fi-sr-star text-yellow-400 text-xs"></i>
            <span className="text-xs font-medium text-gray-800">{rating}</span>
          </div>

          {/* Interest Count */}
          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <i className="fi fi-rr-heart text-xs"></i>
            <span>{interest_count}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>

          {/* Venue and Duration */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <i className="fi fi-rr-marker text-xs"></i>
              <span className="line-clamp-1">{venue}</span>
            </div>
            <div className="flex items-center gap-1">
              <i className="fi fi-rr-clock text-xs"></i>
              <span>{duration}</span>
            </div>
          </div>

          {/* Price and Availability */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-gray-900">₹{price}</span>
                <span className="text-sm text-gray-500">per person</span>
              </div>
              <div className="text-xs text-gray-500">
                {availableSlots > 0 ? (
                  <span className="text-green-600">
                    {availableSlots} slots available
                  </span>
                ) : (
                  <span className="text-red-500">Sold out</span>
                )}
              </div>
            </div>

            {/* Book Now Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <span>Book</span>
              <i className="fi fi-rr-arrow-small-right text-xs"></i>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
