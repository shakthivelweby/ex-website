"use client";

import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  formatSearchDate as formatDate,
  parseSearchDate as parseDate,
  getDateRangeForQuickOption,
  resolveQuickDateRangePick,
  inferQuickDateRangePick,
} from "./quickDateUtils";

const QUICK_DATE_OPTIONS = ["Today", "Tomorrow", "This Weekend"];

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i).toLocaleString("en", { month: "long" })
);

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => currentYear + i);
};

export default function DateRangeSearchField({ dateFrom, dateTo, onChange }) {
  const [dateRange, setDateRange] = useState([
    parseDate(dateFrom),
    parseDate(dateTo),
  ]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeQuickPick, setActiveQuickPick] = useState(() =>
    resolveQuickDateRangePick(dateFrom, dateTo, null)
  );
  const calendarRef = useRef(null);

  useEffect(() => {
    setDateRange([parseDate(dateFrom), parseDate(dateTo)]);
    setActiveQuickPick((current) =>
      resolveQuickDateRangePick(dateFrom, dateTo, current)
    );
  }, [dateFrom, dateTo]);

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

  const updateDateRange = (start, end, closeCalendar = false) => {
    setDateRange([start, end]);
    onChange({
      dateFrom: start ? formatDate(start) : "",
      dateTo: end ? formatDate(end) : "",
    });
    if (closeCalendar || (start && end)) {
      setIsCalendarOpen(false);
    }
  };

  const handleQuickDateSelect = (option) => {
    const range = getDateRangeForQuickOption(option);
    if (!range) return;
    setActiveQuickPick(option);
    updateDateRange(range.start, range.end, true);
  };

  const handleDateRangeChange = (update) => {
    const [start, end] = update;
    if (start && end) {
      setActiveQuickPick(
        inferQuickDateRangePick(formatDate(start), formatDate(end))
      );
    } else {
      setActiveQuickPick(null);
    }
    updateDateRange(start, end);
  };

  const isQuickDateActive = (option) => activeQuickPick === option;

  const hasDateRange = Boolean(dateFrom || dateTo);

  const isTodaySelected = () => {
    const today = getDateRangeForQuickOption("Today");
    return (
      dateFrom === formatDate(today.start) && dateTo === formatDate(today.end)
    );
  };

  const resetDateToToday = () => {
    const today = getDateRangeForQuickOption("Today");
    setActiveQuickPick("Today");
    updateDateRange(today.start, today.end, true);
  };

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
  );
}
