"use client";

import { useEffect, useRef, useState } from "react";
import LocationSearchPopup from "../LocationSearchPopup";
import RangeSlider from "../RangeSlider/RangeSlider";
import DateRangeSearchField from "../Search/DateRangeSearchField";
import { getRentalSubCategories } from "@/app/rentals/service";
import { isVehicleFormType } from "@/app/rentals/rentalCategoryTypeUtils";
import {
  FilterField,
  FilterMobileFooter,
  FilterSidebarShell,
  getSelectClass,
  inputClass,
  pillClass,
} from "../ListingFilters/shared";

const FUEL_TYPE_OPTIONS = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid", "Other"];
const TRANSMISSION_OPTIONS = ["Manual", "Automatic", "AMT", "CVT", "DCT", "Other"];
const SEAT_OPTIONS = ["2", "4", "5", "6", "7", "8"];

const RentalFilters = ({
  initialFilters,
  onFilterChange,
  categories,
  layout = "inline",
  onClose,
}) => {
  const [tempFilters, setTempFilters] = useState(initialFilters || {});
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const prevInitialFiltersRef = useRef();
  const subCategoriesFetchIdRef = useRef(0);

  useEffect(() => {
    const prevFilters = prevInitialFiltersRef.current;
    const filtersChanged = JSON.stringify(initialFilters) !== JSON.stringify(prevFilters);
    if (filtersChanged) {
      prevInitialFiltersRef.current = initialFilters;
      setTempFilters(initialFilters || {});
    }
  }, [initialFilters]);

  useEffect(() => {
    const formType = String(tempFilters?.form_type || "").trim();
    const categorySlug = String(tempFilters?.category || "").trim();
    const params = categorySlug
      ? { category: categorySlug }
      : formType
      ? { form_type: formType }
      : {};
    const fetchId = ++subCategoriesFetchIdRef.current;

    (async () => {
      const res = await getRentalSubCategories(params);
      if (fetchId !== subCategoriesFetchIdRef.current) return;
      setSubCategories(Array.isArray(res?.data) ? res.data : []);
    })();
  }, [tempFilters?.form_type, tempFilters?.category]);

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
    const hadCategoryScope = Boolean(
      String(tempFilters?.form_type || "").trim() || String(tempFilters?.category || "").trim()
    );
    const clearedFilters = {
      date_from: "",
      date_to: "",
      location: "",
      category: "",
      form_type: "",
      sub_category: "",
      transmission: "",
      fuel_type: "",
      seats: "",
      rating: "",
      price_from: "",
      price_to: "",
      longitude: "",
      latitude: "",
      search: "",
    };
    setTempFilters(clearedFilters);
    onFilterChange(clearedFilters);
    if (!hadCategoryScope) {
      const fetchId = ++subCategoriesFetchIdRef.current;
      getRentalSubCategories({}).then((res) => {
        if (fetchId !== subCategoriesFetchIdRef.current) return;
        setSubCategories(Array.isArray(res?.data) ? res.data : []);
      });
    }
  };

  const getActiveFilterCount = () =>
    Object.entries(tempFilters || {}).filter(([key, value]) => {
      if (key === "date" || key === "per_page") return false;
      return Boolean(value);
    }).length;

  const activeCount = getActiveFilterCount();

  const showVehicleFilters = isVehicleFormType(tempFilters?.form_type);

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
          showClear={Boolean(tempFilters.date_from || tempFilters.date_to)}
          onClear={() => patchFilters({ date_from: "", date_to: "" })}
        >
          <DateRangeSearchField
            embedded
            emptyLabel="Pick check-in & check-out"
            dateFrom={tempFilters.date_from}
            dateTo={tempFilters.date_to}
            onChange={({ dateFrom, dateTo }) =>
              patchFilters({ date_from: dateFrom, date_to: dateTo })
            }
          />
        </FilterField>
      </section>

      <div className="border-t border-gray-100" />

      <section className="space-y-3">
        <p className="text-xs font-semibold text-gray-800">Category</p>
        <FilterField icon="fi fi-rr-apps" label="Category">
          <select
            value={tempFilters.category || ""}
            onChange={(e) => {
              const category = e.target.value;
              if (!category) {
                patchFilters({
                  category: "",
                  sub_category: "",
                  form_type: "",
                  transmission: "",
                  fuel_type: "",
                  seats: "",
                });
                return;
              }
              const cat = (categories || []).find((c) => String(c.slug) === category);
              const categoryFormType = String(cat?.form_type || "").trim().toLowerCase();
              const isVehicle = isVehicleFormType(categoryFormType);
              patchFilters({
                category,
                sub_category: "",
                form_type: categoryFormType,
                ...(isVehicle ? {} : { transmission: "", fuel_type: "", seats: "" }),
              });
            }}
            className={getSelectClass(Boolean(tempFilters.category))}
          >
            <option value="">All categories</option>
            {(categories || []).map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField icon="fi fi-rr-tags" label="Sub category">
          <select
            value={tempFilters.sub_category || ""}
            onChange={(e) => patchFilters({ sub_category: e.target.value })}
            className={getSelectClass(Boolean(tempFilters.sub_category))}
          >
            <option value="">All sub categories</option>
            {subCategories.map((sub) => (
              <option key={sub.id} value={sub.slug}>
                {sub.name}
              </option>
            ))}
          </select>
        </FilterField>
      </section>

      {showVehicleFilters ? (
        <>
          <div className="border-t border-gray-100" />
          <section className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
            <p className="text-xs font-semibold text-gray-800">Vehicle specs</p>
            <div className="space-y-3">
              <FilterField icon="fi fi-rr-gas-pump" label="Fuel">
                <select
                  value={tempFilters.fuel_type || ""}
                  onChange={(e) => patchFilters({ fuel_type: e.target.value })}
                  className={getSelectClass(Boolean(tempFilters.fuel_type))}
                >
                  <option value="">Any fuel type</option>
                  {FUEL_TYPE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField icon="fi fi-rr-settings" label="Transmission">
                <select
                  value={tempFilters.transmission || ""}
                  onChange={(e) => patchFilters({ transmission: e.target.value })}
                  className={getSelectClass(Boolean(tempFilters.transmission))}
                >
                  <option value="">Any transmission</option>
                  {TRANSMISSION_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField icon="fi fi-rr-users" label="Seats">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => patchFilters({ seats: "" })}
                    className={pillClass(!tempFilters.seats)}
                  >
                    Any
                  </button>
                  {SEAT_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => patchFilters({ seats: s })}
                      className={pillClass(tempFilters.seats === s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </FilterField>
            </div>
          </section>
        </>
      ) : null}

      <div className="border-t border-gray-100" />

      <section>
        <FilterField
          icon="fi fi-rr-indian-rupee-sign"
          label="Price per day"
          showClear={hasPriceFilter}
          onClear={() => patchFilters({ price_from: "", price_to: "" })}
        >
          <div className="px-0.5 pt-1">
            <RangeSlider
              min={0}
              max={1000}
              step={50}
              initialValue={[
                parseInt(tempFilters.price_from, 10) || 0,
                parseInt(tempFilters.price_to, 10) || 1000,
              ]}
              onChange={(value) => patchFilters({ price_from: value[0], price_to: value[1] })}
              formatDisplay={(value) => {
                if (!value || value.length !== 2) return "Any price";
                if (value[0] === 0 && value[1] === 1000) return "Any price";
                if (value[0] === 0) return `Under ₹${value[1]}`;
                if (value[1] === 1000) return `₹${value[0]}+`;
                return `₹${value[0]} – ₹${value[1]}`;
              }}
              title="Price per day"
            />
            <div className="mt-2 flex justify-between text-[10px] font-medium text-gray-400">
              <span>₹0</span>
              <span>₹1000+</span>
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
        <div className="flex items-center gap-2">
          <i className="fi fi-rr-settings-sliders text-gray-400" aria-hidden />
          <span className="text-sm font-semibold text-gray-900">Filters</span>
        </div>
      </div>
      <div className="px-4 py-4">
        <FilterContent />
      </div>
      {locationPopup}
    </div>
  );
};

export default RentalFilters;
