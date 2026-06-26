"use client";

import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LocationSearchInput from "../LocationSearchInput";
import RangeSlider from "../RangeSlider/RangeSlider";

const QUICK_DATE_OPTIONS = ["Today", "Tomorrow", "This Weekend"];

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i).toLocaleString("en", { month: "long" })
);

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => currentYear + i);
};

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseDate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const PRICE_MIN = 0;
const PRICE_MAX = 1000;

export default function AttractionsSearchFilters({
  filters,
  onFilterChange,
  categories = [],
}) {
  const [selectedDate, setSelectedDate] = useState(parseDate(filters.date));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    setSelectedDate(parseDate(filters.date));
  }, [filters.date]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCalendarOpen]);

  const handlePlaceSelected = (place) => {
    if (!place?.geometry?.location) return;
    onFilterChange({
      ...filters,
      longitude: place.geometry.location.lng(),
      latitude: place.geometry.location.lat(),
      location: place.name || place.formatted_address || "",
    });
  };

  const updateDate = (date, closeCalendar = false) => {
    setSelectedDate(date);
    onFilterChange({
      ...filters,
      date: date ? formatDate(date) : "",
    });
    if (closeCalendar) setIsCalendarOpen(false);
  };

  const handleQuickDateSelect = (option) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (option) {
      case "Today":
        updateDate(today, true);
        break;
      case "Tomorrow": {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        updateDate(tomorrow, true);
        break;
      }
      case "This Weekend": {
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
        updateDate(saturday, true);
        break;
      }
      default:
        break;
    }
  };

  const isQuickDateActive = (option) => {
    if (!filters.date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (option) {
      case "Today":
        return filters.date === formatDate(today);
      case "Tomorrow": {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return filters.date === formatDate(tomorrow);
      }
      case "This Weekend": {
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
        return filters.date === formatDate(saturday);
      }
      default:
        return false;
    }
  };

  const isTodaySelected = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filters.date === formatDate(today);
  };

  const resetDateToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    updateDate(today, true);
  };

  const clearLocation = () => {
    onFilterChange({
      ...filters,
      location: "",
      longitude: "",
      latitude: "",
    });
  };

  const toggleCategory = (slug) => {
    onFilterChange({
      ...filters,
      category: filters.category === slug ? "" : slug,
    });
  };

  const handlePriceChange = (value) => {
    if (!Array.isArray(value)) return;
    const [from, to] = value;
    const isFullRange = from === PRICE_MIN && to === PRICE_MAX;
    onFilterChange({
      ...filters,
      price_from: isFullRange ? "" : String(from),
      price_to: isFullRange ? "" : String(to),
    });
  };

  const hasPriceFilter = Boolean(filters.price_from || filters.price_to);

  const formatDateLabel = () => {
    if (!selectedDate) return "Select a date";
    return selectedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderDateHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div className="flex items-center justify-between gap-2 px-1 pb-3">
      <button
        type="button"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <i className="fi fi-rr-angle-left text-sm" />
      </button>

      <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
        <select
          value={date.getMonth()}
          onChange={({ target }) => changeMonth(Number(target.value))}
          className="text-sm font-medium text-gray-900 border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-primary-400 max-w-[9rem]"
        >
          {MONTHS.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={date.getFullYear()}
          onChange={({ target }) => changeYear(Number(target.value))}
          className="text-sm font-medium text-gray-900 border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-primary-400"
        >
          {getYearOptions().map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <i className="fi fi-rr-angle-right text-sm" />
      </button>
    </div>
  );

  return (
    <div className="px-6 py-4 space-y-5 max-h-[50vh] overflow-y-auto">
      {/* Location */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <i className="fi fi-rr-marker text-gray-400" />
            Location
          </label>
          {filters.location && (
            <button
              type="button"
              onClick={clearLocation}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <LocationSearchInput
          value={filters.location}
          onPlaceSelected={handlePlaceSelected}
          onClear={clearLocation}
          googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          placeholder="Enter city or destination name..."
        />
      </div>

      {/* Date */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <i className="fi fi-rr-calendar text-gray-400" />
            Date
            <span className="text-primary-500">*</span>
          </label>
          {filters.date && !isTodaySelected() && (
            <button
              type="button"
              onClick={resetDateToToday}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Reset to today
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_DATE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleQuickDateSelect(option)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                isQuickDateActive(option)
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="relative" ref={calendarRef}>
          <button
            type="button"
            onClick={() => setIsCalendarOpen((open) => !open)}
            className={`w-full h-11 px-4 rounded-xl text-left text-sm flex items-center justify-between transition-all border ${
              filters.date
                ? "bg-white border-primary-300 text-gray-900 shadow-sm"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <span className="truncate pr-2">{formatDateLabel()}</span>
            <i
              className={`fi fi-rr-calendar flex-shrink-0 ${
                filters.date ? "text-primary-500" : "text-gray-400"
              }`}
            />
          </button>

          {isCalendarOpen && (
            <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[60] w-fit max-w-full bg-white rounded-2xl border border-gray-200 shadow-2xl p-3">
              <div className="flex items-center justify-between gap-4 mb-2 px-1 min-w-[16.5rem]">
                <span className="text-xs font-medium text-gray-500">
                  Select date
                </span>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <i className="fi fi-rr-cross-small text-sm" />
                </button>
              </div>
              <DatePicker
                inline
                selected={selectedDate}
                onChange={(date) => updateDate(date, true)}
                minDate={new Date()}
                renderCustomHeader={renderDateHeader}
                calendarClassName="events-search-datepicker events-search-datepicker-popup !border-0"
                showPopperArrow={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Attraction type */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <i className="fi fi-rr-ferris-wheel text-gray-400" />
            Attraction Type
          </label>
          {filters.category && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, category: "" })}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400">No types available</p>
          ) : (
            categories.map((category) => {
              const selected = filters.category === category.slug;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.slug)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    selected
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {selected && <i className="fi fi-rr-check text-[10px]" />}
                  {category.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Price range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <i className="fi fi-rr-indian-rupee-sign text-gray-400" />
            Price Range
          </label>
          {hasPriceFilter && (
            <button
              type="button"
              onClick={() =>
                onFilterChange({ ...filters, price_from: "", price_to: "" })
              }
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <RangeSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={50}
          initialValue={[
            parseInt(filters.price_from, 10) || PRICE_MIN,
            parseInt(filters.price_to, 10) || PRICE_MAX,
          ]}
          onChange={handlePriceChange}
          formatDisplay={(value) => {
            if (!value || value.length !== 2) return "Any price";
            if (value[0] === PRICE_MIN && value[1] === PRICE_MAX) return "Any price";
            if (value[0] === PRICE_MIN) return `Under ₹${value[1]}`;
            if (value[1] === PRICE_MAX) return `₹${value[0]}+`;
            return `₹${value[0]} - ₹${value[1]}`;
          }}
          title="Price Range"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>Free</span>
          <span>₹1000+</span>
        </div>
      </div>
    </div>
  );
}
