"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import PackageCard from "@/components/PackageCard";
import DateNavBar from "@/components/DateNavBar/DateNavBar";
import RangeSlider from "@/components/RangeSlider/RangeSlider";
import DateRangePicker from "@/components/DateRangePicker/DateRangePicker";
import Dropdown from "@/components/Dropdown/Dropdown";
import Popup from "@/components/Popup";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import Search from "@/components/Search/Search";
import { useScheduledTrips, useDestinations } from "./query";
import { getEarliestAvailableDate } from "./service";

export default function Scheduled() {
  // State for selected date from DateNavBar - Initialize with null to prevent hydration mismatch
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileLayout, setMobileLayout] = useState("grid"); // Changed from 'grid' to 'list'
  // Add state for start location and location edit popup
  const [startLocation, setStartLocation] = useState("");
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const [isDestinationPopupOpen, setIsDestinationPopupOpen] = useState(false);
  const [destinationId, setDestinationId] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: null,
    longitude: null,
  });

  // Track if we've loaded from localStorage to prevent clearing on initial mount
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  // Track if we've already found the earliest available date
  const hasFoundEarliestDate = useRef(false);

  // is mobile check
  useEffect(() => {
    if (isMobile) {
      setMobileLayout("list");
    } else {
      setMobileLayout("grid");
    }
  }, [isMobile, setMobileLayout]);

  // State for all filters
  const [filters, setFilters] = useState({
    destination: "",
    budget_from: "",
    budget_to: "",
    sort_by_price: "",
    selectedDate: "",
    longitude: "",
    latitude: "",
    dateRange: {
      startDate: "",
      endDate: "",
    },
    pax: "",
    duration: "",
    country_id: "",
    state_id: "",
    destination_id: "",
  });

  // Use a key to force re-render components when clearing filters
  const [resetKey, setResetKey] = useState(0);

  // State to control the filter popup visibility
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);

  // Removed tempFilters - filters now update directly

  // Google API Key - you can move this to environment variables

  // Function to find the earliest available trip date using backend API
  const findEarliestAvailableDate = async (filters) => {
    // Check if we have a destination filter
    const hasDestination =
      (filters?.country_id && filters.country_id !== "") ||
      (filters?.state_id && filters.state_id !== "") ||
      (filters?.destination_id && filters.destination_id !== "");

    if (!hasDestination) return new Date();

    try {
      const response = await getEarliestAvailableDate(filters);

      // Response structure: { data: { earliest_date: "2026-04-01" } }
      if (response?.data?.earliest_date) {
        return new Date(response.data.earliest_date);
      }
    } catch (error) {
      console.error("Error finding earliest available date:", error);
    }

    // If no available date found, return today
    return new Date();
  };

  // Handle mounting and initialize date
  useEffect(() => {
    setIsMounted(true);
    // Set today as initial date, will be updated if earlier date is found
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    if (!isMounted || !hasLoadedFromStorage) return;

    // Only save to localStorage if location is actually set
    if (locationCoordinates.latitude && locationCoordinates.longitude) {
      localStorage.setItem(
        "locationCoordinates",
        JSON.stringify(locationCoordinates)
      );
    }
    if (startLocation) {
      localStorage.setItem("startLocation", startLocation);
    } else {
      // Only remove from localStorage if location is intentionally cleared (after initial load)
      localStorage.removeItem("startLocation");
      localStorage.removeItem("locationCoordinates");
    }
  }, [locationCoordinates, startLocation, isMounted, hasLoadedFromStorage]);

  // get from local storage - only after mounting
  useEffect(() => {
    if (!isMounted) return;

    const storedLocationCoordinates = localStorage.getItem(
      "locationCoordinates"
    );
    const storedStartLocation = localStorage.getItem("startLocation");
    const storedDestination = localStorage.getItem("choosedDestination");

    if (storedDestination) {
      const destination = JSON.parse(storedDestination);
      setDestinationId(destination.id);
      setDestinationName(destination.name);

      // Update filters based on type using functional update
      setFilters((prev) => {
        const updatedFilters = { ...prev };
        // Clear existing IDs first
        delete updatedFilters.country_id;
        delete updatedFilters.state_id;
        delete updatedFilters.destination_id;

        // Set the appropriate ID based on type
        // Use country_id/state_id from destination object when available, fallback to id
        switch (destination.type) {
          case "country":
            updatedFilters.country_id =
              destination.country_id ?? destination.id;
            break;
          case "state":
            updatedFilters.state_id = destination.state_id ?? destination.id;
            break;
          case "destination":
            updatedFilters.destination_id =
              destination.destination_id ?? destination.id;
            break;
        }
        return updatedFilters;
      });
    }

    // Handle starting location and coordinates separately
    // Only load from localStorage if exists, don't set defaults
    if (storedLocationCoordinates && storedStartLocation) {
      setLocationCoordinates(JSON.parse(storedLocationCoordinates));
      setStartLocation(storedStartLocation);
    }

    // Mark that we've loaded from storage to prevent clearing on initial mount
    setHasLoadedFromStorage(true);
  }, [isMounted]); // Removed filters dependency

  const {
    data: scheduledTrips,
    isLoading,
    isFetching,
  } = useScheduledTrips(filters);
  const { data: destinationsData } = useDestinations();
  const packages = scheduledTrips?.data || [];
  const isQueryLoading = isLoading || isFetching;

  // Check if query is enabled (has required filters)
  const hasSelectedDate = Boolean(
    filters?.selectedDate != null && filters?.selectedDate !== ""
  );
  const hasDestinationFilter = Boolean(
    (filters?.country_id && filters?.country_id !== "") ||
      (filters?.state_id && filters?.state_id !== "") ||
      (filters?.destination_id && filters?.destination_id !== "")
  );
  const isQueryEnabled = hasSelectedDate && hasDestinationFilter;

  // Format destinations for dropdown - wrapped in useMemo to prevent recalculation on every render
  const destinationOptions = useMemo(
    () =>
      destinationsData?.data?.map((dest) => ({
        value: dest.id.toString(),
        label: dest.name,
        coordinates: {
          latitude: dest.latitude,
          longitude: dest.longitude,
        },
      })) || [],
    [destinationsData?.data]
  );

  // set default destination id - runs on mount and when popup opens/closes
  useEffect(() => {
    if (!isMounted) return;

    const choosedDestination = localStorage.getItem("choosedDestination");
    if (choosedDestination) {
      const destination = JSON.parse(choosedDestination);
      setDestinationId(destination.id);
      setDestinationName(destination.name);

      // Update filters based on type using functional update
      setFilters((prev) => {
        const updatedFilters = { ...prev };
        // Clear existing IDs first
        delete updatedFilters.country_id;
        delete updatedFilters.state_id;
        delete updatedFilters.destination_id;

        // Set the appropriate ID based on type
        // Use country_id/state_id from destination object when available, fallback to id
        switch (destination.type) {
          case "country":
            updatedFilters.country_id =
              destination.country_id ?? destination.id;
            break;
          case "state":
            updatedFilters.state_id = destination.state_id ?? destination.id;
            break;
          case "destination":
            updatedFilters.destination_id =
              destination.destination_id ?? destination.id;
            break;
        }
        return updatedFilters;
      });
    } else {
      // Set default destination (India) - using correct ID from API
      // Match the structure that Search component creates
      const destinationData = {
        id: 2,
        name: "India",
        type: "country",
        country_id: 2,
        state_id: undefined, // Not set for country type
        destination_id: null, // Always null for country type (matches Search component structure)
      };
      localStorage.setItem(
        "choosedDestination",
        JSON.stringify(destinationData)
      );
      setDestinationId(destinationData.id);
      setDestinationName(destinationData.name);
      // Update filters with destination details using functional update
      setFilters((prev) => ({
        ...prev,
        country_id: destinationData.country_id,
      }));
    }
  }, [isDestinationPopupOpen, isMounted]); // Run on mount and when popup opens/closes

  // Find and set the earliest available trip date when destination is loaded
  useEffect(() => {
    if (!isMounted || hasFoundEarliestDate.current) return;

    // Check if we have a destination filter
    const hasDestinationFilter = Boolean(
      (filters?.country_id && filters.country_id !== "") ||
        (filters?.state_id && filters.state_id !== "") ||
        (filters?.destination_id && filters.destination_id !== "")
    );

    if (!hasDestinationFilter) return;

    // Only find earliest date on initial load (when selectedDate is today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentSelectedDate = selectedDate ? new Date(selectedDate) : null;
    currentSelectedDate?.setHours(0, 0, 0, 0);

    // Only search for earliest date if current date is today (initial load)
    if (
      currentSelectedDate &&
      currentSelectedDate.getTime() === today.getTime()
    ) {
      hasFoundEarliestDate.current = true;
      findEarliestAvailableDate(filters)
        .then((earliestDate) => {
          if (earliestDate) {
            console.log("Setting earliest available date:", earliestDate);
            setSelectedDate(earliestDate);
          }
        })
        .catch((error) => {
          console.error("Error in findEarliestAvailableDate:", error);
        });
    }
  }, [
    isMounted,
    filters.country_id,
    filters.state_id,
    filters.destination_id,
    selectedDate,
  ]); // Run when destination is first loaded

  // Add a storage event listener to handle updates from other components (cross-tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "choosedDestination") {
        const destination = JSON.parse(e.newValue);
        setDestinationId(destination.id);
        setDestinationName(destination.name);

        setFilters((prev) => {
          const updatedFilters = { ...prev };
          // Clear existing IDs first
          delete updatedFilters.country_id;
          delete updatedFilters.state_id;
          delete updatedFilters.destination_id;

          // Set the appropriate ID based on type
          // Use country_id/state_id from destination object when available, fallback to id
          switch (destination.type) {
            case "country":
              updatedFilters.country_id =
                destination.country_id ?? destination.id;
              break;
            case "state":
              updatedFilters.state_id = destination.state_id ?? destination.id;
              break;
            case "destination":
              updatedFilters.destination_id =
                destination.destination_id ?? destination.id;
              break;
          }
          return updatedFilters;
        });
      }
    };

    // Handle custom event for same-tab updates
    const handleDestinationChanged = () => {
      const storedDestination = localStorage.getItem("choosedDestination");
      if (storedDestination) {
        const destination = JSON.parse(storedDestination);
        setDestinationId(destination.id);
        setDestinationName(destination.name);

        setFilters((prev) => {
          const updatedFilters = { ...prev };
          // Clear existing IDs first
          delete updatedFilters.country_id;
          delete updatedFilters.state_id;
          delete updatedFilters.destination_id;

          // Set the appropriate ID based on type
          // Use country_id/state_id from destination object when available, fallback to id
          switch (destination.type) {
            case "country":
              updatedFilters.country_id =
                destination.country_id ?? destination.id;
              break;
            case "state":
              updatedFilters.state_id = destination.state_id ?? destination.id;
              break;
            case "destination":
              updatedFilters.destination_id =
                destination.destination_id ?? destination.id;
              break;
          }
          return updatedFilters;
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("destinationChanged", handleDestinationChanged);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "destinationChanged",
        handleDestinationChanged
      );
    };
  }, []);

  // Update coordinates when destination changes
  useEffect(() => {
    if (filters.destination) {
      const selectedDest = destinationOptions.find(
        (opt) => opt.value === filters.destination
      );
      if (selectedDest?.coordinates) {
        // Remove this since we don't need coordinates for destination
        // setLocationCoordinates(selectedDest.coordinates);
      }
    }
  }, [filters.destination, destinationOptions]);

  // Handle mobile detection on client side
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const openLocationPopup = () => {
    setIsLocationPopupOpen(true);
  };

  // Handle place selection from Google Autocomplete
  const handlePlaceSelect = (place) => {
    if (place.geometry && place.geometry.location) {
      const locationData = {
        name: place.name || place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        formattedAddress: place.formatted_address,
      };

      const newCoordinates = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };

      // Update state with the location data
      setStartLocation(locationData.name);
      setLocationCoordinates(newCoordinates);

      // Immediately save to localStorage
      localStorage.setItem(
        "locationCoordinates",
        JSON.stringify(newCoordinates)
      );
      localStorage.setItem("startLocation", locationData.name);

      // Close popup
      setIsLocationPopupOpen(false);
    }
  };

  // Open location popup
  const openDestinationPopup = () => {
    setIsDestinationPopupOpen(true);
  };

  // use effect to update selected date, and longitude and latitude in filters
  useEffect(() => {
    if (!selectedDate) return; // Add this check to prevent unnecessary updates

    setFilters((prev) => ({
      ...prev,
      selectedDate: selectedDate.toISOString().split("T")[0],
      // Only include location if it's been set by user
      ...(startLocation &&
      locationCoordinates.latitude &&
      locationCoordinates.longitude
        ? {
            longitude: locationCoordinates.longitude,
            latitude: locationCoordinates.latitude,
          }
        : {
            longitude: null,
            latitude: null,
          }),
    }));
  }, [selectedDate, locationCoordinates, startLocation]);

  // Update individual filter values directly - applies immediately
  const updateFilter = (name, value) => {
    if (name === "budget") {
      // When budget changes, update both from and to values
      setFilters((prev) => ({
        ...prev,
        budget_from: value,
        budget_to: Math.min(value + 3000, 53000),
      }));
    } else if (name === "destination") {
      // For destination dropdown, extract the value from the option object
      setFilters((prev) => ({
        ...prev,
        destination: value?.value || null, // value.value contains the destination_id
      }));
    } else if (name === "sort_by_price") {
      // For sort_by_price dropdown, extract the value from the option object
      const sortValue = value?.value || value; // Handle both object and direct value
      setFilters((prev) => ({
        ...prev,
        sort_by_price:
          sortValue === "asc" || sortValue === "desc" ? sortValue : null,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value !== null && value !== "" ? value : null,
      }));
    }
  };

  // Clear all filters (except destination and date)
  const clearAllFilters = () => {
    setFilters((prev) => ({
      ...prev,
      destination: null,
      budget_from: null,
      budget_to: null,
      sort_by_price: null,
      dateRange: {
        startDate: null,
        endDate: null,
      },
      pax: null,
      duration: null,
      // Clear location coordinates from filters
      longitude: null,
      latitude: null,
      // Preserve destination-related fields and selectedDate
    }));

    // Clear starting location
    setStartLocation("");
    setLocationCoordinates({
      latitude: null,
      longitude: null,
    });

    // Remove from localStorage
    localStorage.removeItem("startLocation");
    localStorage.removeItem("locationCoordinates");

    // Increment reset key to force re-render of components
    setResetKey((prev) => prev + 1);

    // Close the filter popup
    setIsFilterPopupOpen(false);
  };

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return !!(
      filters.destination ||
      filters.budget_from ||
      filters.budget_to ||
      filters.sort_by_price ||
      filters.dateRange?.startDate ||
      filters.dateRange?.endDate ||
      filters.pax ||
      filters.duration
    );
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.destination) count++;
    if (filters.budget_from || filters.budget_to) count++;
    if (filters.sort_by_price) count++;
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) count++;
    if (filters.pax) count++;
    if (filters.duration) count++;
    return count;
  };

  // Filters now update directly, no need for applyFilters function

  return (
    <main className="min-h-screPackage provided  bg-white flex flex-col items-center relative">
      {/* Decorative blurred circle background at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] bg-primary-100 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>
      {/* wrap div */}
      <div className="relative z-10 w-full">
        <DateNavBar
          onDateChange={setSelectedDate}
          selectedDate={selectedDate}
        />

        <div className="container mx-auto px-4  ">
          {/* Title with edit button */}
          <h1
            className="text-2xl text-gray-900 md:text-4xl font-medium text-center mb-0 tracking-tight py-12 px-2 w-full md:w-[60%] mx-auto"
            style={{ lineHeight: "1.3" }}
          >
            Schedule trips to explore{" "}
            <span className="text-primary-600 underline underline-offset-4 relative cursor-pointer">
              {destinationName}
            </span>
            <i
              className="inline-flex items-center justify-center fi fi-rr-pencil text-gray-900 text-xs text-white relative top-0 left-2 cursor-pointer mr-4 w-6 h-6  bg-primary-700 rounded-full p-1"
              onClick={openDestinationPopup}
            ></i>
            {startLocation && (
              <>
                {" "}
                which start from{" "}
                <span className="text-primary-600 underline underline-offset-4 relative cursor-pointer">
                  {startLocation}
                </span>
                <i
                  className="inline-flex items-center justify-center fi fi-rr-pencil text-gray-900 text-xs text-white relative top-0 left-2 cursor-pointer mr-4 w-6 h-6  bg-primary-700 rounded-full p-1"
                  onClick={openLocationPopup}
                ></i>
              </>
            )}
          </h1>

          {/* destination list popup */}

          <Search
            isOpen={isDestinationPopupOpen}
            onClose={() => setIsDestinationPopupOpen(false)}
            type="schedule"
          />

          {/* Location Edit Popup - Now using LocationSearchPopup component */}
          <LocationSearchPopup
            isOpen={isLocationPopupOpen}
            onClose={() => setIsLocationPopupOpen(false)}
            onPlaceSelected={handlePlaceSelect}
            googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            title="Change Starting Location"
            initialValue={startLocation}
            onClear={() => {
              setStartLocation("");
              setLocationCoordinates({ latitude: null, longitude: null });
              localStorage.removeItem("startLocation");
              localStorage.removeItem("locationCoordinates");
              setIsLocationPopupOpen(false);
            }}
          />

          {/* Mobile Filter Popup */}
          <Popup
            isOpen={isFilterPopupOpen}
            onClose={() => setIsFilterPopupOpen(false)}
            pos="right"
            preventScroll={true}
            draggable={true}
            className="md:h-auto h-[75vh]"
            title={
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-settings-sliders text-lg text-primary-500"></i>
                <span className="text-gray-700">Trip Filters</span>
                {hasActiveFilters() && (
                  <span className="text-sm font-normal text-gray-500">
                    ({getActiveFilterCount()} active)
                  </span>
                )}
              </div>
            }
          >
            <Popup.Content>
              <div className="space-y-6 md:pb-24">
                {/* Where you like to go */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <i className="fi fi-rr-marker text-primary-500"></i>
                      Starting Location
                    </label>
                    {startLocation && (
                      <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <div
                    className="border-b border-gray-200 w-full text-gray-700 font-bold cursor-pointer hover:text-primary-600 transition-colors flex items-center justify-between group"
                    onClick={openLocationPopup}
                  >
                    <span className={startLocation ? "" : "text-gray-400"}>
                      {startLocation || "Click to set starting location"}
                    </span>
                    {startLocation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStartLocation("");
                          setLocationCoordinates({
                            latitude: null,
                            longitude: null,
                          });
                          localStorage.removeItem("startLocation");
                          localStorage.removeItem("locationCoordinates");
                        }}
                        className="ml-2 p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Clear location"
                      >
                        <i className="fi fi-rr-cross-small text-sm"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Date Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <i className="fi fi-rr-calendar text-primary-500"></i>
                      Select Date
                    </label>
                    {selectedDate && (
                      <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={
                        selectedDate
                          ? selectedDate.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedDate(new Date(e.target.value));
                        } else {
                          setSelectedDate(null);
                        }
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full px-3 py-2 border-b ${
                        selectedDate
                          ? "border-primary-500 border-b-2"
                          : "border-gray-200"
                      } text-gray-700 font-medium bg-transparent focus:outline-none focus:border-primary-500 focus:border-b-2 transition-colors cursor-pointer`}
                    />
                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear date"
                      >
                        <i className="fi fi-rr-cross-small text-sm"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Your Budget */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <i className="fi fi-rr-money-bill-wave text-primary-500"></i>
                      Budget Range
                    </label>
                    {(filters.budget_from || filters.budget_to) && (
                      <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <RangeSlider
                    key={`budget-${resetKey}`}
                    min={6000}
                    max={53000}
                    step={1000}
                    initialValue={
                      filters.budget_from
                        ? Number(filters.budget_from)
                        : filters.budget_to
                        ? Number(filters.budget_to)
                        : ""
                    }
                    formatDisplay={(val) => {
                      if (!val || val === "" || isNaN(Number(val)))
                        return "Set your budget range";
                      const numVal = Number(val);
                      const maxVal = Math.min(numVal + 3000, 53000);
                      return `₹${Math.floor(numVal / 1000)}k to ₹${Math.floor(
                        maxVal / 1000
                      )}k`;
                    }}
                    title="Price Range"
                    onChange={(value) => updateFilter("budget", value)}
                    className={
                      filters.budget_from || filters.budget_to
                        ? "border-b-2 border-primary-500"
                        : "border-b border-gray-200"
                    }
                  />
                </div>

                {/* Sort by Price */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <i className="fi fi-rr-sort-amount-down text-primary-500"></i>
                      Price Sorting
                    </label>
                    {filters.sort_by_price && (
                      <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <Dropdown
                    key={`sort-${resetKey}`}
                    options={[
                      { value: "asc", label: "Low to High" },
                      { value: "desc", label: "High to Low" },
                    ]}
                    placeholder="Sort by price"
                    value={
                      [
                        { value: "asc", label: "Low to High" },
                        { value: "desc", label: "High to Low" },
                      ].find((opt) => opt.value === filters.sort_by_price) ||
                      null
                    }
                    onChange={(option) => updateFilter("sort_by_price", option)}
                    className={
                      filters.sort_by_price
                        ? "border-b-1 border-primary-500"
                        : "border-b border-gray-200"
                    }
                  />
                </div>

                {/* Number of Travelers - Hidden */}
                {/* <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <i className="fi fi-rr-users text-primary-500"></i>
                      Travelers
                    </label>
                    {tempFilters.pax && (
                      <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <RangeSlider
                    key={`pax-${resetKey}`}
                    min={1}
                    max={50}
                    step={1}
                    initialValue={tempFilters.pax || ""}
                    formatDisplay={(val) =>
                      !val
                        ? "Number of travelers"
                        : `${val} ${val === 1 ? "Traveler" : "Travelers"}`
                    }
                    title="Number of Travelers"
                    onChange={(value) => updateFilter("pax", value)}
                    className={
                      tempFilters.pax
                        ? "border-b-2 border-primary-500"
                        : "border-b border-gray-200"
                    }
                  />
                </div> */}

                {/* Trip Duration */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <i className="fi fi-rr-calendar-clock text-primary-500"></i>
                      Duration
                    </label>
                    {filters.duration && (
                      <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <RangeSlider
                    key={`duration-${resetKey}`}
                    min={1}
                    max={15}
                    step={1}
                    initialValue={filters.duration || ""}
                    formatDisplay={(val) => {
                      if (!val || val === "") return "Select trip duration";
                      const numVal = Number(val);
                      if (isNaN(numVal)) return "Select trip duration";
                      const nights = numVal - 1;
                      return `${numVal} ${
                        numVal === 1 ? "Day" : "Days"
                      } ${nights} ${nights === 1 ? "Night" : "Nights"}`;
                    }}
                    title="Trip Duration"
                    onChange={(value) => updateFilter("duration", value)}
                    className={
                      filters.duration
                        ? "border-b-2 border-primary-500"
                        : "border-b border-gray-200"
                    }
                  />
                </div>
              </div>
            </Popup.Content>
            <Popup.Footer className="md:sticky md:bottom-0 md:mt-auto md:border-t md:border-gray-100 md:bg-white md:shadow-lg md:z-10 md:!py-0">
              <div className="flex items-center gap-3 px-6 py-4 md:px-6 md:py-4">
                <button
                  onClick={clearAllFilters}
                  className="h-11 px-6 rounded-full bg-gray-100 text-gray-700 text-sm font-medium w-full cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fi fi-rr-refresh"></i>
                  Clear All Filters
                </button>
              </div>
            </Popup.Footer>
          </Popup>

          {/* Date Divider - Compact Design */}
          <div className="relative my-0 md:my-4 py-3 md:py-4 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-50 via-primary-25 to-transparent rounded-xl opacity-60"></div>
            <div className="relative flex items-center justify-between px-3 md:px-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg shadow-md">
                  <i className="fi fi-rr-calendar text-gray-900 text-sm"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">
                    Trips Available
                  </span>
                  <span className="text-sm md:text-lg font-bold text-gray-900">
                    <span className="md:hidden">
                      {selectedDate &&
                        new Intl.DateTimeFormat("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        }).format(selectedDate)}
                    </span>
                    <span className="hidden md:inline">
                      {selectedDate &&
                        new Intl.DateTimeFormat("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        }).format(selectedDate)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Layout Toggle Controls */}
              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <div className="flex items-center bg-white rounded-full p-0.5 border border-gray-100 shadow-sm lg:hidden">
                  <button
                    onClick={() => setMobileLayout("list")}
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                      mobileLayout === "list"
                        ? "bg-gray-900 text-white shadow-sm scale-[1.02]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    aria-label="List view"
                  >
                    <i
                      className={`fi fi-rr-list text-[13px] transition-transform ${
                        mobileLayout === "list" ? "scale-110" : ""
                      }`}
                    ></i>
                  </button>
                  <button
                    onClick={() => setMobileLayout("grid")}
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                      mobileLayout === "grid"
                        ? "bg-gray-900 text-white shadow-sm scale-[1.02]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    aria-label="Grid view"
                  >
                    <i
                      className={`fi fi-rr-apps text-[13px] transition-transform ${
                        mobileLayout === "grid" ? "scale-110" : ""
                      }`}
                    ></i>
                  </button>
                </div>
                <div className="">
                  <button
                    onClick={() => setIsFilterPopupOpen(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white shadow-sm hover:bg-black transition-colors text-sm"
                  >
                    <i className="fi fi-rr-settings-sliders text-[13px]"></i>
                    <span className="font-medium">Filters</span>
                    {hasActiveFilters() && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Cards - Grid/List View */}
          <div
            className={`${
              mobileLayout === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-4"
            }`}
          >
            {isQueryEnabled && isQueryLoading && (
              <div className="col-span-full text-center py-16">
                <div className="max-w-md mx-auto px-8">
                  <div className="animate-pulse">
                    <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
                    <p className="text-gray-600">Loading packages...</p>
                  </div>
                </div>
              </div>
            )}
            {isQueryEnabled && !isQueryLoading && packages?.length === 0 && (
              <div className="col-span-full text-center py-16 ">
                <div className="max-w-md mx-auto px-8">
                  <i className="fi fi-rr-info-circle text-3xl text-gray-400 mb-4 block"></i>
                  <p className="text-gray-600 mb-8">
                    Sorry, we couldn&apos;t find any packages
                    {startLocation && (
                      <>
                        {" "}
                        starting from{" "}
                        <span className="font-medium text-gray-900">
                          {startLocation}
                        </span>
                      </>
                    )}{" "}
                    for this date right now
                  </p>
                </div>
              </div>
            )}
            {packages?.map((trip) => {
              const {
                id,
                name,
                images,
                total_days,
                total_nights,
                starting_location,
                final_adult_price,
                available_slot,
              } = trip;

              return (
                <PackageCard
                  key={id}
                  packageId={id}
                  imageSrc={images[0]?.image_url}
                  imageAlt={name}
                  title={name}
                  startingFrom={starting_location}
                  duration={`${total_days}D ${total_nights}N`}
                  price={final_adult_price}
                  slotsAvailable={available_slot}
                  isCertified={true}
                  date={selectedDate?.toISOString().split("T")[0] || ""}
                  mobileLayout={mobileLayout}
                />
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
