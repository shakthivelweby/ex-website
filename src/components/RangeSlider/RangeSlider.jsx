"use client";

import { useState, useEffect, useRef } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const normalizeRange = (value, min, max) => {
  if (value === null || value === undefined) return [min, max];
  if (Array.isArray(value)) return value;
  return [value, max];
};

const RangeSlider = ({
  min,
  max,
  step = 1,
  initialValue = null,
  formatDisplay,
  title = "Price Range",
  onChange,
  className = "",
  variant = "underline",
  minLabel,
  maxLabel,
}) => {
  const [value, setValue] = useState(() => normalizeRange(initialValue, min, max));
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setValue(normalizeRange(initialValue, min, max));
  }, [initialValue, min, max]);

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

  const getDisplayText = () => {
    if (formatDisplay) return formatDisplay(value);
    return `₹${value[0]} - ₹${value[1]}`;
  };

  const triggerClassName =
    variant === "field"
      ? `flex w-full items-center justify-between border-0 bg-transparent text-left text-sm focus:outline-none ${className}`
      : `w-full border-0 border-b border-gray-300 py-2.5 text-left text-sm hover:border-b-gray-400 focus:outline-none ${className}`;

  const popupLeftLabel = minLabel ?? `₹${min}`;
  const popupRightLabel = maxLabel ?? `₹${max}+`;

  const renderTrigger = () => (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={triggerClassName}
    >
      <span className="text-gray-800">{getDisplayText()}</span>
      {variant === "field" && (
        <i className="fi fi-rr-angle-small-down text-base text-gray-400" />
      )}
    </button>
  );

  const renderPopup = () =>
    isOpen && (
      <div
        className="absolute left-0 right-0 top-full z-20 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg"
        onClick={handleDropdownClick}
      >
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
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
              value={value}
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
            <span>{popupLeftLabel}</span>
            <span>{popupRightLabel}</span>
          </div>
        </div>
      </div>
    );

  if (!isMounted) {
    return (
      <div className="relative w-full">
        <div className={triggerClassName}>
          <span className="text-gray-800">{getDisplayText()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {renderTrigger()}
      {renderPopup()}
    </div>
  );
};

export default RangeSlider;
