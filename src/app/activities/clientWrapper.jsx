"use client";

import ActivityCard from "@/components/activityCard";
import ActivityFilters from "@/components/ActivityFilters/ActivityFilters";
import Popup from "@/components/Popup";
import { useEffect, useRef, useState } from "react";
// Router hooks removed to avoid SSR issues
import { getActivities } from "./service";
import { formatTimeTo12Hour } from "@/utils/formatDate";

export default function ClientWrapper({
  searchParams: initialSearchParams = {},
  initialActivities,
  initialCategories,
  initialLocations,
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activities, setActivities] = useState(initialActivities || []);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(initialCategories || []);
  const [locations, setLocations] = useState(initialLocations || []);
  const scrollContainerRef = useRef(null);
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

  const [filters, setFilters] = useState(initialFilters);

  // Function to check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => value);
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
    setFilters(newFilters);
    updateURL(newFilters);

    // Refetch activities with new filters
    try {
      setLoading(true);
      const activitiesResponse = await getActivities(newFilters);

      // Transform activities data (Laravel: { data: { data: [], pagination } })
      const list = activitiesResponse?.data?.data;
      if (Array.isArray(list)) {
        const transformedActivities = list.map(
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
            price: (() => {
              const rt = activity.price?.rate_type;
              const base =
                rt === "full"
                  ? Number(activity.price?.full_rate || 0)
                  : rt === "pax"
                  ? Number(activity.price?.adult_price || 0)
                  : Number(activity.price?.full_rate || activity.price || 0);
              const admin = Math.max(0, Number(activity.price?.admin_charge ?? 0));
              const afterAdmin = base + (base * admin) / 100;
              return Math.round(afterAdmin * 100) / 100;
            })(),
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

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-3 lg:mt-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Section - Desktop */}
          <div className="hidden lg:block lg:w-1/4 xl:w-1/5 shrink-0">
            <div className="sticky top-24">
              <ActivityFilters
                categories={categories}
                locations={locations}
                initialFilters={filters}
                onFilterChange={handleFilterChange}
                layout="sidebar"
              />
            </div>
          </div>

          {/* Activities Content */}
          <div className="flex-grow">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <h2 className="text-sm sm:text-base font-medium text-gray-900">
                  {filters.location ? (
                    <>
                      Activities in{" "}
                      <span className="text-primary-600">{filters.location}</span>
                    </>
                  ) : (
                    <>
                      Activities —{" "}
                      <span className="text-primary-600">all locations</span>
                    </>
                  )}
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  {activities.length} activities available
                </span>
              </div>

              {/* Mobile Filter Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white shadow-sm hover:bg-black transition-colors text-sm"
                >
                  <i className="fi fi-rr-settings-sliders text-[13px]"></i>
                  <span className="text-white">Filters</span>
                  {hasActiveFilters() && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Category Grid */}
            <div className="mb-8">
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
                            ...filters,
                            category: category.slug,
                          })
                        }
                        className={`flex flex-col items-center gap-2 group flex-shrink-0 min-w-[80px] ${
                          filters.category === category.slug
                            ? "text-primary-600"
                            : "text-gray-600 hover:text-primary-600"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 p-2.5 sm:p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${
                            filters.category === category.slug
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
                          ...filters,
                          category: category.slug,
                        })
                      }
                      className={`flex flex-col items-center gap-2 group ${
                        filters.category === category.slug
                          ? "text-primary-600"
                          : "text-gray-600 hover:text-primary-600"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 p-3 rounded-lg flex items-center justify-center transition-colors ${
                          filters.category === category.slug
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
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
              initialFilters={filters}
              onFilterChange={handleFilterChange}
              layout="mobile"
              onClose={toggleFilter}
            />
          </div>
        </Popup>
      </div>

    </main>
  );
}

