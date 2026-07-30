"use client";

import { useEffect, useRef, useState } from "react";
import RangeSlider from "../RangeSlider/RangeSlider";
import {
  FilterField,
  FilterMobileFooter,
  FilterSidebarShell,
  getSelectClass,
  pillClass,
} from "../ListingFilters/shared";

const PRICE_MIN = 1000;
const PRICE_MAX = 50000;

const TOUR_TYPE_OPTIONS = [
  { value: "fixed_departure", label: "Scheduled" },
  { value: "private", label: "Private" },
];

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "asc", label: "Price: Low to High" },
  { value: "desc", label: "Price: High to Low" },
];

const PackageFilters = ({
  initialFilters,
  onFilterChange,
  suitableForOptions = [],
  destinationOptions = [],
  showDestination = false,
  suitableForLoading = false,
  layout = "sidebar",
  onClose,
}) => {
  const [tempFilters, setTempFilters] = useState(initialFilters || {});
  const prevInitialFiltersRef = useRef();

  useEffect(() => {
    const prevFilters = prevInitialFiltersRef.current;
    const filtersChanged = JSON.stringify(initialFilters) !== JSON.stringify(prevFilters);
    if (filtersChanged) {
      prevInitialFiltersRef.current = initialFilters;
      setTempFilters(initialFilters || {});
    }
  }, [initialFilters]);

  const patchFilters = (patch) => {
    const next = { ...tempFilters, ...patch };
    setTempFilters(next);
    onFilterChange(next);
  };

  const clearAllFilters = () => {
    const cleared = {
      tour_type: "",
      duration: "",
      price_from: "",
      price_to: "",
      suitable_id: "",
      sort_by_price: "",
      destination: "",
    };
    setTempFilters(cleared);
    onFilterChange(cleared);
  };

  const getActiveFilterCount = () =>
    Object.entries(tempFilters || {}).filter(([key, value]) => {
      if (!showDestination && key === "destination") return false;
      return Boolean(value);
    }).length;

  const hasPriceFilter =
    (tempFilters.price_from && Number(tempFilters.price_from) > PRICE_MIN) ||
    (tempFilters.price_to && Number(tempFilters.price_to) < PRICE_MAX);

  const FilterContent = () => (
    <div className="space-y-5">
      <section className="space-y-3">
        <FilterField
          icon="fi fi-rr-umbrella-beach"
          label="Tour type"
          showClear={Boolean(tempFilters.tour_type)}
          onClear={() => patchFilters({ tour_type: "" })}
        >
          <div className="flex flex-wrap gap-1.5">
            {TOUR_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  patchFilters({
                    tour_type:
                      tempFilters.tour_type === option.value ? "" : option.value,
                  })
                }
                className={pillClass(tempFilters.tour_type === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterField>
      </section>

      <div className="border-t border-gray-100" />

      <section>
        <FilterField
          icon="fi fi-rr-calendar"
          label="Number of days"
          showClear={Boolean(tempFilters.duration)}
          onClear={() => patchFilters({ duration: "" })}
        >
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={tempFilters.duration || ""}
            onChange={(event) =>
              patchFilters({
                duration:
                  event.target.value === ""
                    ? ""
                    : String(Math.max(1, parseInt(event.target.value, 10) || 1)),
              })
            }
            placeholder="Any duration"
            className={getSelectClass(Boolean(tempFilters.duration))}
          />
        </FilterField>
      </section>

      <div className="border-t border-gray-100" />

      <section>
        <FilterField
          icon="fi fi-rr-indian-rupee-sign"
          label="Price range"
          showClear={hasPriceFilter}
          onClear={() => patchFilters({ price_from: "", price_to: "" })}
        >
          <div className="px-0.5 pt-1">
            <RangeSlider
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={1000}
              initialValue={[
                parseInt(tempFilters.price_from, 10) || PRICE_MIN,
                parseInt(tempFilters.price_to, 10) || PRICE_MAX,
              ]}
              onChange={(value) =>
                patchFilters({
                  price_from: value[0] === PRICE_MIN ? "" : String(value[0]),
                  price_to: value[1] === PRICE_MAX ? "" : String(value[1]),
                })
              }
              formatDisplay={(value) => {
                if (!value || value.length !== 2) return "Any price";
                if (value[0] === PRICE_MIN && value[1] === PRICE_MAX) return "Any price";
                if (value[0] === PRICE_MIN) return `Under ₹${value[1].toLocaleString()}`;
                if (value[1] === PRICE_MAX) return `₹${value[0].toLocaleString()}+`;
                return `₹${value[0].toLocaleString()} – ₹${value[1].toLocaleString()}`;
              }}
              title="Price range"
            />
            <div className="mt-2 flex justify-between text-[10px] font-medium text-gray-400">
              <span>₹1,000</span>
              <span>₹50,000+</span>
            </div>
          </div>
        </FilterField>
      </section>

      <div className="border-t border-gray-100" />

      <section className="space-y-3">
        <FilterField icon="fi fi-rr-users" label="Suitable for">
          <select
            value={tempFilters.suitable_id || ""}
            onChange={(e) => patchFilters({ suitable_id: e.target.value })}
            disabled={suitableForLoading}
            className={getSelectClass(Boolean(tempFilters.suitable_id))}
          >
            <option value="">All groups</option>
            {suitableForOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField icon="fi fi-rr-sort" label="Sort by">
          <select
            value={tempFilters.sort_by_price || ""}
            onChange={(e) => patchFilters({ sort_by_price: e.target.value })}
            className={getSelectClass(Boolean(tempFilters.sort_by_price))}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value || "default"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>

        {showDestination ? (
          <FilterField icon="fi fi-rr-map-marker" label="Destination">
            <select
              value={tempFilters.destination || ""}
              onChange={(e) => patchFilters({ destination: e.target.value })}
              className={getSelectClass(Boolean(tempFilters.destination))}
            >
              <option value="">All destinations</option>
              {destinationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>
        ) : null}
      </section>
    </div>
  );

  const activeCount = getActiveFilterCount();

  if (layout === "mobile") {
    return (
      <div className="space-y-5">
        <FilterContent />
        <FilterMobileFooter onClearAll={clearAllFilters} onClose={() => onClose?.()} />
      </div>
    );
  }

  if (layout === "sidebar") {
    return (
      <FilterSidebarShell activeCount={activeCount} onClearAll={clearAllFilters}>
        <FilterContent />
      </FilterSidebarShell>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3.5">
        <span className="text-sm font-semibold text-gray-900">Filters</span>
      </div>
      <div className="px-4 py-4">
        <FilterContent />
      </div>
    </div>
  );
};

export default PackageFilters;
