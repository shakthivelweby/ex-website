"use client";

import { useEffect, useRef, useState } from "react";

const ensureGooglePlacesScript = async (googleApiKey) => {
  if (typeof window === "undefined") return false;
  if (window.google?.maps?.places) return true;
  if (!googleApiKey) return false;

  const existing = document.querySelector('script[data-ew-google-places="1"]');
  if (existing) {
    await new Promise((resolve) => {
      if (window.google?.maps?.places) return resolve(true);
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      setTimeout(() => resolve(false), 12000);
    });
    return Boolean(window.google?.maps?.places);
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
    googleApiKey
  )}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.setAttribute("data-ew-google-places", "1");
  document.head.appendChild(script);

  await new Promise((resolve) => {
    script.addEventListener("load", () => resolve(true), { once: true });
    script.addEventListener("error", () => resolve(false), { once: true });
    setTimeout(() => resolve(false), 12000);
  });

  return Boolean(window.google?.maps?.places);
};

export default function LocationSearchInput({
  value = "",
  onPlaceSelected,
  onClear,
  googleApiKey,
  placeholder = "Enter city or destination name...",
  className = "",
  repositionDropdown = false,
  variant = "default",
}) {
  const [inputValue, setInputValue] = useState(value);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const onPlaceSelectedRef = useRef(onPlaceSelected);

  useEffect(() => {
    onPlaceSelectedRef.current = onPlaceSelected;
  }, [onPlaceSelected]);

  useEffect(() => {
    setInputValue(value);
    if (inputRef.current && inputRef.current.value !== (value || "")) {
      inputRef.current.value = value || "";
    }
  }, [value]);

  const repositionPacDropdown = () => {
    if (!repositionDropdown || !inputRef.current) return;
    const pac = document.querySelector(".pac-container");
    if (!pac) return;
    const rect = inputRef.current.getBoundingClientRect();
    pac.style.position = "fixed";
    pac.style.top = `${rect.bottom + 4}px`;
    pac.style.left = `${rect.left}px`;
    pac.style.width = `${rect.width}px`;
    pac.style.zIndex = "100000";
  };

  useEffect(() => {
    if (!repositionDropdown) return undefined;

    const handleReposition = () => repositionPacDropdown();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    const observer = new MutationObserver(() => {
      repositionPacDropdown();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
      observer.disconnect();
    };
  }, [repositionDropdown]);

  const getStateFromCoords = async (latitude, longitude) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
    );
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error("Failed to get location details");
    }

    const stateComponent = data.results[0]?.address_components.find((component) =>
      component.types.includes("administrative_area_level_1")
    );

    if (!stateComponent) {
      throw new Error("State not found");
    }

    return {
      name: stateComponent.long_name,
      formattedAddress: data.results[0]?.formatted_address,
      location: { lat: latitude, lng: longitude },
    };
  };

  const handleAutoDetectLocation = () => {
    setIsDetectingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const stateInfo = await getStateFromCoords(
            position.coords.latitude,
            position.coords.longitude
          );

          const placeObject = {
            name: stateInfo.name,
            formatted_address: stateInfo.formattedAddress,
            geometry: {
              location: {
                lat: () => stateInfo.location.lat,
                lng: () => stateInfo.location.lng,
              },
            },
          };

          const label = placeObject.name || placeObject.formatted_address || "";
          setInputValue(label);
          onPlaceSelectedRef.current?.(placeObject);
          setIsDetectingLocation(false);
        } catch {
          setLocationError("Could not determine your location. Please try again.");
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        let errorMessage = "Could not detect your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Please allow location access to use this feature.";
        }
        setLocationError(errorMessage);
        setIsDetectingLocation(false);
      }
    );
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const ok = await ensureGooglePlacesScript(googleApiKey);
      if (cancelled || !ok) return;

      const el = inputRef.current;
      if (!el || !(el instanceof HTMLInputElement)) return;

      try {
        const ac = new window.google.maps.places.Autocomplete(el, {
          types: ["geocode"],
          componentRestrictions: { country: "in" },
          fields: ["name", "formatted_address", "geometry", "vicinity"],
        });
        autocompleteRef.current = ac;
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          if (!place?.geometry?.location) return;
          const label = place.name || place.formatted_address || "";
          setInputValue(label);
          onPlaceSelectedRef.current?.(place);
        });
        el.addEventListener("focus", repositionPacDropdown);
      } catch {
        // Autocomplete init failed; manual entry still works
      }
    };

    run();
    return () => {
      cancelled = true;
      const el = inputRef.current;
      if (el) {
        el.removeEventListener("focus", repositionPacDropdown);
      }
      autocompleteRef.current = null;
    };
  }, [googleApiKey, repositionDropdown]);

  useEffect(() => {
    if (document.querySelector("style[data-ew-pac-styles]")) return;

    const style = document.createElement("style");
    style.setAttribute("data-ew-pac-styles", "1");
    style.textContent = `
      .pac-container {
        border-radius: 12px !important;
        margin-top: 8px !important;
        padding: 4px !important;
        border: 1px solid #e5e7eb !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        z-index: 99999 !important;
      }
      .pac-item {
        padding: 10px 12px !important;
        cursor: pointer !important;
        font-family: inherit !important;
      }
      .pac-item:hover { background: #f8fafc !important; }
      .pac-icon { display: none !important; }
    `;
    document.head.appendChild(style);
  }, []);

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setInputValue("");
    setLocationError(null);
    onClear?.();
  };

  const isHero = variant === "hero";

  const inputClassName = isHero
    ? "block w-full border-0 bg-transparent p-0 pr-14 text-sm font-medium leading-tight text-[#222222] placeholder:text-[#B0B0B0] focus:outline-none focus:ring-0"
    : `block w-full h-11 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-20 text-sm text-gray-900
            placeholder:text-gray-400 focus:outline-none focus:border-primary-300 focus:bg-white transition-all`;

  return (
    <div className={className}>
      <div className="relative">
        {!isHero ? (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className="fi fi-rr-marker text-gray-400 text-sm" />
          </div>
        ) : null}
        <input
          ref={inputRef}
          type="text"
          defaultValue={value}
          onInput={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className={inputClassName}
        />
        <div
          className={`absolute inset-y-0 right-0 flex items-center gap-0.5 ${
            isHero ? "-right-1" : "pr-2"
          }`}
        >
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
              title="Clear location"
            >
              <i className="fi fi-rr-cross-small text-sm" />
            </button>
          )}
          <button
            type="button"
            onClick={handleAutoDetectLocation}
            disabled={isDetectingLocation}
            className={`h-8 w-8 flex items-center justify-center text-gray-400 rounded-lg
              ${isDetectingLocation ? "opacity-50 cursor-not-allowed" : "hover:text-primary-500 hover:bg-primary-50"}`}
            title="Use current location"
          >
            <i
              className={`fi fi-rr-location-crosshairs text-sm ${
                isDetectingLocation ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>
      {locationError && !isHero ? (
        <p className="mt-1.5 text-xs text-red-600 flex items-start gap-1.5">
          <i className="fi fi-rr-exclamation text-sm mt-0.5" />
          {locationError}
        </p>
      ) : null}
    </div>
  );
}
