"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Popup from "../Popup";
import {
  useAllDestinations,
  useRentalCategories,
  useActivityCategories,
  useEventCategories,
  useAttractionCategories,
} from "@/app/search/query";
import { hasStoredImage } from "@/utils/imageUrl";
import { buildCategoryTypesFromCategories } from "@/app/rentals/rentalCategoryTypeUtils";
import LocationSearchInput from "../LocationSearchInput";
import SearchInputBox from "./SearchInputBox";
import SearchTypePicker from "./SearchTypePicker";
import { SEARCH_MODULES } from "./searchModules";
import {
  buildPackageLocationOptions,
  buildPackageSearchHref,
  filterLocationOptions,
  isSameLocationOption,
  locationOptionKey,
  packageLocationPickerHint,
  togglePackageLocation,
} from "./packageLocations";

const HERO_MODULES = SEARCH_MODULES;

const createDefaultLocationFilters = () => ({
  location: "",
  longitude: "",
  latitude: "",
  form_type: "",
  category: "",
});

export default function HeroSearch() {
  const router = useRouter();
  const destinationAnchorRef = useRef(null);
  const destinationDropdownRef = useRef(null);
  const destinationSearchInputRef = useRef(null);
  const tabsScrollRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showTabsScrollHint, setShowTabsScrollHint] = useState(true);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [selectedModule, setSelectedModule] = useState("package");
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [packageDuration, setPackageDuration] = useState("");
  const [locationFilters, setLocationFilters] = useState(
    createDefaultLocationFilters,
  );

  const isPackage = selectedModule === "package";
  const isSchedule = selectedModule === "schedule";
  const isDestinationModule = isPackage || isSchedule;
  const isEvents = selectedModule === "events";
  const isAttractions = selectedModule === "attractions";
  const isActivities = selectedModule === "activities";
  const isRentals = selectedModule === "rentals";
  const hasTypePicker = isActivities || isEvents || isAttractions || isRentals;

  const activeModuleConfig =
    HERO_MODULES.find((module) => module.id === selectedModule) ??
    HERO_MODULES[0];

  const { data: destinationsData, isLoading: isDestinationsLoading } =
    useAllDestinations(true);
  const allDestinations = destinationsData?.data || [];

  const { data: rentalCategoriesData, isLoading: isRentalCategoriesLoading } =
    useRentalCategories(isRentals);
  const rentalCategoryTypes = useMemo(
    () => buildCategoryTypesFromCategories(rentalCategoriesData?.data || []),
    [rentalCategoriesData],
  );

  const { data: activityCategoriesData, isLoading: isActivityCategoriesLoading } =
    useActivityCategories(isActivities);
  const { data: eventCategoriesData, isLoading: isEventCategoriesLoading } =
    useEventCategories(isEvents);
  const { data: attractionCategoriesData, isLoading: isAttractionCategoriesLoading } =
    useAttractionCategories(isAttractions);

  const activityPickerItems = useMemo(
    () =>
      (activityCategoriesData?.data || []).map((category) => ({
        id: category.id,
        value: category.slug,
        label: category.name,
        image: category.image,
        icon: "fi-rr-hiking",
      })),
    [activityCategoriesData],
  );

  const eventPickerItems = useMemo(
    () =>
      (eventCategoriesData?.data || []).map((category) => ({
        id: category.id,
        value: category.slug,
        label: category.name,
        image: category.image,
        icon: "fi-rr-glass-cheers",
      })),
    [eventCategoriesData],
  );

  const attractionPickerItems = useMemo(
    () =>
      (attractionCategoriesData?.data || []).map((category) => ({
        id: category.id,
        value: category.slug,
        label: category.name,
        image: category.image,
        icon: "fi-rr-ferris-wheel",
      })),
    [attractionCategoriesData],
  );

  const rentalPickerItems = useMemo(
    () =>
      rentalCategoryTypes.map((type) => ({
        id: type.form_type,
        value: type.form_type,
        label: type.label,
        icon: "fi-rr-car-side",
      })),
    [rentalCategoryTypes],
  );

  const locationOptions = useMemo(() => {
    if (isSchedule) {
      return allDestinations.map((destination) => ({
        ...destination,
        type: "destination",
      }));
    }
    return buildPackageLocationOptions(allDestinations);
  }, [allDestinations, isSchedule]);

  const filteredDestinations = useMemo(
    () => filterLocationOptions(locationOptions, destinationQuery),
    [locationOptions, destinationQuery],
  );

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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!showDestinationDropdown || !isMobile) return undefined;
    const timer = window.setTimeout(() => {
      destinationSearchInputRef.current?.focus();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [showDestinationDropdown, isMobile]);

  useEffect(() => {
    if (!showDestinationDropdown || isMobile) return undefined;

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [showDestinationDropdown, isMobile, updateDropdownPosition]);

  useEffect(() => {
    if (!showDestinationDropdown || isMobile) return undefined;

    const handleClickOutside = (event) => {
      if (destinationAnchorRef.current?.contains(event.target)) return;
      if (destinationDropdownRef.current?.contains(event.target)) return;
      setShowDestinationDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDestinationDropdown, isMobile]);

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
    setPackageDuration("");
    setLocationFilters(createDefaultLocationFilters());
  };

  const toggleDestination = (destination) => {
    if (isSchedule) {
      setSelectedDestinations((prev) =>
        prev.some((d) => isSameLocationOption(d, destination))
          ? []
          : [{ ...destination, type: "destination" }],
      );
      setDestinationQuery("");
      setShowDestinationDropdown(false);
      return;
    }

    setSelectedDestinations((prev) => togglePackageLocation(prev, destination));
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
    const result = buildPackageSearchHref({
      selectedLocations: selectedDestinations,
      duration: packageDuration,
      isSchedule,
    });

    if (result.choosedDestination) {
      localStorage.setItem(
        "choosedDestination",
        JSON.stringify(result.choosedDestination),
      );
      window.dispatchEvent(new CustomEvent("destinationChanged"));
    }

    if (result.sessionDestinations) {
      sessionStorage.setItem(
        "packageSearchDestinations",
        JSON.stringify(result.sessionDestinations),
      );
    }

    if (result.sessionStates) {
      sessionStorage.setItem(
        "packageSearchStates",
        JSON.stringify(result.sessionStates),
      );
    }

    router.push(result.href);
  };

  const runLocationSearch = () => {
    const params = new URLSearchParams();
    if (locationFilters.longitude)
      params.set("longitude", locationFilters.longitude);
    if (locationFilters.latitude)
      params.set("latitude", locationFilters.latitude);
    if (locationFilters.location)
      params.set("location", locationFilters.location);

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

    if (
      (isActivities || isEvents || isAttractions) &&
      locationFilters.category
    ) {
      params.set("category", locationFilters.category);
    }

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  const handleSearch = () => {
    setShowDestinationDropdown(false);
    if (isDestinationModule) {
      if (selectedDestinations.length === 0) {
        if (isPackage && packageDuration) {
          router.push(`/packages/search?duration=${packageDuration}`);
        } else {
          router.push(isSchedule ? "/scheduled" : "/explore");
        }
        return;
      }
      runPackageSearch();
      return;
    }
    runLocationSearch();
  };

  const destinationPickerHint = packageLocationPickerHint(
    selectedDestinations,
    { isSchedule },
  );

  const destinationPlaceholder =
    selectedDestinations.length > 0
      ? isSchedule
        ? ""
        : "Add more"
      : isSchedule
        ? "Pick a destination"
        : "Search destinations or states";

  const renderDestinationOptions = () => {
    if (isDestinationsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#EBEBEB] border-t-primary-600" />
        </div>
      );
    }

    if (filteredDestinations.length === 0) {
      return (
        <p className="py-6 text-center text-sm text-[#717171]">
          {isSchedule
            ? "No destinations found"
            : "No destinations or states found"}
        </p>
      );
    }

    return filteredDestinations.map((destination) => {
      const selected = selectedDestinations.some((d) =>
        isSameLocationOption(d, destination),
      );
      const isState = destination.type === "state";
      return (
        <button
          key={locationOptionKey(destination)}
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
                <i
                  className={`fi ${
                    isState ? "fi-rr-marker" : "fi-rr-map-marker"
                  } text-sm text-[#717171]`}
                />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#222222]">
              {destination.name}
            </p>
            <p className="truncate text-xs text-[#717171]">
              {isState ? "State" : destination.state?.name || "Destination"}
            </p>
          </div>
          <div
            className={`fi-box h-5 w-5 shrink-0 rounded-full border ${
              selected
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-[#DDDDDD]"
            }`}
          >
            {selected ? (
              <i className="fi fi-rr-check text-[10px]" aria-hidden="true" />
            ) : null}
          </div>
        </button>
      );
    });
  };

  const renderSelectedDestinationChips = ({
    onRemoveStopPropagation = true,
  } = {}) =>
    selectedDestinations.map((dest) => (
      <span
        key={locationOptionKey(dest)}
        className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-primary-100 bg-primary-50 py-0.5 pl-2 pr-1 text-xs font-medium text-primary-700"
      >
        <span className="truncate">{dest.name}</span>
        {dest.type === "state" ? (
          <span className="text-[10px] font-normal text-primary-500">
            State
          </span>
        ) : null}
        <button
          type="button"
          onClick={(e) => {
            if (onRemoveStopPropagation) e.stopPropagation();
            toggleDestination(dest);
          }}
          className="shrink-0 text-primary-500 hover:text-primary-800"
          aria-label={`Remove ${dest.name}`}
        >
          <i className="fi fi-rr-cross-small text-[11px]" />
        </button>
      </span>
    ));

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full"
      >
        <div className="overflow-hidden rounded-2xl bg-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-white/50 backdrop-blur-md">
          <div className="px-5 pb-3 pt-5 text-center sm:px-8 sm:pb-4 sm:pt-6">
            <h1 className="text-[30px] font-medium leading-[1.1] tracking-tight text-[#222222] sm:text-[34px] md:text-4xl">
              Pay less. Book direct.
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#717171] sm:mt-2.5 sm:text-[15px]">
              Packages, events, attractions, activities & more — from verified
              suppliers, one search away.
            </p>
          </div>

          <div className="border-t border-[#EBEBEB] px-5 py-2 sm:px-8 sm:py-2.5">
            <div className="relative w-full">
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
                      className={`flex shrink-0 snap-center flex-col items-center gap-0.5 border-b-2 px-2.5 py-1.5 text-[11px] font-medium transition-colors sm:gap-1 sm:px-4 sm:py-2 sm:text-[12px] ${
                        isActive
                          ? `border-current ${module.activeText}`
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
                      <span className="whitespace-nowrap">{module.label}</span>
                    </button>
                  );
                })}
              </div>

              {showTabsScrollHint ? (
                <>
                  <div
                    className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white/80 via-white/70 to-transparent sm:hidden"
                    aria-hidden
                  />
                  <button
                    type="button"
                    onClick={scrollTabsRight}
                    className="absolute right-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/90 text-[#717171] shadow-sm backdrop-blur-sm sm:hidden"
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
                  ? isPackage
                    ? "sm:grid-cols-[minmax(0,1fr)_minmax(130px,0.4fr)_auto]"
                    : "sm:grid-cols-[minmax(0,1fr)_auto]"
                  : hasTypePicker
                    ? "sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]"
                    : "sm:grid-cols-[minmax(0,1.2fr)_auto]"
              } sm:items-end`}
            >
              {isDestinationModule ? (
                <div ref={destinationAnchorRef} className="min-w-0">
                  <SearchInputBox
                    label={isSchedule ? "Destination" : "Where to?"}
                  >
                    {isMobile ? (
                      <button
                        type="button"
                        onClick={() => setShowDestinationDropdown(true)}
                        className="flex min-h-[22px] w-full flex-wrap items-center gap-1.5 text-left"
                      >
                        {renderSelectedDestinationChips()}
                        <span
                          className={`min-w-[72px] flex-1 text-sm font-medium ${
                            selectedDestinations.length > 0 && isSchedule
                              ? "text-transparent"
                              : "text-[#B0B0B0]"
                          }`}
                        >
                          {selectedDestinations.length > 0
                            ? isSchedule
                              ? ""
                              : "Add more"
                            : isSchedule
                              ? "Tap to pick destination"
                              : "Tap to choose destinations"}
                        </span>
                      </button>
                    ) : (
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
                            requestAnimationFrame(() =>
                              updateDropdownPosition(),
                            );
                          }
                        }}
                      >
                        {renderSelectedDestinationChips()}
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
                              requestAnimationFrame(() =>
                                updateDropdownPosition(),
                              );
                            }}
                            placeholder={destinationPlaceholder}
                            className="min-w-[72px] flex-1 border-0 bg-transparent p-0 text-sm font-medium text-[#222222] placeholder:text-[#B0B0B0] focus:outline-none"
                          />
                        ) : null}
                      </div>
                    )}
                  </SearchInputBox>

                  {showDestinationDropdown &&
                  !isMobile &&
                  typeof document !== "undefined"
                    ? createPortal(
                        <div
                          ref={destinationDropdownRef}
                          className="fixed z-[200] overflow-hidden rounded-2xl border border-white/50 bg-white/90 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-lg"
                          style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                            width: dropdownPosition.width,
                          }}
                        >
                          <div className="border-b border-[#EBEBEB]/70 bg-[#FAFAFA]/80 px-3 py-2 backdrop-blur-sm">
                            <p className="text-xs font-medium text-[#717171]">
                              {destinationPickerHint}
                            </p>
                          </div>
                          <div className="max-h-72 overflow-y-auto p-2">
                            {renderDestinationOptions()}
                          </div>
                          {!isSchedule && selectedDestinations.length > 0 ? (
                            <div className="border-t border-[#EBEBEB] bg-[#FAFAFA] px-3 py-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setShowDestinationDropdown(false)
                                }
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

              {isPackage ? (
                <SearchInputBox label="Number of days">
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={packageDuration}
                    onChange={(event) =>
                      setPackageDuration(
                        event.target.value === ""
                          ? ""
                          : String(
                              Math.max(
                                1,
                                parseInt(event.target.value, 10) || 1,
                              ),
                            ),
                      )
                    }
                    placeholder="Any duration"
                    className="w-full border-0 bg-transparent p-0 text-sm font-medium text-[#222222] placeholder:text-[#B0B0B0] focus:outline-none"
                  />
                </SearchInputBox>
              ) : null}

              {isRentals ? (
                <SearchTypePicker
                  label="What to rent?"
                  title="Rental type"
                  value={locationFilters.form_type}
                  onChange={(form_type) =>
                    setLocationFilters((prev) => ({ ...prev, form_type }))
                  }
                  items={rentalPickerItems}
                  isLoading={isRentalCategoriesLoading}
                  isMobile={isMobile}
                  accent="indigo"
                  allOption={{
                    label: "All rentals",
                    description: "Browse every rental type",
                  }}
                  mobilePlaceholder="Tap to choose rental type"
                  desktopEmptyLabel="All rentals"
                  searchPlaceholder="Search rental types"
                  fallbackIcon="fi-rr-car-side"
                />
              ) : null}

              {isActivities ? (
                <SearchTypePicker
                  label="Activity type"
                  title="Activity type"
                  value={locationFilters.category}
                  onChange={(category) =>
                    setLocationFilters((prev) => ({ ...prev, category }))
                  }
                  items={activityPickerItems}
                  isLoading={isActivityCategoriesLoading}
                  isMobile={isMobile}
                  accent="emerald"
                  allOption={{
                    label: "All activities",
                    description: "Browse every activity type",
                  }}
                  mobilePlaceholder="Tap to choose activity type"
                  desktopEmptyLabel="All activities"
                  searchPlaceholder="Search activity types"
                  fallbackIcon="fi-rr-hiking"
                />
              ) : null}

              {isEvents ? (
                <SearchTypePicker
                  label="Event type"
                  title="Event type"
                  value={locationFilters.category}
                  onChange={(category) =>
                    setLocationFilters((prev) => ({ ...prev, category }))
                  }
                  items={eventPickerItems}
                  isLoading={isEventCategoriesLoading}
                  isMobile={isMobile}
                  accent="rose"
                  allOption={{
                    label: "All events",
                    description: "Browse every event type",
                  }}
                  mobilePlaceholder="Tap to choose event type"
                  desktopEmptyLabel="All events"
                  searchPlaceholder="Search event types"
                  fallbackIcon="fi-rr-glass-cheers"
                />
              ) : null}

              {isAttractions ? (
                <SearchTypePicker
                  label="Attraction type"
                  title="Attraction type"
                  value={locationFilters.category}
                  onChange={(category) =>
                    setLocationFilters((prev) => ({ ...prev, category }))
                  }
                  items={attractionPickerItems}
                  isLoading={isAttractionCategoriesLoading}
                  isMobile={isMobile}
                  accent="amber"
                  allOption={{
                    label: "All attractions",
                    description: "Browse every attraction type",
                  }}
                  mobilePlaceholder="Tap to choose attraction type"
                  desktopEmptyLabel="All attractions"
                  searchPlaceholder="Search attraction types"
                  fallbackIcon="fi-rr-ferris-wheel"
                />
              ) : null}

              <button
                type="button"
                onClick={handleSearch}
                className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-colors sm:h-[58px] sm:px-6 md:h-[70px] md:w-auto md:min-w-[130px] ${activeModuleConfig.searchBtn}`}
              >
                <i className="fi fi-rr-search text-sm" />
                {searchButtonLabel}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {isMobile && isDestinationModule ? (
        <Popup
          isOpen={showDestinationDropdown}
          onClose={() => setShowDestinationDropdown(false)}
          showCloseButton={false}
          pos="bottom"
          draggable
          className="w-full overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          pannelStyle="h-[88vh] max-h-[88vh]"
          overlayClassName="bg-black/30 backdrop-blur-[2px]"
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <header className="shrink-0 border-b border-[#EBEBEB] px-5 pb-3 pt-1 text-center sm:px-8">
              <h2 className="text-lg font-medium leading-tight text-[#222222]">
                {isSchedule ? "Pick destination" : "Where to?"}
              </h2>
            </header>

            <section className="shrink-0 border-b border-[#EBEBEB] px-5 py-4 sm:px-8">
              <SearchInputBox label={isSchedule ? "Destination" : "Where to?"}>
                <div className="flex min-h-[22px] flex-wrap items-center gap-1.5">
                  {renderSelectedDestinationChips({
                    onRemoveStopPropagation: false,
                  })}
                  <input
                    ref={destinationSearchInputRef}
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => setDestinationQuery(e.target.value)}
                    placeholder={
                      destinationPlaceholder || "Search destinations"
                    }
                    className="min-w-[72px] flex-1 border-0 bg-transparent p-0 text-sm font-medium text-[#222222] placeholder:text-[#B0B0B0] focus:outline-none"
                  />
                </div>
              </SearchInputBox>
            </section>

            <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2 [-webkit-overflow-scrolling:touch] sm:px-8">
              <div className="sticky top-0 z-10 mb-2 border-b border-[#EBEBEB] bg-white py-2">
                <p className="text-xs font-medium text-[#717171]">
                  {destinationPickerHint}
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
                    <p className="text-sm text-[#717171]">
                      {isSchedule
                        ? "No destinations found"
                        : "No destinations or states found"}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="destinations"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-1"
                  >
                    {renderDestinationOptions()}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section className="sticky bottom-0 z-20 mt-auto shrink-0 border-t border-[#EBEBEB] bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sm:px-8">
              <button
                type="button"
                onClick={() => setShowDestinationDropdown(false)}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                {isSchedule
                  ? selectedDestinations.length > 0
                    ? "Done"
                    : "Close"
                  : selectedDestinations.length > 0
                    ? `Done (${selectedDestinations.length})`
                    : "Close"}
              </button>
            </section>
          </div>
        </Popup>
      ) : null}
    </>
  );
}
