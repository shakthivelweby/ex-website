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

export default function Scheduled() {
  // State for selected date from DateNavBar - Initialize with null to prevent hydration mismatch
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileLayout, setMobileLayout] = useState('grid'); // Changed from 'grid' to 'list'
  // Add state for start location and location edit popup
  const [startLocation, setStartLocation] = useState("");
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const [isDestinationPopupOpen, setIsDestinationPopupOpen] = useState(false);
  const [destinationId, setDestinationId] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [isMobile, setIsMobile] = useState(window.matchMedia("(max-width: 768px)").matches);

  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: 10.1631526,
    longitude: 76.64127119999999,
  });

  // is mobile check
  useEffect(() => {
    if (isMobile) {
      setMobileLayout('list');
    } else {
      setMobileLayout('grid');
    }
  }, [setIsMobile]);

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

  // Add temporary filter state
  const [tempFilters, setTempFilters] = useState({
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

  // Google API Key - you can move this to environment variables
  const googleApiKey = "AIzaSyDaNPqSBObLDby0rpTvEUbQ8Ek9kxAABK0";

  // Handle mounting and initialize date
  useEffect(() => {
    setIsMounted(true);
    setSelectedDate(new Date());
  }, []);

  
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
    
    const storedLocationCoordinates = localStorage.getItem("locationCoordinates");
    const storedStartLocation = localStorage.getItem("startLocation");
    const storedDestination = localStorage.getItem("choosedDestination");

    if (storedDestination) {
      const destination = JSON.parse(storedDestination);
      setDestinationId(destination.id);
      setDestinationName(destination.name);
      
      // Update filters based on type using functional update
      setFilters(prev => {
        const updatedFilters = { ...prev };
        // Clear existing IDs first
        delete updatedFilters.country_id;
        delete updatedFilters.state_id;
        delete updatedFilters.destination_id;

        // Set the appropriate ID based on type
        switch (destination.type) {
          case 'country':
            updatedFilters.country_id = destination.id;
            break;
          case 'state':
            updatedFilters.state_id = destination.id;
            break;
          case 'destination':
            updatedFilters.destination_id = destination.id;
            break;
        }
        return updatedFilters;
      });
    }

    // Handle starting location and coordinates separately
    if (storedLocationCoordinates && storedStartLocation) {
      setLocationCoordinates(JSON.parse(storedLocationCoordinates));
      setStartLocation(storedStartLocation);
    } else {
      // Set default location as Kerala
      const defaultCoordinates = {
        latitude: 10.1631526,
        longitude: 76.64127119999999,
      };
      setLocationCoordinates(defaultCoordinates);
      setStartLocation("Kerala");
      
      // Store default values in localStorage
      localStorage.setItem("locationCoordinates", JSON.stringify(defaultCoordinates));
      localStorage.setItem("startLocation", "Kerala");
    }
  }, [isMounted]); // Removed filters dependency

  

  const { data: scheduledTrips } = useScheduledTrips(filters);
  const { data: destinationsData } = useDestinations();
  const packages = scheduledTrips?.data || [];

  // Format destinations for dropdown - wrapped in useMemo to prevent recalculation on every render
  const destinationOptions = useMemo(() => 
    destinationsData?.data?.map(dest => ({
      value: dest.id.toString(),
      label: dest.name,
      coordinates: {
        latitude: dest.latitude,
        longitude: dest.longitude
      }
    })) || []
  , [destinationsData?.data]);

  // set default destination id
  useEffect(() => {
    const choosedDestination = localStorage.getItem("choosedDestination");
    if (choosedDestination) {
      const destination = JSON.parse(choosedDestination);
      setDestinationId(destination.id);
      setDestinationName(destination.name);

      // Update filters based on type using functional update
      setFilters(prev => {
        const updatedFilters = { ...prev };
        // Clear existing IDs first
        delete updatedFilters.country_id;
        delete updatedFilters.state_id;
        delete updatedFilters.destination_id;

        // Set the appropriate ID based on type
        switch (destination.type) {
          case 'country':
            updatedFilters.country_id = destination.id;
            break;
          case 'state':
            updatedFilters.state_id = destination.id;
            break;
          case 'destination':
            updatedFilters.destination_id = destination.id;
            break;
        }
        return updatedFilters;
      });
    } else {
      const destination = {
        id: 1,
        name: "India",
        type: 'country',
        country_id: 1
      };
      const destinationData = {
        id: destination.id,
        name: destination.name,
        type: destination.type,
        country_id: destination.country_id
      };
      localStorage.setItem("choosedDestination", JSON.stringify(destinationData));
      setDestinationId(destination.id);
      setDestinationName(destination.name);
      // Update filters with destination details using functional update
      setFilters(prev => ({
        ...prev,
        country_id: destination.country_id
      }));
    }
  }, [isDestinationPopupOpen]); // Removed filters dependency

  // Add a storage event listener to handle updates from other components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "choosedDestination") {
        const destination = JSON.parse(e.newValue);
        setDestinationId(destination.id);
        setDestinationName(destination.name);
        
        setFilters(prev => ({
          ...prev,
          country_id: destination.country_id || null,
          state_id: destination.state_id || null,
          destination_id: destination.type === 'destination' ? destination.id : null
        }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update coordinates when destination changes
  useEffect(() => {
    if (filters.destination) {
      const selectedDest = destinationOptions.find(opt => opt.value === filters.destination);
      if (selectedDest?.coordinates) {
        // Remove this since we don't need coordinates for destination
        // setLocationCoordinates(selectedDest.coordinates);
      }
    }
  }, [filters.destination, destinationOptions]);


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
  const openDestinationPopup = () => {
    setIsDestinationPopupOpen(true);
  };

  // use effect to update selected date, and longitude and latitude in filters
  useEffect(() => {
    if (!selectedDate) return; // Add this check to prevent unnecessary updates
    
    setFilters((prev) => ({
      ...prev,
      selectedDate: selectedDate.toISOString().split("T")[0],
      longitude: locationCoordinates.longitude,
      latitude: locationCoordinates.latitude,
    }));
  }, [selectedDate, locationCoordinates]);

  // Update individual filter values in temporary state
  const updateFilter = (name, value) => {
    if (name === "budget") {
      // When budget changes, update both from and to values
      setTempFilters((prev) => ({
        ...prev,
        budget_from: value,
        budget_to: Math.min(value + 3000, 53000),
      }));
    } else if (name === "destination") {
      // For destination dropdown, extract the value from the option object
      setTempFilters((prev) => ({
        ...prev,
        destination: value?.value || null, // value.value contains the destination_id
      }));
    } else if (name === "sort_by_price") {
      // For sort_by_price dropdown, extract the value from the option object
      setTempFilters((prev) => ({
        ...prev,
        sort_by_price: value?.value || null, // value.value contains 'asc' or 'desc'
      }));
    } else {
      setTempFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    // Clear the main filters state
    setFilters(prev => ({
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
    
    // Clear the temporary filters but preserve destination-related fields
    setTempFilters({
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
      country_id: filters.country_id,
      state_id: filters.state_id,
      destination_id: filters.destination_id,
    });
    
    // Increment reset key to force re-render of components
    setResetKey((prev) => prev + 1);
    
    // Close the filter popup
    setIsFilterPopupOpen(false);
  };

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return !!(
      tempFilters.destination ||
      tempFilters.budget_from ||
      tempFilters.budget_to ||
      tempFilters.sort_by_price ||
      (tempFilters.dateRange?.startDate || tempFilters.dateRange?.endDate) ||
      tempFilters.pax ||
      tempFilters.duration
    );
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (tempFilters.destination) count++;
    if (tempFilters.budget_from || tempFilters.budget_to) count++;
    if (tempFilters.sort_by_price) count++;
    if (tempFilters.dateRange?.startDate || tempFilters.dateRange?.endDate) count++;
    if (tempFilters.pax) count++;
    if (tempFilters.duration) count++;
    return count;
  };

  // Apply filters
  const applyFilters = () => {
    // Create a clean filters object without null values
    const cleanFilters = Object.entries(tempFilters).reduce((acc, [key, value]) => {
      if (value !== null && value !== '') {
        if (key === 'dateRange') {
          if (value.startDate || value.endDate) {
            acc[key] = {
              startDate: value.startDate?.toISOString().split('T')[0] || null,
              endDate: value.endDate?.toISOString().split('T')[0] || null,
            };
          }
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    // Add the current location coordinates
    cleanFilters.longitude = locationCoordinates.longitude;
    cleanFilters.latitude = locationCoordinates.latitude;
    cleanFilters.selectedDate = selectedDate?.toISOString().split('T')[0] || "";

    // Update main filters state with clean values
    setFilters(cleanFilters);
    
    // Close popup after applying filters
    setIsFilterPopupOpen(false);
  };

  // Initialize tempFilters when filter popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setTempFilters(filters);
    }
  }, [isFilterPopupOpen, filters]);

  return (
    <main className="min-h-screPackage provided  bg-white flex flex-col items-center relative">
      {/* Decorative blurred circle background at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] bg-primary-100 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>
      {/* wrap div */}
      <div className="relative z-10 w-full">
        <DateNavBar onDateChange={setSelectedDate} />

        <div className="container mx-auto px-4  ">
          {/* Title with edit button */}
          <h1 className="text-2xl  text-gray-900 md:text-4xl font-medium text-center mb-0 tracking-tight py-12 px-2 w-full md:w-[60%] mx-auto" style={{lineHeight: '1.3'}}>
            Schedule trips to explore {" "}
            <span className="text-primary-600 underline underline-offset-4 relative cursor-pointer">
              {destinationName}
            </span>
            <i
              className="inline-flex items-center justify-center fi fi-rr-pencil text-gray-900 text-xs text-white relative top-0 left-2 cursor-pointer mr-4 w-6 h-6  bg-primary-700 rounded-full p-1"
              onClick={openDestinationPopup}
            ></i> 
            which start from {}
            <span className="text-primary-600 underline underline-offset-4 relative cursor-pointer">
              {startLocation}
            </span>
            <i
              className="inline-flex items-center justify-center fi fi-rr-pencil text-gray-900 text-xs text-white relative top-0 left-2 cursor-pointer mr-4 w-6 h-6  bg-primary-700 rounded-full p-1"
              onClick={openLocationPopup}
            ></i>
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
            googleApiKey={googleApiKey}
            title="Change Starting Location"
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
                <span>Trip Filters</span>
                {hasActiveFilters() && (
                  <span className="text-sm font-normal text-gray-500">
                    ({getActiveFilterCount()} active)
                  </span>
                )}
              </div>
            }
          >
            <Popup.Content>
              <div className="space-y-6">
                {/* Where you like to go */}
                <div className="space-y-3" onClick={openLocationPopup} >
                  <div className="flex items-center justify-between  mb-4 cursor-pointer" >
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <i className="fi fi-rr-marker text-primary-500"></i>
                      Starting Location
                    </label>
                    {filters.destination && (
                      <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded-full">Selected</span>
                    )}
                  </div>
                  <div className="border-b border-gray-200 w-full text-gray-700 font-bold">{startLocation}</div>
                </div>

                {/* Your Budget */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <i className="fi fi-rr-money-bill-wave text-primary-500"></i>
                      Budget Range
                    </label>
                    {(tempFilters.budget_from || tempFilters.budget_to) && (
                      <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded-full">Selected</span>
                    )}
                  </div>
                  <RangeSlider
                    key={`budget-${resetKey}`}
                    min={6000}
                    max={53000}
                    step={1000}
                    initialValue={tempFilters.budget_from || tempFilters.budget_to || ""}
                    formatDisplay={(val) => {
                      if (!val) return "Set your budget range";
                      const maxVal = Math.min(val + 3000, 53000);
                      return `₹${Math.floor(val / 1000)}k to ₹${Math.floor(maxVal / 1000)}k`;
                    }}
                    title="Price Range"
                    onChange={(value) => updateFilter("budget", value)}
                    className={tempFilters.budget_from || tempFilters.budget_to ? "border-b-2 border-primary-500" : "border-b border-gray-200"}
                  />
                </div>

                {/* Sort by Price */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <i className="fi fi-rr-sort-amount-down text-primary-500"></i>
                      Price Sorting
                    </label>
                    {tempFilters.sort_by_price && (
                      <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded-full">Selected</span>
                    )}
                  </div>
                  <Dropdown
                    key={`sort-${resetKey}`}
                    options={[
                      { value: "asc", label: "Low to High" },
                      { value: "desc", label: "High to Low" }
                    ]}
                    placeholder="Sort by price"
                    value={[
                      { value: "asc", label: "Low to High" },
                      { value: "desc", label: "High to Low" }
                    ].find(opt => opt.value === tempFilters.sort_by_price) || null}
                    onChange={(option) => updateFilter("sort_by_price", option)}
                    className={tempFilters.sort_by_price ? "border-b-1 border-primary-500" : "border-b border-gray-200"}
                  />
                </div>

                {/* Number of Travelers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <i className="fi fi-rr-users text-primary-500"></i>
                      Travelers
                    </label>
                    {tempFilters.pax && (
                      <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded-full">Selected</span>
                    )}
                  </div>
                  <RangeSlider
                    key={`pax-${resetKey}`}
                    min={1}
                    max={50}
                    step={1}
                    initialValue={tempFilters.pax || ""}
                    formatDisplay={(val) => (!val ? "Number of travelers" : `${val} ${val === 1 ? 'Traveler' : 'Travelers'}`)}
                    title="Number of Travelers"
                    onChange={(value) => updateFilter("pax", value)}
                    className={tempFilters.pax ? "border-b-2 border-primary-500" : "border-b border-gray-200"}
                  />
                </div>

                {/* Trip Duration */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <i className="fi fi-rr-calendar-clock text-primary-500"></i>
                      Duration
                    </label>
                    {tempFilters.duration && (
                      <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded-full">Selected</span>
                    )}
                  </div>
                  <RangeSlider
                    key={`duration-${resetKey}`}
                    min={1}
                    max={15}
                    step={1}
                    initialValue={tempFilters.duration || ""}
                    formatDisplay={(val) => {
                      if (!val) return "Select trip duration";
                      return `${val} ${val === 1 ? 'Day' : 'Days'} ${val - 1} ${val - 1 === 1 ? 'Night' : 'Nights'}`;
                    }}
                    title="Trip Duration"
                    onChange={(value) => updateFilter("duration", value)}
                    className={tempFilters.duration ? "border-b-2 border-primary-500" : "border-b border-gray-200"}
                  />
                </div>
              </div>
            </Popup.Content>
            <Popup.Footer>
              <div className="flex items-center gap-3 px-6">
                <button
                  onClick={clearAllFilters}
                  className="h-11 px-6 rounded-full bg-gray-100 text-gray-700 text-sm font-medium flex-1 cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fi fi-rr-refresh"></i>
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="h-11 px-6 rounded-full bg-primary-500 text-white text-sm font-medium flex-1 cursor-pointer hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fi fi-rr-check"></i>
                  Apply Filters
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
                {/* View Toggle */}
                <div className="flex items-center bg-white rounded-full p-0.5 border border-gray-100 shadow-sm lg:hidden">
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
                available_slot
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
