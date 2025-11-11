"use client";

import { useState, useEffect, useRef } from "react";
import RangeSlider from "../RangeSlider/RangeSlider";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LocationSearchPopup from "../LocationSearchPopup";

const ActivityFilters = ({
  initialFilters,
  onFilterChange,
  categories,
  locations,
  layout = "inline", // "inline", "sidebar", or "mobile"
  onClose, // For mobile popup close functionality
}) => {
  const [tempFilters, setTempFilters] = useState(initialFilters || {});
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPriceRangeOpen, setIsPriceRangeOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const prevInitialFiltersRef = useRef();

  useEffect(() => {
    // Only update tempFilters if initialFilters actually changed from previous value
    const prevFilters = prevInitialFiltersRef.current;
    const filtersChanged =
      JSON.stringify(initialFilters) !== JSON.stringify(prevFilters);

    if (filtersChanged) {
      prevInitialFiltersRef.current = initialFilters;
      setTempFilters(initialFilters || {});
    }

    // Initialize date if it exists in filters
    if (initialFilters?.date) {
      if (initialFilters.date === "today") {
        setSelectedDate(new Date());
      } else if (initialFilters.date === "tomorrow") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow);
      } else if (initialFilters.date === "weekend") {
        const today = new Date();
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
        const weekend = new Date(today);
        weekend.setDate(today.getDate() + daysUntilSaturday);
        setSelectedDate(weekend);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(initialFilters.date)) {
        // Custom date format
        setSelectedDate(new Date(initialFilters.date));
      }
    }
  }, [initialFilters]);

  const handlePlaceSelected = (place) => {
    // Handle undefined place
    if (!place) {
      console.warn("No place selected");
      return;
    }

    // Extract location name from place object
    const locationName =
      place.name || place.formatted_address || place.vicinity || "";

    // Check if place has required geometry data
    if (place.geometry && place.geometry.location) {
      const longitude =
        typeof place.geometry.location.lng === "function"
          ? place.geometry.location.lng()
          : place.geometry.location.lng;
      const latitude =
        typeof place.geometry.location.lat === "function"
          ? place.geometry.location.lat()
          : place.geometry.location.lat;

      if (longitude && latitude) {
        const newFilters = {
          ...tempFilters,
          longitude,
          latitude,
          location: locationName, // Add location name for backend filtering
        };
        setTempFilters(newFilters);
        onFilterChange(newFilters);
        setIsLocationOpen(false);
        console.log("📍 Location selected:", locationName, "Coordinates:", {
          longitude,
          latitude,
        });
      } else {
        console.warn("Invalid coordinates received:", { longitude, latitude });
      }
    } else {
      // Even without coordinates, we can still filter by location name
      if (locationName) {
        const newFilters = {
          ...tempFilters,
          location: locationName,
        };
        setTempFilters(newFilters);
        onFilterChange(newFilters);
        setIsLocationOpen(false);
        console.log("📍 Location selected (name only):", locationName);
      } else {
        console.warn(
          "Place object missing both geometry data and location name:",
          place
        );
      }
    }
  };

  const handlePriceChange = (value) => {
    const newFilters = {
      ...tempFilters,
      price_from: value[0],
      price_to: value[1],
    };
    setTempFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      // Format date as YYYY-MM-DD for custom dates
      const formattedDate = date.toISOString().split("T")[0];
      const newFilters = {
        ...tempFilters,
        date: formattedDate,
      };
      setTempFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  const handleQuickDateSelect = (option) => {
    let dateParam = "";

    switch (option) {
      case "Today":
        dateParam = "today";
        break;
      case "Tomorrow":
        dateParam = "tomorrow";
        break;
      case "This Weekend":
        dateParam = "weekend";
        break;
    }

    setSelectedDate(new Date()); // Keep UI state for display
    const newFilters = {
      ...tempFilters,
      date: dateParam,
    };
    setTempFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      date: "",
      location: "",
      category: "",
      rating: "",
      price_from: "",
      price_to: "",
      longitude: "",
      latitude: "",
    };
    setTempFilters(clearedFilters);
    setSelectedDate(new Date()); // Reset to current date for UI
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return Object.values(tempFilters).some((value) => value);
  };

  const getActiveFilterCount = () => {
    return Object.values(tempFilters).filter((value) => value).length;
  };

  const removeFilter = (key) => {
    const newFilters = { ...tempFilters, [key]: "" };
    setTempFilters(newFilters);

    // Special handling for date to reset UI state
    if (key === "date") {
      setSelectedDate(new Date());
    }

    onFilterChange(newFilters);
  };

  // Function to check if date matches quick option
  const checkIfDateMatchesOption = (option) => {
    if (!tempFilters.date) return false;

    switch (option) {
      case "Today":
        return tempFilters.date === "today";
      case "Tomorrow":
        return tempFilters.date === "tomorrow";
      case "This Weekend":
        return tempFilters.date === "weekend";
      default:
        return false;
    }
  };

  const FilterContent = () => (
    <div className="space-y-3">
      {/* Location Section */}
      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-marker text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">Location</span>
          </div>
          {tempFilters.location && (
            <button
              onClick={() => {
                const newFilters = {
                  ...tempFilters,
                  longitude: "",
                  latitude: "",
                  location: "",
                };
                setTempFilters(newFilters);
                onFilterChange(newFilters);
              }}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <button
          onClick={() => setIsLocationOpen(true)}
          className="w-full px-3 py-2 bg-white border border-gray-300 focus:border-primary-500 focus:outline-none text-left text-sm rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-gray-600">
            {tempFilters.location ? tempFilters.location : "Choose location"}
          </span>
          <i className="fi fi-rr-angle-small-right ml-auto text-gray-400"></i>
        </button>
      </div>

      {/* Date Section */}
      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-calendar text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">Date</span>
          </div>
          {tempFilters.date && (
            <button
              onClick={() => removeFilter("date")}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          <div className="hidden flex-wrap gap-1.5">
            {["Today", "Tomorrow", "This Weekend"].map((option) => (
              <button
                key={option}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  checkIfDateMatchesOption(option)
                    ? "bg-primary-600 text-white"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => handleQuickDateSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="relative">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              minDate={new Date()}
              placeholderText="Select a date"
              dateFormat="dd MMM yyyy"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none text-sm text-gray-600 transition-colors focus:ring-none"
              popperClassName="react-datepicker-left"
              customInput={
                <button className="w-full flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fi fi-rr-calendar text-gray-400"></i>
                    <span>
                      {selectedDate
                        ? selectedDate.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Select a date"}
                    </span>
                  </span>
                  <i className="fi fi-rr-angle-small-down text-gray-400"></i>
                </button>
              }
            />
          </div>
        </div>
      </div>

      {/* Rating Section */}
      <div className="p-3 bg-gray-100 rounded-lg hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-star text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">Rating</span>
          </div>
          {tempFilters.rating && (
            <button
              onClick={() => {
                const newFilters = { ...tempFilters, rating: "" };
                setTempFilters(newFilters);
                onFilterChange(newFilters);
              }}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {[4.5, 4.0, 3.5, 3.0].map((rating) => (
            <button
              key={rating}
              className={`px-3 py-1.5 text-xs transition-colors ${
                tempFilters.rating === rating.toString()
                  ? "bg-primary-600 text-white"
                  : "bg-white border border-gray-300 rounded-lg focus:border-primary-500 text-gray-700"
              }`}
              onClick={() => {
                const newFilters = {
                  ...tempFilters,
                  rating: rating.toString(),
                };
                setTempFilters(newFilters);
                onFilterChange(newFilters);
              }}
            >
              {rating}+ ⭐
            </button>
          ))}
        </div>
      </div>

      {/* Activity Type Section */}
      <div className="hidden p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-apps text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">
              Activity Type
            </span>
          </div>
          {tempFilters.category && (
            <button
              onClick={() => {
                const newFilters = { ...tempFilters, category: "" };
                setTempFilters(newFilters);
                onFilterChange(newFilters);
              }}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories && categories.length > 0 ? (
            categories.map((category) => {
              const isSelected = tempFilters.category === category.slug;
              return (
                <button
                  key={category.id}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    isSelected
                      ? "bg-primary-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:border-primary-300"
                  }`}
                  onClick={() => {
                    const newFilters = {
                      ...tempFilters,
                      category: category.slug,
                    };
                    setTempFilters(newFilters);
                    onFilterChange(newFilters);
                  }}
                >
                  {category.name}
                </button>
              );
            })
          ) : (
            <div className="text-sm text-gray-500 py-2">
              No categories available
            </div>
          )}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-indian-rupee-sign text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">
              Price Range
            </span>
          </div>
          {(tempFilters.price_from || tempFilters.price_to) && (
            <button
              onClick={() => {
                const newFilters = {
                  ...tempFilters,
                  price_from: "",
                  price_to: "",
                };
                setTempFilters(newFilters);
                onFilterChange(newFilters);
              }}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="px-2">
          <RangeSlider
            min={0}
            max={1000}
            step={50}
            initialValue={[
              parseInt(tempFilters.price_from) || 0,
              parseInt(tempFilters.price_to) || 1000,
            ]}
            onChange={handlePriceChange}
            formatDisplay={(value) => {
              if (!value || value.length !== 2) return "Select Price Range";
              if (value[0] === 0 && value[1] === 1000) return "Any Price";
              if (value[0] === 0) return `Under ₹${value[1]}`;
              if (value[1] === 1000) return `₹${value[0]}+`;
              return `₹${value[0]} - ₹${value[1]}`;
            }}
            title="Price Range"
          />
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Free</span>
            <span>₹1000+</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile layout
  if (layout === "mobile") {
    return (
      <div className="space-y-6">
        <FilterContent />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={clearAllFilters}
            className="flex-1 py-2.5 px-4 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => {
              // Apply filters (they're already applied in real-time)
              // Close the popup if onClose is provided
              if (onClose) {
                onClose();
              }
            }}
            className="flex-1 py-2.5 px-4 rounded-full bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Apply Now
          </button>
        </div>

        {/* Location Picker Popup */}
        <LocationSearchPopup
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
          onPlaceSelected={handlePlaceSelected}
          googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          title="Choose Location"
        />
      </div>
    );
  }

  // Top/Compact layout - horizontal filters at top
  if (layout === "top" || layout === "compact") {
    // Format price range display
    const getPriceRangeDisplay = () => {
      const priceFrom = parseInt(tempFilters.price_from) || 0;
      const priceTo = parseInt(tempFilters.price_to) || 1000;
      
      if (!tempFilters.price_from && !tempFilters.price_to) return "Price Range";
      if (priceFrom === 0 && priceTo === 1000) return "Any Price";
      if (priceFrom === 0) return `Under ₹${priceTo}`;
      if (priceTo === 1000) return `₹${priceFrom}+`;
      return `₹${priceFrom} - ₹${priceTo}`;
    };

    return (
      <div className="flex items-center justify-end">
      <div className="flex items-center justify-end space-x-5 flex-wrap">
        <h3 className="text-base font-medium text-gray-800">Filters</h3>
        {/* Location Filter */}
        <div className="relative">
          <button
            onClick={() => setIsLocationOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary-500 transition-colors text-sm"
          >
            <i className="fi fi-rr-marker text-gray-400"></i>
            <span className="text-gray-700">
              {tempFilters.location ? tempFilters.location : "Location"}
            </span>
            {tempFilters.location && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newFilters = {
                    ...tempFilters,
                    longitude: "",
                    latitude: "",
                    location: "",
                  };
                  setTempFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                className="ml-1 text-primary-600 hover:text-primary-700"
              >
                <i className="fi fi-rr-cross-small text-xs"></i>
              </button>
            )}
          </button>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            minDate={new Date()}
            placeholderText="Select date"
            dateFormat="dd MMM yyyy"
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary-500 transition-colors text-sm"
            popperClassName="react-datepicker-left"
            customInput={
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary-500 transition-colors text-sm">
                <i className="fi fi-rr-calendar text-gray-400"></i>
                <span className="text-gray-700">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "Date"}
                </span>
                {tempFilters.date && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFilter("date");
                    }}
                    className="ml-1 text-primary-600 hover:text-primary-700"
                  >
                    <i className="fi fi-rr-cross-small text-xs"></i>
                  </button>
                )}
              </button>
            }
          />
        </div>

        {/* Price Range Filter */}
        <div className="relative">
          <button
            onClick={() => setIsPriceRangeOpen(!isPriceRangeOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary-500 transition-colors text-sm"
          >
            <i className="fi fi-rr-indian-rupee-sign text-gray-400"></i>
            <span className="text-gray-700">{getPriceRangeDisplay()}</span>
            {(tempFilters.price_from || tempFilters.price_to) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newFilters = {
                    ...tempFilters,
                    price_from: "",
                    price_to: "",
                  };
                  setTempFilters(newFilters);
                  onFilterChange(newFilters);
                }}
                className="ml-1 text-primary-600 hover:text-primary-700"
              >
                <i className="fi fi-rr-cross-small text-xs"></i>
              </button>
            )}
          </button>

          {/* Price Range Dropdown */}
          {isPriceRangeOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Price Range
                  </span>
                  <button
                    onClick={() => setIsPriceRangeOpen(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <i className="fi fi-rr-cross-small"></i>
                  </button>
                </div>
                <RangeSlider
                  min={0}
                  max={1000}
                  step={50}
                  initialValue={[
                    parseInt(tempFilters.price_from) || 0,
                    parseInt(tempFilters.price_to) || 1000,
                  ]}
                  onChange={(value) => {
                    handlePriceChange(value);
                  }}
                  formatDisplay={(value) => {
                    if (!value || value.length !== 2) return "Select Price Range";
                    if (value[0] === 0 && value[1] === 1000) return "Any Price";
                    if (value[0] === 0) return `Under ₹${value[1]}`;
                    if (value[1] === 1000) return `₹${value[0]}+`;
                    return `₹${value[0]} - ₹${value[1]}`;
                  }}
                  title="Price Range"
                />
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>Free</span>
                  <span>₹1000+</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Apply Now Button */}
          <button
            onClick={() => {
              // Apply filters (they're already applied in real-time)
              // Close any open dropdowns
              setIsPriceRangeOpen(false);
              setIsLocationOpen(false);
              // Ensure filters are applied
              onFilterChange(tempFilters);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            <i className="fi fi-rr-check text-xs"></i>
            <span>Apply Now</span>
          </button>

          {/* Clear All Button */}
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium bg-white border border-gray-300 rounded-lg hover:border-primary-500 transition-colors"
            >
              <i className="fi fi-rr-cross-small"></i>
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Location Picker Popup */}
        <LocationSearchPopup
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
          onPlaceSelected={handlePlaceSelected}
          googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          title="Choose Location"
        />
      </div>
      </div>
    );
  }

  // Sidebar layout
  if (layout === "sidebar") {
    return (
      <div className="bg-white shadow-sm border border-gray-100 rounded-lg h-fit sticky top-4">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fi fi-rr-settings-sliders text-gray-400"></i>
              <span className="font-medium text-gray-800">Filters</span>
              {hasActiveFilters() && (
                <span className="text-sm text-gray-500">
                  ({getActiveFilterCount()})
                </span>
              )}
            </div>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          <FilterContent />
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 py-2.5 px-4 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                // Apply filters (they're already applied in real-time)
                // This button can be used to confirm selection or refresh
              }}
              className="flex-1 py-2.5 px-4 rounded-full bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Apply Now
            </button>
          </div>
        </div>

        {/* Location Picker Popup */}
        <LocationSearchPopup
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
          onPlaceSelected={handlePlaceSelected}
          googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          title="Choose Location"
        />
      </div>
    );
  }

  // Inline layout (default)
  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-lg">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-settings-sliders text-gray-400"></i>
            <span className="font-medium text-gray-800">Filters</span>
            {hasActiveFilters() && (
              <span className="text-sm text-gray-500">
                ({getActiveFilterCount()})
              </span>
            )}
          </div>
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <FilterContent />
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-3">
          <button
            onClick={clearAllFilters}
            className="flex-1 py-2.5 px-4 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => {
              // Apply filters (they're already applied in real-time)
              // Close any open dropdowns
              setIsPriceRangeOpen(false);
              setIsLocationOpen(false);
              // Ensure filters are applied
              onFilterChange(tempFilters);
            }}
            className="flex-1 py-2.5 px-4 rounded-full bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Location Picker Popup */}
      <LocationSearchPopup
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        onPlaceSelected={handlePlaceSelected}
        googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        title="Choose Location"
      />
    </div>
  );
};

// Add custom styles for the date picker
const styles = `
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container {
    width: 100%;
  }
  .react-datepicker-left {
    left: 0 !important;
  }
  .react-datepicker__triangle {
    left: 50% !important;
  }
`;

// Add styles to head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default ActivityFilters;

