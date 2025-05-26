"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const RangeSlider = ({
  min,
  max,
  step = 1,
  initialValue = null,
  formatDisplay,
  title,
  onChange,
  className,
}) => {
  const [value, setValue] = useState(initialValue);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const sliderRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
  };

  const handleClear = () => {
    setValue(null);
    onChange(null);
    setIsPopupOpen(false);
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        sliderRef.current &&
        !sliderRef.current.contains(event.target)
      ) {
        setIsPopupOpen(false);
        // When closing, apply the current value
        onChange(value);
      }
    };

    if (isPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopupOpen, onChange, value]);

  const calculatePositionPercent = () => {
    if (value === null) return 0;
    return ((value - min) / (max - min)) * 100;
  };

  const formattedValue = value !== null ? formatDisplay(value) : "--";

  return (
    <div className={`relative ${className}`} ref={sliderRef}>
      <button
        onClick={togglePopup}
        className={`w-full h-10 px-4 py-2 text-sm rounded-full focus:outline-none focus:ring-none focus:border-primary-300 flex items-center justify-between bg-white ${
          value !== null
            ? "border-2 border-primary-500 text-gray-800"
            : "border border-gray-300 text-gray-500 cursor-pointer hover:border-primary-300"
        }`}
      >
        <span>{formattedValue}</span>
        <i className="fi fi-rr-settings-sliders text-gray-800"></i>
      </button>

      {/* Add the dot indicator when value is set */}
      {value !== null && (
        <span className="absolute -top-2 -right-2 w-3 h-3 bg-primary-500 rounded-full"></span>
      )}

      {isMounted &&
        isPopupOpen &&
        createPortal(
          <div
            ref={popupRef}
            className="fixed z-50 bg-white rounded-xl shadow-lg p-6 animate-fadeIn border border-gray-200 w-72 max-w-[90vw]"
            style={{
              top: sliderRef.current
                ? sliderRef.current.getBoundingClientRect().bottom + 10
                : 0,
              left: sliderRef.current
                ? sliderRef.current.getBoundingClientRect().left
                : 0,
            }}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-base font-medium text-gray-800">{title}</h3>
              <button
                onClick={handleClear}
                className="text-rose-500 hover:text-rose-600 font-medium text-sm transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="mb-14 relative px-1">
              {/* Custom slider track */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full relative">
                {/* Filled track */}
                <div
                  className="absolute h-1.5 bg-rose-500 rounded-full left-0"
                  style={{ width: `${calculatePositionPercent()}%` }}
                ></div>

                {/* Slider knob */}
                <div
                  className="absolute w-8 h-8 -top-3 transform -translate-x-1/2 flex items-center justify-center"
                  style={{ left: `${calculatePositionPercent()}%` }}
                >
                  <div className="w-5 h-5 bg-rose-500 rounded-full shadow"></div>
                </div>
              </div>

              {/* Hidden actual input for functionality */}
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value !== null ? value : min}
                onChange={handleChange}
                className="w-full appearance-none absolute inset-0 opacity-0 cursor-pointer h-12 -top-5 z-10 touch-manipulation"
              />

              <div className="absolute top-8 w-full flex justify-between mt-2">
                <div className="text-gray-700 text-sm">
                  <div>min</div>
                  <div className="font-medium">{min.toLocaleString()}</div>
                </div>
                <div className="text-gray-700 text-sm text-right">
                  <div>Max</div>
                  <div className="font-medium">{max.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default RangeSlider;
