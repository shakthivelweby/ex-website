"use client";

import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DateRangePicker.css";

const DateRangePicker = ({
  onChange,
  initialStartDate = null,
  initialEndDate = null,
  placeholder = "--",
  className = "",
}) => {
  const [dateRange, setDateRange] = useState([
    initialStartDate ? new Date(initialStartDate) : null,
    initialEndDate ? new Date(initialEndDate) : null,
  ]);
  const [startDate, endDate] = dateRange;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const handleChange = (update) => {
    const [newStartDate, newEndDate] = update;

    // If both dates are selected
    if (newStartDate && newEndDate) {
      // Check if they're in the same month
      const sameMonth =
        newStartDate.getMonth() === newEndDate.getMonth() &&
        newStartDate.getFullYear() === newEndDate.getFullYear();

      if (sameMonth) {
        // If in same month, only update the start date
        setDateRange([newStartDate, null]);
        return;
      }
    }

    // Otherwise update normally
    setDateRange(update);

    // Auto close when both dates are selected
    if (newStartDate && newEndDate) {
      if (onChange) {
        onChange({ startDate: newStartDate, endDate: newEndDate });
      }
      setIsOpen(false);
    }
  };

  const toggleDatePicker = () => {
    setIsOpen(!isOpen);
  };

  const handleApply = () => {
    if (onChange && startDate && endDate) {
      onChange({ startDate, endDate });
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setDateRange([null, null]);
    if (onChange) {
      onChange({ startDate: null, endDate: null });
    }
  };

  const formatDateDisplay = () => {
    if (!startDate || !endDate) return placeholder;

    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Determine if the value has been set by the user
  const hasValue = startDate !== null && endDate !== null;

  // Custom header rendering for the calendar
  const renderCustomHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div className="flex items-center justify-between px-2 py-2">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        type="button"
        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <i className="fi fi-rr-angle-left text-gray-600"></i>
      </button>

      <div className="text-base font-medium text-gray-900">
        {date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </div>

      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        type="button"
        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <i className="fi fi-rr-angle-right text-gray-600"></i>
      </button>
    </div>
  );

  // Handle outside click to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={toggleDatePicker}
        className={`w-full h-10 rounded-full ${
          hasValue ? "border-2 border-primary-500" : "border border-gray-300"
        } px-4 text-gray-800 text-sm font-medium bg-white focus:outline-none focus:ring-none focus:border-primary-300 hover:border-primary-300 flex items-center justify-between cursor-pointer`}
      >
        {formatDateDisplay()}
        <span className="ml-2">
          <i className="fi fi-rr-calendar text-gray-800 text-base"></i>
        </span>
      </button>

      {hasValue && (
        <span className="absolute -top-2 -right-2 w-3 h-3 bg-primary-500 rounded-full"></span>
      )}

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 bg-white date-picker-container">
          <div className="w-full">
            {/* Header with only the Clear button */}
            <div className="datepicker-header">
              <div className="datepicker-header-left">
                {/* Empty space if needed for alignment */}
              </div>
              <div className="datepicker-header-right">
                <button onClick={handleClear} className="clear-btn">
                  Clear
                </button>
              </div>
            </div>

            <div className="calendar-flex-container">
              <div>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => handleChange([date, endDate])}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  inline
                  monthsShown={1}
                  minDate={new Date()}
                  calendarClassName="border-none"
                  renderCustomHeader={renderCustomHeader}
                  dayClassName={(date) => {
                    const isToday =
                      date.getDate() === new Date().getDate() &&
                      date.getMonth() === new Date().getMonth() &&
                      date.getFullYear() === new Date().getFullYear();

                    if (isToday) return "bg-gray-100";
                    return undefined;
                  }}
                  className="custom-datepicker"
                />
              </div>

              <div>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => handleChange([startDate, date])}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  inline
                  monthsShown={1}
                  minDate={(() => {
                    // If startDate exists, set minDate to the first day of the next month
                    if (startDate) {
                      const nextMonth = new Date(startDate);
                      nextMonth.setDate(1); // First day of the month
                      nextMonth.setMonth(nextMonth.getMonth() + 1); // Move to next month
                      return nextMonth;
                    }
                    return new Date(); // Default to today
                  })()}
                  calendarClassName="border-none"
                  renderCustomHeader={renderCustomHeader}
                  dayClassName={(date) => {
                    const isToday =
                      date.getDate() === new Date().getDate() &&
                      date.getMonth() === new Date().getMonth() &&
                      date.getFullYear() === new Date().getFullYear();

                    if (isToday) return "bg-gray-100";
                    return undefined;
                  }}
                  openToDate={(() => {
                    // Always open to next month after startDate
                    const nextMonth = new Date(startDate || new Date());
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    return nextMonth;
                  })()}
                  className="custom-datepicker"
                  // Disable all dates in the same month as startDate
                  filterDate={(date) => {
                    if (!startDate) return true;

                    // Different month or different year is allowed
                    return (
                      date.getMonth() !== startDate.getMonth() ||
                      date.getFullYear() !== startDate.getFullYear()
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
