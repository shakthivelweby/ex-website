"use client";

import EventCard from "@/components/eventCard";
import EventFilters from "@/components/EventFilters/EventFilters";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const ClientWrapper = ({
  allCategories,
  allLanguages,
  list,
  transformedEvents,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [events, setEvents] = useState(transformedEvents);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState(allCategories.data);
  const [languages, setLanguages] = useState(allLanguages.data);

  // Remove the useEffect that was transforming data client-side
  // The data is now pre-transformed server-side

  // Update events when transformedEvents prop changes (e.g., when filters are applied)
  useEffect(() => {
    setEvents(transformedEvents);
  }, [transformedEvents]);

  // Get initial filters from URL
  const initialFilters = {
    date: searchParams.get("date") || "",
    language: searchParams.get("language") || "",
    category: searchParams.get("category") || "",
    price_from: searchParams.get("price_from") || "",
    price_to: searchParams.get("price_to") || "",
    longitude: searchParams.get("longitude") || "",
    latitude: searchParams.get("latitude") || "",
  };

  useEffect(() => {
    if (initialFilters.longitude && initialFilters.latitude) {
      // You might want to reverse geocode to get location name for display
      setSelectedLocation("Selected Location");
    }
  }, [initialFilters.longitude, initialFilters.latitude]);

  // Function to check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(initialFilters).some((value) => value);
  };

  // Function to update URL with filters
  const updateURL = (newFilters) => {
    const params = new URLSearchParams(searchParams);

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
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
  const handleFilterChange = (newFilters) => {
    updateURL(newFilters);
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      handleFilterChange({
                        ...initialFilters,
                        category: category.slug,
                      })
                    }
                    className={`flex flex-col items-center gap-2 group ${initialFilters.category === category.slug
                      ? "text-primary-600"
                      : "text-gray-600 hover:text-primary-600"
                      }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${initialFilters.category === category.slug
                        ? "bg-primary-50"
                        : "bg-gray-50 group-hover:bg-primary-50"
                        }`}
                    >
                      {/* <i className={`${category.icon} text-xl`}></i> */}
                    </div>
                    <span className="text-xs font-medium text-center">
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Events Grid */}
            {events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={{
                      ...event,
                      image: event.thumImage // Use thumbnail image, fallback to cover image, then default
                    }}
                  />
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
      `}</style>
    </main>
  );
};

export default ClientWrapper;
