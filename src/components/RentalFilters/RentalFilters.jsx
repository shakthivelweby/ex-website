"use client";

import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LocationSearchPopup from "../LocationSearchPopup";
import RangeSlider from "../RangeSlider/RangeSlider";
import { getRentalSubCategories } from "@/app/rentals/service";

const FUEL_TYPE_OPTIONS = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid", "Other"];
const TRANSMISSION_OPTIONS = ["Manual", "Automatic", "AMT", "CVT", "DCT", "Other"];

const RentalFilters = ({
  initialFilters,
  onFilterChange,
  categories,
  layout = "inline",
  onClose,
}) => {
  const [tempFilters, setTempFilters] = useState(initialFilters || {});
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [subCategories, setSubCategories] = useState([]);
  const prevInitialFiltersRef = useRef();

  useEffect(() => {
    const prevFilters = prevInitialFiltersRef.current;
    const filtersChanged = JSON.stringify(initialFilters) !== JSON.stringify(prevFilters);
    if (filtersChanged) {
      prevInitialFiltersRef.current = initialFilters;
      setTempFilters(initialFilters || {});
    }

    if (initialFilters?.date && /^\d{4}-\d{2}-\d{2}$/.test(initialFilters.date)) {
      setSelectedDate(new Date(initialFilters.date));
    }
  }, [initialFilters]);

  useEffect(() => {
    const loadSubCategories = async () => {
      const categorySlug = String(tempFilters?.category || "").trim();
      if (!categorySlug) {
        setSubCategories([]);
        return;
      }
      const res = await getRentalSubCategories({ category: categorySlug });
      setSubCategories(Array.isArray(res?.data) ? res.data : []);
    };
    loadSubCategories();
  }, [tempFilters?.category]);

  const patchFilters = (patch) => {
    const next = { ...tempFilters, ...patch };
    setTempFilters(next);
    onFilterChange(next);
  };

  const handlePlaceSelected = (place) => {
    if (!place) return;
    const locationName = place.name || place.formatted_address || place.vicinity || "";
    const longitude =
      typeof place.geometry?.location?.lng === "function"
        ? place.geometry.location.lng()
        : place.geometry?.location?.lng;
    const latitude =
      typeof place.geometry?.location?.lat === "function"
        ? place.geometry.location.lat()
        : place.geometry?.location?.lat;

    patchFilters({
      location: locationName,
      longitude: longitude || "",
      latitude: latitude || "",
    });
    setIsLocationOpen(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (!date) return;
    patchFilters({ date: date.toISOString().split("T")[0] });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      date: "",
      location: "",
      category: "",
      sub_category: "",
      transmission: "",
      fuel_type: "",
      rating: "",
      price_from: "",
      price_to: "",
      longitude: "",
      latitude: "",
      search: "",
    };
    setTempFilters(clearedFilters);
    setSubCategories([]);
    setSelectedDate(new Date());
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = () => Object.values(tempFilters || {}).some((v) => Boolean(v));
  const getActiveFilterCount = () => Object.values(tempFilters || {}).filter((v) => Boolean(v)).length;

  const FilterContent = () => (
    <div className="space-y-3">
      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-marker text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">Location</span>
          </div>
        </div>
        <button
          onClick={() => setIsLocationOpen(true)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-left text-sm flex items-center gap-2"
        >
          <span className="text-gray-600">{tempFilters.location || "Choose location"}</span>
          <i className="fi fi-rr-angle-small-right ml-auto text-gray-400"></i>
        </button>
      </div>

      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <i className="fi fi-rr-calendar text-gray-400"></i>
          <span className="text-sm font-medium text-gray-700">Date</span>
        </div>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          minDate={new Date()}
          dateFormat="dd MMM yyyy"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600"
        />
      </div>

      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <i className="fi fi-rr-apps text-gray-400"></i>
          <span className="text-sm font-medium text-gray-700">Category Type</span>
        </div>
        <select
          value={tempFilters.category || ""}
          onChange={(e) => patchFilters({ category: e.target.value, sub_category: "" })}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600"
        >
          <option value="">All categories</option>
          {(categories || []).map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <i className="fi fi-rr-tags text-gray-400"></i>
          <span className="text-sm font-medium text-gray-700">Sub Category</span>
        </div>
        <select
          value={tempFilters.sub_category || ""}
          onChange={(e) => patchFilters({ sub_category: e.target.value })}
          disabled={!tempFilters.category}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 disabled:bg-gray-100"
        >
          <option value="">All sub categories</option>
          {subCategories.map((sub) => (
            <option key={sub.id} value={sub.slug}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <i className="fi fi-rr-gas-pump text-gray-400"></i>
          <span className="text-sm font-medium text-gray-700">Fuel Type</span>
        </div>
        <select
          value={tempFilters.fuel_type || ""}
          onChange={(e) => patchFilters({ fuel_type: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600"
        >
          <option value="">All fuel types</option>
          {FUEL_TYPE_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <i className="fi fi-rr-settings text-gray-400"></i>
          <span className="text-sm font-medium text-gray-700">Transmission</span>
        </div>
        <select
          value={tempFilters.transmission || ""}
          onChange={(e) => patchFilters({ transmission: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600"
        >
          <option value="">All transmissions</option>
          {TRANSMISSION_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <i className="fi fi-rr-indian-rupee-sign text-gray-400"></i>
          <span className="text-sm font-medium text-gray-700">Price Range</span>
        </div>
        <div className="px-2">
          <RangeSlider
            min={0}
            max={1000}
            step={50}
            initialValue={[parseInt(tempFilters.price_from) || 0, parseInt(tempFilters.price_to) || 1000]}
            onChange={(value) => patchFilters({ price_from: value[0], price_to: value[1] })}
            formatDisplay={(value) => {
              if (!value || value.length !== 2) return "Any Price";
              if (value[0] === 0 && value[1] === 1000) return "Any Price";
              if (value[0] === 0) return `Under ₹${value[1]}`;
              if (value[1] === 1000) return `₹${value[0]}+`;
              return `₹${value[0]} - ₹${value[1]}`;
            }}
            title="Price Range"
          />
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Free</span>
            <span>₹1000+</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ActionButtons = () => (
    <div className="flex gap-3 pt-4 border-t border-gray-100">
      <button
        onClick={clearAllFilters}
        className="flex-1 py-2.5 px-4 rounded-full border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Clear All
      </button>
      <button
        onClick={() => {
          if (onClose) onClose();
        }}
        className="flex-1 py-2.5 px-4 rounded-full bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
      >
        Apply Now
      </button>
    </div>
  );

  if (layout === "mobile") {
    return (
      <div className="space-y-6">
        <FilterContent />
        <ActionButtons />
        <LocationSearchPopup
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
          onPlaceSelected={handlePlaceSelected}
          googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          title="Choose Location"
        />
      </div>
    );
  }

  if (layout === "sidebar") {
    return (
      <div className="bg-white shadow-sm border border-gray-100 rounded-lg h-fit sticky top-4">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fi fi-rr-settings-sliders text-gray-400"></i>
              <span className="font-medium text-gray-800">Filters</span>
              {hasActiveFilters() && <span className="text-sm text-gray-500">({getActiveFilterCount()})</span>}
            </div>
            {hasActiveFilters() && (
              <button onClick={clearAllFilters} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Clear All
              </button>
            )}
          </div>
        </div>
        <div className="p-4">
          <FilterContent />
        </div>
        <div className="p-4 border-t border-gray-100">
          <ActionButtons />
        </div>
        <LocationSearchPopup
          isOpen={isLocationOpen}
          onClose={() => setIsLocationOpen(false)}
          onPlaceSelected={handlePlaceSelected}
          googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          title="Choose Location"
        />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-lg">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-settings-sliders text-gray-400"></i>
            <span className="font-medium text-gray-800">Filters</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <FilterContent />
      </div>
      <div className="p-4 border-t border-gray-100">
        <ActionButtons />
      </div>
      <LocationSearchPopup
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        onPlaceSelected={handlePlaceSelected}
        googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        title="Choose Location"
      />
    </div>
  );
};

export default RentalFilters;

