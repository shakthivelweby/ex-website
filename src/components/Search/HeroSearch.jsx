"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAllDestinations, useRentalCategories } from "@/app/search/query";
import { hasStoredImage } from "@/utils/imageUrl";
import { buildCategoryTypesFromCategories } from "@/app/rentals/rentalCategoryTypeUtils";
import DateRangeSearchField from "./DateRangeSearchField";
import LocationSearchInput from "../LocationSearchInput";
import SearchInputBox from "./SearchInputBox";
import { SEARCH_MODULES } from "./searchModules";

const HERO_MODULES = SEARCH_MODULES;

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const createDefaultDateFilters = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);
  return {
    location: "",
    longitude: "",
    latitude: "",
    dateFrom: todayStr,
    dateTo: todayStr,
    form_type: "",
  };
};

export default function HeroSearch() {
  const router = useRouter();
  const destinationAnchorRef = useRef(null);
  const destinationDropdownRef = useRef(null);
  const tabsScrollRef = useRef(null);
  const [showTabsScrollHint, setShowTabsScrollHint] = useState(true);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [selectedModule, setSelectedModule] = useState("package");
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [locationFilters, setLocationFilters] = useState(createDefaultDateFilters);

  const isPackage = selectedModule === "package";
  const isSchedule = selectedModule === "schedule";
  const isDestinationModule = isPackage || isSchedule;
  const isEvents = selectedModule === "events";
  const isAttractions = selectedModule === "attractions";
  const isActivities = selectedModule === "activities";
  const isRentals = selectedModule === "rentals";
  const needsDates = !isDestinationModule;

  const activeModuleConfig =
    HERO_MODULES.find((module) => module.id === selectedModule) ?? HERO_MODULES[0];

  const { data: destinationsData, isLoading: isDestinationsLoading } =
    useAllDestinations(true);
  const allDestinations = destinationsData?.data || [];

  const { data: rentalCategoriesData } = useRentalCategories(isRentals);
  const rentalCategoryTypes = useMemo(
    () => buildCategoryTypesFromCategories(rentalCategoriesData?.data || []),
    [rentalCategoriesData],
  );

  const filteredDestinations = useMemo(() => {
    if (!destinationQuery.trim()) return allDestinations;
    const query = destinationQuery.toLowerCase();
    return allDestinations.filter(
      (dest) =>
        dest.name?.toLowerCase().includes(query) ||
        dest.state?.name?.toLowerCase().includes(query),
    );
  }, [allDestinations, destinationQuery]);

  const updateDropdownPosition = useCallback(() => {
    const anchor = destinationAnchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const margin = 8;
    let width = Math.min(rect.width, window.innerWidth - margin * 2);
    let left = rect.left;
    const maxLeft = window.innerWidth - width - margin;
    if (left > maxLeft) left = Math.max(margin, maxLeft);
    if (left < margin) left = margin;

    setDropdownPosition({
      top: rect.bottom + 8,
      left,
      width,
    });
  }, []);

  useEffect(() => {
    if (!showDestinationDropdown) return undefined;

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [showDestinationDropdown, updateDropdownPosition]);

  useEffect(() => {
    if (!showDestinationDropdown) return undefined;

    const handleClickOutside = (event) => {
      if (destinationAnchorRef.current?.contains(event.target)) return;
      if (destinationDropdownRef.current?.contains(event.target)) return;
      setShowDestinationDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDestinationDropdown]);

  useEffect(() => {
    const el = tabsScrollRef.current;
    if (!el) return undefined;

    const updateScrollHint = () => {
      setShowTabsScrollHint(
        el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      );
    };

    updateScrollHint();
    el.addEventListener("scroll", updateScrollHint, { passive: true });
    window.addEventListener("resize", updateScrollHint);

    return () => {
      el.removeEventListener("scroll", updateScrollHint);
      window.removeEventListener("resize", updateScrollHint);
    };
  }, []);

  const scrollTabsRight = () => {
    tabsScrollRef.current?.scrollBy({ left: 140, behavior: "smooth" });
  };

  const handleModuleChange = (moduleId) => {
    setSelectedModule(moduleId);
    setShowDestinationDropdown(false);
    setDestinationQuery("");
    setSelectedDestinations([]);
    setLocationFilters(createDefaultDateFilters());
  };

  const toggleDestination = (destination) => {
    if (isSchedule) {
      setSelectedDestinations((prev) =>
        prev.some((d) => d.id === destination.id) ? [] : [destination],
      );
      setDestinationQuery("");
      setShowDestinationDropdown(false);
      return;
    }

    setSelectedDestinations((prev) => {
      const exists = prev.some((d) => d.id === destination.id);
      if (exists) return prev.filter((d) => d.id !== destination.id);
      return [...prev, destination];
    });
    setDestinationQuery("");
  };

  const searchButtonLabel =
    isDestinationModule && selectedDestinations.length > 0
      ? isSchedule
        ? "View scheduled"
        : selectedDestinations.length === 1
          ? "Search"
          : `Search ${selectedDestinations.length}`
      : "Search";

  const runPackageSearch = () => {
    const normalized = selectedDestinations.map((dest) => ({
      id: dest.id,
      name: dest.name,
      type: "destination",
      state_id: dest.state_id,
      country_id: dest.state?.country_id,
      destination_id: dest.id,
    }));

    if (isSchedule) {
      localStorage.setItem("choosedDestination", JSON.stringify(normalized[0]));
      window.dispatchEvent(new CustomEvent("destinationChanged"));
      router.push("/scheduled");
      return;
    }

    if (normalized.length === 1) {
      const item = normalized[0];
      const countryId = item.country_id ?? item.state?.country_id;
      if (!countryId) {
        router.push("/explore");
        return;
      }
      localStorage.setItem("choosedDestination", JSON.stringify(item));
      window.dispatchEvent(new CustomEvent("destinationChanged"));
      const params = new URLSearchParams({
        state: item.state_id,
        destination: item.id,
      });
      router.push(`/packages/${countryId}?${params.toString()}`);
      return;
    }

    sessionStorage.setItem(
      "packageSearchDestinations",
      JSON.stringify(normalized),
    );
    const ids = normalized.map((d) => d.id).join(",");
    const countryCounts = normalized.reduce((acc, d) => {
      if (!d.country_id) return acc;
      acc[d.country_id] = (acc[d.country_id] || 0) + 1;
      return acc;
    }, {});
    const primaryCountryId = Object.entries(countryCounts).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    if (primaryCountryId) {
      router.push(`/packages/${primaryCountryId}?destinations=${ids}`);
    } else {
      router.push(`/explore?destinations=${ids}`);
    }
  };

  const runLocationSearch = () => {
    const params = new URLSearchParams();
    if (locationFilters.dateFrom) params.set("date_from", locationFilters.dateFrom);
    if (locationFilters.dateTo) params.set("date_to", locationFilters.dateTo);
    if (locationFilters.longitude) params.set("longitude", locationFilters.longitude);
    if (locationFilters.latitude) params.set("latitude", locationFilters.latitude);
    if (locationFilters.location) params.set("location", locationFilters.location);

    const basePath = isRentals
      ? "/rentals"
      : isEvents
        ? "/events"
        : isAttractions
          ? "/attractions"
          : "/activities";

    if (isRentals && locationFilters.form_type) {
      params.set("form_type", locationFilters.form_type);
    }

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  const handleSearch = () => {
    setShowDestinationDropdown(false);
    if (isDestinationModule) {
      if (selectedDestinations.length === 0) {
        router.push(isSchedule ? "/scheduled" : "/explore");
        return;
      }
      runPackageSearch();
      return;
    }
    runLocationSearch();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full"
    >
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-[#EBEBEB]">
        <div className="px-5 pb-3 pt-5 text-center sm:px-8 sm:pb-4 sm:pt-7">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-600 sm:mb-2 sm:text-[11px] sm:tracking-[0.2em]">
            Explore World
          </p>
          <h1 className="text-[30px] font-medium leading-[1.1] tracking-tight text-[#222222] sm:text-[34px] md:text-4xl">
            Pay less. Book direct.
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#717171] sm:mt-2.5 sm:text-[15px]">
            Packages, events, attractions, activities & more — from verified
            suppliers, one search away.
          </p>
        </div>

        <div className="border-t border-[#EBEBEB] px-5 py-2 sm:px-8 sm:py-2.5">
          <div
            className="relative w-full"
          >
            <div
              ref={tabsScrollRef}
              className="flex snap-x snap-mandatory justify-start gap-0.5 overflow-x-auto pr-9 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center sm:gap-1 sm:pr-0 [&::-webkit-scrollbar]:hidden"
            >
            {HERO_MODULES.map((module) => {
              const isActive = selectedModule === module.id;
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => handleModuleChange(module.id)}
                  className={`flex shrink-0 snap-center flex-col items-center gap-0.5 border-b-2 px-2.5 py-1.5 text-[11px] font-semibold transition-colors sm:gap-1 sm:px-4 sm:py-2 sm:text-[12px] ${
                    isActive
                      ? `border-current ${module.activeText}`
                      : "border-transparent text-[#555555] hover:text-[#222222]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${module.iconBg}`}
                  >
                    <i className={`fi ${module.icon} text-xs sm:text-sm ${module.iconColor}`} />
                  </span>
                  <span className="whitespace-nowrap">{module.label}</span>
                </button>
              );
            })}
            </div>

            {showTabsScrollHint ? (
              <>
                <div
                  className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white via-white/95 to-transparent sm:hidden"
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={scrollTabsRight}
                  className="absolute right-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#EBEBEB] bg-white text-[#717171] shadow-sm sm:hidden"
                  aria-label="Swipe to see more categories"
                >
                  <i className="fi fi-rr-angle-right text-xs" />
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#EBEBEB] px-5 py-4 sm:px-8 sm:py-5">
          <div
            className={`grid w-full grid-cols-1 gap-2.5 sm:gap-3 ${
              isDestinationModule
                ? "sm:grid-cols-[minmax(0,1fr)_auto]"
                : isRentals
                  ? "sm:grid-cols-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_auto]"
                  : "sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]"
            } sm:items-end`}
          >
            {isDestinationModule ? (
              <div ref={destinationAnchorRef} className="min-w-0">
                <SearchInputBox label={isSchedule ? "Destination" : "Where to?"}>
                  <div
                    className={`flex min-h-[22px] flex-wrap items-center gap-1.5 ${
                      isSchedule &&
                      selectedDestinations.length > 0 &&
                      !showDestinationDropdown
                        ? "cursor-text"
                        : ""
                    }`}
                    onClick={() => {
                      if (
                        isSchedule &&
                        selectedDestinations.length > 0 &&
                        !showDestinationDropdown
                      ) {
                        setShowDestinationDropdown(true);
                        requestAnimationFrame(() => updateDropdownPosition());
                      }
                    }}
                  >
                    {selectedDestinations.map((dest) => (
                      <span
                        key={dest.id}
                        className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-primary-100 bg-primary-50 py-0.5 pl-2 pr-1 text-xs font-medium text-primary-700"
                      >
                        <span className="truncate">{dest.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDestination(dest);
                          }}
                          className="shrink-0 text-primary-500 hover:text-primary-800"
                          aria-label={`Remove ${dest.name}`}
                        >
                          <i className="fi fi-rr-cross-small text-[11px]" />
                        </button>
                      </span>
                    ))}
                    {!(
                      isSchedule &&
                      selectedDestinations.length > 0 &&
                      !showDestinationDropdown
                    ) ? (
                      <input
                        type="text"
                        value={destinationQuery}
                        onChange={(e) => {
                          setDestinationQuery(e.target.value);
                          setShowDestinationDropdown(true);
                        }}
                        onFocus={() => {
                          setShowDestinationDropdown(true);
                          requestAnimationFrame(() => updateDropdownPosition());
                        }}
                        placeholder={
                          selectedDestinations.length > 0
                            ? isSchedule
                              ? ""
                              : "Add more"
                            : isSchedule
                              ? "Pick a destination"
                              : "Search destinations to add"
                        }
                        className="min-w-[72px] flex-1 border-0 bg-transparent p-0 text-sm font-medium text-[#222222] placeholder:text-[#B0B0B0] focus:outline-none"
                      />
                    ) : null}
                  </div>
                </SearchInputBox>

                {showDestinationDropdown && typeof document !== "undefined"
                  ? createPortal(
                      <div
                        ref={destinationDropdownRef}
                        className="fixed z-[200] overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.14)]"
                        style={{
                          top: dropdownPosition.top,
                          left: dropdownPosition.left,
                          width: dropdownPosition.width,
                        }}
                      >
                        <div className="border-b border-[#EBEBEB] bg-[#FAFAFA] px-3 py-2">
                          <p className="text-xs font-medium text-[#717171]">
                            {isSchedule
                              ? "Select one destination"
                              : selectedDestinations.length > 0
                                ? `${selectedDestinations.length} selected — add more destinations`
                                : "Select one or more destinations"}
                          </p>
                        </div>
                        <div className="max-h-72 overflow-y-auto p-2">
                        {isDestinationsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#EBEBEB] border-t-primary-600" />
                          </div>
                        ) : filteredDestinations.length === 0 ? (
                          <p className="py-6 text-center text-sm text-[#717171]">
                            No destinations found
                          </p>
                        ) : (
                          filteredDestinations.map((destination) => {
                            const selected = selectedDestinations.some(
                              (d) => d.id === destination.id,
                            );
                            return (
                              <button
                                key={destination.id}
                                type="button"
                                onClick={() => toggleDestination(destination)}
                                className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
                                  selected
                                    ? "bg-primary-50 ring-1 ring-primary-200"
                                    : "hover:bg-[#FAFAFA]"
                                }`}
                              >
                                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#EBEBEB]">
                                  {hasStoredImage(destination.thumb_image) &&
                                  destination.thumb_image_url ? (
                                    <Image
                                      src={destination.thumb_image_url}
                                      alt={destination.name}
                                      fill
                                      className="object-cover"
                                      sizes="36px"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <i className="fi fi-rr-map-marker text-sm text-[#717171]" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-[#222222]">
                                    {destination.name}
                                  </p>
                                  <p className="truncate text-xs text-[#717171]">
                                    {destination.state?.name || "Destination"}
                                  </p>
                                </div>
                                <div
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                    selected
                                      ? "border-primary-600 bg-primary-600"
                                      : "border-[#DDDDDD]"
                                  }`}
                                >
                                  {selected ? (
                                    <i className="fi fi-rr-check text-[9px] text-white" />
                                  ) : null}
                                </div>
                              </button>
                            );
                          })
                        )}
                        </div>
                        {!isSchedule && selectedDestinations.length > 0 ? (
                          <div className="border-t border-[#EBEBEB] bg-[#FAFAFA] px-3 py-2">
                            <button
                              type="button"
                              onClick={() => setShowDestinationDropdown(false)}
                              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                            >
                              Done selecting ({selectedDestinations.length})
                            </button>
                          </div>
                        ) : null}
                      </div>,
                      document.body,
                    )
                  : null}
              </div>
            ) : (
              <SearchInputBox label="Location">
                <LocationSearchInput
                  variant="hero"
                  value={locationFilters.location}
                  googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                  placeholder={isRentals ? "Pickup city or area" : "City or destination"}
                  repositionDropdown
                  onPlaceSelected={(place) => {
                    if (!place?.geometry?.location) return;
                    const lat =
                      typeof place.geometry.location.lat === "function"
                        ? place.geometry.location.lat()
                        : place.geometry.location.lat;
                    const lng =
                      typeof place.geometry.location.lng === "function"
                        ? place.geometry.location.lng()
                        : place.geometry.location.lng;
                    setLocationFilters((prev) => ({
                      ...prev,
                      location: place.name || place.formatted_address || "",
                      latitude: String(lat),
                      longitude: String(lng),
                    }));
                  }}
                  onClear={() =>
                    setLocationFilters((prev) => ({
                      ...prev,
                      location: "",
                      latitude: "",
                      longitude: "",
                    }))
                  }
                />
              </SearchInputBox>
            )}

            {isRentals ? (
              <SearchInputBox label="What to rent?">
                <select
                  value={locationFilters.form_type}
                  onChange={(e) =>
                    setLocationFilters((prev) => ({
                      ...prev,
                      form_type: e.target.value,
                    }))
                  }
                  className="w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-sm font-medium text-[#222222] focus:outline-none [&:invalid]:text-[#B0B0B0]"
                  required
                >
                  <option value="" disabled>
                    {rentalCategoryTypes.length === 0
                      ? "Loading types..."
                      : "Select rental type"}
                  </option>
                  {rentalCategoryTypes.map((type) => (
                    <option key={type.form_type} value={type.form_type}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </SearchInputBox>
            ) : null}

            {needsDates ? (
              <DateRangeSearchField
                variant="hero"
                dateFrom={locationFilters.dateFrom}
                dateTo={locationFilters.dateTo}
                emptyLabel="Pick dates"
                onChange={({ dateFrom, dateTo }) =>
                  setLocationFilters((prev) => ({ ...prev, dateFrom, dateTo }))
                }
              />
            ) : null}

            <button
              type="button"
              onClick={handleSearch}
              className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-colors sm:h-[58px] sm:px-6 md:h-[70px] md:w-auto md:min-w-[130px] ${activeModuleConfig.searchBtn} ${
                isRentals ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <i className="fi fi-rr-search text-sm" />
              {searchButtonLabel}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
