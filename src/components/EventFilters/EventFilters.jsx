'use client';

import { useState, useEffect } from 'react';
import RangeSlider from '../RangeSlider/RangeSlider';
import Popup from '../Popup';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LocationSearchPopup from '../LocationSearchPopup';

const EventFilters = ({ isOpen, onClose, isMobile, initialFilters, onFilterChange }) => {
  const [tempFilters, setTempFilters] = useState(initialFilters || {});
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    setTempFilters(initialFilters || {});
    // Initialize date if it exists in filters
    if (initialFilters?.date) {
      setSelectedDate(new Date(initialFilters.date));
    }
  }, [initialFilters]);

  const languages = [
    'Hindi', 'English', 'Marathi', 'Tamil', 'Bengali', 'Malayalam',
    'Telugu', 'Kannada', 'Hinglish', 'Gujarati', 'Multi Language',
    'Urdu', 'Punjabi', 'Hindustani', 'Korean', 'Italian', 'Japanese',
    'Spanish'
  ];

  const categories = [
    'Workshops', 'Comedy Shows', 'Music Shows', 'Performances', 'Kids',
    'Meetups', 'Talks', 'Screening', 'Exhibitions', 'Award shows',
    'Holi Celebrations', 'Spirituality'
  ];

  const handlePlaceSelected = (place) => {
    if (place) {
      const locationName = place.name;
      setTempFilters(prev => ({ ...prev, location: locationName }));
      setIsLocationOpen(false);
    }
  };

  const handlePriceChange = (value) => {
    setTempFilters(prev => ({
      ...prev,
      price_range_from: value[0],
      price_range_to: value[1]
    }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      setTempFilters(prev => ({
        ...prev,
        date: date.toISOString()
      }));
    }
  };

  const handleQuickDateSelect = (option) => {
    const today = new Date();
    let selectedDate = null;

    switch (option) {
      case 'Today':
        selectedDate = today;
        break;
      case 'Tomorrow':
        selectedDate = new Date(today.setDate(today.getDate() + 1));
        break;
      case 'This Weekend':
        // Find next Saturday
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
        selectedDate = new Date(today.setDate(today.getDate() + daysUntilSaturday));
        break;
    }

    setSelectedDate(selectedDate);
    setTempFilters(prev => ({
      ...prev,
      date: selectedDate?.toISOString()
    }));
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      date: '',
      language: '',
      category: '',
      price_range_from: '',
      price_range_to: '',
      location: ''
    };
    setTempFilters(clearedFilters);
    onFilterChange(clearedFilters);
    if (onClose) onClose();
  };

  const applyFilters = () => {
    onFilterChange(tempFilters);
    if (onClose) onClose();
  };

  const hasActiveFilters = () => {
    return Object.values(tempFilters).some(value => value);
  };

  const getActiveFilterCount = () => {
    return Object.values(tempFilters).filter(value => value).length;
  };

  const removeFilter = (key) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: key === 'date' ? '' : '',
      ...(key === 'date' ? { startDate: null, endDate: null } : {})
    }));
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

  const checkIfDateMatchesOption = (option) => {
    if (!selectedDate) return false;

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    switch (option) {
      case 'Today':
        return isDateEqual(selectedDate, today);
      case 'Tomorrow':
        return isDateEqual(selectedDate, tomorrow);
      case 'This Weekend':
        return isWeekend(selectedDate);
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
          {tempFilters.location && (
            <button
              onClick={() => removeFilter('location')}
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
            {tempFilters.location || 'Choose location'}
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
          {tempFilters.date && (
            <button
              onClick={() => {
                removeFilter('date');
                setSelectedDate(null);
              }}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {['Today', 'Tomorrow', 'This Weekend'].map((option) => (
              <button
                key={option}
                className={`px-3 py-1.5 text-xs transition-colors ${checkIfDateMatchesOption(option)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
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
                    <span>{selectedDate ? selectedDate.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Select a date'}</span>
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
          {tempFilters.language && (
            <button
              onClick={() => removeFilter('language')}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {languages.map((language) => (
            <button
              key={language}
              className={`px-3 py-1.5 text-xs transition-colors ${tempFilters.language === language
                ? 'bg-primary-600 text-white'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              onClick={() => setTempFilters(prev => ({ ...prev, language }))}
            >
              {language}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-apps text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">Categories</span>
          </div>
          {tempFilters.category && (
            <button
              onClick={() => removeFilter('category')}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-3 py-1.5 text-xs transition-colors ${tempFilters.category === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              onClick={() => setTempFilters(prev => ({ ...prev, category }))}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-indian-rupee-sign text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">Price Range</span>
          </div>
          {(tempFilters.price_range_from || tempFilters.price_range_to) && (
            <button
              onClick={() => removeFilter('price_range')}
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
              parseInt(tempFilters.price_range_from) || 0,
              parseInt(tempFilters.price_range_to) || 5000
            ]}
            onChange={handlePriceChange}
            formatDisplay={(value) => value ? `₹${value[0]} - ₹${value[1]}` : 'Select Price Range'}
            title="Price Range"
          />
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>₹0</span>
            <span>₹5000+</span>
          </div>
        </div>
      </div>
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
          <div className="flex items-center gap-2 px-4">
            <button
              onClick={clearAllFilters}
              className="h-10 px-4 bg-gray-100 text-gray-700 text-sm font-medium flex-1 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fi fi-rr-refresh"></i>
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="h-10 px-4 bg-primary-600 text-white text-sm font-medium flex-1 hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fi fi-rr-check"></i>
              Apply ({getActiveFilterCount()})
            </button>
          </div>
        </Popup.Footer>
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

      <div className="px-3">
        <FilterContent />
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={applyFilters}
          className="w-full h-9 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <i className="fi fi-rr-check"></i>
          Apply
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
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default EventFilters; 