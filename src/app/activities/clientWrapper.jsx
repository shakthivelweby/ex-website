"use client";

import Image from "next/image";
import Link from "next/link";
import ActivityCard from "@/components/activityCard";
import ActivityFilters from "@/components/ActivityFilters/ActivityFilters";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import Popup from "@/components/Popup";
import { useState, useEffect } from "react";
// Router hooks removed to avoid SSR issues
import {
  getActivityCategories,
  getActivityLocations,
  list,
  getActivities,
} from "./service";
import { formatTimeTo12Hour } from "@/utils/formatDate";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const ClientWrapper = ({
  searchParams: initialSearchParams,
  initialActivities,
  initialCategories,
  initialLocations,
}) => {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activities, setActivities] = useState(initialActivities || []);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(initialCategories || []);
  const [locations, setLocations] = useState(initialLocations || []);
  const [isClient, setIsClient] = useState(false);
  const [featuredActivities, setFeaturedActivities] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Get initial filters from server-side search params - Make it reactive state
  const [initialFilters, setInitialFilters] = useState({
    date: initialSearchParams.date || "",
    location: initialSearchParams.location || "",
    category: initialSearchParams.category || "",
    rating: initialSearchParams.rating || "",
    price_from: initialSearchParams.price_from || "",
    price_to: initialSearchParams.price_to || "",
    longitude: initialSearchParams.longitude || "",
    latitude: initialSearchParams.latitude || "",
  });

  // Mark component as client-side after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (initialFilters.longitude && initialFilters.latitude) {
      setSelectedLocation("Selected Location");
    }
  }, [initialFilters.longitude, initialFilters.latitude]);

  // Filter featured activities
  useEffect(() => {
    if (activities.length > 0) {
      const featured = activities
        .filter((activity) => activity.promoted || activity.rating >= 4.5)
        .slice(0, 5);
      setFeaturedActivities(featured);
    }
  }, [activities]);

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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  // Function to handle filter changes immediately

  const handleFilterChange = async (newFilters) => {
    updateURL(newFilters);

    // Update initialFilters state so it's passed down to child components
    setInitialFilters(newFilters);

    // Refetch activities with new filters
    try {
      setLoading(true);
      const activitiesResponse = await getActivities(newFilters);

      // Transform activities data
      if (activitiesResponse?.data?.data) {
        const transformedActivities = activitiesResponse.data.data.map(
          (activity) => ({
            id: activity.id,
            title: activity.name,
            description: activity.description,
            location: activity.location,
            city: activity.city,
            type:
              activity.activity_category_master?.name ||
              activity.category ||
              "",
            image:
              activity.image ||
              activity.thumb_image ||
              activity.cover_image,
            price:
              activity.price?.rate_type === "full"
                ? activity.price?.full_rate
                : activity.price?.rate_type === "pax"
                ? activity.price?.adult_price
                : activity.price?.full_rate || activity.price || 0,
            rating: activity.rating || 0,
            reviewCount: activity.review_count || 0,
            duration: formatTimeTo12Hour(activity.start_time) || "updating",
            bestTimeToVisit: activity.best_time_to_visit || "Morning",
            features: activity.features || [],
            promoted:
              activity.promoted ||
              activity.popular === "1" ||
              activity.recommended === "1" ||
              activity.rating >= 4.0 ||
              false,
            popular: activity.popular === "1",
            recommended: activity.recommended === "1",
            interest_count: activity.interest_count || 0,
            openingHours: activity.opening_hours || "9:00 AM - 6:00 PM",
            address: activity.address || "",
            coordinates: {
              latitude: activity.latitude || 0,
              longitude: activity.longitude || 0,
            },
          })
        );

        setActivities(transformedActivities);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error("Error fetching filtered activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Category scroll functions
  const scrollCategories = (direction) => {
    const container = document.getElementById("categoryScrollContainer");
    if (container) {
      const scrollAmount = 200;
      const newScrollLeft =
        container.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      container.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  // Check scroll position
  const checkScrollPosition = () => {
    const container = document.getElementById("categoryScrollContainer");
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
      const container = document.getElementById("categoryScrollContainer");
      if (container) {
        container.addEventListener("scroll", checkScrollPosition);
        return () =>
          container.removeEventListener("scroll", checkScrollPosition);
      }
    }
  }, [isClient, categories]);

  return (
    <main className="min-h-screen bg-white">
      {/* Banner Section */}
      <div className="relative bg-[url('/images/activity-bg.jpg')] bg-cover bg-center bg-no-repeat h-[50vh] md:h-[50vh] w-full overflow-hidden">
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60 z-10"></div>
        
        {/* Content at Bottom */}
        <div className="relative h-full z-20 flex items-end">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 sm:pb-12 lg:pb-16">
            <div className="max-w-3xl">
                <div className="text-xs sm:text-sm text-white/90 font-normal uppercase mb-2">
                  {activities.length} activities available
                </div>
              <h1 className="text-4xl lg:text-5xl font-medium text-white leading-[1.1] tracking-tight">
                Explore Our Exciting Activities
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Main Content */}
        <div className="">
          {/* Top Bar with Heading and Filters */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-4 mb-4">
              {/* Left Side - Heading and Count */}
              <div className="hidden items-center gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl lg:text-[28px] font-semibold text-gray-800 tracking-tight">
                Explore Our Exciting Activities{" "}
                  {/* <span className="text-primary-600">
                    {selectedLocation || "Mumbai"}
                  </span> */}
                </h2>
                <div className="text-xs sm:text-sm text-gray-500">
                  {activities.length} activities available
                </div>
              </div>

              {/* Desktop Filters - Same line as heading */}
              <div className="hidden lg:flex lg:items-center lg:gap-3">
                <ActivityFilters
                  categories={categories}
                  locations={locations}
                  initialFilters={initialFilters}
                  onFilterChange={handleFilterChange}
                  layout="top"
                />
              </div>

              {/* Mobile Filter Button - Sticky Fixed */}
              <div className="lg:hidden fixed bottom-[80px] right-6 z-40">
                <button
                  onClick={toggleFilter}
                  className="relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gray-900 text-white hover:bg-primary-600 transition-all duration-300 hover:shadow-xl hover:scale-105 text-sm font-semibold shadow-lg"
                >
                  <i className="fi fi-rr-settings-sliders text-sm"></i>
                  <span>Filters</span>
                  {hasActiveFilters() && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {
                          Object.values(initialFilters).filter((value) => value)
                            .length
                        }
                      </span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Activities Content */}
          <div className="flex-grow">

            {/* Category Grid */}
            <div className="">
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
                      className={`w-16 h-16 p-2 rounded-lg flex items-center justify-center transition-colors ${
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
                        <i className="fi fi-rr-tag text-gray-400 text-xl"></i>
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
                    onClick={() => scrollCategories("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <i className="fi fi-rr-angle-left text-gray-600 text-sm"></i>
                  </button>
                )}

                {/* Right Arrow */}
                {canScrollRight && (
                  <button
                    onClick={() => scrollCategories("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <i className="fi fi-rr-angle-right text-gray-600 text-sm"></i>
                  </button>
                )}

                {/* Scrollable Container */}
                <div
                  id="categoryScrollContainer"
                  className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar px-2"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
                        className={`w-20 h-20 p-2 rounded-xl flex items-center justify-center transition-colors ${
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
                          <i className="fi fi-rr-tag text-gray-400 text-2xl"></i>
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

            {/* Activities Grid */}
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
                    Loading activities...
                  </span>
                </div>
              </div>
            ) : activities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  No activities found
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
            <ActivityFilters
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

