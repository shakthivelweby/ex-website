"use client";

import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateNavBar = ({ onDateChange, selectedDate: externalSelectedDate }) => {
  const [selectedDate, setSelectedDate] = useState(externalSelectedDate || new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const calendarRef = useRef(null);
  const timeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const lastScrollY = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const navBarRef = useRef(null);

  // Sync with external selectedDate prop
  useEffect(() => {
    if (externalSelectedDate) {
      const externalDate = new Date(externalSelectedDate);
      const currentDate = new Date(selectedDate);
      // Only update if dates are different (compare dates, not time)
      if (
        externalDate.getFullYear() !== currentDate.getFullYear() ||
        externalDate.getMonth() !== currentDate.getMonth() ||
        externalDate.getDate() !== currentDate.getDate()
      ) {
        setSelectedDate(externalDate);
      }
    }
  }, [externalSelectedDate]);

  // Notify parent component when date changes
  useEffect(() => {
    if (!selectedDate || !onDateChange) return;
    onDateChange(selectedDate);
  }, [selectedDate, onDateChange]);

  // Handle clicks outside the calendar to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }

    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Handle scroll events to hide expanded section
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If we're scrolling more than 10px and the bar is expanded and calendar is not open
      if (
        Math.abs(currentScrollY - lastScrollY.current) > 10 &&
        isExpanded &&
        !isCalendarOpen
      ) {
        // Clear any existing scroll timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Collapse immediately when scrolling
        setIsExpanded(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isExpanded, isCalendarOpen]);

  // Auto-collapse after inactivity
  useEffect(() => {
    // Clear any existing timeout when expansion state changes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Set a new timeout only if expanded and calendar is not open
    if (isExpanded && !isCalendarOpen) {
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
    }

    // Reset timeout on user activity - only if calendar is not open
    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (isExpanded && !isCalendarOpen) {
        timeoutRef.current = setTimeout(() => {
          setIsExpanded(false);
        }, 3000);
      }
    };

    // Listen for activity events
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    // Cleanup
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [isExpanded, isCalendarOpen]);

  // Check if device is mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is the lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getDateDisplay = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time part for comparison
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const compareToday = new Date(today);
    compareToday.setHours(0, 0, 0, 0);
    const compareYesterday = new Date(yesterday);
    compareYesterday.setHours(0, 0, 0, 0);
    const compareTomorrow = new Date(tomorrow);
    compareTomorrow.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === compareToday.getTime()) {
      return "Today";
    } else if (compareDate.getTime() === compareYesterday.getTime()) {
      return "Yesterday";
    } else if (compareDate.getTime() === compareTomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    }
  };

  // Go to previous day
  const goToPrevDay = (e) => {
    // Prevent event from bubbling up
    e.stopPropagation();
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
    
    // Don't auto-collapse if calendar is open
    if (!isCalendarOpen) {
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
    }
  };

  // Go to next day
  const goToNextDay = (e) => {
    // Prevent event from bubbling up
    e.stopPropagation();
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
    
    // Don't auto-collapse if calendar is open
    if (!isCalendarOpen) {
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
    }
  };

  // Go to today
  const goToToday = () => {
    setSelectedDate(new Date());
    setIsCalendarOpen(false);
  };

  // Check if date is today
  const isToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(selectedDate);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  };

  // Handle calendar click
  const handleCalendarClick = (e) => {
    // Prevent event from bubbling up
    e.stopPropagation();
    
    // Reset the inactivity timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // If not expanded, expand first
    if (!isExpanded) {
      setIsExpanded(true);
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
    } else {
      // If expanded, toggle calendar
      const newCalendarState = !isCalendarOpen;
      setIsCalendarOpen(newCalendarState);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Only set collapse timeout if calendar is closed
      if (!newCalendarState) {
        timeoutRef.current = setTimeout(() => {
          setIsExpanded(false);
        }, 3000);
      }
    }
  };

  // Handle hover for desktop
  const handleMouseEnter = () => {
    if (!isMobile && !isCalendarOpen) {
      setIsExpanded(true);
      // Clear any existing timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isCalendarOpen) {
      // Add small delay before collapsing
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 300);
    }
  };

  // Handle click for mobile
  const handleClick = (e) => {
    // Prevent event from bubbling up
    e.stopPropagation();
    
    if (isMobile) {
      if (!isExpanded) {
        setIsExpanded(true);
        // Clear any existing timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        // Set new timeout
        timeoutRef.current = setTimeout(() => {
          setIsExpanded(false);
        }, 3000);
      }
    }
  };

  return (
    <div
      ref={navBarRef}
      className={`fixed bottom-[80px] left-1/2 transform -translate-x-1/2 z-50 flex items-center px-1 py-1 rounded-full shadow-xl bg-primary-500/90 backdrop-blur-md transition-all duration-500 ease-in-out ${
        isExpanded ? "w-[70%] sm:w-auto max-w-[400px]" : "w-auto"
      } justify-between`}
      style={{ boxShadow: "0 4px 24px 0 #069494" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Prev Button */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded
            ? "max-w-[100px] opacity-100 ml-1"
            : "max-w-0 opacity-0 ml-0"
        }`}
      >
        <button
          className={`px-2 sm:px-3 py-1.5 mr-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-200 flex-shrink-0 whitespace-nowrap
            ${
              isToday()
                ? "text-white/60 bg-white/10 cursor-not-allowed"
                : "bg-white text-primary-600 hover:bg-gray-50 hover:shadow-md active:scale-95"
            }`}
          disabled={isToday()}
          onClick={goToPrevDay}
        >
          &lt; Prev
        </button>
      </div>

      {/* Today Button with Calendar */}
      <div className="relative flex-grow-0 flex justify-center transition-all duration-500 ease-in-out">
        <button
          className={`px-3 sm:px-4 py-1.5 rounded-full ${
            isCalendarOpen ? "bg-primary-700" : "bg-primary-500"
          } text-white font-medium text-sm shadow-md flex items-center justify-center hover:bg-primary-700 transition-all duration-200 active:scale-95 w-auto min-w-[90px]`}
          onClick={handleCalendarClick}
          aria-expanded={isCalendarOpen}
          aria-haspopup="true"
        >
          <span>{getDateDisplay(selectedDate)}</span>
          <svg
            className={`ml-1 w-3 h-3 transition-transform duration-200 ${
              isCalendarOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isCalendarOpen && (
          <div
            className="absolute bottom-full mb-4 left-1/2  transform -translate-x-1/2 z-50"
            ref={calendarRef}
          >
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setIsCalendarOpen(false);
                // Reset the timeout after selecting a date
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => {
                  setIsExpanded(false);
                }, 3000);
              }}
              inline
              calendarClassName="custom-calendar"
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div className="custom-calendar-header">
                  <button
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    className="month-nav-button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <span className="month-title">
                    {date.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    className="month-nav-button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            />
            {/* Custom footer with Today button */}
            <div className="custom-calendar-footer">
              <button onClick={goToToday} className="today-button">
                Today
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Next Button */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded
            ? "max-w-[100px] opacity-100 mr-1"
            : "max-w-0 opacity-0 mr-0"
        }`}
      >
        <button
          className="px-2 sm:px-3 py-1.5 ml-2 rounded-full bg-white text-primary-600 font-medium text-xs sm:text-sm flex items-center hover:bg-gray-50 hover:shadow-md transition-all duration-200 active:scale-95 flex-shrink-0 whitespace-nowrap"
          onClick={goToNextDay}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
};

export default DateNavBar;
