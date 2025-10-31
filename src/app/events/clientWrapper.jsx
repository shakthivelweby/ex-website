"use client";

import EventCard from "@/components/eventCard";
import EventFilters from "@/components/EventFilters/EventFilters";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import { useState, useEffect, useRef } from "react";
// Router hooks removed to avoid SSR issues
import { getEventCategories, getLanguages, list } from "./service";

const ClientWrapper = ({
  searchParams: initialSearchParams,
  initialEvents,
  initialCategories,
  initialLanguages,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [events, setEvents] = useState(initialEvents || []);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(initialCategories || []);
  const [languages, setLanguages] = useState(initialLanguages || []);
  const [isClient, setIsClient] = useState(false);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Get initial filters from server-side search params
  const initialFilters = {
    date: initialSearchParams.date || "",
    language: initialSearchParams.language || "",
    category: initialSearchParams.category || "",
    price_from: initialSearchParams.price_from || "",
    price_to: initialSearchParams.price_to || "",
    longitude: initialSearchParams.longitude || "",
    latitude: initialSearchParams.latitude || "",
  };

  // Mark component as client-side after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check scroll position and update arrow states
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  // Update scroll state when categories change
  useEffect(() => {
    checkScrollPosition();
  }, [categories]);

  useEffect(() => {
    if (initialFilters.longitude && initialFilters.latitude) {
      setSelectedLocation("Selected Location");
    }
  }, [initialFilters.longitude, initialFilters.latitude]);

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

    // Update or remove language parameter (using slug)
    if (newFilters.language) {
      params.set("language", newFilters.language);
    } else {
      params.delete("language");
    }

    // Update or remove category parameter (using slug)
    if (newFilters.category) {
      params.set("category", newFilters.category);
    } else {
      params.delete("category");
    }

    // Update or remove price range parameters
    if (newFilters.price_from && newFilters.price_to) {
      params.set("price_from", newFilters.price_from);
      params.set("price_to", newFilters.price_to);
    } else {
      params.delete("price_from");
      params.delete("price_to");
    }

    // Update or remove location parameters
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

  // Function to handle filter changes immediately
  const handleFilterChange = async (newFilters) => {
    updateURL(newFilters);

    // Refetch events with new filters
    try {
      setLoading(true);
      const eventsResponse = await list(newFilters);

      // Transform events data
      if (eventsResponse?.data) {
        const transformedEvents = eventsResponse.data.map((event) => ({
          id: event.id,
          title: event.name,
          date: event.starting_date,
          venue: event.location,
          type: event.event_category_master?.name || "",
          image: event.thumb_image || event.cover_image,
          price: (() => {
            if (event.event_days && event.event_days.length > 0) {
              const prices = event.event_days
                .flatMap((day) => day.event_ticket_prices)
                .map((price) => parseFloat(price.price))
                .filter((price) => !isNaN(price));

              if (prices.length > 0) {
                return Math.min(...prices);
              }
            }
            return 100;
          })(),
          eventDays: event.event_days || [],
          totalShows: (() => {
            if (event.event_days && event.event_days.length > 0) {
              return event.event_days.reduce(
                (total, day) => total + (day.event_shows?.length || 0),
                0
              );
            }
            return 0;
          })(),
          availableSlots: (() => {
            if (event.event_days && event.event_days.length > 0) {
              return event.event_days.reduce((total, day) => {
                const daySlots =
                  day.event_ticket_prices?.reduce(
                    (dayTotal, price) =>
                      dayTotal + (price.available_slots || 0),
                    0
                  ) || 0;
                return total + daySlots;
              }, 0);
            }
            return 0;
          })(),
          dateRange: (() => {
            if (event.event_days && event.event_days.length > 0) {
              const dates = event.event_days.map((day) => day.date).sort();
              if (dates.length === 1) {
                return dates[0];
              } else {
                return `${dates[0]} to ${dates[dates.length - 1]}`;
              }
            }
            return event.starting_date || "";
          })(),
          promoted: true,
          interest_count: 245,
        }));

        setEvents(transformedEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching filtered events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-3 lg:mt-10">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Section - Desktop */}
          <div className="hidden lg:block lg:w-1/4 xl:w-1/5 shrink-0">
            <div className="sticky top-24">
              <EventFilters
                categories={categories}
                languages={languages}
                initialFilters={initialFilters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Events Content */}
          <div className="flex-grow">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <h2 className="text-sm sm:text-base font-medium text-gray-900">
                  Events in{" "}
                  <span className="text-primary-600">
                    {selectedLocation || "Mumbai"}
                  </span>
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  {events.length} events available
                </span>
              </div>

              {/* Location and Filter Buttons */}
              <div className="flex items-center gap-2 lg:gap-3">
                {/* Mobile Filter Button */}
                <div className="lg:hidden">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white shadow-sm hover:bg-black transition-colors text-sm"
                  >
                    <i className="fi fi-rr-settings-sliders text-[13px]"></i>
                    <span className="text-white">Filters</span>
                    {Object.values(initialFilters).some((value) => value) && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Category Grid */}
            <div className="mb-8">
              {/* Mobile & Tablet: Horizontal Scroll with Navigation */}
              <div className="lg:hidden">
                <div className="relative">
                  {/* Left Arrow */}
                  {canScrollLeft && (
                    <button
                      onClick={scrollLeft}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <i className="fi fi-rr-angle-left text-gray-600 text-sm"></i>
                    </button>
                  )}

                  {/* Right Arrow */}
                  {canScrollRight && (
                    <button
                      onClick={scrollRight}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <i className="fi fi-rr-angle-right text-gray-600 text-sm"></i>
                    </button>
                  )}

                  {/* Scrollable Container */}
                  <div
                    ref={scrollContainerRef}
                    onScroll={checkScrollPosition}
                    className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 px-1 -mx-1"
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
                          className={`w-12 h-12 p-2.5 sm:p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${
                            initialFilters.category === category.slug
                              ? "bg-primary-50 shadow-sm"
                              : "bg-gray-50 group-hover:bg-primary-50 group-hover:shadow-sm"
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
                        <span className="text-xs font-medium text-center leading-tight whitespace-nowrap max-w-[80px] truncate">
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Gradient fade indicators */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Desktop: Grid Layout */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-6 xl:grid-cols-8 gap-4">
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
              </div>
            </div>

            {/* Events Grid */}
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
                    Loading events...
                  </span>
                </div>
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  No events found
                </div>
                <div className="text-gray-400 text-sm">
                  Try adjusting your filters
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters */}
        <EventFilters
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          isMobile
          categories={categories}
          languages={languages}
          initialFilters={initialFilters}
          onFilterChange={handleFilterChange}
        />

        {/* Location Picker Popup */}
        <LocationSearchPopup
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
          onPlaceSelected={handlePlaceSelected}
          googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          title="Choose Location"
        />
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
};

export default ClientWrapper;
