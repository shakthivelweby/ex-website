"use client";

import { useMemo } from "react";
import SearchLocationField from "./SearchLocationField";
import RangeSlider from "../RangeSlider/RangeSlider";
import DateRangeSearchField from "./DateRangeSearchField";
import {
  buildCategoryTypesFromCategories,
  formTypeIcon,
  isVehicleFormType,
} from "@/app/rentals/rentalCategoryTypeUtils";

const PRICE_MIN = 0;
const PRICE_MAX = 1000;
const FUEL_TYPE_OPTIONS = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const TRANSMISSION_OPTIONS = ["Manual", "Automatic", "AMT", "CVT"];
const SEAT_OPTIONS = ["2", "4", "5", "6", "7", "8"];

export default function RentalsSearchFilters({
  filters,
  onFilterChange,
  categories = [],
  destinations = [],
  compact = false,
}) {
  const categoryTypes = useMemo(
    () => buildCategoryTypesFromCategories(categories),
    [categories],
  );

  const showVehicleFilters = isVehicleFormType(filters.form_type);

  const toggleFormType = (formType) => {
    const next = filters.form_type === formType ? "" : formType;
    onFilterChange({
      ...filters,
      form_type: next,
      category: "",
      sub_category: "",
      ...(isVehicleFormType(next) ? {} : { transmission: "", fuel_type: "", seats: "" }),
    });
  };

  const handlePriceChange = (value) => {
    if (!Array.isArray(value)) return;
    const [from, to] = value;
    const isFullRange = from === PRICE_MIN && to === PRICE_MAX;
    onFilterChange({
      ...filters,
      price_from: isFullRange ? "" : String(from),
      price_to: isFullRange ? "" : String(to),
    });
  };

  const hasPriceFilter = Boolean(filters.price_from || filters.price_to);

  return (
    <div
      className={`overflow-y-auto ${
        compact ? "px-4 py-3 space-y-4 max-h-[38vh]" : "px-6 py-4 space-y-5 max-h-[50vh]"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <i className="fi fi-rr-marker text-gray-400" />
            Location
          </label>
          {filters.location ? (
            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  ...filters,
                  location: "",
                  longitude: "",
                  latitude: "",
                })
              }
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          ) : null}
        </div>
        <SearchLocationField
          location={filters.location}
          latitude={filters.latitude}
          longitude={filters.longitude}
          destinations={destinations}
          placeholder="Enter city or pickup area..."
          onChange={(locationPatch) =>
            onFilterChange({ ...filters, ...locationPatch })
          }
        />
      </div>

      <DateRangeSearchField
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onChange={({ dateFrom, dateTo }) =>
          onFilterChange({ ...filters, dateFrom, dateTo })
        }
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <i className="fi fi-rr-car text-gray-400" />
            Rental Type
          </label>
          {filters.form_type ? (
            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  ...filters,
                  form_type: "",
                  category: "",
                  sub_category: "",
                  transmission: "",
                  fuel_type: "",
                  seats: "",
                })
              }
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryTypes.length === 0 ? (
            <p className="text-sm text-gray-400">No types available</p>
          ) : (
            categoryTypes.map((type) => {
              const selected = filters.form_type === type.form_type;
              return (
                <button
                  key={type.form_type}
                  type="button"
                  onClick={() => toggleFormType(type.form_type)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    selected
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <i className={`${formTypeIcon(type.form_type)} text-[11px]`} />
                  {selected ? <i className="fi fi-rr-check text-[10px]" /> : null}
                  {type.label}
                </button>
              );
            })
          )}
        </div>
      </div>

      {showVehicleFilters ? (
        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
          <p className="text-xs font-semibold text-gray-700">Vehicle preferences</p>

          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Transmission
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, transmission: "" })}
                className={`px-2.5 py-1 text-xs rounded-lg border ${
                  !filters.transmission
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                Any
              </button>
              {TRANSMISSION_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      transmission: filters.transmission === item ? "" : item,
                    })
                  }
                  className={`px-2.5 py-1 text-xs rounded-lg border ${
                    filters.transmission === item
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Fuel
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, fuel_type: "" })}
                className={`px-2.5 py-1 text-xs rounded-lg border ${
                  !filters.fuel_type
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                Any
              </button>
              {FUEL_TYPE_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      fuel_type: filters.fuel_type === item ? "" : item,
                    })
                  }
                  className={`px-2.5 py-1 text-xs rounded-lg border ${
                    filters.fuel_type === item
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Seats
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, seats: "" })}
                className={`px-2.5 py-1 text-xs rounded-lg border ${
                  !filters.seats
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                Any
              </button>
              {SEAT_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      seats: filters.seats === item ? "" : item,
                    })
                  }
                  className={`px-2.5 py-1 text-xs rounded-lg border ${
                    filters.seats === item
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <i className="fi fi-rr-indian-rupee-sign text-gray-400" />
            Price per day
          </label>
          {hasPriceFilter ? (
            <button
              type="button"
              onClick={() =>
                onFilterChange({ ...filters, price_from: "", price_to: "" })
              }
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          ) : null}
        </div>
        <RangeSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={50}
          initialValue={[
            parseInt(filters.price_from, 10) || PRICE_MIN,
            parseInt(filters.price_to, 10) || PRICE_MAX,
          ]}
          onChange={handlePriceChange}
          formatDisplay={(value) => {
            if (!value || value.length !== 2) return "Any price";
            if (value[0] === PRICE_MIN && value[1] === PRICE_MAX) return "Any price";
            if (value[0] === PRICE_MIN) return `Under ₹${value[1]}`;
            if (value[1] === PRICE_MAX) return `₹${value[0]}+`;
            return `₹${value[0]} - ₹${value[1]}`;
          }}
          title="Price per day"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>₹0</span>
          <span>₹1000+</span>
        </div>
      </div>
    </div>
  );
}
