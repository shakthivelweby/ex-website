"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import PackageCard from "@/components/PackageCard";
import DateNavBar from "@/components/DateNavBar/DateNavBar";
import RangeSlider from "@/components/RangeSlider/RangeSlider";
import DateRangePicker from "@/components/DateRangePicker/DateRangePicker";
import Dropdown from "@/components/Dropdown/Dropdown";
import Popup from "@/components/Popup";
import { useScheduledTrips } from "./query";

export default function Scheduled() {
  // State for selected date from DateNavBar
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Add state for start location and location edit popup
  const [startLocation, setStartLocation] = useState("");

  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: null,
    longitude: null,
  });

  // State for all filters
  const [filters, setFilters] = useState({
    destination: "",
    budget: "",
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

  // save to local storage
  useEffect(() => {
    if (locationCoordinates.latitude && locationCoordinates.longitude) {
      localStorage.setItem(
        "locationCoordinates",
        JSON.stringify(locationCoordinates)
      );
    }
    if (startLocation) {
      localStorage.setItem("startLocation", startLocation);
    }
  }, [locationCoordinates, startLocation]);

  // get from local storage
  useEffect(() => {
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
      localStorage.setItem("startLocation", "Kerala");
    }
  }, []);

  const sendData = () => {};

  const { data: scheduledTrips } = useScheduledTrips(filters);
  const packages = scheduledTrips?.data;

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

  // Add a new ref for Places Service
  const placesService = useRef(null);

  // Update the useEffect that loads Google Places API
  useEffect(() => {
    // Skip if already loaded or if window.google exists
    if (placesLoaded || window.google?.maps?.places) {
      setPlacesLoaded(true);
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService (required)
      const mapDiv = document.createElement("div");
      placesService.current = new window.google.maps.places.PlacesService(
        mapDiv
      );
      sessionToken.current =
        new window.google.maps.places.AutocompleteSessionToken();
      return;
    }

    // Create a script element to load the Google Places API
    const script = document.createElement("script");
    script.id = "google-maps-script"; // Add an ID to check if script exists
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Set up callback for when the API is loaded
    script.onload = () => {
      setPlacesLoaded(true);
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService (required)
      const mapDiv = document.createElement("div");
      placesService.current = new window.google.maps.places.PlacesService(
        mapDiv
      );
      sessionToken.current =
        new window.google.maps.places.AutocompleteSessionToken();
    };

    // Handle errors
    script.onerror = () => {
      console.error("Failed to load Google Places API");
    };

    // Check if script already exists
    const existingScript = document.getElementById("google-maps-script");
    if (!existingScript) {
      document.head.appendChild(script);
    }

    // Cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [placesLoaded, googleApiKey]);

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
          types: ["(regions)"], // Restrict to cities only
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

  // Update the selectLocation function to get coordinates
  const selectLocation = (location) => {
    // Request additional place details including geometry
    placesService.current.getDetails(
      {
        placeId: location.placeId,
        fields: ["geometry", "formatted_address", "name"],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const locationData = {
            name: place.name,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            formattedAddress: place.formatted_address,
          };

          // Update your state with the location data
          setStartLocation(place.name);
          // You might want to store coordinates in state as well
          setLocationCoordinates({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          });
        } else {
          console.error("Error fetching place details:", status);
        }

        // Close popup and reset search
        setIsLocationPopupOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    );
  };

  // use effect to update selected date, and longitude and latitude in filters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      selectedDate: selectedDate.toISOString().split("T")[0],
      longitude: locationCoordinates.longitude,
      latitude: locationCoordinates.latitude,
    }));
  }, [selectedDate, locationCoordinates]);

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

  // function searchPackages() {
  //   // console.log(startLocation);
  //   usePackages({
  //     startLongitude: locationCoordinates.longitude,
  //     startLatitude: locationCoordinates.latitude,
  //   });
  // }

  return (
    <main className="min-h-screPackage provided  bg-white flex flex-col items-center relative">
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
            <span className="text-primary-600 underline underline-offset-4 relative cursor-pointer">
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
                    className="block w-full rounded-full border border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500 focus:outline-none shadow-sm transition h-10"
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
          <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
                        onClick={() =>
                          selectLocation({
                            placeId: "ChIJv8a-SlENCDsRkkGEpcqC1Qs",
                            name: "Kochi",
                          })
                        }
                        className="px-4 py-2 rounded-full text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        Kochi
                      </button>
                      <button
                        onClick={() =>
                          selectLocation({
                            placeId: "ChIJR827Bbi7BTsRy4FcXKufQxU",
                            name: "Trivandrum",
                          })
                        }
                        className="px-4 py-2 rounded-full text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        Trivandrum
                      </button>
                      <button
                        onClick={() =>
                          selectLocation({
                            placeId: "ChIJR827Bbi7BTsRy4FcXKufQxU",
                            name: "Thiruvananthapuram",
                          })
                        }
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
                adult_price,
              } = trip;

              return (
                <PackageCard
                  packageId={id}
                  imageSrc={images[0].image_url}
                  imageAlt={name}
                  title={name}
                  startingFrom={starting_location}
                  duration={`${total_days}N ${total_nights}D`}
                  price={adult_price}
                  slotsAvailable={5}
                  key={id}
                  isCertified={false}
                  date={selectedDate.toISOString().split("T")[0]}
                />
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
