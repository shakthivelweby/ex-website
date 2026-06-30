"use client";

import SearchLocationField from "./SearchLocationField";
import RangeSlider from "../RangeSlider/RangeSlider";
import DateRangeSearchField from "./DateRangeSearchField";

const PRICE_MIN = 0;
const PRICE_MAX = 10000;

export default function AttractionsSearchFilters({
  filters,
  onFilterChange,
  categories = [],
  destinations = [],
  compact = false,
}) {
  const toggleCategory = (slug) => {
    onFilterChange({
      ...filters,
      category: filters.category === slug ? "" : slug,
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
            <i className="fi fi-rr-ferris-wheel text-gray-400" />
            Attraction Type
          </label>
          {filters.category && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, category: "" })}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400">No types available</p>
          ) : (
            categories.map((category) => {
              const selected = filters.category === category.slug;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.slug)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    selected
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {selected && <i className="fi fi-rr-check text-[10px]" />}
                  {category.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <i className="fi fi-rr-indian-rupee-sign text-gray-400" />
            Price Range
          </label>
          {hasPriceFilter && (
            <button
              type="button"
              onClick={() =>
                onFilterChange({ ...filters, price_from: "", price_to: "" })
              }
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Clear
            </button>
          )}
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
          title="Price Range"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>Free</span>
          <span>₹{PRICE_MAX}+</span>
        </div>
      </div>
    </div>
  );
}
