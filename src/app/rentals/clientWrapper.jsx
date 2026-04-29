"use client";

import RentalCard from "@/components/rentalCard";
import RentalFilters from "@/components/RentalFilters/RentalFilters";
import LocationSearchPopup from "@/components/LocationSearchPopup";
import Popup from "@/components/Popup";
import { useEffect, useState } from "react";
import { getRentals } from "./service";

const ClientWrapper = ({ searchParams: initialSearchParams, initialRentals, initialCategories }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [rentals, setRentals] = useState(initialRentals || []);
  const [loading, setLoading] = useState(false);

  const [initialFilters, setInitialFilters] = useState({
    date: initialSearchParams.date || "",
    location: initialSearchParams.location || "",
    category: initialSearchParams.category || "",
    sub_category: initialSearchParams.sub_category || "",
    transmission: initialSearchParams.transmission || "",
    fuel_type: initialSearchParams.fuel_type || "",
    rating: initialSearchParams.rating || "",
    price_from: initialSearchParams.price_from || "",
    price_to: initialSearchParams.price_to || "",
    longitude: initialSearchParams.longitude || "",
    latitude: initialSearchParams.latitude || "",
    search: initialSearchParams.search || "",
  });

  const updateURL = (newFilters) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const setOrDelete = (key, value) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };
    setOrDelete("date", newFilters.date);
    setOrDelete("location", newFilters.location);
    setOrDelete("category", newFilters.category);
    setOrDelete("sub_category", newFilters.sub_category);
    setOrDelete("transmission", newFilters.transmission);
    setOrDelete("fuel_type", newFilters.fuel_type);
    setOrDelete("rating", newFilters.rating);
    if (newFilters.price_from && newFilters.price_to) {
      params.set("price_from", newFilters.price_from);
      params.set("price_to", newFilters.price_to);
    } else {
      params.delete("price_from");
      params.delete("price_to");
    }
    setOrDelete("longitude", newFilters.longitude);
    setOrDelete("latitude", newFilters.latitude);
    setOrDelete("search", newFilters.search);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    if (!isFilterOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  };

  const handleFilterChange = async (newFilters) => {
    updateURL(newFilters);
    setInitialFilters(newFilters);
    try {
      setLoading(true);
      const res = await getRentals({ ...newFilters, per_page: 24 });
      setRentals(res?.data?.data || []);
    } catch (e) {
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelected = (place) => {
    if (!place) return;
    const locationName = place.name || place.formatted_address || "";
    const longitude =
      typeof place.geometry?.location?.lng === "function"
        ? place.geometry.location.lng()
        : place.geometry?.location?.lng;
    const latitude =
      typeof place.geometry?.location?.lat === "function"
        ? place.geometry.location.lat()
        : place.geometry?.location?.lat;

    const next = {
      ...initialFilters,
      location: locationName,
      longitude: longitude || "",
      latitude: latitude || "",
    };
    setIsLocationOpen(false);
    handleFilterChange(next);
  };

  return (
    <div className="container mx-auto px-4 pt-28 pb-10">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Rentals</h1>
      </div>

      {/* Mobile filter bar */}
      <div className="lg:hidden flex items-center gap-2 mb-4">
        <button
          onClick={toggleFilter}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium"
        >
          <i className="fi fi-rr-settings-sliders mr-2" />
          Filters
        </button>
        <button
          onClick={() => setIsLocationOpen(true)}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium"
        >
          <i className="fi fi-rr-marker" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar filters */}
        <div className="hidden lg:block lg:col-span-3">
          <RentalFilters
            initialFilters={initialFilters}
            onFilterChange={handleFilterChange}
            categories={initialCategories || []}
            locations={[]}
            layout="sidebar"
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="text-gray-500">Loading rentals...</div>
          ) : rentals.length === 0 ? (
            <div className="text-gray-500">No rentals found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentals.map((r) => (
                <RentalCard
                  key={r.id}
                  rental={r}
                  userCoords={{
                    latitude: initialFilters.latitude,
                    longitude: initialFilters.longitude,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter popup */}
      <Popup
        show={isFilterOpen}
        onClose={() => {
          setIsFilterOpen(false);
          document.body.style.overflow = "unset";
        }}
        title="Filters"
        className="w-full h-full md:w-[420px] md:h-auto md:rounded-2xl"
      >
        <div className="p-4">
          <RentalFilters
            initialFilters={initialFilters}
            onFilterChange={handleFilterChange}
            categories={initialCategories || []}
            locations={[]}
            layout="mobile"
            onClose={() => {
              setIsFilterOpen(false);
              document.body.style.overflow = "unset";
            }}
          />
        </div>
      </Popup>

      {/* Location popup */}
      <LocationSearchPopup
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        onPlaceSelected={handlePlaceSelected}
      />
    </div>
  );
};

export default ClientWrapper;

