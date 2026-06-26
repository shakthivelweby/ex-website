import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Popup from "../Popup";
import { useAllDestinations, useEventCategories, useEventLanguages, useAttractionCategories } from "@/app/search/query";
import { hasStoredImage } from "@/utils/imageUrl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import EventsSearchFilters from "./EventsSearchFilters";
import AttractionsSearchFilters from "./AttractionsSearchFilters";

const SEARCH_MODULES = [
  { id: "package", label: "Packages", icon: "fi-rr-umbrella-beach", enabled: true },
  { id: "schedule", label: "Scheduled Trips", icon: "fi-rr-pending", enabled: true },
  { id: "events", label: "Events", icon: "fi-rr-glass-cheers", enabled: true },
  { id: "attractions", label: "Attractions", icon: "fi-rr-ferris-wheel", enabled: true },
  { id: "activities", label: "Activities", icon: "fi-rr-hiking", enabled: false },
  { id: "rentals", label: "Rentals", icon: "fi-rr-car", enabled: false },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

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
    date: todayStr,
    category: "",
    price_from: "",
    price_to: "",
  };
};

export default function Search({ isOpen, onClose, type }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState(type || "package");
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [eventFilters, setEventFilters] = useState(createDefaultEventFilters);
  const [attractionFilters, setAttractionFilters] = useState(createDefaultAttractionFilters);
  const router = useRouter();

  const isPackageModule = selectedModule === "package";
  const isScheduleModule = selectedModule === "schedule";
  const isEventsModule = selectedModule === "events";
  const isAttractionsModule = selectedModule === "attractions";
  const showDestinationPicker = isPackageModule || isScheduleModule;
  const showComingSoon =
    !isPackageModule && !isScheduleModule && !isEventsModule && !isAttractionsModule;
  const { data: destinationsData, isLoading: isDestinationsLoading } =
    useAllDestinations(isOpen && showDestinationPicker);
  const { data: eventCategoriesData } = useEventCategories(isOpen && isEventsModule);
  const { data: eventLanguagesData } = useEventLanguages(isOpen && isEventsModule);
  const { data: attractionCategoriesData } = useAttractionCategories(
    isOpen && isAttractionsModule
  );

  const eventCategories = eventCategoriesData?.data || [];
  const eventLanguages = eventLanguagesData?.data || [];
  const attractionCategories = attractionCategoriesData?.data || [];

  const allDestinations = destinationsData?.data || [];

  useEffect(() => {
    if (type) {
      setSelectedModule(type);
    }
  }, [type]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedDestinations([]);
      setEventFilters(createDefaultEventFilters());
      setAttractionFilters(createDefaultAttractionFilters());
      if (!type) {
        setSelectedModule("package");
      }
    }
  }, [isOpen, type]);

  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return allDestinations;
    const query = searchQuery.toLowerCase();
    return allDestinations.filter(
      (dest) =>
        dest.name?.toLowerCase().includes(query) ||
        dest.state?.name?.toLowerCase().includes(query)
    );
  }, [allDestinations, searchQuery]);

  const toggleDestination = (destination) => {
    if (isScheduleModule) {
      setSelectedDestinations((prev) =>
        prev.some((d) => d.id === destination.id) ? [] : [destination]
      );
      return;
    }

    setSelectedDestinations((prev) => {
      const exists = prev.some((d) => d.id === destination.id);
      if (exists) {
        return prev.filter((d) => d.id !== destination.id);
      }
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
        localStorage.setItem("choosedDestination", JSON.stringify(normalized[0]));
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
        JSON.stringify(normalized)
      );
      const ids = normalized.map((d) => d.id).join(",");
      const countryCounts = normalized.reduce((acc, d) => {
        if (!d.country_id) return acc;
        acc[d.country_id] = (acc[d.country_id] || 0) + 1;
        return acc;
      }, {});
      const primaryCountryId = Object.entries(countryCounts).sort(
        (a, b) => b[1] - a[1]
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

    const query = params.toString();
    router.push(`/events?${query}`);
    onClose();
  };

  const isEventSearchReady =
    Boolean(eventFilters.dateFrom) && Boolean(eventFilters.dateTo);

  const handleRunAttractionSearch = () => {
    if (!attractionFilters.date) return;

    const params = new URLSearchParams();
    params.set("date", attractionFilters.date);
    if (attractionFilters.category) params.set("category", attractionFilters.category);
    if (attractionFilters.price_from) params.set("price_from", attractionFilters.price_from);
    if (attractionFilters.price_to) params.set("price_to", attractionFilters.price_to);
    if (attractionFilters.longitude) params.set("longitude", attractionFilters.longitude);
    if (attractionFilters.latitude) params.set("latitude", attractionFilters.latitude);
    if (attractionFilters.location) params.set("location", attractionFilters.location);

    router.push(`/attractions?${params.toString()}`);
    onClose();
  };

  const isAttractionSearchReady = Boolean(attractionFilters.date);

  const handleModuleSelect = (module) => {
    if (!module.enabled) return;
    setSelectedModule(module.id);
    setSearchQuery("");
    setSelectedDestinations([]);
    setEventFilters(createDefaultEventFilters());
    setAttractionFilters(createDefaultAttractionFilters());
  };

  const moduleTabs = (
    <section className="px-6 pt-1 pb-4 flex-shrink-0 border-b border-gray-100">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400 text-center mb-3">
        What are you looking for?
      </p>
      <div className="grid grid-cols-6 gap-2">
        {SEARCH_MODULES.map((module) => {
          const isSelected = selectedModule === module.id;
          const isDisabled = !module.enabled;

          return (
            <button
              key={module.id}
              onClick={() => handleModuleSelect(module)}
              disabled={isDisabled}
              className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl transition-all duration-200 min-w-0 ${
                isSelected
                  ? "bg-primary-500 text-white shadow-sm"
                  : isDisabled
                    ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 ${
                  isSelected ? "bg-white" : "bg-white border border-gray-200"
                }`}
              >
                <i
                  className={`fi ${module.icon} text-base ${
                    isSelected
                      ? "text-primary-500"
                      : isDisabled
                        ? "text-gray-300"
                        : "text-gray-500"
                  }`}
                />
              </div>
              <span className="text-xs font-medium text-center leading-tight px-0.5">
                {module.label}
              </span>
              {isDisabled && (
                <span className="text-[9px] font-medium uppercase tracking-wide opacity-70">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="Search"
      pos="center"
      className="!max-w-6xl w-[min(96vw,72rem)] h-auto max-h-[90vh] rounded-3xl overflow-hidden"
      draggable={false}
      overlayClassName="bg-black/40 backdrop-blur-sm"
    >
      <div className="flex flex-col">
        {moduleTabs}

        {showDestinationPicker ? (
          <>
            {/* Search & filters */}
            <section className="px-6 py-4 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <i className="fi fi-rr-search text-gray-400 text-base" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter destinations..."
                  className="block w-full h-11 bg-gray-50 rounded-xl pl-11 pr-4 text-sm text-gray-900
                    placeholder:text-gray-400 focus:outline-none border border-gray-200 focus:bg-white
                    focus:border-primary-300 transition-all duration-200"
                />
              </div>
            </section>

            {/* Destinations list */}
            <section className="px-6 pb-2 max-h-[42vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3 sticky top-0 bg-white py-1 z-10">
                <h3 className="text-base font-semibold text-gray-900">
                  Choose Destinations
                </h3>
                {!isDestinationsLoading && (
                  <span className="text-sm text-gray-400">
                    {filteredDestinations.length} available
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
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <div className="w-12 h-12 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin" />
                    <p className="mt-4 text-gray-500 text-sm">
                      Loading destinations...
                    </p>
                  </motion.div>
                ) : filteredDestinations.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <i className="fi fi-rr-map-marker-cross text-gray-400 text-xl" />
                    </div>
                    <p className="text-gray-500">No destinations found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try a different filter term
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="destinations"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                  >
                    {filteredDestinations.map((destination) => {
                      const selected = isDestinationSelected(destination.id);

                      return (
                        <motion.button
                          key={destination.id}
                          variants={itemVariants}
                          onClick={() => toggleDestination(destination)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl group transition-all text-left ${
                            selected
                              ? "bg-primary-50 ring-1 ring-primary-500"
                              : "bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              selected
                                ? "bg-primary-500 border-primary-500"
                                : "border-gray-300 group-hover:border-primary-300"
                            }`}
                          >
                            {selected && (
                              <i className="fi fi-rr-check text-white text-[10px]" />
                            )}
                          </div>

                          <div className="w-11 h-11 rounded-lg overflow-hidden relative bg-gray-200 flex-shrink-0">
                            {hasStoredImage(destination.thumb_image) &&
                            destination.thumb_image_url ? (
                              <Image
                                src={destination.thumb_image_url}
                                alt={destination.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                                <i className="fi fi-rr-map-marker text-gray-500 text-lg" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-medium truncate transition-colors ${
                                selected
                                  ? "text-primary-700"
                                  : "text-gray-900 group-hover:text-primary-600"
                              }`}
                            >
                              {destination.name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {destination.state?.name || "Destination"}
                              {destination.package_count > 0 && (
                                <span className="text-gray-400">
                                  {" "}
                                  · {destination.package_count} package
                                  {destination.package_count !== 1 ? "s" : ""}
                                </span>
                              )}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Footer */}
            <section className="flex-shrink-0 border-t border-gray-100 bg-white px-6 py-4">
              {selectedDestinations.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {selectedDestinations.map((dest) => (
                    <span
                      key={dest.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs"
                    >
                      {dest.name}
                      <button
                        type="button"
                        onClick={() => toggleDestination(dest)}
                        className="hover:bg-primary-100 rounded-full p-0.5 transition-colors"
                      >
                        <i className="fi fi-rr-cross-small text-xs" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedDestinations([])}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                  >
                    Clear all
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleRunSearch}
                disabled={selectedDestinations.length === 0}
                className={`w-full h-11 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  selectedDestinations.length > 0
                    ? "bg-primary-500 text-white hover:bg-primary-600 shadow-sm"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <i className="fi fi-rr-search text-sm" />
                {selectedDestinations.length === 0
                  ? "Select destinations to search"
                  : isScheduleModule
                    ? "View Scheduled Trips"
                    : selectedDestinations.length === 1
                      ? "Search Packages"
                      : `Search ${selectedDestinations.length} Destinations`}
              </button>
            </section>
          </>
        ) : isEventsModule ? (
          <>
            <EventsSearchFilters
              filters={eventFilters}
              onFilterChange={setEventFilters}
              categories={eventCategories}
              languages={eventLanguages}
            />

            <section className="flex-shrink-0 border-t border-gray-100 bg-white px-6 py-4">
              <button
                type="button"
                onClick={handleRunEventSearch}
                disabled={!isEventSearchReady}
                className={`w-full h-11 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  isEventSearchReady
                    ? "bg-primary-500 text-white hover:bg-primary-600 shadow-sm"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <i className="fi fi-rr-search text-sm" />
                {isEventSearchReady ? "Search Events" : "Select a date to search"}
              </button>
            </section>
          </>
        ) : isAttractionsModule ? (
          <>
            <AttractionsSearchFilters
              filters={attractionFilters}
              onFilterChange={setAttractionFilters}
              categories={attractionCategories}
            />

            <section className="flex-shrink-0 border-t border-gray-100 bg-white px-6 py-4">
              <button
                type="button"
                onClick={handleRunAttractionSearch}
                disabled={!isAttractionSearchReady}
                className={`w-full h-11 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  isAttractionSearchReady
                    ? "bg-primary-500 text-white hover:bg-primary-600 shadow-sm"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <i className="fi fi-rr-search text-sm" />
                {isAttractionSearchReady
                  ? "Search Attractions"
                  : "Select a date to search"}
              </button>
            </section>
          </>
        ) : showComingSoon ? (
          <div className="flex items-center justify-center px-8 py-12">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <i className="fi fi-rr-hourglass-end text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Coming Soon
              </h3>
              <p className="text-sm text-gray-500">
                Search for this module is not available yet. Select Packages to
                search by destination.
              </p>
            </div>
          </div>
        ) : null}

      </div>
    </Popup>
  );
}
