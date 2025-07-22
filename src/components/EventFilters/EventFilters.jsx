'use client';

import { useState, useEffect } from 'react';
import RangeSlider from '../RangeSlider/RangeSlider';
import Popup from '../Popup';
import DateRangePicker from '../DateRangePicker/DateRangePicker';

const EventFilters = ({ isOpen, onClose, isMobile, initialFilters, onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    date: true,
    languages: true,
    categories: true,
    moreFilters: true,
    price: true
  });

  const [tempFilters, setTempFilters] = useState(initialFilters || {});

  // Update tempFilters when initialFilters change
  useEffect(() => {
    setTempFilters(initialFilters || {});
  }, [initialFilters]);

  const languages = [
    'Hindi', 'English', 'Marathi', 'Tamil', 'Bengali', 'Malayalam',
    'Telugu', 'Kannada', 'Hinglish', 'Gujarati', 'Multi Language',
    'Urdu', 'Punjabi', 'Hindustani', 'Korean', 'Italian', 'Japanese',
    'Spanish'
  ];

  const categories = [
    'Workshops',
    'Comedy Shows',
    'Music Shows',
    'Performances',
    'Kids',
    'Meetups',
    'Talks',
    'Screening',
    'Exhibitions',
    'Award shows',
    'Holi Celebrations',
    'Spirituality'
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceChange = (value) => {
    setTempFilters(prev => ({
      ...prev,
      price_range_from: value[0],
      price_range_to: value[1]
    }));
  };

  const handleDateRangeChange = ({ startDate, endDate }) => {
    if (startDate && endDate) {
      setTempFilters(prev => ({
        ...prev,
        date: 'custom',
        startDate,
        endDate
      }));
    } else {
      setTempFilters(prev => ({
        ...prev,
        date: '',
        startDate: null,
        endDate: null
      }));
    }
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      date: '',
      language: '',
      category: '',
      price_range_from: '',
      price_range_to: ''
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

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="pb-6 border-b border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => toggleSection('date')}
              className="flex items-center gap-2 group"
            >
              <i className="fi fi-rr-calendar text-primary-500"></i>
              <span className="text-sm font-medium text-gray-700">Date</span>
              <i className={`fi fi-rr-angle-small-down text-lg   transition-transform ${expandedSections.date ? 'rotate-180' : ''}`}></i>
            </button>
            {(tempFilters.date || tempFilters.startDate) && (
              <button 
                onClick={() => setTempFilters(prev => ({ 
                  ...prev, 
                  date: '',
                  startDate: null,
                  endDate: null 
                }))}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>
          
          {expandedSections.date && (
            <div className="space-y-4">
              {/* Quick Date Options */}
              <div className="flex flex-wrap gap-2">
                {['Today', 'Tomorrow', 'This Weekend'].map((option) => (
                  <button
                    key={option}
                    className={`px-4 py-1 rounded-full text-sm border transition-all ${
                      tempFilters.date === option 
                      ? 'border-primary-600 bg-primary-50 text-primary-700' 
                      : 'border-primary-100 text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => setTempFilters(prev => ({ 
                      ...prev, 
                      date: option,
                      startDate: null,
                      endDate: null
                    }))}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Date Range Picker */}
              <div className="pt-2">
                <DateRangePicker
                  onChange={handleDateRangeChange}
                  initialStartDate={tempFilters.startDate}
                  initialEndDate={tempFilters.endDate}
                  placeholder="Select dates"
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Languages Filter */}
      <div className="pb-6 border-b border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => toggleSection('languages')}
              className="flex items-center gap-2 group"
            >
              <i className="fi fi-rr-comments text-primary-500"></i>
              <span className="text-sm font-medium text-gray-700">Languages</span>
              <i className={`fi fi-rr-angle-small-down transition-transform ${expandedSections.languages ? 'rotate-180' : ''}`}></i>
            </button>
            {tempFilters.language && (
              <button 
                onClick={() => setTempFilters(prev => ({ ...prev, language: '' }))}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>
          
          {expandedSections.languages && (
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <button
                  key={language}
                  className={`px-3 py-1 rounded-full text-sm border transition-all ${
                    tempFilters.language === language 
                    ? 'border-primary-600 bg-primary-50 text-primary-700' 
                    : 'border-primary-100 text-primary-600 hover:bg-primary-50'
                  }`}
                  onClick={() => setTempFilters(prev => ({ ...prev, language }))}
                >
                  {language}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories Filter */}
      <div className="pb-6 border-b border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => toggleSection('categories')}
              className="flex items-center gap-2 group"
            >
              <i className="fi fi-rr-apps text-primary-500"></i>
              <span className="text-sm font-medium text-gray-700">Categories</span>
              <i className={`fi fi-rr-angle-small-down transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`}></i>
            </button>
            {tempFilters.category && (
              <button 
                onClick={() => setTempFilters(prev => ({ ...prev, category: '' }))}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {expandedSections.categories && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-3 py-1 rounded-full text-sm border transition-all ${
                    tempFilters.category === category 
                    ? 'border-primary-600 bg-primary-50 text-primary-700' 
                    : 'border-primary-100 text-primary-600 hover:bg-primary-50'
                  }`}
                  onClick={() => setTempFilters(prev => ({ ...prev, category }))}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => toggleSection('price')}
            className="flex items-center gap-2 group"
          >
            <i className="fi fi-rr-indian-rupee-sign text-primary-500"></i>
            <span className="text-sm font-medium text-gray-700">Price Range</span>
            <i className={`fi fi-rr-angle-small-down transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}></i>
          </button>
          {(tempFilters.price_range_from || tempFilters.price_range_to) && (
            <button 
              onClick={() => setTempFilters(prev => ({ 
                ...prev, 
                price_range_from: '', 
                price_range_to: '' 
              }))}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Reset
            </button>
          )}
        </div>

        {expandedSections.price && (
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
            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <span>₹0</span>
              <span>₹5000+</span>
            </div>
          </div>
        )}
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
        className="md:h-auto h-[75vh]"
        title={
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-settings-sliders text-lg text-primary-500"></i>
            <span className="text-gray-700">Event Filters</span>
            {hasActiveFilters() && (
              <span className="text-sm font-normal text-gray-500">
                ({getActiveFilterCount()} active)
              </span>
            )}
          </div>
        }
      >
        <div className="p-6">
          <FilterContent />
        </div>
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
    );
  }

  // For desktop view, render in sidebar
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 sticky top-24">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <i className="fi fi-rr-settings-sliders text-lg text-primary-500"></i>
          <h2 className="text-lg font-medium text-gray-800">Filters</h2>
          {hasActiveFilters() && (
            <span className="text-sm font-normal text-gray-500">
              ({getActiveFilterCount()})
            </span>
          )}
        </div>
        <button
          onClick={clearAllFilters}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Clear All
        </button>
      </div>
      
      <FilterContent />

      <button
        onClick={applyFilters}
        className="w-full py-3 text-white bg-primary-500 hover:bg-primary-600 rounded-full transition-all font-medium"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default EventFilters; 