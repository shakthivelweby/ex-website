"use client";

import { useState } from "react";
import LocationSearchInput from "../LocationSearchInput";

function normalizeCoord(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  return Number.isFinite(num) ? String(num) : "";
}

async function geocodePlaceName(query, apiKey) {
  if (!apiKey || !query?.trim()) return null;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        query,
      )}&components=country:in&key=${encodeURIComponent(apiKey)}`,
    );
    const data = await response.json();
    if (data.status !== "OK" || !data.results?.[0]?.geometry?.location) {
      return null;
    }

    const { lat, lng } = data.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  } catch {
    return null;
  }
}

export default function SearchLocationField({
  location = "",
  latitude = "",
  longitude = "",
  destinations = [],
  onChange,
  placeholder = "Enter city or destination name...",
  variant = "default",
}) {
  const [isResolving, setIsResolving] = useState(false);
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const applyLocation = (next) => {
    onChange?.({
      location: next.location || "",
      latitude: normalizeCoord(next.latitude),
      longitude: normalizeCoord(next.longitude),
    });
  };

  const handlePlaceSelected = (place) => {
    if (!place?.geometry?.location) return;

    const lat =
      typeof place.geometry.location.lat === "function"
        ? place.geometry.location.lat()
        : place.geometry.location.lat;
    const lng =
      typeof place.geometry.location.lng === "function"
        ? place.geometry.location.lng()
        : place.geometry.location.lng;

    applyLocation({
      location: place.name || place.formatted_address || "",
      latitude: lat,
      longitude: lng,
    });
  };

  const handleDestinationPick = async (destination) => {
    let nextLatitude = destination.latitude;
    let nextLongitude = destination.longitude;

    if (
      (!normalizeCoord(nextLatitude) || !normalizeCoord(nextLongitude)) &&
      googleApiKey
    ) {
      setIsResolving(true);
      const geocoded = await geocodePlaceName(
        destination.state?.name
          ? `${destination.name}, ${destination.state.name}, India`
          : `${destination.name}, India`,
        googleApiKey,
      );
      setIsResolving(false);

      if (geocoded) {
        nextLatitude = geocoded.latitude;
        nextLongitude = geocoded.longitude;
      }
    }

    applyLocation({
      location: destination.name,
      latitude: nextLatitude,
      longitude: nextLongitude,
    });
  };

  const clearLocation = () => {
    applyLocation({ location: "", latitude: "", longitude: "" });
  };

  const selectedDestinationId = destinations.find(
    (dest) =>
      dest.name?.toLowerCase() === location?.toLowerCase() ||
      (normalizeCoord(dest.latitude) === normalizeCoord(latitude) &&
        normalizeCoord(dest.longitude) === normalizeCoord(longitude) &&
        latitude &&
        longitude),
  )?.id;

  return (
    <div className={variant === "hero" ? "" : "space-y-2.5"}>
      {variant !== "hero" && destinations.length > 0 ? (
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Popular destinations
          </p>
          <div className="flex flex-wrap gap-1.5">
            {destinations.map((destination) => {
              const selected = selectedDestinationId === destination.id;
              return (
                <button
                  key={destination.id}
                  type="button"
                  disabled={isResolving}
                  onClick={() => handleDestinationPick(destination)}
                  className={`inline-flex max-w-full items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all disabled:opacity-60 ${
                    selected
                      ? "bg-gray-900 text-white shadow-sm"
                      : "border border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  {selected ? <i className="fi fi-rr-check text-[10px]" aria-hidden /> : null}
                  <span className="truncate">{destination.name}</span>
                  {destination.state?.name ? (
                    <span
                      className={`truncate text-[10px] ${
                        selected ? "text-white/75" : "text-gray-400"
                      }`}
                    >
                      · {destination.state.name}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <LocationSearchInput
        variant={variant === "hero" ? "hero" : "default"}
        value={location}
        onPlaceSelected={handlePlaceSelected}
        onClear={clearLocation}
        googleApiKey={googleApiKey}
        placeholder={placeholder}
        repositionDropdown
      />

      {isResolving ? (
        <p className="text-[11px] text-gray-500">Resolving location…</p>
      ) : null}
    </div>
  );
}
