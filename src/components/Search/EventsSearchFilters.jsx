"use client";

import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LocationSearchInput from "../LocationSearchInput";

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

export default function EventsSearchFilters({
  filters,
  onFilterChange,
  categories = [],
  languages = [],
}) {
  const [dateRange, setDateRange] = useState([
    parseDate(filters.dateFrom),
    parseDate(filters.dateTo),
  ]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    setDateRange([parseDate(filters.dateFrom), parseDate(filters.dateTo)]);
  }, [filters.dateFrom, filters.dateTo]);

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

  const updateDateRange = (start, end, closeCalendar = false) => {
    setDateRange([start, end]);
    onFilterChange({
      ...filters,
      dateFrom: start ? formatDate(start) : "",
      dateTo: end ? formatDate(end) : "",
    });
    if (closeCalendar || (start && end)) {
      setIsCalendarOpen(false);
    }
  };

  const handleQuickDateSelect = (option) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (option) {
      case "Today":
        updateDateRange(today, today, true);
        break;
      case "Tomorrow": {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        updateDateRange(tomorrow, tomorrow, true);
        break;
      }
      case "This Weekend": {
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        updateDateRange(saturday, sunday, true);
        break;
      }
      default:
        break;
    }
  };

  const handleDateRangeChange = (update) => {
    const [start, end] = update;
    updateDateRange(start, end);
  };

  const isQuickDateActive = (option) => {
    if (!filters.dateFrom) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (option) {
      case "Today":
        return filters.dateFrom === formatDate(today) && filters.dateTo === formatDate(today);
      case "Tomorrow": {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return (
          filters.dateFrom === formatDate(tomorrow) &&
          filters.dateTo === formatDate(tomorrow)
        );
      }
      case "This Weekend": {
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        return (
          filters.dateFrom === formatDate(saturday) &&
          filters.dateTo === formatDate(sunday)
        );
      }
      default:
        return false;
    }
  };

  const hasDateRange = Boolean(filters.dateFrom || filters.dateTo);

  const isTodaySelected = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today);
    return filters.dateFrom === todayStr && filters.dateTo === todayStr;
  };

  const toggleArrayFilter = (key, slug) => {
    const current = filters[key] || [];
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    onFilterChange({ ...filters, [key]: next });
  };

  const clearDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    updateDateRange(today, today, true);
  };

  const clearLocation = () => {
    onFilterChange({
      ...filters,
      location: "",
      longitude: "",
      latitude: "",
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

  const formatRangeLabel = () => {
    if (!dateRange[0] && !dateRange[1]) return "Select start and end date";
    if (dateRange[0] && !dateRange[1]) {
      return `${dateRange[0].toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} — pick end date`;
    }
    return `${dateRange[0].toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })} – ${dateRange[1].toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
  };

  const calendarHint = !dateRange[0]
    ? "Select start date"
    : !dateRange[1]
      ? "Select end date"
      : "Range selected";

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

      {/* Date range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <i className="fi fi-rr-calendar text-gray-400" />
            Date Range
            <span className="text-primary-500">*</span>
          </label>
          {hasDateRange && !isTodaySelected() && (
            <button
              type="button"
              onClick={clearDateRange}
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
              hasDateRange
                ? "bg-white border-primary-300 text-gray-900 shadow-sm"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <span className="truncate pr-2">{formatRangeLabel()}</span>
            <i
              className={`fi fi-rr-calendar flex-shrink-0 ${
                hasDateRange ? "text-primary-500" : "text-gray-400"
              }`}
            />
          </button>

          {isCalendarOpen && (
            <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[60] w-fit max-w-full bg-white rounded-2xl border border-gray-200 shadow-2xl p-3">
              <div className="flex items-center justify-between gap-4 mb-2 px-1 min-w-[16.5rem]">
                <span className="text-xs font-medium text-gray-500">
                  {calendarHint}
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
                selectsRange
                inline
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={handleDateRangeChange}
                minDate={new Date()}
                renderCustomHeader={renderDateHeader}
                calendarClassName="events-search-datepicker events-search-datepicker-popup !border-0"
                showPopperArrow={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Language - multi select */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <i className="fi fi-rr-comments text-gray-400" />
            Language
          </label>
          {filters.languages?.length > 0 && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, languages: [] })}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {languages.length === 0 ? (
            <p className="text-sm text-gray-400">No languages available</p>
          ) : (
            languages.map((language) => {
              const selected = filters.languages?.includes(language.slug);
              return (
                <button
                  key={language.id}
                  type="button"
                  onClick={() => toggleArrayFilter("languages", language.slug)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    selected
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {selected && <i className="fi fi-rr-check text-[10px]" />}
                  {language.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Category - multi select */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <i className="fi fi-rr-apps text-gray-400" />
            Category
          </label>
          {filters.categories?.length > 0 && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, categories: [] })}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400">No categories available</p>
          ) : (
            categories.map((category) => {
              const selected = filters.categories?.includes(category.slug);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleArrayFilter("categories", category.slug)}
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
    </div>
  );
}
