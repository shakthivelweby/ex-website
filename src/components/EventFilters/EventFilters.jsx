"use client";

import { useState, useEffect } from "react";
import RangeSlider from "../RangeSlider/RangeSlider";
import Popup from "../Popup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LocationSearchPopup from "../LocationSearchPopup";

const EventFilters = ({
  isOpen,
  onClose,
  isMobile,
  initialFilters,
  onFilterChange,
  categories,
  languages,
}) => {
  const [tempFilters, setTempFilters] = useState(initialFilters || {});
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pendingFilters, setPendingFilters] = useState(initialFilters || {});

  useEffect(() => {
    setTempFilters(initialFilters || {});
    setPendingFilters(initialFilters || {});
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
    if (place) {
      const longitude = place.geometry.location.lng();
      const latitude = place.geometry.location.lat();
      const newFilters = { ...tempFilters, longitude, latitude };
      setTempFilters(newFilters);
      setPendingFilters(newFilters);
      setIsLocationOpen(false);
    }
  };

  const handlePriceChange = (value) => {
    const newFilters = {
      ...tempFilters,
      price_from: value[0],
      price_to: value[1],
    };
    setTempFilters(newFilters);
    setPendingFilters(newFilters);
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
      setPendingFilters(newFilters);
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
      default:
        return;
    }

    setSelectedDate(new Date()); // Keep UI state for display
    const newFilters = {
      ...tempFilters,
      date: dateParam,
    };
    setTempFilters(newFilters);
    setPendingFilters(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      date: "",
      language: "",
      category: "",
      price_from: "",
      price_to: "",
      longitude: "",
      latitude: "",
    };
    setTempFilters(clearedFilters);
    setPendingFilters(clearedFilters);
    setSelectedDate(new Date()); // Reset to current date for UI
    onFilterChange(clearedFilters);
    if (onClose) onClose();
  };

  const applyFilters = () => {
    setTempFilters(pendingFilters);
    onFilterChange(pendingFilters);
    if (onClose) onClose();
  };

  const hasActiveFilters = () => {
    return Object.values(pendingFilters).some((value) => value);
  };

  const getActiveFilterCount = () => {
    return Object.values(pendingFilters).filter((value) => value).length;
  };

  // Helper function to get the current filters for display
  const getCurrentFilters = () => {
    return pendingFilters;
  };

  const removeFilter = (key) => {
    const newFilters = { ...tempFilters, [key]: "" };
    setTempFilters(newFilters);

    // Special handling for date to reset UI state
    if (key === "date") {
      setSelectedDate(new Date());
    }

    setPendingFilters(newFilters);
  };

  const isDateEqual = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const isWeekend = (date) => {
    if (!date) return false;
    const day = date.getDay();
    return day === 6; // Check if it's Saturday
  };

  // Function to check if date matches quick option
  const checkIfDateMatchesOption = (option) => {
    const currentFilters = getCurrentFilters();
    if (!currentFilters.date) return false;

    switch (option) {
      case "Today":
        return currentFilters.date === "today";
      case "Tomorrow":
        return currentFilters.date === "tomorrow";
      case "This Weekend":
        return currentFilters.date === "weekend";
      default:
        return false;
    }
  };

  const FilterContent = () => (
    <div className="divide-y divide-gray-100">
      {/* Location Section */}
      <div className="py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-marker text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">Location</span>
          </div>
          {(getCurrentFilters().longitude || getCurrentFilters().latitude) && (
            <button
              onClick={() => {
                const newFilters = {
                  ...tempFilters,
                  longitude: "",
                  latitude: "",
                };
                setTempFilters(newFilters);
                setPendingFilters(newFilters);
              }}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <button
          onClick={() => setIsLocationOpen(true)}
          className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 text-left text-sm rounded flex items-center gap-2 transition-colors"
        >
          <span className="text-gray-600">
            {getCurrentFilters().longitude && getCurrentFilters().latitude
              ? "Location selected"
              : "Choose location"}
          </span>
          <i className="fi fi-rr-angle-small-right ml-auto text-gray-400"></i>
        </button>
      </div>

      {/* Date Section */}
      <div className="py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-calendar text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">Date</span>
          </div>
          {getCurrentFilters().date && (
            <button
              onClick={() => removeFilter("date")}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
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
              className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
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

      {/* Languages Section */}
      <div className="py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-comments text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">Languages</span>
          </div>
          {getCurrentFilters().language && (
            <button
              onClick={() => {
                const newFilters = { ...tempFilters, language: "" };
                setTempFilters(newFilters);
                setPendingFilters(newFilters);
              }}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {languages.map((language) => (
            <button
              key={language.id}
              className={`px-3 py-1.5 text-xs transition-colors ${
                getCurrentFilters().language === language.slug
                  ? "bg-primary-600 text-white"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
              onClick={() => {
                const newFilters = {
                  ...tempFilters,
                  language: language.slug,
                };
                setTempFilters(newFilters);
                setPendingFilters(newFilters);
              }}
            >
              {language.name}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-apps text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">
              Categories
            </span>
          </div>
          {getCurrentFilters().category && (
            <button
              onClick={() => {
                const newFilters = { ...tempFilters, category: "" };
                setTempFilters(newFilters);
                setPendingFilters(newFilters);
              }}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-3 py-1.5 text-xs transition-colors ${
                getCurrentFilters().category === category.slug
                  ? "bg-primary-600 text-white"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
              onClick={() => {
                const newFilters = {
                  ...tempFilters,
                  category: category.slug,
                };
                setTempFilters(newFilters);
                setPendingFilters(newFilters);
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      {/* <div className="py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-indian-rupee-sign text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">
              Price Range
            </span>
          </div>
          {(getCurrentFilters().price_from || getCurrentFilters().price_to) && (
            <button
              onClick={() => {
                const newFilters = {
                  ...tempFilters,
                  price_from: "",
                  price_to: "",
                };
                setTempFilters(newFilters);
                setPendingFilters(newFilters);
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
            max={5000}
            step={100}
            initialValue={[
              parseInt(getCurrentFilters().price_from) || 0,
              parseInt(getCurrentFilters().price_to) || 5000,
            ]}
            onChange={handlePriceChange}
            formatDisplay={(value) =>
              value ? `₹${value[0]} - ₹${value[1]}` : "Select Price Range"
            }
            title="Price Range"
          />
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>₹0</span>
            <span>₹5000+</span>
          </div>
        </div>
      </div> */}
    </div>
  );

  // For mobile view, render in a popup
  if (isMobile) {
    return (
      <Popup
        isOpen={isOpen}
        onClose={onClose}
        pos="right"
        preventScroll={true}
        draggable={true}
        className="md:h-auto h-[85vh]"
        title={
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-settings-sliders text-lg text-gray-400"></i>
            <span className="text-gray-700">Filters</span>
            {hasActiveFilters() && (
              <span className="text-sm font-normal text-gray-500">
                ({getActiveFilterCount()})
              </span>
            )}
          </div>
        }
      >
        <div className="px-4">
          <FilterContent />
        </div>
        <Popup.Footer>
          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
            <button
              onClick={clearAllFilters}
              className="h-10 px-4 bg-gray-100 text-gray-700 text-sm font-medium flex-1 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 rounded-lg"
            >
              <i className="fi fi-rr-refresh"></i>
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="h-10 px-6 text-sm font-medium flex items-center justify-center gap-2 rounded-lg transition-colors bg-primary-600 text-white hover:bg-primary-700"
            >
              <i className="fi fi-rr-check"></i>
              Apply Filters
            </button>
          </div>
        </Popup.Footer>

        {/* Location Picker Popup for Mobile */}
        <LocationSearchPopup
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
          onPlaceSelected={handlePlaceSelected}
          googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          title="Choose Location"
        />
      </Popup>
    );
  }

  // For desktop view, render in sidebar
  return (
    <div className="bg-white shadow-sm border border-gray-100">
      <div className="p-3 border-b border-gray-100">
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
        </div>
      </div>

      <div className="px-3">
        <FilterContent />
      </div>

      {/* Desktop Filter Buttons */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={clearAllFilters}
            className="h-9 px-4 bg-gray-100 text-gray-700 text-sm font-medium flex-1 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 rounded-lg"
          >
            <i className="fi fi-rr-refresh"></i>
            Clear All
          </button>
          <button
            onClick={applyFilters}
            className="h-9 px-4 text-sm font-medium flex items-center justify-center gap-2 rounded-lg transition-colors bg-primary-600 text-white hover:bg-primary-700"
          >
            <i className="fi fi-rr-check"></i>
            Apply Filters
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

export default EventFilters;
