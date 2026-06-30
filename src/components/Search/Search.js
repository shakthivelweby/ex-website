"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Popup from "../Popup";
import { useAllDestinations, useRentalCategories } from "@/app/search/query";
import { hasStoredImage } from "@/utils/imageUrl";
import { buildCategoryTypesFromCategories } from "@/app/rentals/rentalCategoryTypeUtils";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import DateRangeSearchField from "./DateRangeSearchField";
import LocationSearchInput from "../LocationSearchInput";
import SearchInputBox from "./SearchInputBox";
import { SEARCH_MODULES } from "./searchModules";

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const createDefaultLocationFilters = () => {
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

function SearchFooter({ label, onClick, buttonClass, isMobile }) {
  return (
    <section
      className={`flex-shrink-0 border-t border-[#EBEBEB] bg-white px-5 py-4 sm:px-8 sm:py-5 ${
        isMobile
          ? "sticky bottom-0 z-20 mt-auto pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]"
          : ""
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-colors ${buttonClass}`}
      >
        <i className="fi fi-rr-search text-sm" />
        {label}
      </button>
    </section>
  );
}

export default function Search({ isOpen, onClose, type }) {
  const tabsScrollRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showTabsScrollHint, setShowTabsScrollHint] = useState(true);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState(type || "package");
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [locationFilters, setLocationFilters] = useState(
    createDefaultLocationFilters,
  );
  const router = useRouter();

  const isPackage = selectedModule === "package";
  const isSchedule = selectedModule === "schedule";
  const isDestinationModule = isPackage || isSchedule;
  const isEvents = selectedModule === "events";
  const isAttractions = selectedModule === "attractions";
  const isActivities = selectedModule === "activities";
  const isRentals = selectedModule === "rentals";
  const needsDates = !isDestinationModule;

  const activeModuleConfig =
    SEARCH_MODULES.find((module) => module.id === selectedModule) ??
    SEARCH_MODULES[0];

  const { data: destinationsData, isLoading: isDestinationsLoading } =
    useAllDestinations(isOpen);
  const allDestinations = destinationsData?.data || [];

  const { data: rentalCategoriesData } = useRentalCategories(
    isOpen && isRentals,
  );
  const rentalCategoryTypes = useMemo(
    () => buildCategoryTypesFromCategories(rentalCategoriesData?.data || []),
    [rentalCategoriesData],
  );

  useEffect(() => {
    if (type) setSelectedModule(type);
  }, [type]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setDestinationQuery("");
      setSelectedDestinations([]);
      setLocationFilters(createDefaultLocationFilters());
      if (!type) setSelectedModule("package");
    }
  }, [isOpen, type]);

  useEffect(() => {
    if (!isOpen) return undefined;

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
  }, [isOpen, selectedModule]);

  const filteredDestinations = useMemo(() => {
    if (!destinationQuery.trim()) return allDestinations;
    const query = destinationQuery.toLowerCase();
    return allDestinations.filter(
      (dest) =>
        dest.name?.toLowerCase().includes(query) ||
        dest.state?.name?.toLowerCase().includes(query),
    );
  }, [allDestinations, destinationQuery]);

  const handleModuleSelect = (module) => {
    if (!module.enabled) return;
    setSelectedModule(module.id);
    setDestinationQuery("");
    setSelectedDestinations([]);
    setLocationFilters(createDefaultLocationFilters());
  };

  const toggleDestination = (destination) => {
    if (isSchedule) {
      setSelectedDestinations((prev) =>
        prev.some((d) => d.id === destination.id) ? [] : [destination],
      );
      setDestinationQuery("");
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
      if (normalized.length >= 1) {
        localStorage.setItem("choosedDestination", JSON.stringify(normalized[0]));
        window.dispatchEvent(new CustomEvent("destinationChanged"));
      }
      router.push("/scheduled");
      onClose();
      return;
    }

    if (normalized.length === 1) {
      const item = normalized[0];
      const countryId = item.country_id ?? item.state?.country_id;
      if (!countryId) {
        router.push("/explore");
        onClose();
        return;
      }
      localStorage.setItem("choosedDestination", JSON.stringify(item));
      window.dispatchEvent(new CustomEvent("destinationChanged"));
      const params = new URLSearchParams({
        state: item.state_id,
        destination: item.id,
      });
      router.push(`/packages/${countryId}?${params.toString()}`);
      onClose();
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
    onClose();
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
    onClose();
  };

  const handleSearch = () => {
    if (isDestinationModule) {
      if (selectedDestinations.length === 0) {
        router.push(isSchedule ? "/scheduled" : "/explore");
        onClose();
        return;
      }
      runPackageSearch();
      return;
    }
    runLocationSearch();
  };

  const scrollTabsRight = () => {
    tabsScrollRef.current?.scrollBy({ left: 140, behavior: "smooth" });
  };

  const modalSizeClass =
    "!max-w-lg w-[min(96vw,32rem)] md:!max-w-2xl md:w-[min(96vw,42rem)]";

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      pos={isMobile ? "bottom" : "center"}
      draggable
      className={
        isMobile
          ? "w-full overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          : `${modalSizeClass} h-auto max-h-[88vh] overflow-hidden rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-[#EBEBEB]`
      }
      pannelStyle={isMobile ? "h-[88vh] max-h-[88vh]" : ""}
      overlayClassName="bg-black/30 backdrop-blur-[2px]"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="relative shrink-0 border-b border-[#EBEBEB] px-5 pb-3 pt-4 text-center sm:px-8 sm:pb-4 sm:pt-6">
          {!isMobile ? (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#717171] transition-colors hover:bg-[#F7F7F7] hover:text-[#222222] sm:right-6 sm:top-5"
              aria-label="Close search"
            >
              <i className="fi fi-rr-cross text-sm" />
            </button>
          ) : null}
          <h2 className="text-xl font-medium leading-[1.1] tracking-tight text-[#222222] sm:text-2xl">
            Search
          </h2>
        </header>

        <section className="flex-shrink-0 border-b border-[#EBEBEB] px-5 py-2 sm:px-8 sm:py-2.5">
          <div className="relative w-full">
            <div
              ref={tabsScrollRef}
              className="flex snap-x snap-mandatory justify-start gap-0.5 overflow-x-auto pr-9 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center sm:gap-1 sm:pr-0 [&::-webkit-scrollbar]:hidden"
            >
              {SEARCH_MODULES.map((module) => {
                const isActive = selectedModule === module.id;
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => handleModuleSelect(module)}
                    disabled={!module.enabled}
                    className={`flex shrink-0 snap-center flex-col items-center gap-0.5 border-b-2 px-2.5 py-1.5 text-[11px] font-semibold transition-colors sm:gap-1 sm:px-3 sm:py-2 sm:text-[12px] ${
                      isActive
                        ? `border-current ${module.activeText}`
                        : !module.enabled
                          ? "cursor-not-allowed border-transparent text-[#B0B0B0]"
                          : "border-transparent text-[#555555] hover:text-[#222222]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${module.iconBg}`}
                    >
                      <i
                        className={`fi ${module.icon} text-xs sm:text-sm ${module.iconColor}`}
                      />
                    </span>
                    <span className="whitespace-nowrap">{module.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {showTabsScrollHint ? (
              <>
                <div
                  className="pointer-events-none absolute bottom-0 right-0 top-0 w-10 bg-gradient-to-l from-white via-white/95 to-transparent sm:hidden"
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
        </section>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <section className="flex-shrink-0 border-b border-[#EBEBEB] px-5 py-4 sm:px-8 sm:py-5">
          <div
            className={`grid w-full grid-cols-1 gap-2.5 sm:gap-3 ${
              isDestinationModule
                ? ""
                : isRentals
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2"
            } sm:items-end`}
          >
            {isDestinationModule ? (
              <SearchInputBox label={isSchedule ? "Destination" : "Where to?"}>
                <div className="flex min-h-[22px] flex-wrap items-center gap-1.5">
                  {selectedDestinations.map((dest) => (
                    <span
                      key={dest.id}
                      className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-primary-100 bg-primary-50 py-0.5 pl-2 pr-1 text-xs font-medium text-primary-700"
                    >
                      <span className="truncate">{dest.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleDestination(dest)}
                        className="shrink-0 text-primary-500 hover:text-primary-800"
                        aria-label={`Remove ${dest.name}`}
                      >
                        <i className="fi fi-rr-cross-small text-[11px]" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => setDestinationQuery(e.target.value)}
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
                </div>
              </SearchInputBox>
            ) : (
              <SearchInputBox label="Location">
                <LocationSearchInput
                  variant="hero"
                  value={locationFilters.location}
                  googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                  placeholder={
                    isRentals ? "Pickup city or area" : "City or destination"
                  }
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
                >
                  <option value="">
                    {rentalCategoryTypes.length === 0
                      ? "Loading types..."
                      : "Select rental type"}
                  </option>
                  {rentalCategoryTypes.map((typeOption) => (
                    <option
                      key={typeOption.form_type}
                      value={typeOption.form_type}
                    >
                      {typeOption.label}
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
          </div>
        </section>

        {isDestinationModule ? (
          <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2 [-webkit-overflow-scrolling:touch] sm:px-8">
            <div className="sticky top-0 z-10 mb-2 border-b border-[#EBEBEB] bg-white py-2">
              <p className="text-xs font-medium text-[#717171]">
                {isSchedule
                  ? "Select one destination"
                  : selectedDestinations.length > 0
                    ? `${selectedDestinations.length} selected — add more destinations`
                    : "Select one or more destinations"}
                {!isDestinationsLoading ? (
                  <span className="float-right text-[#B0B0B0]">
                    {filteredDestinations.length}
                  </span>
                ) : null}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {isDestinationsLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-10"
                >
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#EBEBEB] border-t-primary-600" />
                  <p className="mt-3 text-xs text-[#717171]">Loading...</p>
                </motion.div>
              ) : filteredDestinations.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl bg-[#FAFAFA] py-8 text-center"
                >
                  <p className="text-sm text-[#717171]">No destinations found</p>
                </motion.div>
              ) : (
                <motion.div
                  key="destinations"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1"
                >
                  {filteredDestinations.map((destination) => {
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
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        ) : isMobile ? (
          <div className="min-h-0 flex-1" aria-hidden="true" />
        ) : null}
        </div>

        <SearchFooter
          label={searchButtonLabel}
          onClick={handleSearch}
          buttonClass={activeModuleConfig.searchBtn}
          isMobile={isMobile}
        />
      </div>
    </Popup>
  );
}
