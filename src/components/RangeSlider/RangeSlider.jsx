"use client";

import { useState, useEffect, useRef } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const RangeSlider = ({
  min,
  max,
  step = 1,
  initialValue = null,
  formatDisplay,
  title,
  onChange,
  className = "",
}) => {
  const [value, setValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef(null);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Add click outside handler
  useEffect(() => {
    if (!isMounted) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isMounted]);

  const handleSliderChange = (newValue) => {
    setValue(newValue);
  };

  const handleSliderAfterChange = (newValue) => {
    onChange(newValue);
  };

  const handleReset = (e) => {
    e.stopPropagation();
    const resetValue = [min, max];
    setValue(resetValue);
    onChange(resetValue);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  // Don't render the interactive parts until mounted
  if (!isMounted) {
    return (
      <div className="relative">
        <button
          type="button"
          className={`w-full py-2.5 text-left text-sm border-0 border-b border-gray-300 rounded-none hover:border-b-gray-400 focus:outline-none ${
            value !== null ? "text-gray-900" : "text-gray-500"
          } ${className}`}
        >
          {formatDisplay
            ? formatDisplay(value)
            : value
            ? `₹${value[0]} - ₹${value[1]}`
            : "Select Price Range"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-2.5 text-left text-sm border-0 border-b border-gray-300 rounded-none hover:border-b-gray-400 focus:outline-none ${
          value !== null ? "text-gray-900" : "text-gray-500"
        } ${className}`}
      >
        {formatDisplay
          ? formatDisplay(value)
          : value
          ? `₹${value[0]} - ₹${value[1]}`
          : "Select Price Range"}
      </button>

      {isOpen && (
        <div
          className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
          onClick={handleDropdownClick}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-800">{title}</h3>
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Reset
              </button>
            </div>
            <div
              className="flex items-center gap-4 px-2"
              onClick={handleDropdownClick}
            >
              <Slider
                range
                min={min}
                max={max}
                step={step}
                value={value === null ? [min, max] : value}
                onChange={handleSliderChange}
                onChangeComplete={handleSliderAfterChange}
                trackStyle={[{ backgroundColor: "#069494", height: 2 }]}
                handleStyle={[
                  {
                    borderColor: "#069494",
                    height: 20,
                    width: 20,
                    marginTop: -8,
                    backgroundColor: "#069494",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                  },
                  {
                    borderColor: "#069494",
                    height: 20,
                    width: 20,
                    marginTop: -8,
                    backgroundColor: "#069494",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                  },
                ]}
                railStyle={{ backgroundColor: "#E5E7EB", height: 2 }}
              />
            </div>
            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <span>
                {formatDisplay ? formatDisplay([min, min]) : `₹${min}`}
              </span>
              <span>
                {formatDisplay ? formatDisplay([max, max]) : `₹${max}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RangeSlider;
