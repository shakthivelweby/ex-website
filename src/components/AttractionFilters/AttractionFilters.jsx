"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RangeSlider from "@/components/RangeSlider/RangeSlider";
import Popup from "@/components/Popup";

const AttractionFilters = ({
  isOpen = false,
  onClose = () => {},
  isMobile = false,
  categories = [],
  languages = [],
  initialFilters = {},
  onFilterChange = () => {},
}) => {
  const [filters, setFilters] = useState({
    date: initialFilters.date || "",
    language: initialFilters.language || "",
    category: initialFilters.category || "",
    price_from: initialFilters.price_from || "",
    price_to: initialFilters.price_to || "",
    longitude: initialFilters.longitude || "",
    latitude: initialFilters.latitude || "",
  });

  const [priceRange, setPriceRange] = useState([
    parseInt(initialFilters.price_from) || 0,
    parseInt(initialFilters.price_to) || 5000,
  ]);

  // Update filters when initialFilters change
  useEffect(() => {
    setFilters({
      date: initialFilters.date || "",
      language: initialFilters.language || "",
      category: initialFilters.category || "",
      price_from: initialFilters.price_from || "",
      price_to: initialFilters.price_to || "",
      longitude: initialFilters.longitude || "",
      latitude: initialFilters.latitude || "",
    });

    setPriceRange([
      parseInt(initialFilters.price_from) || 0,
      parseInt(initialFilters.price_to) || 5000,
    ]);
  }, [initialFilters]);

  const handleFilterUpdate = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
    const newFilters = {
      ...filters,
      price_from: range[0].toString(),
      price_to: range[1].toString(),
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
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
    setFilters(clearedFilters);
    setPriceRange([0, 5000]);
    onFilterChange(clearedFilters);
  };

  const quickDateOptions = [
    { label: "Today", value: "today" },
    { label: "Tomorrow", value: "tomorrow" },
    { label: "This Weekend", value: "weekend" },
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header for Mobile */}
      {isMobile && (
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <i className="fi fi-rr-cross text-gray-600 text-sm"></i>
          </button>
        </div>
      )}

      {/* Date Filter */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <i className="fi fi-rr-calendar text-primary-500"></i>
          Date
        </h4>
        
        {/* Quick Date Options */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {quickDateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterUpdate("date", option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.date === option.value
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Custom Date Picker */}
        <DatePicker
          selected={filters.date ? new Date(filters.date) : null}
          onChange={(date) => handleFilterUpdate("date", date ? date.toISOString().split('T')[0] : "")}
          placeholderText="Select custom date"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          dateFormat="yyyy-MM-dd"
          minDate={new Date()}
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <i className="fi fi-rr-ferris-wheel text-primary-500"></i>
            Category
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category.slug}
                  onChange={() =>
                    handleFilterUpdate(
                      "category",
                      filters.category === category.slug ? "" : category.slug
                    )
                  }
                  className="w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500"
                />
                <div className="flex items-center gap-2">
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-6 h-6 object-cover rounded"
                    />
                  )}
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Language Filter */}
      {languages.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <i className="fi fi-rr-globe text-primary-500"></i>
            Language
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {languages.map((language) => (
              <label
                key={language.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <input
                  type="radio"
                  name="language"
                  checked={filters.language === language.slug}
                  onChange={() =>
                    handleFilterUpdate(
                      "language",
                      filters.language === language.slug ? "" : language.slug
                    )
                  }
                  className="w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{language.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <i className="fi fi-rr-indian-rupee-sign text-primary-500"></i>
          Price Range
        </h4>
        <div className="px-2">
          <RangeSlider
            min={0}
            max={5000}
            step={100}
            value={priceRange}
            onChange={handlePriceRangeChange}
            formatValue={(value) => `₹${value}`}
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={clearAllFilters}
          className="w-full py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <i className="fi fi-rr-refresh text-sm"></i>
          Clear All Filters
        </button>
      </div>

      {/* Apply Button for Mobile */}
      {isMobile && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Popup
        isOpen={isOpen}
        onClose={onClose}
        pos="bottom"
        height="80vh"
        className="lg:hidden"
      >
        <div className="p-6 h-full overflow-y-auto">
          <FilterContent />
        </div>
      </Popup>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {Object.values(filters).some((value) => value) && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>
      <FilterContent />
    </div>
  );
};

export default AttractionFilters;
