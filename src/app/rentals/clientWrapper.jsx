"use client";

import RentalCard from "@/components/rentalCard";
import RentalFilters from "@/components/RentalFilters/RentalFilters";
import Popup from "@/components/Popup";
import { useEffect, useRef, useState } from "react";
import { getRentals } from "./service";

const ClientWrapper = ({
  searchParams: initialSearchParams,
  initialRentals,
  initialCategories,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [rentals, setRentals] = useState(initialRentals || []);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [initialFilters, setInitialFilters] = useState({
    date: initialSearchParams.date || "",
    location: initialSearchParams.location || "",
    category: initialSearchParams.category || "",
    sub_category: initialSearchParams.sub_category || "",
    transmission: initialSearchParams.transmission || "",
    fuel_type: initialSearchParams.fuel_type || "",
    rating: initialSearchParams.rating || "",
    price_from: initialSearchParams.price_from || "",
    price_to: initialSearchParams.price_to || "",
    longitude: initialSearchParams.longitude || "",
    latitude: initialSearchParams.latitude || "",
    search: initialSearchParams.search || "",
  });

  const hasActiveFilters = () => Object.values(initialFilters).some((value) => value);

  const updateURL = (newFilters) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const setOrDelete = (key, value) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };
    setOrDelete("date", newFilters.date);
    setOrDelete("location", newFilters.location);
    setOrDelete("category", newFilters.category);
    setOrDelete("sub_category", newFilters.sub_category);
    setOrDelete("transmission", newFilters.transmission);
    setOrDelete("fuel_type", newFilters.fuel_type);
    setOrDelete("rating", newFilters.rating);
    if (newFilters.price_from && newFilters.price_to) {
      params.set("price_from", newFilters.price_from);
      params.set("price_to", newFilters.price_to);
    } else {
      params.delete("price_from");
      params.delete("price_to");
    }
    setOrDelete("longitude", newFilters.longitude);
    setOrDelete("latitude", newFilters.latitude);
    setOrDelete("search", newFilters.search);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    if (!isFilterOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  };

  const handleFilterChange = async (newFilters) => {
    updateURL(newFilters);
    setInitialFilters(newFilters);
    try {
      setLoading(true);
      const res = await getRentals({ ...newFilters, per_page: 24 });
      setRentals(res?.data?.data || []);
    } catch (e) {
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.isArray(initialCategories) ? initialCategories : [];

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  useEffect(() => {
    checkScrollPosition();
  }, [categories]);

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-3 lg:mt-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="hidden lg:block lg:w-1/4 xl:w-1/5 shrink-0">
            <div className="sticky top-24">
              <RentalFilters
                initialFilters={initialFilters}
                onFilterChange={handleFilterChange}
                categories={categories}
                locations={[]}
                layout="sidebar"
              />
            </div>
          </div>

          <div className="flex-grow">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <h2 className="text-sm sm:text-base font-medium text-gray-900">
                  Rentals in{" "}
                  <span className="text-primary-600">
                    {initialFilters.location || "your area"}
                  </span>
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  {rentals.length} {rentals.length === 1 ? "vehicle" : "vehicles"} available
                </span>
              </div>

              <div className="lg:hidden shrink-0">
                <button
                  type="button"
                  onClick={toggleFilter}
                  className="relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white shadow-sm hover:bg-black transition-colors text-sm"
                >
                  <i className="fi fi-rr-settings-sliders text-[13px]"></i>
                  <span>Filters</span>
                  {hasActiveFilters() && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Category strip removed from top (requested). */}

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
                  <span className="text-primary font-medium">Loading rentals...</span>
                </div>
              </div>
            ) : rentals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8">
                {rentals.map((r) => (
                  <RentalCard
                    key={r.id}
                    rental={r}
                    userCoords={{
                      latitude: initialFilters.latitude,
                      longitude: initialFilters.longitude,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No rentals found</div>
                <div className="text-gray-400 text-sm">Try adjusting your filters</div>
              </div>
            )}
          </div>
        </div>

        <Popup
          isOpen={isFilterOpen}
          onClose={() => {
            setIsFilterOpen(false);
            document.body.style.overflow = "unset";
          }}
          title="Filters"
          pos="right"
          className="lg:hidden"
          draggable={true}
        >
          <div className="p-6 space-y-6">
            <RentalFilters
              initialFilters={initialFilters}
              onFilterChange={handleFilterChange}
              categories={categories}
              locations={[]}
              layout="mobile"
              onClose={() => {
                setIsFilterOpen(false);
                document.body.style.overflow = "unset";
              }}
            />
          </div>
        </Popup>
      </div>

      <style jsx global>{`
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
