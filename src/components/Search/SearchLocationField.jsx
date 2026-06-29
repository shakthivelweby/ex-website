"use client";

import LocationSearchInput from "../LocationSearchInput";

function normalizeCoord(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  return Number.isFinite(num) ? String(num) : "";
}

export default function SearchLocationField({
  location = "",
  latitude = "",
  longitude = "",
  destinations = [],
  onChange,
  placeholder = "Enter city or destination name...",
}) {
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

  const handleDestinationPick = (destination) => {
    applyLocation({
      location: destination.name,
      latitude: destination.latitude,
      longitude: destination.longitude,
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
    <div className="space-y-2.5">
      <LocationSearchInput
        value={location}
        onPlaceSelected={handlePlaceSelected}
        onClear={clearLocation}
        googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        placeholder={placeholder}
        repositionDropdown
      />

      {destinations.length > 0 ? (
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
                  onClick={() => handleDestinationPick(destination)}
                  className={`inline-flex max-w-full items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
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
    </div>
  );
}
