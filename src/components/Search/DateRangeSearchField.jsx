"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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

const POPOVER_WIDTH = 304;

export default function DateRangeSearchField({
  dateFrom,
  dateTo,
  onChange,
  embedded = false,
  variant = "default",
  emptyLabel = "Select start and end date",
  isActive = false,
}) {
  const [dateRange, setDateRange] = useState([
    parseDate(dateFrom),
    parseDate(dateTo),
  ]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [activeQuickPick, setActiveQuickPick] = useState(() =>
    resolveQuickDateRangePick(dateFrom, dateTo, null)
  );
  const anchorRef = useRef(null);
  const popoverRef = useRef(null);

  const updatePopoverPosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const margin = 8;
    let left = rect.left;
    const maxLeft = window.innerWidth - POPOVER_WIDTH - margin;
    if (left > maxLeft) left = Math.max(margin, maxLeft);
    if (left < margin) left = margin;

    setPopoverPosition({
      top: rect.bottom + 6,
      left,
    });
  }, []);

  useEffect(() => {
    setDateRange([parseDate(dateFrom), parseDate(dateTo)]);
    setActiveQuickPick((current) =>
      resolveQuickDateRangePick(dateFrom, dateTo, current)
    );
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (!isCalendarOpen || (!embedded && variant !== "hero")) return undefined;

    updatePopoverPosition();
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [embedded, isCalendarOpen, updatePopoverPosition, variant]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        anchorRef.current?.contains(event.target) ||
        popoverRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsCalendarOpen(false);
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
    if (!dateRange[0] && !dateRange[1]) return emptyLabel;
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
    <div
      className={`flex items-center justify-between px-0.5 ${
        embedded || variant === "hero" ? "gap-1 pb-2" : "gap-2 px-1 pb-3"
      }`}
    >
      <button
        type="button"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className={`flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 ${
          embedded || variant === "hero" ? "h-7 w-7" : "h-8 w-8"
        }`}
      >
        <i className="fi fi-rr-angle-left text-sm" />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
        <select
          value={date.getMonth()}
          onChange={({ target }) => changeMonth(Number(target.value))}
          className={`rounded-lg border border-gray-200 bg-white font-medium text-gray-900 focus:border-primary-400 focus:outline-none ${
            embedded || variant === "hero"
              ? "max-w-[6.5rem] px-1.5 py-1 text-[11px]"
              : "max-w-[9rem] px-2 py-1.5 text-sm"
          }`}
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
          className={`rounded-lg border border-gray-200 bg-white font-medium text-gray-900 focus:border-primary-400 focus:outline-none ${
            embedded || variant === "hero" ? "px-1.5 py-1 text-[11px]" : "px-2 py-1.5 text-sm"
          }`}
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
        className={`flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 ${
          embedded || variant === "hero" ? "h-7 w-7" : "h-8 w-8"
        }`}
      >
        <i className="fi fi-rr-angle-right text-sm" />
      </button>
    </div>
  );

  const popoverContent = (
    <>
      <div className="mb-2 flex items-center justify-between gap-3 px-0.5">
        <span className="text-xs font-medium text-gray-500">{calendarHint}</span>
        <button
          type="button"
          onClick={() => setIsCalendarOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
    </>
  );

  const calendarPopover = isCalendarOpen ? (
    embedded || variant === "hero" ? (
      typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popoverRef}
              className="fixed z-[200] rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl"
              style={{
                top: popoverPosition.top,
                left: popoverPosition.left,
                width: POPOVER_WIDTH,
              }}
            >
              {popoverContent}
            </div>,
            document.body
          )
        : null
    ) : (
      <div className="absolute left-0 top-[calc(100%+0.375rem)] z-[100] w-fit max-w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl">
        {popoverContent}
      </div>
    )
  ) : null;

  const toggleCalendar = () => {
    setIsCalendarOpen((open) => {
      const next = !open;
      if (next && (embedded || variant === "hero")) {
        requestAnimationFrame(() => updatePopoverPosition());
      }
      return next;
    });
  };

  const formatHeroRangeLabel = () => {
    if (!dateRange[0] && !dateRange[1]) return emptyLabel;
    const opts = { weekday: "short", day: "numeric", month: "short" };
    if (dateRange[0] && !dateRange[1]) {
      return `${dateRange[0].toLocaleDateString("en-GB", opts)} — pick end`;
    }
    return `${dateRange[0].toLocaleDateString("en-GB", opts)} – ${dateRange[1].toLocaleDateString("en-GB", opts)}`;
  };

  const triggerButton =
    variant === "hero" ? (
      <button
        type="button"
        onClick={toggleCalendar}
        className={`flex min-h-[58px] w-full flex-col justify-center rounded-xl border border-[#DDDDDD] bg-[#F7F7F7] px-3.5 py-2.5 text-left transition-colors hover:bg-white sm:min-h-[70px] sm:px-4 sm:py-3 ${
          isActive || isCalendarOpen
            ? "border-primary-400 bg-white ring-2 ring-primary-500/10"
            : ""
        }`}
      >
        <p className="mb-1 text-[11px] font-medium text-[#717171]">Dates</p>
        <p
          className={`truncate text-sm font-medium ${
            hasDateRange ? "text-[#222222]" : "text-[#B0B0B0]"
          }`}
        >
          {formatHeroRangeLabel()}
        </p>
      </button>
    ) : (
    <button
      type="button"
      onClick={toggleCalendar}
      className={
        embedded
          ? `flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-xs transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/15 ${
              hasDateRange
                ? "border-gray-200 bg-white text-gray-800"
                : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
            }`
          : `flex h-11 w-full items-center justify-between rounded-xl border px-4 text-left text-sm transition-all ${
              hasDateRange
                ? "border-primary-300 bg-white text-gray-900 shadow-sm"
                : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`
      }
    >
      <span className="truncate pr-2">{formatRangeLabel()}</span>
      <i
        className={`fi fi-rr-calendar shrink-0 text-xs ${
          hasDateRange ? "text-primary-500" : "text-gray-400"
        }`}
      />
    </button>
  );

  if (embedded || variant === "hero") {
    return (
      <div className="relative flex-1" ref={anchorRef}>
        {triggerButton}
        {calendarPopover}
      </div>
    );
  }

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
      <div className="relative" ref={anchorRef}>
        {triggerButton}
        {calendarPopover}
      </div>
    </div>
  );
}
