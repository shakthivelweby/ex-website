import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Popup from "../Popup";
import {
  useAllDestinations,
  useEventCategories,
  useEventLanguages,
  useAttractionCategories,
  useActivityCategories,
  useRentalCategories,
} from "@/app/search/query";
import { hasStoredImage } from "@/utils/imageUrl";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import EventsSearchFilters from "./EventsSearchFilters";
import AttractionsSearchFilters from "./AttractionsSearchFilters";
import ActivitiesSearchFilters from "./ActivitiesSearchFilters";
import RentalsSearchFilters from "./RentalsSearchFilters";

const SEARCH_MODULES = [
  {
    id: "package",
    label: "Packages",
    shortLabel: "Packages",
    icon: "fi-rr-umbrella-beach",
    enabled: true,
  },
  {
    id: "schedule",
    label: "Scheduled Trips",
    shortLabel: "Scheduled",
    icon: "fi-rr-pending",
    enabled: true,
  },
  {
    id: "events",
    label: "Events",
    shortLabel: "Events",
    icon: "fi-rr-glass-cheers",
    enabled: true,
  },
  {
    id: "attractions",
    label: "Attractions",
    shortLabel: "Attractions",
    icon: "fi-rr-ferris-wheel",
    enabled: true,
  },
  {
    id: "activities",
    label: "Activities",
    shortLabel: "Activities",
    icon: "fi-rr-hiking",
    enabled: true,
  },
  {
    id: "rentals",
    label: "Rentals",
    shortLabel: "Rentals",
    icon: "fi-rr-car",
    enabled: true,
  },
];

const formatEventDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const createDefaultEventFilters = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatEventDate(today);
  return {
    location: "",
    longitude: "",
    latitude: "",
    dateFrom: todayStr,
    dateTo: todayStr,
    languages: [],
    categories: [],
  };
};

const createDefaultAttractionFilters = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatEventDate(today);
  return {
    location: "",
    longitude: "",
    latitude: "",
    dateFrom: todayStr,
    dateTo: todayStr,
    category: "",
    price_from: "",
    price_to: "",
  };
};

const createDefaultActivityFilters = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatEventDate(today);
  return {
    location: "",
    longitude: "",
    latitude: "",
    dateFrom: todayStr,
    dateTo: todayStr,
    category: "",
    price_from: "",
    price_to: "",
  };
};

const createDefaultRentalFilters = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatEventDate(today);
  return {
    location: "",
    longitude: "",
    latitude: "",
    dateFrom: todayStr,
    dateTo: todayStr,
    category: "",
    form_type: "",
    sub_category: "",
    transmission: "",
    fuel_type: "",
    seats: "",
    price_from: "",
    price_to: "",
  };
};

function SearchFooter({ enabled, label, onClick }) {
  return (
    <section className="flex-shrink-0 border-t border-[#EBEBEB] bg-white px-4 py-3">
      <button
        type="button"
        onClick={onClick}
        disabled={!enabled}
        className={`w-full h-10 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
          enabled
            ? "bg-[#222222] text-white hover:bg-black"
            : "bg-[#F7F7F7] text-[#B0B0B0] cursor-not-allowed"
        }`}
      >
        <i className="fi fi-rr-search text-[13px]" />
        {label}
      </button>
    </section>
  );
}

export default function Search({ isOpen, onClose, type }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState(type || "package");
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [eventFilters, setEventFilters] = useState(createDefaultEventFilters);
  const [attractionFilters, setAttractionFilters] = useState(
    createDefaultAttractionFilters,
  );
  const [activityFilters, setActivityFilters] = useState(
    createDefaultActivityFilters,
  );
  const [rentalFilters, setRentalFilters] = useState(createDefaultRentalFilters);
  const router = useRouter();

  const isPackageModule = selectedModule === "package";
  const isScheduleModule = selectedModule === "schedule";
  const isEventsModule = selectedModule === "events";
  const isAttractionsModule = selectedModule === "attractions";
  const isActivitiesModule = selectedModule === "activities";
  const isRentalsModule = selectedModule === "rentals";
  const showDestinationPicker = isPackageModule || isScheduleModule;
  const showComingSoon =
    !isPackageModule &&
    !isScheduleModule &&
    !isEventsModule &&
    !isAttractionsModule &&
    !isActivitiesModule &&
    !isRentalsModule;

  const { data: destinationsData, isLoading: isDestinationsLoading } =
    useAllDestinations(isOpen && showDestinationPicker);
  const { data: eventCategoriesData } = useEventCategories(
    isOpen && isEventsModule,
  );
  const { data: eventLanguagesData } = useEventLanguages(
    isOpen && isEventsModule,
  );
  const { data: attractionCategoriesData } = useAttractionCategories(
    isOpen && isAttractionsModule,
  );
  const { data: activityCategoriesData } = useActivityCategories(
    isOpen && isActivitiesModule,
  );
  const { data: rentalCategoriesData } = useRentalCategories(
    isOpen && isRentalsModule,
  );

  const eventCategories = eventCategoriesData?.data || [];
  const eventLanguages = eventLanguagesData?.data || [];
  const attractionCategories = attractionCategoriesData?.data || [];
  const activityCategories = activityCategoriesData?.data || [];
  const rentalCategories = rentalCategoriesData?.data || [];
  const allDestinations = destinationsData?.data || [];

  useEffect(() => {
    if (type) setSelectedModule(type);
  }, [type]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedDestinations([]);
      setEventFilters(createDefaultEventFilters());
      setAttractionFilters(createDefaultAttractionFilters());
      setActivityFilters(createDefaultActivityFilters());
      setRentalFilters(createDefaultRentalFilters());
      if (!type) setSelectedModule("package");
    }
  }, [isOpen, type]);

  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return allDestinations;
    const query = searchQuery.toLowerCase();
    return allDestinations.filter(
      (dest) =>
        dest.name?.toLowerCase().includes(query) ||
        dest.state?.name?.toLowerCase().includes(query),
    );
  }, [allDestinations, searchQuery]);

  const toggleDestination = (destination) => {
    if (isScheduleModule) {
      setSelectedDestinations((prev) =>
        prev.some((d) => d.id === destination.id) ? [] : [destination],
      );
      return;
    }

    setSelectedDestinations((prev) => {
      const exists = prev.some((d) => d.id === destination.id);
      if (exists) return prev.filter((d) => d.id !== destination.id);
      return [...prev, destination];
    });
  };

  const isDestinationSelected = (id) =>
    selectedDestinations.some((d) => d.id === id);

  const handleRunSearch = () => {
    if (selectedDestinations.length === 0) return;

    const normalized = selectedDestinations.map((dest) => ({
      id: dest.id,
      name: dest.name,
      type: "destination",
      state_id: dest.state_id,
      country_id: dest.state?.country_id,
      destination_id: dest.id,
    }));

    if (selectedModule === "schedule") {
      if (normalized.length >= 1) {
        localStorage.setItem(
          "choosedDestination",
          JSON.stringify(normalized[0]),
        );
        window.dispatchEvent(new CustomEvent("destinationChanged"));
      }
      router.replace("/scheduled", { scroll: false });
      onClose();
      return;
    }

    if (normalized.length === 1) {
      const item = normalized[0];
      if (!item.country_id) return;

      localStorage.setItem("choosedDestination", JSON.stringify(item));
      window.dispatchEvent(new CustomEvent("destinationChanged"));
      const params = new URLSearchParams({
        state: item.state_id,
        destination: item.id,
      });
      router.push(`/packages/${item.country_id}?${params.toString()}`);
    } else {
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
        const params = new URLSearchParams({ destinations: ids });
        router.push(`/packages/${primaryCountryId}?${params.toString()}`);
      } else {
        router.push(`/explore?destinations=${ids}`);
      }
    }

    onClose();
  };

  const handleRunEventSearch = () => {
    if (!eventFilters.dateFrom || !eventFilters.dateTo) return;

    const params = new URLSearchParams();
    params.set("date_from", eventFilters.dateFrom);
    params.set("date_to", eventFilters.dateTo);
    if (eventFilters.languages?.length) {
      params.set("language", eventFilters.languages.join(","));
    }
    if (eventFilters.categories?.length) {
      params.set("category", eventFilters.categories.join(","));
    }
    if (eventFilters.longitude) params.set("longitude", eventFilters.longitude);
    if (eventFilters.latitude) params.set("latitude", eventFilters.latitude);
    if (eventFilters.location) params.set("location", eventFilters.location);

    router.push(`/events?${params.toString()}`);
    onClose();
  };

  const handleRunAttractionSearch = () => {
    if (!attractionFilters.dateFrom || !attractionFilters.dateTo) return;

    const params = new URLSearchParams();
    params.set("date_from", attractionFilters.dateFrom);
    params.set("date_to", attractionFilters.dateTo);
    if (attractionFilters.category)
      params.set("category", attractionFilters.category);
    if (attractionFilters.price_from)
      params.set("price_from", attractionFilters.price_from);
    if (attractionFilters.price_to)
      params.set("price_to", attractionFilters.price_to);
    if (attractionFilters.longitude)
      params.set("longitude", attractionFilters.longitude);
    if (attractionFilters.latitude)
      params.set("latitude", attractionFilters.latitude);
    if (attractionFilters.location)
      params.set("location", attractionFilters.location);

    router.push(`/attractions?${params.toString()}`);
    onClose();
  };

  const handleRunActivitySearch = () => {
    if (!activityFilters.dateFrom || !activityFilters.dateTo) return;

    const params = new URLSearchParams();
    params.set("date_from", activityFilters.dateFrom);
    params.set("date_to", activityFilters.dateTo);
    if (activityFilters.category)
      params.set("category", activityFilters.category);
    if (activityFilters.price_from)
      params.set("price_from", activityFilters.price_from);
    if (activityFilters.price_to)
      params.set("price_to", activityFilters.price_to);
    if (activityFilters.longitude)
      params.set("longitude", activityFilters.longitude);
    if (activityFilters.latitude)
      params.set("latitude", activityFilters.latitude);
    if (activityFilters.location)
      params.set("location", activityFilters.location);

    router.push(`/activities?${params.toString()}`);
    onClose();
  };

  const handleRunRentalSearch = () => {
    if (!rentalFilters.dateFrom || !rentalFilters.dateTo) return;

    const params = new URLSearchParams();
    params.set("date_from", rentalFilters.dateFrom);
    params.set("date_to", rentalFilters.dateTo);
    if (rentalFilters.form_type) params.set("form_type", rentalFilters.form_type);
    if (rentalFilters.category) params.set("category", rentalFilters.category);
    if (rentalFilters.sub_category)
      params.set("sub_category", rentalFilters.sub_category);
    if (rentalFilters.transmission)
      params.set("transmission", rentalFilters.transmission);
    if (rentalFilters.fuel_type) params.set("fuel_type", rentalFilters.fuel_type);
    if (rentalFilters.seats) params.set("seats", rentalFilters.seats);
    if (rentalFilters.price_from)
      params.set("price_from", rentalFilters.price_from);
    if (rentalFilters.price_to) params.set("price_to", rentalFilters.price_to);
    if (rentalFilters.longitude)
      params.set("longitude", rentalFilters.longitude);
    if (rentalFilters.latitude) params.set("latitude", rentalFilters.latitude);
    if (rentalFilters.location) params.set("location", rentalFilters.location);

    router.push(`/rentals?${params.toString()}`);
    onClose();
  };

  const isEventSearchReady =
    Boolean(eventFilters.dateFrom) && Boolean(eventFilters.dateTo);
  const isAttractionSearchReady =
    Boolean(attractionFilters.dateFrom) && Boolean(attractionFilters.dateTo);
  const isActivitySearchReady =
    Boolean(activityFilters.dateFrom) && Boolean(activityFilters.dateTo);
  const isRentalSearchReady =
    Boolean(rentalFilters.dateFrom) && Boolean(rentalFilters.dateTo);

  const handleModuleSelect = (module) => {
    if (!module.enabled) return;
    setSelectedModule(module.id);
    setSearchQuery("");
    setSelectedDestinations([]);
    setEventFilters(createDefaultEventFilters());
    setAttractionFilters(createDefaultAttractionFilters());
    setActivityFilters(createDefaultActivityFilters());
    setRentalFilters(createDefaultRentalFilters());
  };

  const searchButtonLabel =
    selectedDestinations.length === 0
      ? "Select a destination"
      : isScheduleModule
        ? "View scheduled trips"
        : selectedDestinations.length === 1
          ? "Search packages"
          : `Search ${selectedDestinations.length} destinations`;

  const moduleTabs = (
    <section className="px-4 pt-2 pb-3 flex-shrink-0 border-b border-[#EBEBEB]">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 md:mx-0 md:px-0 md:grid md:grid-cols-6 md:gap-2 md:overflow-visible">
        {SEARCH_MODULES.map((module) => {
          const isSelected = selectedModule === module.id;
          const isDisabled = !module.enabled;

          return (
            <button
              key={module.id}
              type="button"
              onClick={() => handleModuleSelect(module)}
              disabled={isDisabled}
              className={`shrink-0 md:w-full inline-flex md:flex-col items-center md:justify-center gap-1.5 md:gap-1 px-3 py-1.5 md:px-2 md:py-2.5 rounded-full md:rounded-xl text-[13px] md:text-[12px] font-medium border transition-colors ${
                isSelected
                  ? "bg-[#222222] text-white border-[#222222]"
                  : isDisabled
                    ? "bg-[#F7F7F7] text-[#B0B0B0] border-[#EBEBEB] cursor-not-allowed"
                    : "bg-white text-[#222222] border-[#DDDDDD] hover:border-[#222222]"
              }`}
            >
              <i className={`fi ${module.icon} text-[13px] md:text-base`} />
              <span className="md:text-center md:leading-tight">
                {module.shortLabel}
              </span>
              {isDisabled && (
                <span className="text-[10px] opacity-70 md:mt-0.5">Soon</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );

  const modalSizeClass =
    "!max-w-lg w-[min(96vw,32rem)] md:!max-w-2xl md:w-[min(96vw,42rem)]";

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="text-[15px] font-semibold text-[#222222]">Search</span>
      }
      pos="center"
      className={`${modalSizeClass} h-auto max-h-[88vh] rounded-2xl overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.12)]`}
      draggable={false}
      overlayClassName="bg-black/30 backdrop-blur-[2px]"
    >
      <div className="flex flex-col min-h-0">
        {moduleTabs}

        {showDestinationPicker ? (
          <>
            <section className="px-4 py-3 flex-shrink-0">
              <div className="relative">
                <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717171] text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destinations"
                  className="block w-full h-10 bg-[#F7F7F7] rounded-full pl-10 pr-4 text-sm text-[#222222] placeholder:text-[#717171] focus:outline-none focus:bg-white border border-transparent focus:border-[#DDDDDD] transition-colors"
                />
              </div>
            </section>

            <section className="px-4 pb-2 flex-1 min-h-0 max-h-[40vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-2 sticky top-0 bg-white py-1 z-10">
                <h3 className="text-sm font-semibold text-[#222222]">
                  Destinations
                </h3>
                {!isDestinationsLoading && (
                  <span className="text-xs text-[#717171]">
                    {filteredDestinations.length}
                  </span>
                )}
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
                    <div className="w-7 h-7 rounded-full border-2 border-[#EBEBEB] border-t-[#222222] animate-spin" />
                    <p className="mt-3 text-[#717171] text-xs">Loading...</p>
                  </motion.div>
                ) : filteredDestinations.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 rounded-xl bg-[#F7F7F7]"
                  >
                    <i className="fi fi-rr-map-marker-cross text-[#B0B0B0] text-xl mb-2" />
                    <p className="text-sm text-[#717171]">
                      No destinations found
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="destinations"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-1"
                  >
                    {filteredDestinations.map((destination) => {
                      const selected = isDestinationSelected(destination.id);

                      return (
                        <button
                          key={destination.id}
                          type="button"
                          onClick={() => toggleDestination(destination)}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${
                            selected
                              ? "bg-[#F7F7F7] ring-1 ring-[#222222]"
                              : "hover:bg-[#F7F7F7]"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-[#EBEBEB] flex-shrink-0">
                            {hasStoredImage(destination.thumb_image) &&
                            destination.thumb_image_url ? (
                              <Image
                                src={destination.thumb_image_url}
                                alt={destination.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <i className="fi fi-rr-map-marker text-[#717171] text-sm" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                selected ? "text-[#222222]" : "text-[#222222]"
                              }`}
                            >
                              {destination.name}
                            </p>
                            <p className="text-xs text-[#717171] truncate">
                              {destination.state?.name || "Destination"}
                            </p>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                              selected
                                ? "bg-[#222222] border-[#222222]"
                                : "border-[#DDDDDD]"
                            }`}
                          >
                            {selected && (
                              <i className="fi fi-rr-check text-white text-[9px]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {selectedDestinations.length > 0 && (
              <section className="px-4 py-2 flex-shrink-0 border-t border-[#EBEBEB]">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {selectedDestinations.map((dest) => (
                    <span
                      key={dest.id}
                      className="inline-flex items-center gap-1 shrink-0 px-2.5 py-1 bg-[#F7F7F7] text-[#222222] rounded-full text-xs font-medium"
                    >
                      {dest.name}
                      <button
                        type="button"
                        onClick={() => toggleDestination(dest)}
                        className="hover:text-[#717171] transition-colors"
                        aria-label={`Remove ${dest.name}`}
                      >
                        <i className="fi fi-rr-cross-small text-[11px]" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedDestinations([])}
                    className="shrink-0 text-xs text-[#717171] hover:text-[#222222] px-1"
                  >
                    Clear
                  </button>
                </div>
              </section>
            )}

            <SearchFooter
              enabled={selectedDestinations.length > 0}
              label={searchButtonLabel}
              onClick={handleRunSearch}
            />
          </>
        ) : isEventsModule ? (
          <>
            <EventsSearchFilters
              filters={eventFilters}
              onFilterChange={setEventFilters}
              categories={eventCategories}
              languages={eventLanguages}
              compact
            />
            <SearchFooter
              enabled={isEventSearchReady}
              label={isEventSearchReady ? "Search events" : "Select dates"}
              onClick={handleRunEventSearch}
            />
          </>
        ) : isAttractionsModule ? (
          <>
            <AttractionsSearchFilters
              filters={attractionFilters}
              onFilterChange={setAttractionFilters}
              categories={attractionCategories}
              compact
            />
            <SearchFooter
              enabled={isAttractionSearchReady}
              label={
                isAttractionSearchReady ? "Search attractions" : "Select dates"
              }
              onClick={handleRunAttractionSearch}
            />
          </>
        ) : isActivitiesModule ? (
          <>
            <ActivitiesSearchFilters
              filters={activityFilters}
              onFilterChange={setActivityFilters}
              categories={activityCategories}
              compact
            />
            <SearchFooter
              enabled={isActivitySearchReady}
              label={
                isActivitySearchReady ? "Search activities" : "Select dates"
              }
              onClick={handleRunActivitySearch}
            />
          </>
        ) : isRentalsModule ? (
          <>
            <RentalsSearchFilters
              filters={rentalFilters}
              onFilterChange={setRentalFilters}
              categories={rentalCategories}
              compact
            />
            <SearchFooter
              enabled={isRentalSearchReady}
              label={isRentalSearchReady ? "Search rentals" : "Select dates"}
              onClick={handleRunRentalSearch}
            />
          </>
        ) : showComingSoon ? (
          <div className="flex items-center justify-center px-6 py-10">
            <div className="text-center">
              <i className="fi fi-rr-hourglass-end text-[#B0B0B0] text-2xl mb-3" />
              <p className="text-sm font-medium text-[#222222] mb-1">
                Coming soon
              </p>
              <p className="text-xs text-[#717171] max-w-[220px]">
                This category isn&apos;t available yet. Try another module above.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Popup>
  );
}
