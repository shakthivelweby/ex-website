"use client";

import { useEffect, useRef, useState } from "react";
import LocationSearchPopup from "../LocationSearchPopup";
import RangeSlider from "../RangeSlider/RangeSlider";
import DateRangeSearchField from "../Search/DateRangeSearchField";
import {
  FilterField,
  FilterMobileFooter,
  FilterSidebarShell,
  getSelectClass,
  inputClass,
  pillClass,
} from "../ListingFilters/shared";

const EventFilters = ({
  initialFilters,
  onFilterChange,
  categories = [],
  languages = [],
  layout = "inline",
  onClose,
}) => {
  const [tempFilters, setTempFilters] = useState(initialFilters || {});
  const [isLocationOpen, setIsLocationOpen] = useState(false);
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

  const clearAllFilters = () => {
    const clearedFilters = {
      date_from: "",
      date_to: "",
      date: "",
      language: "",
      category: "",
      price_from: "",
      price_to: "",
      longitude: "",
      latitude: "",
      location: "",
    };
    setTempFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = () =>
    Object.entries(tempFilters || {}).filter(([key, value]) => {
      if (key === "date" || key === "per_page") return false;
      return Boolean(value);
    }).length;

  const hasPriceFilter =
    (tempFilters.price_from && Number(tempFilters.price_from) > 0) ||
    (tempFilters.price_to && Number(tempFilters.price_to) < 1000);

  const FilterContent = () => (
    <div className="space-y-5">
      <section className="space-y-3">
        <FilterField
          icon="fi fi-rr-marker"
          label="Location"
          showClear={Boolean(tempFilters.location)}
          onClear={() => patchFilters({ location: "", longitude: "", latitude: "" })}
        >
          <button
            type="button"
            onClick={() => setIsLocationOpen(true)}
            className={`${inputClass} flex items-center gap-2 text-left hover:border-gray-300`}
          >
            <span
              className={`truncate text-xs ${
                tempFilters.location ? "text-gray-800" : "text-[11px] text-gray-400"
              }`}
            >
              {tempFilters.location || "Search city or area"}
            </span>
            <i className="fi fi-rr-search ml-auto shrink-0 text-xs text-gray-400" aria-hidden />
          </button>
        </FilterField>

        <FilterField
          icon="fi fi-rr-calendar"
          label="Dates"
          showClear={Boolean(tempFilters.date_from || tempFilters.date_to || tempFilters.date)}
          onClear={() => patchFilters({ date_from: "", date_to: "", date: "" })}
        >
          <DateRangeSearchField
            embedded
            emptyLabel="Pick event dates"
            dateFrom={tempFilters.date_from || tempFilters.date}
            dateTo={tempFilters.date_to || tempFilters.date}
            onChange={({ dateFrom, dateTo }) =>
              patchFilters({ date_from: dateFrom, date_to: dateTo, date: dateFrom })
            }
          />
        </FilterField>
      </section>

      <div className="border-t border-gray-100" />

      <section className="space-y-3">
        <p className="text-xs font-semibold text-gray-800">Category</p>
        <FilterField icon="fi fi-rr-apps" label="Event category">
          <select
            value={tempFilters.category || ""}
            onChange={(e) => patchFilters({ category: e.target.value })}
            className={getSelectClass(Boolean(tempFilters.category))}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </FilterField>
      </section>

      {languages.length > 0 ? (
        <>
          <div className="border-t border-gray-100" />
          <section className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
            <p className="text-xs font-semibold text-gray-800">Language</p>
            <FilterField icon="fi fi-rr-comments" label="Show language">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => patchFilters({ language: "" })}
                  className={pillClass(!tempFilters.language)}
                >
                  Any
                </button>
                {languages.map((language) => (
                  <button
                    key={language.id}
                    type="button"
                    onClick={() =>
                      patchFilters({
                        language: tempFilters.language === language.slug ? "" : language.slug,
                      })
                    }
                    className={pillClass(tempFilters.language === language.slug)}
                  >
                    {language.name}
                  </button>
                ))}
              </div>
            </FilterField>
          </section>
        </>
      ) : null}

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
              min={0}
              max={5000}
              step={100}
              initialValue={[
                parseInt(tempFilters.price_from, 10) || 0,
                parseInt(tempFilters.price_to, 10) || 5000,
              ]}
              onChange={(value) => patchFilters({ price_from: value[0], price_to: value[1] })}
              formatDisplay={(value) => {
                if (!value || value.length !== 2) return "Any price";
                if (value[0] === 0 && value[1] === 5000) return "Any price";
                if (value[0] === 0) return `Under ₹${value[1]}`;
                if (value[1] === 5000) return `₹${value[0]}+`;
                return `₹${value[0]} – ₹${value[1]}`;
              }}
              title="Price range"
            />
            <div className="mt-2 flex justify-between text-[10px] font-medium text-gray-400">
              <span>₹0</span>
              <span>₹5000+</span>
            </div>
          </div>
        </FilterField>
      </section>
    </div>
  );

  const locationPopup = (
    <LocationSearchPopup
      isOpen={isLocationOpen}
      onClose={() => setIsLocationOpen(false)}
      onPlaceSelected={handlePlaceSelected}
      googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      title="Choose location"
    />
  );

  const activeCount = getActiveFilterCount();

  if (layout === "mobile") {
    return (
      <div className="space-y-5">
        <FilterContent />
        <FilterMobileFooter onClearAll={clearAllFilters} onClose={() => onClose?.()} />
        {locationPopup}
      </div>
    );
  }

  if (layout === "sidebar") {
    return (
      <>
        <FilterSidebarShell activeCount={activeCount} onClearAll={clearAllFilters}>
          <FilterContent />
        </FilterSidebarShell>
        {locationPopup}
      </>
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
      {locationPopup}
    </div>
  );
};

export default EventFilters;
