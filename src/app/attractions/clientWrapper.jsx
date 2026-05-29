"use client";

import Image from "next/image";
import Link from "next/link";
import AttractionCard from "@/components/attractionCard";
import AttractionFilters from "@/components/AttractionFilters/AttractionFilters";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import Popup from "@/components/Popup";
import { useState, useEffect, useRef } from "react";
// Router hooks removed to avoid SSR issues
import {
  getAttractionCategories,
  getAttractionLocations,
  list,
  getAttractions,
} from "./service";
import { formatTimeTo12Hour } from "@/utils/formatDate";

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
  const scrollContainerRef = useRef(null);
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

    // Refetch attractions with new filters
    try {
      setLoading(true);
      const attractionsResponse = await getAttractions(newFilters);

      // Transform attractions data
      if (attractionsResponse?.data?.data) {
        const transformedAttractions = attractionsResponse.data.data.map(
          (attraction) => ({
            // Admin flags may come as "1"/"0" strings, integers, or booleans depending on API serialization
            popular:
              attraction.popular === "1" ||
              attraction.popular === 1 ||
              attraction.popular === true,
            recommended:
              attraction.recommended === "1" ||
              attraction.recommended === 1 ||
              attraction.recommended === true,
            id: attraction.id,
            title: attraction.name,
            description: attraction.description,
            location: attraction.location,
            city: attraction.city,
            type:
              attraction.attraction_category_master?.name ||
              attraction.category ||
              "",
            image:
              attraction.image ||
              attraction.thumb_image ||
              attraction.cover_image,
            price: (() => {
              const rt = attraction.price?.rate_type;
              const base =
                rt === "full"
                  ? Number(attraction.price?.full_rate || 0)
                  : rt === "pax"
                  ? Number(attraction.price?.adult_price || 0)
                  : Number(attraction.price?.full_rate || attraction.price || 0);
              return Math.round(base * 100) / 100;
            })(),
            rating: attraction.rating || 0,
            reviewCount: attraction.review_count || 0,
            duration: formatTimeTo12Hour(attraction.start_time) || "updating",
            bestTimeToVisit: attraction.best_time_to_visit || "Morning",
            features: attraction.features || [],
            promoted:
              attraction.promoted ||
              attraction.popular === "1" ||
              attraction.popular === 1 ||
              attraction.popular === true ||
              attraction.recommended === "1" ||
              attraction.recommended === 1 ||
              attraction.recommended === true ||
              attraction.rating >= 4.0 ||
              false,
            interest_count: attraction.interest_count || 0,
            openingHours: attraction.opening_hours || "9:00 AM - 6:00 PM",
            address: attraction.address || "",
            coordinates: {
              latitude: attraction.latitude || 0,
              longitude: attraction.longitude || 0,
            },
          })
        );

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

  // Check scroll position and update arrow states (same behavior as events listing)
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  useEffect(() => {
    checkScrollPosition();
  }, [categories]);

  const activeCategory = categories.find((c) => c.slug === initialFilters.category);

  const bannerImage = "/images/attractions/banner.webp";
  const bannerEyebrow = "MUST-SEE PLACES";
  const bannerHeading = "Make It Memorable";

  return (
    <main className="min-h-screen bg-white pb-8">
      {/* Hero banner — package landing style */}
      <section className="relative h-[45vh] min-h-[300px] w-full overflow-hidden md:h-[50vh] md:min-h-[360px]">
        <div className="absolute inset-0">
          <Image
            src={bannerImage}
            alt={bannerHeading}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>

        <div className="relative mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="absolute right-0 top-4 z-10 lg:hidden">
            <button
              type="button"
              onClick={toggleFilter}
              className="relative inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-black/45"
            >
              <i className="fi fi-rr-settings-sliders text-[13px]" />
              Filters
              {hasActiveFilters() && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary-400 ring-2 ring-black/50" />
              )}
            </button>
          </div>

          <div className="absolute bottom-[12%] max-w-3xl md:bottom-[15%]">
            <span className="mb-2 inline-block text-xs font-light uppercase tracking-[0.2em] text-white/80">
              {bannerEyebrow}
            </span>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
              {bannerHeading}
            </h1>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="mx-auto flex container items-center gap-2 px-4 py-4 text-sm sm:px-6 lg:px-8">
          <Link href="/" className="text-gray-600 transition-colors hover:text-primary-600">
            Home
          </Link>
          <span className="text-gray-400">
            <i className="fi fi-rr-angle-right text-xs" />
          </span>
          <span className="font-medium text-primary-600">Attractions</span>
          {activeCategory && (
            <>
              <span className="text-gray-400">
                <i className="fi fi-rr-angle-right text-xs" />
              </span>
              <span className="font-medium text-primary-600">{activeCategory.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="relative container mx-auto px-4 pt-6">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filters - Desktop Only */}
          <div className="hidden lg:block lg:w-1/4 xl:w-1/5 shrink-0">
            <div className="sticky top-24">
              <AttractionFilters
                categories={categories}
                locations={locations}
                initialFilters={initialFilters}
                onFilterChange={handleFilterChange}
                layout="sidebar"
              />
            </div>
          </div>

          {/* Attractions Content */}
          <div className="flex-grow">
            {/* Category Grid */}
            <div className="mb-6">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Browse by category
              </p>
              {/* Mobile & Tablet: Horizontal Scroll with Navigation */}
              <div className="lg:hidden">
                <div className="relative">
                  {canScrollLeft && (
                    <button
                      onClick={scrollLeft}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <i className="fi fi-rr-angle-left text-gray-600 text-sm"></i>
                    </button>
                  )}

                  {canScrollRight && (
                    <button
                      onClick={scrollRight}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <i className="fi fi-rr-angle-right text-gray-600 text-sm"></i>
                    </button>
                  )}

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

                  <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-6 bg-gradient-to-r from-white/90 to-transparent" />
                  <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-6 bg-gradient-to-l from-white/90 to-transparent" />
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
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
