"use client";

import ActivityCard from "@/components/activityCard";
import ActivityFilters from "@/components/ActivityFilters/ActivityFilters";
import Popup from "@/components/Popup";
import ListingsEmptyState from "@/components/common/ListingsEmptyState";
import {
  buildCategorySuggestions,
  buildListingEmptyCopy,
  buildListingFilterLabels,
  getCategoryNameBySlug,
} from "@/utils/listingsEmptyStateHelpers";
import { useEffect, useRef, useState } from "react";
import ListingGridLoader from "@/components/loading/ListingGridLoader";
// Router hooks removed to avoid SSR issues
import { getActivities } from "./service";
import { formatTimeTo12Hour } from "@/utils/formatDate";
import { applyAdminCharge, applyDiscountOnAmount } from "@/utils/attractionPricing";

const normalizeActivityFilters = (raw = {}) => {
  const dateFrom = raw.date_from || raw.date || "";
  const dateTo = raw.date_to || dateFrom;
  return {
    ...raw,
    date_from: dateFrom,
    date_to: dateTo,
    date: dateFrom,
  };
};

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
  const initialFilters = normalizeActivityFilters({
    date_from: initialSearchParams.date_from || initialSearchParams.date || "",
    date_to:
      initialSearchParams.date_to ||
      initialSearchParams.date_from ||
      initialSearchParams.date ||
      "",
    location: initialSearchParams.location || "",
    category: initialSearchParams.category || "",
    rating: initialSearchParams.rating || "",
    price_from: initialSearchParams.price_from || "",
    price_to: initialSearchParams.price_to || "",
    longitude: initialSearchParams.longitude || "",
    latitude: initialSearchParams.latitude || "",
  });

  const [filters, setFilters] = useState(initialFilters);

  // Function to check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => value);
  };

  const clearAllFilters = () => {
    handleFilterChange({
      date_from: "",
      date_to: "",
      location: "",
      category: "",
      rating: "",
      price_from: "",
      price_to: "",
      longitude: "",
      latitude: "",
    });
  };

  const activeCategoryName = getCategoryNameBySlug(categories, filters.category);
  const emptyCopy = buildListingEmptyCopy({
    itemLabel: "activities",
    categoryName: activeCategoryName,
  });

  // Function to update URL with filters
  const updateURL = (newFilters) => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    // Update or remove date parameter
    if (newFilters.date_from) {
      params.set("date_from", newFilters.date_from);
    } else {
      params.delete("date_from");
    }

    if (newFilters.date_to) {
      params.set("date_to", newFilters.date_to);
    } else {
      params.delete("date_to");
    }

    params.delete("date");

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
    const normalized = normalizeActivityFilters(newFilters);
    setFilters(normalized);
    updateURL(normalized);

    // Refetch activities with new filters
    try {
      setLoading(true);
      const activitiesResponse = await getActivities(normalized);

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
              if (
                activity.free_booking === true ||
                activity.free_booking === 1 ||
                activity.free_booking === "1"
              ) {
                return 0;
              }
              const rt = activity.price?.rate_type;
              const adminPct = Number(activity.price?.admin_charge ?? 0);
              const discountPct = Number(activity.price?.discount ?? 0);
              const base =
                rt === "full"
                  ? Number(activity.price?.full_rate || 0)
                  : rt === "pax"
                  ? Number(activity.price?.adult_price || 0)
                  : Number(activity.price?.full_rate || activity.price || 0);
              const afterAdmin = applyAdminCharge(base, adminPct);
              return applyDiscountOnAmount(afterAdmin, discountPct);
            })(),
            freeBooking:
              activity.free_booking === true ||
              activity.free_booking === 1 ||
              activity.free_booking === "1",
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
    <main className="min-h-screen bg-white pb-24 lg:pb-8">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-3 lg:mt-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Section - Desktop */}
          <div className="hidden lg:block w-full lg:w-[300px] xl:w-[320px] shrink-0">
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
            <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-medium leading-snug text-gray-900 sm:text-lg">
                  Activities in{" "}
                  <span className="text-primary-600 break-words">
                    {filters.location || "your area"}
                  </span>
                </h1>
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  {activities.length}{" "}
                  {activities.length === 1 ? "activity" : "activities"} available
                </p>
              </div>

              {/* Mobile Filter Button */}
              <div className="shrink-0 lg:hidden">
                <button
                  onClick={() => {
                    setIsFilterOpen(true);
                    document.body.style.overflow = "hidden";
                  }}
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
                            category:
                              filters.category === category.slug ? "" : category.slug,
                          })
                        }
                        className={`flex flex-col items-center gap-2 group flex-shrink-0 min-w-[72px] sm:min-w-[80px] ${
                          filters.category === category.slug
                            ? "text-primary-600"
                            : "text-gray-600 hover:text-primary-600"
                        }`}
                      >
                        <div
                          className={`h-14 w-14 p-2.5 sm:h-12 sm:w-12 sm:p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${
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
                        <span className="max-w-[72px] truncate text-center text-xs font-medium leading-tight sm:max-w-[80px]">
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
                          category:
                            filters.category === category.slug ? "" : category.slug,
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
              <ListingGridLoader message="Loading activities..." />
            ) : activities.length > 0 ? (
              <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-3">
                {activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <ListingsEmptyState
                icon="fi fi-rr-hiking"
                title="No activities found"
                subtitle={emptyCopy.subtitle}
                description={emptyCopy.description}
                hasActiveFilters={hasActiveFilters()}
                onClearFilters={hasActiveFilters() ? clearAllFilters : undefined}
                activeFilterLabels={buildListingFilterLabels(filters, { categories })}
                suggestions={buildCategorySuggestions(categories, filters.category, (slug) =>
                  handleFilterChange({ ...filters, category: slug })
                )}
                suggestionsTitle="Explore other categories"
              />
            )}
          </div>
        </div>

        {/* Mobile Filter Popup */}
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
            <ActivityFilters
              categories={categories}
              locations={locations}
              initialFilters={filters}
              onFilterChange={handleFilterChange}
              layout="mobile"
              onClose={() => {
                setIsFilterOpen(false);
                document.body.style.overflow = "unset";
              }}
            />
          </div>
        </Popup>
      </div>

    </main>
  );
}

