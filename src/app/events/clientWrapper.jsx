"use client";

import EventCard from "@/components/eventCard";
import EventFilters from "@/components/EventFilters/EventFilters";
import Image from "next/image";
import Link from "next/link";
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
    location: initialSearchParams.location || "",
  };

  const [filters, setFilters] = useState(initialFilters);

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

  // Function to toggle filter popup
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
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

  const activeCategory = categories.find((c) => c.slug === filters.category);

  const bannerImage = "/event/banner.webp";
  const bannerEyebrow = "FEEL THE ENERGY";
  const bannerHeading = "Celebrate Every Moment";

  return (
    <main className="min-h-screen bg-white pb-8">
      {/* Hero banner */}
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

        <div className="relative container mx-auto h-full px-4 sm:px-6 lg:px-8">
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

          <div className="absolute bottom-[12%] left-0 max-w-3xl md:bottom-[15%]">
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
        <div className="container mx-auto flex items-center gap-2 px-4 py-4 text-sm sm:px-6 lg:px-8">
          <Link href="/" className="text-gray-600 transition-colors hover:text-primary-600">
            Home
          </Link>
          <span className="text-gray-400">
            <i className="fi fi-rr-angle-right text-xs" />
          </span>
          <span className="font-medium text-primary-600">Events</span>
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

      <div className="container mx-auto px-4 pt-6 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Section - Desktop */}
          <div className="hidden lg:block lg:w-1/4 xl:w-1/5 shrink-0">
            <div className="sticky top-24">
              <EventFilters
                categories={categories}
                languages={languages}
                initialFilters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Events Content */}
          <div className="flex-grow">
            {/* Top Bar */}
            <div className="mb-4 flex items-center justify-between sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <h2 className="text-sm font-medium text-gray-900 sm:text-base">
                  Events in{" "}
                  <span className="text-primary-600">
                    {filters.location || "Mumbai"}
                  </span>
                </h2>
                <span className="text-xs text-gray-500 sm:text-sm">
                  {events.length} events available
                </span>
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
          onClose={() => {
            setIsFilterOpen(false);
            document.body.style.overflow = "unset";
          }}
          isMobile
          categories={categories}
          languages={languages}
          initialFilters={filters}
          onFilterChange={handleFilterChange}
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
