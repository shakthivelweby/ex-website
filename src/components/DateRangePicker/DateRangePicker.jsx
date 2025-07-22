"use client";

import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({
  onChange,
  initialStartDate = null,
  initialEndDate = null,
  placeholder = "--",
  className = "",
}) => {
  const [startDate, setStartDate] = useState(
    initialStartDate ? new Date(initialStartDate) : null
  );
  const [endDate, setEndDate] = useState(
    initialEndDate ? new Date(initialEndDate) : null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  const containerRef = useRef(null);

  const toggleDatePicker = () => {
    setIsOpen(!isOpen);
    setIsSelectingStart(true);
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onChange?.({ startDate: null, endDate: null });
  };

  const handleDateSelect = (date) => {
    if (isSelectingStart) {
      setStartDate(date);
      setEndDate(null);
      setIsSelectingStart(false);
    } else {
      if (date < startDate) {
        setStartDate(date);
        setEndDate(null);
      } else {
        setEndDate(date);
        onChange?.({ startDate, endDate: date });
        setIsOpen(false);
      }
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

  const hasValue = startDate !== null && endDate !== null;

  const renderCustomHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div className="flex items-center justify-between px-2 pb-4">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        type="button"
        className="text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <i className="fi fi-rr-angle-left text-sm"></i>
      </button>

      <span className="text-sm font-medium text-gray-900">
        {date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </span>

      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        type="button"
        className="text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <i className="fi fi-rr-angle-right text-sm"></i>
      </button>
    </div>
  );

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
        <div className="absolute right-0 top-12 z-50 bg-white shadow-lg rounded-lg border border-gray-100">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">
                {isSelectingStart ? "Select start date" : "Select end date"}
              </span>
              <button 
                onClick={handleClear}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>

            <DatePicker
              selected={isSelectingStart ? startDate : endDate}
              onChange={handleDateSelect}
              selectsStart={isSelectingStart}
              selectsEnd={!isSelectingStart}
              startDate={startDate}
              endDate={endDate}
              inline
              monthsShown={1}
              minDate={isSelectingStart ? new Date() : startDate || new Date()}
              renderCustomHeader={renderCustomHeader}
              calendarClassName="!border-0"
              showPopperArrow={false}
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        .react-datepicker {
          font-family: inherit !important;
          border: none !important;
          width: 280px !important;
        }
        .react-datepicker__month-container {
          width: 100% !important;
        }
        .react-datepicker__header {
          background: white !important;
          border-bottom: none !important;
          padding: 0 !important;
        }
        .react-datepicker__current-month {
          display: none !important;
        }
        .react-datepicker__day-names {
          display: flex !important;
          justify-content: space-between !important;
          padding: 0 0.75rem !important;
          margin: 0 !important;
        }
        .react-datepicker__day-name {
          color: #6B7280 !important;
          font-weight: normal !important;
          font-size: 0.75rem !important;
          margin: 0 !important;
          width: 2rem !important;
          line-height: 2rem !important;
          text-transform: uppercase !important;
        }
        .react-datepicker__month {
          margin: 0 !important;
          padding: 0 0.75rem !important;
        }
        .react-datepicker__week {
          display: flex !important;
          justify-content: space-between !important;
          margin-bottom: 2px !important;
        }
        .react-datepicker__day {
          color: #374151 !important;
          font-size: 0.875rem !important;
          width: 2rem !important;
          height: 2rem !important;
          line-height: 2rem !important;
          margin: 0 !important;
          border-radius: 9999px !important;
          padding: 0 !important;
        }
        .react-datepicker__day:hover:not(.react-datepicker__day--disabled):not(.react-datepicker__day--selected) {
          background-color: #F3F4F6 !important;
          border-radius: 9999px !important;
        }
        .react-datepicker__day--selected {
          background-color: #069494 !important;
          color: white !important;
          font-weight: normal !important;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: transparent !important;
          color: #374151 !important;
        }
        .react-datepicker__day--keyboard-selected:hover {
          background-color: #F3F4F6 !important;
        }
        .react-datepicker__day--today {
          font-weight: normal !important;
          background-color: #F3F4F6 !important;
          color: #374151 !important;
        }
        .react-datepicker__day--disabled {
          color: #D1D5DB !important;
          cursor: default !important;
        }
        .react-datepicker__day--outside-month {
          color: #D1D5DB !important;
          pointer-events: none !important;
        }
        .react-datepicker__triangle {
          display: none !important;
        }
        .react-datepicker__navigation {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default DateRangePicker;
