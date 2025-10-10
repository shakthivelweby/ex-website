"use client";

import AttractionCard from "@/components/attractionCard";
import AttractionFilters from "@/components/AttractionFilters/AttractionFilters";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getAttractionCategories, getLanguages, list } from "./service";

const ClientWrapper = ({
  searchParams: initialSearchParams,
  initialAttractions,
  initialCategories,
  initialLanguages,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [attractions, setAttractions] = useState(initialAttractions || []);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(initialCategories || []);
  const [languages, setLanguages] = useState(initialLanguages || []);

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
          date: attraction.opening_date,
          venue: attraction.location,
          type: attraction.attraction_category_master?.name || "",
          image: attraction.thumb_image || attraction.cover_image,
          price: (() => {
            if (attraction.attraction_prices && attraction.attraction_prices.length > 0) {
              const prices = attraction.attraction_prices
                .map((price) => parseFloat(price.price))
                .filter((price) => !isNaN(price));

              if (prices.length > 0) {
                return Math.min(...prices);
              }
            }
            return 150;
          })(),
          attractionPrices: attraction.attraction_prices || [],
          totalSlots: (() => {
            if (attraction.attraction_prices && attraction.attraction_prices.length > 0) {
              return attraction.attraction_prices.reduce(
                (total, price) => total + (price.available_slots || 0),
                0
              );
            }
            return 0;
          })(),
          availableSlots: (() => {
            if (attraction.attraction_prices && attraction.attraction_prices.length > 0) {
              return attraction.attraction_prices.reduce(
                (total, price) => total + (price.available_slots || 0),
                0
              );
            }
            return 0;
          })(),
          duration: attraction.duration || "2-3 hours",
          rating: attraction.rating || 4.5,
          promoted: true,
          interest_count: 180,
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

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-3 lg:mt-10">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Section - Desktop */}
          <div className="hidden lg:block lg:w-1/4 xl:w-1/5 shrink-0">
            <div className="sticky top-24">
              <AttractionFilters
                categories={categories}
                languages={languages}
                initialFilters={initialFilters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Attractions Content */}
          <div className="flex-grow">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <h2 className="text-sm sm:text-base font-medium text-gray-900">
                  Attractions in{" "}
                  <span className="text-primary-600">
                    {selectedLocation || "Mumbai"}
                  </span>
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  {attractions.length} attractions available
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
                        <i className="fi fi-rr-ferris-wheel text-gray-400 text-lg"></i>
                      )}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {category.name}
                    </span>
                  </button>
                ))}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
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

        {/* Mobile Filters */}
        <AttractionFilters
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
