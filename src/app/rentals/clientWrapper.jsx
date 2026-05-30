"use client";

import RentalCard from "@/components/rentalCard";
import RentalFilters from "@/components/RentalFilters/RentalFilters";
import Popup from "@/components/Popup";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getRentals } from "./service";
import { normalizeRentalFilters } from "./rentalFilterUtils";

const ClientWrapper = ({
  searchParams: initialSearchParams,
  initialRentals,
  initialCategories,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [rentals, setRentals] = useState(initialRentals || []);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const rentalsFetchIdRef = useRef(0);

  const [initialFilters, setInitialFilters] = useState(() =>
    normalizeRentalFilters({
      date: initialSearchParams.date || "",
      location: initialSearchParams.location || "",
      category: initialSearchParams.category || "",
      sub_category: initialSearchParams.sub_category || "",
      transmission: initialSearchParams.transmission || "",
      fuel_type: initialSearchParams.fuel_type || "",
      seats: initialSearchParams.seats || "",
      rating: initialSearchParams.rating || "",
      price_from: initialSearchParams.price_from || "",
      price_to: initialSearchParams.price_to || "",
      longitude: initialSearchParams.longitude || "",
      latitude: initialSearchParams.latitude || "",
      search: initialSearchParams.search || "",
    })
  );

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
    setOrDelete("seats", newFilters.seats);
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

  const loadRentals = async (filters) => {
    const normalized = normalizeRentalFilters(filters);
    const fetchId = ++rentalsFetchIdRef.current;
    setLoading(true);
    setFetchError("");
    try {
      const res = await getRentals({ ...normalized, per_page: 100 });
      if (fetchId !== rentalsFetchIdRef.current) return;
      if (res?.success === false) {
        setRentals([]);
        setFetchError(res?.message || "Failed to load rentals");
        return;
      }
      setRentals(res?.data?.data || []);
    } catch (e) {
      if (fetchId !== rentalsFetchIdRef.current) return;
      setRentals([]);
      setFetchError("Could not load rentals. Is Laravel running on port 8000?");
    } finally {
      if (fetchId === rentalsFetchIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = async (newFilters) => {
    const normalized = normalizeRentalFilters(newFilters);
    updateURL(normalized);
    setInitialFilters(normalized);
    await loadRentals(normalized);
  };

  useEffect(() => {
    if (!initialRentals?.length) {
      loadRentals(initialFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategorySelect = async (slug) => {
    const nextCategory = initialFilters.category === slug ? "" : slug;
    await handleFilterChange(
      normalizeRentalFilters({
        ...initialFilters,
        category: nextCategory,
        sub_category: "",
        transmission: "",
        fuel_type: "",
        seats: "",
      })
    );
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

  const activeCategory = categories.find((c) => c.slug === initialFilters.category);

  const bannerImage = "/images/rentals/banner.webp";
  const bannerEyebrow = "RENT WITH EASE";
  const bannerHeading = "Rent. Wear. Explore.";

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
          <span className="font-medium text-primary-600">Rentals</span>
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
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="hidden lg:block lg:w-1/4 xl:w-1/5 shrink-0">
            <div className="sticky top-24">
              <RentalFilters
                initialFilters={initialFilters}
                onFilterChange={handleFilterChange}
                categories={categories}
                locations={[]}
                layout="sidebar"
                hideCategory
              />
            </div>
          </div>

          <div className="flex-grow">
            <div className="mb-4 flex items-center justify-between sm:mb-6">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <h2 className="text-sm font-medium text-gray-900 sm:text-base">
                  Rentals in{" "}
                  <span className="text-primary-600">
                    {initialFilters.location || "your area"}
                  </span>
                </h2>
                <span className="text-xs text-gray-500 sm:text-sm">
                  {rentals.length} {rentals.length === 1 ? "rental" : "rentals"} available
                </span>
              </div>
            </div>

            {categories.length > 0 && (
              <div className="mb-8">
                <div className="lg:hidden">
                  <div className="relative">
                    {canScrollLeft && (
                      <button
                        type="button"
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <i className="fi fi-rr-angle-left text-gray-600 text-sm"></i>
                      </button>
                    )}
                    {canScrollRight && (
                      <button
                        type="button"
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
                          type="button"
                          onClick={() => handleCategorySelect(category.slug)}
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
                    <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="grid grid-cols-6 xl:grid-cols-8 gap-4">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategorySelect(category.slug)}
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
            )}

            {fetchError ? (
              <div className="text-center py-12">
                <div className="text-red-600 text-lg mb-2">{fetchError}</div>
                <div className="text-gray-500 text-sm">
                  Start Laravel (<code className="text-xs">php artisan serve</code>) then restart the website (
                  <code className="text-xs">npm run build &amp;&amp; npm run start</code>).
                </div>
              </div>
            ) : loading ? (
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
              hideCategory
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
};

export default ClientWrapper;
