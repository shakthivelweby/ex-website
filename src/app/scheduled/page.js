"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import PackageCard from "@/components/PackageCard";
import DateNavBar from "@/components/DateNavBar/DateNavBar";
import RangeSlider from "@/components/RangeSlider/RangeSlider";
import DateRangePicker from "@/components/DateRangePicker/DateRangePicker";
import Dropdown from "@/components/Dropdown/Dropdown";
import Popup from "@/components/Popup";
import { useScheduledTrips, useDestinations } from "./query";
import Autocomplete from "react-google-autocomplete";

export default function Scheduled() {
  // State for selected date from DateNavBar - Initialize with null to prevent hydration mismatch
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileLayout, setMobileLayout] = useState('list'); // Add layout state

  // Add state for start location and location edit popup
  const [startLocation, setStartLocation] = useState("");

  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: null,
    longitude: null,
  });

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
  });

  // Use a key to force re-render components when clearing filters
  const [resetKey, setResetKey] = useState(0);

  // State to control the filter popup visibility
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);

  // Google API Key - you can move this to environment variables
  const googleApiKey = "AIzaSyDaNPqSBObLDby0rpTvEUbQ8Ek9kxAABK0";

  // Handle mounting and initialize date
  useEffect(() => {
    setIsMounted(true);
    setSelectedDate(new Date());
  }, []);

  // save to local storage - only after mounting
  useEffect(() => {
    if (!isMounted) return;
    
    if (locationCoordinates.latitude && locationCoordinates.longitude) {
      localStorage.setItem(
        "locationCoordinates",
        JSON.stringify(locationCoordinates)
      );
    }
    if (startLocation) {
      localStorage.setItem("startLocation", startLocation);
    }
  }, [locationCoordinates, startLocation, isMounted]);

  // get from local storage - only after mounting
  useEffect(() => {
    if (!isMounted) return;
    
    const locationCoordinates = localStorage.getItem("locationCoordinates");
    const startLocation = localStorage.getItem("startLocation");
    if (locationCoordinates) {
      setLocationCoordinates(JSON.parse(locationCoordinates));
      setStartLocation(startLocation);
    } else {
      setLocationCoordinates({
        latitude: 10.1631526,
        longitude: 76.64127119999999,
      });
      setStartLocation("Kerala");
      localStorage.setItem("startLocation", "Kerala");
    }
  }, [isMounted]);

  const sendData = () => {};

  const { data: scheduledTrips } = useScheduledTrips(filters);
  const { data: destinationsData } = useDestinations();
  const packages = scheduledTrips?.data;

  // Format destinations for dropdown
  const destinationOptions = destinationsData?.data?.map(dest => ({
    value: dest.id.toString(),
    label: dest.name,
    coordinates: {
      latitude: dest.latitude,
      longitude: dest.longitude
    }
  })) || [];

  // Update coordinates when destination changes
  useEffect(() => {
    if (filters.destination) {
      const selectedDest = destinationOptions.find(opt => opt.value === filters.destination);
      if (selectedDest?.coordinates) {
        setLocationCoordinates(selectedDest.coordinates);
      }
    }
  }, [filters.destination]);

  // Handle place selection from Google Autocomplete
  const handlePlaceSelect = (place) => {
    if (place.geometry && place.geometry.location) {
      const locationData = {
        name: place.name || place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        formattedAddress: place.formatted_address,
      };

      // Update state with the location data
      setStartLocation(locationData.name);
      setLocationCoordinates({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });

      // Close popup
      setIsLocationPopupOpen(false);
    }
  };

  // Open location popup
  const openLocationPopup = () => {
    setIsLocationPopupOpen(true);
  };

  // use effect to update selected date, and longitude and latitude in filters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      selectedDate: selectedDate?.toISOString().split("T")[0] || "",
      longitude: locationCoordinates.longitude,
      latitude: locationCoordinates.latitude,
    }));
  }, [selectedDate, locationCoordinates]);

  // Update individual filter values
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
      setFilters((prev) => ({
        ...prev,
        sort_by_price: value?.value || null, // value.value contains 'asc' or 'desc'
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Clear all filters
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
    }));
    // Increment reset key to force re-render of components
    setResetKey((prev) => prev + 1);
    // close filter popup
    setIsFilterPopupOpen(false);
  };

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return !!(
      filters.destination ||
      filters.budget_from ||
      filters.budget_to ||
      filters.sort_by_price ||
      (filters.dateRange?.startDate || filters.dateRange?.endDate) ||
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

  // Apply filters
  const applyFilters = () => {
    // Create a clean filters object without null values
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== null && value !== '') {
        if (key === 'dateRange') {
          if (value.startDate || value.endDate) {
            acc[key] = {
              startDate: value.startDate?.toISOString().split('T')[0] || null,
              endDate: value.endDate?.toISOString().split('T')[0] || null,
            };
          }
        } else {
          // Remove the object check since we're now storing direct values
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    // Add the current location coordinates
    cleanFilters.longitude = locationCoordinates.longitude;
    cleanFilters.latitude = locationCoordinates.latitude;
    cleanFilters.selectedDate = selectedDate?.toISOString().split('T')[0] || "";

    // Update filters state with clean values
    setFilters(cleanFilters);
    
    // Close popup after applying filters
    setIsFilterPopupOpen(false);
  };

  // Filter components to be used in both desktop view and mobile popup
  const FilterComponents = () => (
    <>
      {/* Where you like to go */}
      <div className="flex flex-col relative">
        <label className="mb-2 font-medium text-sm text-gray-800 relative">
          Where you like to go?
        </label>
        <div>
          {filters.destination ? <span className="absolute bottom-4 right-0 w-3 h-3 bg-primary-500 rounded-full"></span> : null}
          <Dropdown
            key={`destination-${resetKey}`}
            options={destinationOptions}
            placeholder="Select destination"
            value={destinationOptions.find(opt => opt.value === filters.destination) || null}
            onChange={(option) => updateFilter("destination", option)}
            className={filters.destination ? "" : ""}
          />
        </div>
      </div>

      {/* Your Budget */}
      <div className="flex flex-col relative">
        <label className="mb-2 font-medium text-sm text-gray-800 relative">
          Your Budget
        </label>
        <div>
          {filters.budget_from || filters.budget_to ? <span className="absolute bottom-4 right-0 w-3 h-3 bg-primary-500 rounded-full"></span> : null}
          <RangeSlider
            key={`budget-${resetKey}`}
            min={6000}
            max={53000}
            step={1000}
            initialValue={filters.budget_from || filters.budget_to || ""}
            formatDisplay={(val) => {
              if (!val) return "Select budget range";
              const maxVal = Math.min(val + 3000, 53000);
              return `₹${Math.floor(val / 1000)}k to ₹${Math.floor(maxVal / 1000)}k`;
            }}
            title="Price Range"
            onChange={(value) => updateFilter("budget", value)}
            className={filters.budget_from || filters.budget_to ? "border-b-2 border-primary-500 font-bold" : "border-b border-gray-300"}
          />
        </div>
      </div>

      {/* Sort by Price */}
      <div className="flex flex-col relative">
        <label className="mb-2 font-medium text-sm text-gray-800 relative">
          Sort by Price
        </label>
        <div>
          {filters.sort_by_price ? <span className="absolute bottom-4 right-0 w-3 h-3 bg-primary-500 rounded-full"></span> : null}
          <Dropdown
            key={`sort-${resetKey}`}
            options={[
              { value: "asc", label: "Low to High" },
              { value: "desc", label: "High to Low" }
            ]}
            placeholder="Select price sorting"
            value={[
              { value: "asc", label: "Low to High" },
              { value: "desc", label: "High to Low" }
            ].find(opt => opt.value === filters.sort_by_price) || null}
            onChange={(option) => updateFilter("sort_by_price", option)}
            className={filters.sort_by_price ? "" : ""}
          />
        </div>
      </div>

      {/* Number of pax */}
      <div className="flex flex-col relative">
        <label className="mb-2 font-medium text-sm text-gray-800 relative">
          Number of pax
        </label>
        <div>
          {filters.pax ? <span className="absolute bottom-4 right-0 w-3 h-3 bg-primary-500 rounded-full"></span> : null}
          <RangeSlider
            key={`pax-${resetKey}`}
            min={1}
            max={50}
            step={1}
            initialValue={filters.pax || ""}
            formatDisplay={(val) => (!val ? "Select number of travelers" : `${val} Pax`)}
            title="Number of Travelers"
            onChange={(value) => updateFilter("pax", value)}
            className={filters.pax ? "border-b-2 border-primary-500 font-bold" : "border border-gray-300"}
          />
        </div>
      </div>

      {/* Package Duration */}
      <div className="flex flex-col relative">
        <label className="mb-2 font-medium text-sm text-gray-800 relative">
          Package Duration
        </label>
        <div>
          {filters.duration ? <span className="absolute bottom-4 right-0 w-3 h-3 bg-primary-500 rounded-full"></span> : null}
          <RangeSlider
            key={`duration-${resetKey}`}
            min={1}
            max={15}
            step={1}
            initialValue={filters.duration || ""}
            formatDisplay={(val) => {
              if (!val) return "Select package duration";
              return `${val} Days ${val - 1} Nights`;
            }}
            title="Package Duration"
            onChange={(value) => updateFilter("duration", value)}
            className={filters.duration ? "border-b-2 border-primary-500 font-bold" : "border border-gray-300"}
          />
        </div>
      </div>
    </>
  );

  return (
    <main className="min-h-screPackage provided  bg-white flex flex-col items-center relative">
      {/* Decorative blurred circle background at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] bg-primary-100 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>
      {/* wrap div */}
      <div className="relative z-10">
        <DateNavBar onDateChange={setSelectedDate} />

        <div className="container mx-auto px-4  ">
          {/* Title with edit button */}
          <h1 className="text-3xl text-gray-900 md:text-4xl font-medium text-center mb-0 tracking-tight py-12 px-4">
            Scheduled trips starts from{" "}
            <span className="text-primary-600 underline underline-offset-4 relative cursor-pointer">
              {startLocation}
            </span>
            <i
              className="fi fi-rr-pencil text-gray-900 text-base relative top-1 left-4 cursor-pointer"
              onClick={openLocationPopup}
            ></i>
          </h1>

          {/* Location Edit Popup - Now using react-google-autocomplete */}
          <Popup
            isOpen={isLocationPopupOpen}
            onClose={() => setIsLocationPopupOpen(false)}
            title="Change Starting Location"
            maxWidth="max-w-md"
            showCloseButton={true}
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Search for a location
                </label>
                <div className="mt-1 relative">
                  <div className="flex items-center absolute inset-y-0 left-0 pl-3 z-10">
                    <i className="fi fi-rr-search text-gray-400 text-sm"></i>
                  </div>
                  <Autocomplete
                    apiKey={googleApiKey}
                    onPlaceSelected={handlePlaceSelect}
                    options={{
                      types: ['(regions)'],
                      componentRestrictions: { country: 'in' },
                      fields: ['name', 'formatted_address', 'geometry']
                    }}
                    placeholder="Enter city or destination name..."
                    className="block w-full rounded-full border border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500 focus:outline-none shadow-sm transition h-10"
                    defaultValue=""
                  />
                </div>
              </div>
            </div>
          </Popup>

          {/* Desktop Filter Bar - Hidden on mobile */}
          <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-5 gap-6 items-end">
            <FilterComponents />

            {/* Clear All & Apply Buttons */}
            <div className="flex items-center gap-3 h-10">
              <button
                onClick={clearAllFilters}
                className="px-6 h-full rounded-full bg-gray-100 text-gray-700 text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="px-6 h-full rounded-full bg-primary-500 text-white text-sm font-medium cursor-pointer hover:bg-primary-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Mobile Filter Popup */}
          <Popup
            isOpen={isFilterPopupOpen}
            onClose={() => setIsFilterPopupOpen(false)}
            title="Trip Filters"
            maxWidth="max-w-md"
            maxHeight="max-h-[80vh]"
            showCloseButton={false}
          >
            <div className="grid grid-cols-1 gap-6 pb-2">
              <FilterComponents />

              {/* Filter Action Buttons - Fixed at bottom */}
              <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <button
                    onClick={clearAllFilters}
                    className="h-10 px-4 rounded-full bg-gray-100 text-gray-700 text-sm font-medium flex-1 cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={applyFilters}
                    className="h-10 px-4 rounded-full bg-primary-500 text-white text-sm font-medium flex-1 cursor-pointer hover:bg-primary-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </Popup>

          {/* Date Divider - Compact Design */}
          <div className="relative my-0 md:my-4 py-3 md:py-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-50 via-primary-25 to-transparent rounded-xl opacity-60"></div>
            <div className="relative flex items-center justify-between px-3 md:px-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-primary-500 rounded-lg shadow-md">
                  <i className="fi fi-rr-calendar text-white text-sm"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">Trips Available</span>
                  <span className="text-sm md:text-lg font-bold text-gray-900">
                    <span className="md:hidden">
                      {selectedDate && new Intl.DateTimeFormat('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      }).format(selectedDate)}
                    </span>
                    <span className="hidden md:inline">
                      {selectedDate && new Intl.DateTimeFormat('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      }).format(selectedDate)}
                    </span>
                  </span>
                </div>
              </div>
              
              {/* Layout Toggle Controls */}
              <div className="flex items-center gap-4">
                {/* Filter button - Mobile only */}
              

                {/* View Toggle */}
                <div className="flex items-center bg-white rounded-full p-0.5 border border-gray-100 shadow-sm">
                  <button
                    onClick={() => setMobileLayout('list')}
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                      mobileLayout === 'list'
                      ? 'bg-gray-900 text-white shadow-sm scale-[1.02]'
                      : 'text-gray-400 hover:text-gray-600'
                    }`}
                    aria-label="List view"
                  >
                    <i className={`fi fi-rr-list text-[13px] transition-transform ${
                      mobileLayout === 'list' ? 'scale-110' : ''
                    }`}></i>
                  </button>
                  <button
                    onClick={() => setMobileLayout('grid')}
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                      mobileLayout === 'grid'
                      ? 'bg-gray-900 text-white shadow-sm scale-[1.02]'
                      : 'text-gray-400 hover:text-gray-600'
                    }`}
                    aria-label="Grid view"
                  >
                    <i className={`fi fi-rr-apps text-[13px] transition-transform ${
                      mobileLayout === 'grid' ? 'scale-110' : ''
                    }`}></i>
                  </button>
                </div>
                <div className="lg:hidden">
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
          <div className={`${
            mobileLayout === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'flex flex-col gap-4'
          }`}>
            {/* Rajasthan Package */}
            {packages?.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="max-w-md mx-auto">
                  <i className="fi fi-rr-info-circle text-3xl text-gray-400 mb-4 block"></i>

                  <p className="text-gray-600 mb-8">
                    Sorry, we couldn&apos;t find any packages starting from{" "}
                    <span className="font-medium text-gray-900">
                      {startLocation}
                    </span>{" "}
                    right now
                  </p>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 font-medium">
                      Try these nearby starting locations:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setStartLocation("Kochi");
                          setLocationCoordinates({
                            latitude: 9.9312,
                            longitude: 76.2673,
                          });
                        }}
                        className="px-4 py-2 rounded-full text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        Kochi
                      </button>
                      <button
                        onClick={() => {
                          setStartLocation("Trivandrum");
                          setLocationCoordinates({
                            latitude: 8.5241,
                            longitude: 76.9366,
                          });
                        }}
                        className="px-4 py-2 rounded-full text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        Trivandrum
                      </button>
                      <button
                        onClick={() => {
                          setStartLocation("Thiruvananthapuram");
                          setLocationCoordinates({
                            latitude: 8.5241,
                            longitude: 76.9366,
                          });
                        }}
                        className="px-4 py-2 rounded-full text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        Thiruvananthapuram
                      </button>
                    </div>
                  </div>
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
              } = trip;

              return (
                <PackageCard
                  key={id}
                  packageId={id}
                  imageSrc={images[0].image_url}
                  imageAlt={name}
                  title={name}
                  startingFrom={starting_location}
                  duration={`${total_days}N ${total_nights}D`}
                  price={final_adult_price}
                  slotsAvailable={5}
                  isCertified={false}
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
