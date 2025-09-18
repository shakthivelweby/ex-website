"use client";

import Image from "next/image";
import AttractionCard from "@/components/attractionCard";
import AttractionFilters from "@/components/AttractionFilters/AttractionFilters";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import Popup from "@/components/Popup";
import { useState, useEffect } from "react";
// Router hooks removed to avoid SSR issues
import { getAttractionCategories, getAttractionLocations, list } from "./service";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const ClientWrapper = ({
  searchParams: initialSearchParams,
  initialAttractions,
  initialCategories,
  initialLocations,
}) => {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [attractions, setAttractions] = useState(initialAttractions || []);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(initialCategories || []);
  const [locations, setLocations] = useState(initialLocations || []);
  const [isClient, setIsClient] = useState(false);
  const [featuredAttractions, setFeaturedAttractions] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Get initial filters from server-side search params
  const initialFilters = {
    date: initialSearchParams.date || "",
    location: initialSearchParams.location || "",
    category: initialSearchParams.category || "",
    rating: initialSearchParams.rating || "",
    price_from: initialSearchParams.price_from || "",
    price_to: initialSearchParams.price_to || "",
    longitude: initialSearchParams.longitude || "",
    latitude: initialSearchParams.latitude || "",
  };

  // Mark component as client-side after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (initialFilters.longitude && initialFilters.latitude) {
      setSelectedLocation("Selected Location");
    }
  }, [initialFilters.longitude, initialFilters.latitude]);

  // Filter featured attractions
  useEffect(() => {
    if (attractions.length > 0) {
      const featured = attractions.filter(attraction => attraction.promoted || attraction.rating >= 4.5).slice(0, 5);
      setFeaturedAttractions(featured);
    }
  }, [attractions]);

  // Function to check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(initialFilters).some((value) => value);
  };

  // Function to update URL with filters
  const updateURL = (newFilters) => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    // Update or remove date parameter
    if (newFilters.date) {
      params.set("date", newFilters.date);
    } else {
      params.delete("date");
    }

    // Update or remove location parameter
    if (newFilters.location) {
      params.set("location", newFilters.location);
    } else {
      params.delete("location");
    }

    // Update or remove category parameter (using slug)
    if (newFilters.category) {
      params.set("category", newFilters.category);
    } else {
      params.delete("category");
    }

    // Update or remove rating parameter
    if (newFilters.rating) {
      params.set("rating", newFilters.rating);
    } else {
      params.delete("rating");
    }

    // Update or remove price range parameters
    if (newFilters.price_from && newFilters.price_to) {
      params.set("price_from", newFilters.price_from);
      params.set("price_to", newFilters.price_to);
    } else {
      params.delete("price_from");
      params.delete("price_to");
    }

    // Update or remove coordinates parameters
    if (newFilters.longitude && newFilters.latitude) {
      params.set("longitude", newFilters.longitude);
      params.set("latitude", newFilters.latitude);
    } else {
      params.delete("longitude");
      params.delete("latitude");
    }

    // Update the URL without refreshing the page
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  // Handle location selection
  const handlePlaceSelected = (place) => {
    if (place) {
      const locationName = place.name;
      setSelectedLocation(locationName);
      updateURL({
        ...initialFilters,
        longitude: place.geometry.location.lng(),
        latitude: place.geometry.location.lat(),
      });
      setIsLocationOpen(false);
    }
  };

  // Function to toggle filter popup
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    // Prevent body scroll when filter is open
    if (!isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  // Function to handle filter changes immediately
  const handleFilterChange = async (newFilters) => {
    updateURL(newFilters);

    // Refetch attractions with new filters
    try {
      setLoading(true);
      const attractionsResponse = await list(newFilters);

      // Transform attractions data
      if (attractionsResponse?.data) {
        const transformedAttractions = attractionsResponse.data.map((attraction) => ({
          id: attraction.id,
          title: attraction.name,
          description: attraction.description,
          location: attraction.location,
          city: attraction.city,
          type: attraction.attraction_category_master?.name || "",
          image: attraction.thumb_image || attraction.cover_image,
          price: attraction.price || 0,
          rating: attraction.rating || 0,
          reviewCount: attraction.review_count || 0,
          duration: attraction.duration || "2-3 hours",
          bestTimeToVisit: attraction.best_time_to_visit || "Morning",
          features: attraction.features || [],
          promoted: attraction.promoted || false,
          interest_count: attraction.interest_count || 0,
          openingHours: attraction.opening_hours || "9:00 AM - 6:00 PM",
          address: attraction.address || "",
          coordinates: {
            latitude: attraction.latitude || 0,
            longitude: attraction.longitude || 0,
          },
        }));

        setAttractions(transformedAttractions);
      } else {
        setAttractions([]);
      }
    } catch (error) {
      console.error("Error fetching filtered attractions:", error);
      setAttractions([]);
    } finally {
      setLoading(false);
    }
  };


  // Category scroll functions
  const scrollCategories = (direction) => {
    const container = document.getElementById('categoryScrollContainer');
    if (container) {
      const scrollAmount = 200;
      const newScrollLeft = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll position
  const checkScrollPosition = () => {
    const container = document.getElementById('categoryScrollContainer');
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Initialize scroll position check
  useEffect(() => {
    if (isClient) {
      checkScrollPosition();
      const container = document.getElementById('categoryScrollContainer');
      if (container) {
        container.addEventListener('scroll', checkScrollPosition);
        return () => container.removeEventListener('scroll', checkScrollPosition);
      }
    }
  }, [isClient, categories]);

  return (
    <main className="min-h-screen bg-white">
      {/* Banner Section */}
      <div className="bg-gray-100 py-4 sm:py-8 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="overflow-hidden">
            {featuredAttractions.length > 0 ? (
              <div className="relative">
                {/* Navigation Arrows - Hidden on Mobile */}
                <button className="banner-swiper-button-prev hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-50 rounded-full items-center justify-center shadow-lg transition-all duration-200 z-20 border border-gray-200">
                  <i className="fi fi-rr-angle-left text-gray-600 text-lg"></i>
                </button>
                <button className="banner-swiper-button-next hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-50 rounded-full items-center justify-center shadow-lg transition-all duration-200 z-20 border border-gray-200">
                  <i className="fi fi-rr-angle-right text-gray-600 text-lg"></i>
                </button>

                {/* Swiper */}
                <Swiper
                  modules={[Navigation, Autoplay]}
                  spaceBetween={0}
                  slidesPerView={1}
                  navigation={{
                    prevEl: '.banner-swiper-button-prev',
                    nextEl: '.banner-swiper-button-next',
                  }}
                  autoplay={{
                    delay: 2000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  className="banner-swiper"
                >
                  {featuredAttractions.map((attraction, index) => (
                    <SwiperSlide key={attraction.id}>
                      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 max-w-7xl mx-auto">
                        {/* Left Content */}
                        <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center order-2 lg:order-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-medium">
                              Featured
                            </span>
                          </div>
                          
                          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-3">
                            {attraction.title}
                          </h1>
                          
                          <p className="text-gray-600 text-base sm:text-lg mb-2">
                            {attraction.type}
                          </p>
                          
                          <p className="text-gray-700 text-sm sm:text-base mb-6 leading-relaxed">
                            {attraction.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6">
                            <div className="flex items-center gap-2">
                              <span className="text-xl sm:text-2xl font-bold text-gray-900">₹ {attraction.price}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 text-sm sm:text-base">{attraction.duration}</span>
                            </div>
                            <div className="flex items-center gap-1 hidden">
                              <span className="text-yellow-500 text-lg">★</span>
                              <span className="text-gray-700 font-medium text-sm sm:text-base">{attraction.rating}</span>
                            </div>
                          </div>
                          
                          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-colors duration-200 w-fit text-sm sm:text-base">
                            Explore Now
                          </button>
                        </div>
                        
                        {/* Right Image */}
                        <div className="w-full lg:w-[400px] relative order-1 lg:order-2">
                          <div className="relative h-48 sm:h-64 w-full lg:h-full min-h-[200px] sm:min-h-[300px]">
                            <Image
                              src={attraction.image || "/images/attractions/card-img.jpg"}
                              alt={attraction.title}
                              fill
                              className="object-cover rounded-2xl w-full h-full"
                              priority={index === 0}
                            />
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
                {/* Left Content */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center order-2 lg:order-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                    Gateway of India
                  </h1>
                  
                  <p className="text-gray-600 text-base sm:text-lg mb-2">
                    Historical Monument
                  </p>
                  
                  <p className="text-gray-700 text-sm sm:text-base mb-6 leading-relaxed">
                    Iconic arch monument overlooking the Arabian Sea, a symbol of Mumbai's heritage.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">₹ 500</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm sm:text-base">2 hours</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-lg">★</span>
                      <span className="text-gray-700 font-medium text-sm sm:text-base">4.8</span>
                    </div>
                  </div>
                  
                  <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 w-fit text-sm sm:text-base">
                    Explore Now
                  </button>
                </div>
                
                {/* Right Image */}
                <div className="w-full lg:w-[400px] relative order-1 lg:order-2">
                  <div className="relative h-48 sm:h-64 w-full lg:h-full min-h-[200px] sm:min-h-[300px]">
                    <Image
                      src="/home/destination-1.webp"
                      alt="Gateway of India"
                      fill
                      className="object-cover rounded-2xl w-full h-full"
                      priority
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filters - Desktop Only */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <AttractionFilters
              categories={categories}
              locations={locations}
              initialFilters={initialFilters}
              onFilterChange={handleFilterChange}
              layout="sidebar"
            />
          </div>

          {/* Attractions Content */}
          <div className="flex-grow">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="md:flex items-center gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl lg:text-[28px] font-semibold text-gray-800 tracking-tight">
                 Attractions {" "}
                  {/* <span className="text-primary-600">
                    {selectedLocation || "Mumbai"}
                  </span> */}
                </h2>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 md:mt-0">
                  {attractions.length} attractions available
                </div>
              </div>

              {/* Mobile Filter Button */}
                <button
                onClick={toggleFilter}
                className="lg:hidden relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gray-900 text-white hover:from-primary-600 hover:to-primary-700 transition-all duration-300 hover:shadow-xl hover:scale-105 text-sm font-semibold"
                >
                  <i className="fi fi-rr-settings-sliders text-sm"></i>
                  <span>Filters</span>
                  {hasActiveFilters() && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {Object.values(initialFilters).filter((value) => value).length}
                      </span>
                    </span>
                  )}
                </button>
            </div>

            {/* Category Grid */}
            <div className="mb-8">
              {/* Desktop Grid */}
              <div className="hidden lg:grid grid-cols-8 xl:grid-cols-12 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      handleFilterChange({
                        ...initialFilters,
                        category: category.slug,
                      })
                    }
                    className={`flex flex-col items-center gap-2 group ${
                      initialFilters.category === category.slug
                        ? "text-primary-600"
                        : "text-gray-600 hover:text-primary-600"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 p-3 rounded-lg flex items-center justify-center transition-colors ${
                        initialFilters.category === category.slug
                          ? "bg-primary-50"
                          : "bg-gray-50 group-hover:bg-primary-50"
                      }`}
                    >
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-110"
                        />
                      ) : (
                        <i className="fi fi-rr-tag text-gray-400 text-lg"></i>
                      )}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Mobile/Tablet Horizontal Scroll */}
              <div className="lg:hidden relative">
                {/* Left Arrow */}
                {canScrollLeft && (
                  <button
                    onClick={() => scrollCategories('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <i className="fi fi-rr-angle-left text-gray-600 text-sm"></i>
                  </button>
                )}

                {/* Right Arrow */}
                {canScrollRight && (
                  <button
                    onClick={() => scrollCategories('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <i className="fi fi-rr-angle-right text-gray-600 text-sm"></i>
                  </button>
                )}

                {/* Scrollable Container */}
                <div 
                  id="categoryScrollContainer"
                  className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar px-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() =>
                        handleFilterChange({
                          ...initialFilters,
                          category: category.slug,
                        })
                      }
                      className={`flex flex-col items-center gap-2 group flex-shrink-0 min-w-[80px] ${
                        initialFilters.category === category.slug
                          ? "text-primary-600"
                          : "text-gray-600 hover:text-primary-600"
                      }`}
                    >
                      <div
                        className={`w-16 h-16 p-3 rounded-xl flex items-center justify-center transition-colors ${
                          initialFilters.category === category.slug
                            ? "bg-primary-50 border-2 border-primary-200"
                            : "bg-gray-50 group-hover:bg-primary-50 border-2 border-transparent"
                        }`}
                      >
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-110"
                          />
                        ) : (
                          <i className="fi fi-rr-tag text-gray-400 text-xl"></i>
                        )}
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Attractions Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-8 w-8 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-primary font-medium">
                    Loading attractions...
                  </span>
                </div>
              </div>
            ) : attractions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {attractions.map((attraction) => (
                  <AttractionCard key={attraction.id} attraction={attraction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  No attractions found
                </div>
                <div className="text-gray-400 text-sm">
                  Try adjusting your filters
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Mobile Filter Popup */}
        <Popup
          isOpen={isFilterOpen}
          onClose={toggleFilter}
          title="Filters"
          pos="right"
          className="lg:hidden"
          draggable={true}
        >
          <div className="p-6 space-y-6">
            <AttractionFilters
          categories={categories}
          locations={locations}
          initialFilters={initialFilters}
          onFilterChange={handleFilterChange}
              layout="mobile"
              onClose={toggleFilter}
        />
          </div>
        </Popup>

        {/* Location Picker Popup */}
        <LocationSearchPopup
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
          onPlaceSelected={handlePlaceSelected}
          googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          title="Choose Location"
        />
      </div>

      {/* Floating Filter Button - Mobile Only */}
      <div className="fixed bottom-6 right-6 z-40 hidden">
        <button
          onClick={toggleFilter}
          className="relative w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 hover:shadow-xl hover:scale-110 flex items-center justify-center"
        >
          <i className="fi fi-rr-settings-sliders text-lg"></i>
          {hasActiveFilters() && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {Object.values(initialFilters).filter((value) => value).length}
              </span>
            </span>
          )}
        </button>
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Swiper Navigation Styling */
        .banner-swiper .swiper-button-next,
        .banner-swiper .swiper-button-prev {
          display: none !important;
        }
        
        .banner-swiper .swiper-pagination {
          display: none !important;
        }
        
        .banner-swiper {
          height: auto !important;
        }
        
        .banner-swiper .swiper-slide {
          height: auto !important;
        }
      `}</style>
    </main>
  );
};

export default ClientWrapper;
