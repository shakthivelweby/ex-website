"use client";

import EventCard from "@/components/eventCard";
import EventFilters from "@/components/EventFilters/EventFilters";
import Popup from "@/components/Popup";
import ListingsEmptyState from "@/components/common/ListingsEmptyState";
import ChipThumbImage from "@/components/common/ChipThumbImage";
import {
  buildCategorySuggestions,
  buildListingEmptyCopy,
  buildListingFilterLabels,
  getCategoryNameBySlug,
} from "@/utils/listingsEmptyStateHelpers";
import { useState, useEffect, useRef } from "react";
import ListingGridLoader from "@/components/loading/ListingGridLoader";
// Router hooks removed to avoid SSR issues
import { getEventCategories, getLanguages, list } from "./service";

const ClientWrapper = ({
  searchParams: initialSearchParams,
  initialEvents,
  initialCategories,
  initialLanguages,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
    date_from: initialSearchParams.date_from || "",
    date_to: initialSearchParams.date_to || "",
    language: initialSearchParams.language || "",
    category: initialSearchParams.category || "",
    price_from: initialSearchParams.price_from || "",
    price_to: initialSearchParams.price_to || "",
    longitude: initialSearchParams.longitude || "",
    latitude: initialSearchParams.latitude || "",
    location: initialSearchParams.location || "",
  };

  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const nextFilters = {
      date: initialSearchParams.date || "",
      date_from: initialSearchParams.date_from || "",
      date_to: initialSearchParams.date_to || "",
      language: initialSearchParams.language || "",
      category: initialSearchParams.category || "",
      price_from: initialSearchParams.price_from || "",
      price_to: initialSearchParams.price_to || "",
      longitude: initialSearchParams.longitude || "",
      latitude: initialSearchParams.latitude || "",
      location: initialSearchParams.location || "",
    };

    setFilters((prev) => {
      const changed = Object.keys(nextFilters).some(
        (key) => prev[key] !== nextFilters[key],
      );
      return changed ? nextFilters : prev;
    });
  }, [initialSearchParams]);

  useEffect(() => {
    setEvents(initialEvents || []);
  }, [initialEvents]);

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
    if (!filters.location && filters.longitude && filters.latitude) {
      setFilters((prev) => ({ ...prev, location: "Selected Location" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.longitude, filters.latitude]);

  // Function to check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => value);
  };

  const clearAllFilters = () => {
    handleFilterChange({
      date: "",
      date_from: "",
      date_to: "",
      language: "",
      category: "",
      price_from: "",
      price_to: "",
      longitude: "",
      latitude: "",
      location: "",
    });
  };

  const activeCategoryName = getCategoryNameBySlug(categories, filters.category);
  const emptyCopy = buildListingEmptyCopy({
    itemLabel: "events",
    categoryName: activeCategoryName,
  });

  // Function to update URL with filters
  const updateURL = (newFilters) => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    // Update or remove date parameters
    if (newFilters.date) {
      params.set("date", newFilters.date);
    } else {
      params.delete("date");
    }

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

    // Update or remove language parameter (comma-separated slugs)
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

    // Optional: store location label for UX
    if (newFilters.location) {
      params.set("location", newFilters.location);
    } else {
      params.delete("location");
    }

    // Update the URL without refreshing the page
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  // Function to handle filter changes immediately
  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
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
          date: event.event_days?.[0]?.date || event.starting_date,
          venue: event.location,
          type: event.event_category_master?.name || "",
          image: event.thumb_image || event.cover_image,
          popular: Boolean(event.popular),
          recommended: Boolean(event.recommended),
          price: (() => {
            if (event.event_days && event.event_days.length > 0) {
              const prices = event.event_days
                .flatMap((day) => day.event_ticket_prices)
                .map((p) => {
                  const base = Number(p?.price || 0);
                  return Math.round(base * 100) / 100;
                })
                .filter((n) => Number.isFinite(n) && n > 0);

              if (prices.length > 0) {
                return Math.min(...prices);
              }
            }
            return 0;
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
          interest_count: Number(event.event_bookings_count || 0),
          kidsFriendly:
            event.kids_friendly === true ||
            event.kids_friendly === 1 ||
            event.kids_friendly === "1",
          petsFriendly:
            event.pets_friendly === true ||
            event.pets_friendly === 1 ||
            event.pets_friendly === "1",
          multiDay: (event.event_days?.length || 0) > 1,
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
          <div className="hidden lg:block w-full lg:w-[300px] xl:w-[320px] shrink-0">
            <div className="sticky top-24">
              <EventFilters
                categories={categories}
                languages={languages}
                initialFilters={filters}
                onFilterChange={handleFilterChange}
                layout="sidebar"
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
                  <span className="text-primary-600">{filters.location || "your area"}</span>
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
                    onClick={() => {
                      setIsFilterOpen(true);
                      document.body.style.overflow = "hidden";
                    }}
                    className="relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white shadow-sm hover:bg-black transition-colors text-sm"
                  >
                    <i className="fi fi-rr-settings-sliders text-[13px]"></i>
                    <span className="text-white">Filters</span>
                    {Object.values(filters).some((value) => value) && (
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
                            ...filters,
                            category:
                              filters.category === category.slug ? "" : category.slug,
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
                          <ChipThumbImage
                            src={category.image}
                            filename={category.image_file}
                            alt={category.name}
                            iconClass="fi fi-rr-ticket text-lg"
                            className="w-full h-full rounded-lg overflow-hidden relative"
                            sizes="48px"
                          />
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
                        <ChipThumbImage
                          src={category.image}
                          filename={category.image_file}
                          alt={category.name}
                          iconClass="fi fi-rr-ticket text-lg"
                          className="w-full h-full rounded-lg overflow-hidden relative"
                          sizes="48px"
                        />
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
              <ListingGridLoader message="Loading events..." />
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <ListingsEmptyState
                icon="fi fi-rr-glass-cheers"
                title="No events found"
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
            <EventFilters
              categories={categories}
              languages={languages}
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
