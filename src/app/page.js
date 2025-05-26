"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import PackageCard from "@/components/PackageCard";
import DateNavBar from "@/components/DateNavBar/DateNavBar";
import RangeSlider from "@/components/RangeSlider/RangeSlider";
import DateRangePicker from "@/components/DateRangePicker/DateRangePicker";
import Dropdown from "@/components/Dropdown/Dropdown";
import Popup from "@/components/Popup";

export default function Home() {
  // State for selected date from DateNavBar
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Add state for start location and location edit popup
  const [startLocation, setStartLocation] = useState("Kochi");
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sample destination options
  const destinationOptions = [
    { value: "goa", label: "Goa" },
    { value: "delhi", label: "Delhi" },
    { value: "mumbai", label: "Mumbai" },
    { value: "jaipur", label: "Jaipur" },
    { value: "bangalore", label: "Bangalore" },
    { value: "kolkata", label: "Kolkata" },
    { value: "chennai", label: "Chennai" },
    { value: "hyderabad", label: "Hyderabad" },
    { value: "agra", label: "Agra" },
    { value: "udaipur", label: "Udaipur" },
  ];

  // Add these new states and refs
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const autocompleteService = useRef(null);
  const sessionToken = useRef(null);
  const googleApiKey = "AIzaSyDaNPqSBObLDby0rpTvEUbQ8Ek9kxAABK0";

  // Load Google Places API
  useEffect(() => {
    // Skip if already loaded
    if (placesLoaded) return;

    // Create a script element to load the Google Places API
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Set up callback for when the API is loaded
    script.onload = () => {
      setPlacesLoaded(true);
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      sessionToken.current =
        new window.google.maps.places.AutocompleteSessionToken();
    };

    // Handle errors
    script.onerror = () => {
      console.error("Failed to load Google Places API");
    };

    // Add script to document
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [placesLoaded]);

  // Update the location search function to use Google Places API
  const handleLocationSearch = async (query) => {
    setSearchQuery(query);

    if (query.length < 2 || !placesLoaded || !autocompleteService.current) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // Call Google Places Autocomplete API
      autocompleteService.current.getPlacePredictions(
        {
          input: query,
          types: ["(cities)"], // Restrict to cities only
          componentRestrictions: { country: "in" }, // Restrict to India
          sessionToken: sessionToken.current,
        },
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            // Transform the predictions into our format
            const formattedResults = predictions.map((prediction, index) => {
              // Extract main text and secondary text
              const mainText = prediction.structured_formatting.main_text;
              const secondaryText =
                prediction.structured_formatting.secondary_text;

              return {
                id: prediction.place_id || index,
                name: mainText,
                state: secondaryText,
                fullText: prediction.description,
                placeId: prediction.place_id,
              };
            });

            setSearchResults(formattedResults);
          } else {
            setSearchResults([]);
          }
          setIsSearching(false);
        }
      );
    } catch (error) {
      console.error("Error searching places:", error);
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  // Update the openLocationPopup function
  const openLocationPopup = () => {
    // Set the search query to current location
    setSearchQuery(startLocation);

    // Only trigger a search if Places API is loaded
    if (placesLoaded && autocompleteService.current) {
      handleLocationSearch(startLocation);
    }

    // Open the popup
    setIsLocationPopupOpen(true);
  };

  // Create a new sessionToken each time the popup is opened
  useEffect(() => {
    if (isLocationPopupOpen && placesLoaded && window.google?.maps?.places) {
      sessionToken.current =
        new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [isLocationPopupOpen, placesLoaded]);

  // Update the selectLocation function to get full details
  const selectLocation = (location) => {
    // Use the formatted name from Google Places
    setStartLocation(location.name);

    // If you need more details, you could use the Place Details API here
    // with location.placeId

    setIsLocationPopupOpen(false);
    setSearchQuery(""); // Clear search when closing
    setSearchResults([]); // Clear results when closing
  };

  // Format date for display in the divider
  const formatDateForDivider = (date) => {
    return `Today ${date.getDate()} ${date.toLocaleString("default", {
      month: "May",
    })}`;
  };

  // State for all filters
  const [filters, setFilters] = useState({
    destination: null,
    budget: null,
    dateRange: {
      startDate: null,
      endDate: null,
    },
    pax: null,
    duration: null,
  });

  // Use a key to force re-render components when clearing filters
  const [resetKey, setResetKey] = useState(0);

  // State to control the filter popup visibility
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);

  // Update individual filter values
  const updateFilter = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      destination: null,
      budget: null,
      dateRange: {
        startDate: null,
        endDate: null,
      },
      pax: null,
      duration: null,
    });
    // Increment reset key to force re-render of components
    setResetKey((prev) => prev + 1);
  };

  // Apply filters (you can implement the actual filtering logic here)
  const applyFilters = () => {
    // Format dates for better console readability
    const formattedFilters = {
      ...filters,
      dateRange: {
        startDate: filters.dateRange.startDate?.toLocaleDateString() || null,
        endDate: filters.dateRange.endDate?.toLocaleDateString() || null,
      },
    };

    console.log("Applied Filters:", formattedFilters);
    setIsFilterPopupOpen(false); // Close popup after applying filters
  };

  // Filter components to be used in both desktop view and mobile popup
  const FilterComponents = () => (
    <>
      {/* Where you like to go */}
      <div className="flex flex-col">
        <label
          className={`mb-2 font-medium text-sm ${
            filters.destination ? "text-primary-600" : "text-gray-800"
          }`}
        >
          Where you like to go?
        </label>
        <Dropdown
          key={`destination-${resetKey}`}
          options={destinationOptions}
          placeholder="--"
          value={filters.destination}
          onChange={(option) => updateFilter("destination", option)}
          className={ 
            filters.destination ? "border-primary-600 bg-primary-50/30" : ""
          }
        />
      </div>

      {/* Your Budget */}
      <div className="flex flex-col">
        <label
          className={`mb-2 font-medium text-sm ${
            filters.budget !== null ? "text-primary-600" : "text-gray-800"
          }`}
        >
          Your Budget
        </label>
        <RangeSlider
          min={6000}
          max={53000}
          step={1000}
          initialValue={filters.budget}
          formatDisplay={(val) => {
            if (val === null) return "--";
            const maxVal = Math.min(val + 3000, 53000);
            return `${Math.floor(val / 1000)}k to ${Math.floor(
              maxVal / 1000
            )}k`;
          }}
          title="Adjust Price Range"
          onChange={(value) => updateFilter("budget", value)}
          className={
            filters.budget !== null ? "border-primary-600 bg-primary-50/30" : ""
          }
        />
      </div>

      {/* Travel Period */}
      <div className="flex flex-col">
        <label
          className={`mb-2 font-medium text-sm ${
            filters.dateRange.startDate || filters.dateRange.endDate
              ? "text-primary-600"
              : "text-gray-800"
          }`}
        >
          Travel Period
        </label>
        <DateRangePicker
          key={`date-range-${resetKey}`}
          onChange={(dates) => {
            if (Array.isArray(dates) && dates.length === 2) {
              const [startDate, endDate] = dates;
              updateFilter("dateRange", { startDate, endDate });
            } else if (dates && typeof dates === "object") {
              const { startDate, endDate } = dates;
              updateFilter("dateRange", { startDate, endDate });
            }
          }}
          initialStartDate={filters.dateRange.startDate}
          initialEndDate={filters.dateRange.endDate}
          placeholder="--"
          className={
            filters.dateRange.startDate || filters.dateRange.endDate
              ? "border-primary-600 bg-primary-50/30"
              : ""
          }
        />
      </div>

      {/* Number of pax */}
      <div className="flex flex-col">
        <label
          className={`mb-2 font-medium text-sm ${
            filters.pax !== null ? "text-primary-600" : "text-gray-800"
          }`}
        >
          Number of pax
        </label>
        <RangeSlider
          min={1}
          max={50}
          step={1}
          initialValue={filters.pax}
          formatDisplay={(val) => (val === null ? "--" : `${val} Pax`)}
          title="Adjust Number of Travelers"
          onChange={(value) => updateFilter("pax", value)}
          className={
            filters.pax !== null ? "border-primary-600 bg-primary-50/30" : ""
          }
        />
      </div>

      {/* Package Duration */}
      <div className="flex flex-col">
        <label
          className={`mb-2 font-medium text-sm ${
            filters.duration !== null ? "text-primary-600" : "text-gray-800"
          }`}
        >
          Package Duration
        </label>
        <RangeSlider
          min={1}
          max={15}
          step={1}
          initialValue={filters.duration}
          formatDisplay={(val) => {
            if (val === null) return "--";
            return `${val + 1} Day ${val} Night`;
          }}
          title="Adjust Package Duration"
          onChange={(value) => updateFilter("duration", value)}
          className={
            filters.duration !== null
              ? "border-primary-600 bg-primary-50/30"
              : ""
          }
        />
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-white flex flex-col items-center relative">
      {/* Decorative blurred circle background at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] bg-primary-100 rounded-full blur-3xl opacity-40 md:opacity-30 z-0"></div>
      {/* wrap div */}
      <div className="relative z-10">
        <DateNavBar onDateChange={setSelectedDate} />

        {/* Filter button on top of DateNavBar */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsFilterPopupOpen(true)}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 flex items-center px-3 py-1.5 text-sm bg-white text-gray-700 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors z-40 shadow-sm"
          >
            <i className="fi fi-rr-filter text-xs mr-1.5"></i>
            <span>Filters</span>
          </button>
        </div>

        <div className="container mx-auto px-4 ">
          {/* Title with edit button */}
          <h1 className="text-3xl text-gray-900 md:text-4xl font-medium text-center mb-6 tracking-tight py-12">
            Scheduled trips starts from{" "}
            <span className="text-primary-600 underline underline-offset-4 relative">
              {startLocation}
            </span>
            <i
              className="fi fi-rr-pencil text-gray-900 text-base relative top-1 left-4 cursor-pointer"
              onClick={openLocationPopup}
            ></i>
          </h1>

          {/* Location Edit Popup */}
          <Popup
            isOpen={isLocationPopupOpen}
            onClose={() => {
              setIsLocationPopupOpen(false);
              setSearchQuery(""); // Clear search when closing
              setSearchResults([]); // Clear results when closing
            }}
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
                  <div className="flex items-center absolute inset-y-0 left-0 pl-3">
                    <i className="fi fi-rr-search text-gray-400 text-sm"></i>
                  </div>
                  <input
                    type="text"
                    id="location"
                    className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500 focus:outline-none shadow-sm transition h-10"
                    placeholder="Enter city or destination name..."
                    value={searchQuery}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    autoComplete="off"
                  />
                  {isSearching && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="animate-spin h-5 w-5 text-primary-500"
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
                    </div>
                  )}
                  {searchQuery && !isSearching && (
                    <button
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                    >
                      <i className="fi fi-rr-cross-small text-gray-400 hover:text-gray-600"></i>
                    </button>
                  )}
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="overflow-y-auto max-h-60 border border-gray-200 rounded-md shadow-sm bg-white">
                  <ul className="divide-y divide-gray-100">
                    {searchResults.map((location) => (
                      <li key={location.id}>
                        <button
                          type="button"
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                          onClick={() => selectLocation(location)}
                        >
                          <div className="flex items-start">
                            <i className="fi fi-rr-marker text-primary-500 mt-0.5 mr-2"></i>
                            <div>
                              <div className="font-medium text-gray-900">
                                {location.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {location.state}
                              </div>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isSearching && (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-md border border-gray-200">
                  <i className="fi fi-rr-info-circle block mx-auto text-xl mb-2"></i>
                  <p>No locations found. Try a different search term.</p>
                </div>
              )}
            </div>
          </Popup>

          {/* Filter Popup for Mobile */}
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
                    className="h-10 px-4 rounded-full bg-indigo-100 text-gray-700 text-sm font-medium flex-1 cursor-pointer hover:bg-indigo-200 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={applyFilters}
                    className="h-10 px-4 rounded-full bg-primary-500 text-white text-sm font-medium flex-1 cursor-pointer hover:bg-primary-700 transition-colors"
                  >
                    Apply 
                  </button>
                </div>
              </div>
            </div>
          </Popup>

          {/* Desktop Filter Bar - Hidden on mobile */}
          <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <FilterComponents />

            {/* Clear All & Apply Buttons */}
            <div className="flex items-end gap-3 mt-auto">
              <button
                onClick={clearAllFilters}
                className="h-10 px-4 md:px-8 rounded-full bg-indigo-100 text-gray-700 text-sm font-medium flex-1 cursor-pointer hover:bg-indigo-200 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="h-10 px-4 md:px-8 rounded-full bg-primary-500 text-white text-sm font-medium flex-1 cursor-pointer hover:bg-primary-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Date Divider */}
          <div className=" items-center my-6 py-5 hidden md:flex">
            <div className="flex items-center gap-2">
              <i className="fi fi-rr-calendar text-sm text-gray-800"></i>
              <span className="text-gray-800 font-medium text-lg">
                Today {selectedDate.getDate()} May
              </span>
            </div>
            <div className="flex-1 h-[1px] border-t border-dashed border-gray-300 ml-4"></div>
          </div>

          {/* Trip Cards - Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
            {/* Rajasthan Package */}
            <PackageCard
              packageId="rajasthan-tour"
              imageSrc="https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1000&auto=format&fit=crop"
              title="Rajasthan - Jaisalmer - Delhi - Kashmir - Amritsar - Agra"
              startingFrom={startLocation}
              duration="12N 13D"
              price={20500}
              slotsAvailable={5}
            />

            {/* Kashmir Package */}
            <PackageCard
              packageId="kashmir-tour"
              imageSrc="https://images.unsplash.com/photo-1606821061030-9eedf225857b?q=80&w=3127&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              title="Kashmir - Srinagar - Gulmarg - Sonmarg"
              startingFrom={startLocation}
              duration="5N 6D"
              price={15800}
              slotsAvailable={8}
            />

            {/* Kerala Package */}
            <PackageCard
              packageId="kerala-tour"
              imageSrc="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              title="Kerala - Munnar - Thekkady - Alleppey - Kovalam"
              startingFrom={startLocation}
              duration="6N 7D"
              price={12500}
              slotsAvailable={12}
            />

            {/* Goa Package */}
            <PackageCard
              packageId="goa-tour"
              imageSrc="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1000&auto=format&fit=crop"
              title="Goa - Beach Paradise - North & South Goa"
              startingFrom={startLocation}
              duration="4N 5D"
              price={9500}
              slotsAvailable={3}
            />

            {/* Himachal Package */}
            <PackageCard
              packageId="himachal-tour"
              imageSrc="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1000&auto=format&fit=crop"
              title="Himachal - Shimla - Manali - Dharamshala"
              startingFrom={startLocation}
              duration="7N 8D"
              price={14200}
              slotsAvailable={15}
            />

            {/* Andaman Package */}
            <PackageCard
              packageId="andaman-tour"
              imageSrc="https://images.unsplash.com/photo-1589481169991-40ee02888551?q=80&w=1000&auto=format&fit=crop"
              title="Andaman - Port Blair - Havelock - Neil Island"
              startingFrom={startLocation}
              duration="6N 7D"
              price={18900}
              slotsAvailable={7}
            />

            {/* Ladakh Package */}
            <PackageCard
              packageId="ladakh-tour"
              imageSrc="https://images.unsplash.com/photo-1600356033695-a003690a6351?q=80&w=2934&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              title="Ladakh - Leh - Nubra Valley - Pangong Lake"
              startingFrom={startLocation}
              duration="8N 9D"
              price={22500}
              slotsAvailable={4}
            />

            {/* Agra-Delhi Package */}
            <PackageCard
              packageId="agra-delhi-tour"
              imageSrc="https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1000&auto=format&fit=crop"
              title="Golden Triangle - Delhi - Agra - Jaipur"
              startingFrom={startLocation}
              duration="5N 6D"
              price={10900}
              slotsAvailable={9}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
