"use client";

import Popup from "./Popup";
import Autocomplete from "react-google-autocomplete";
import { useEffect, useState } from "react";

export default function LocationSearchPopup({
  isOpen,
  onClose,
  onPlaceSelected,
  googleApiKey,
  title,
  initialValue = "",
  onClear,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [inputValue, setInputValue] = useState(initialValue);

  // Function to get state name from coordinates using Google Geocoding API
  const getStateFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
      );
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error("Failed to get location details");
      }

      // Find the state component from address components
      const stateComponent = data.results[0]?.address_components.find(
        (component) => component.types.includes("administrative_area_level_1")
      );

      if (!stateComponent) {
        throw new Error("State not found");
      }

      return {
        name: stateComponent.long_name,
        formattedAddress: data.results[0]?.formatted_address,
        location: {
          lat: latitude,
          lng: longitude,
        },
      };
    } catch (error) {
      console.error("Error getting state:", error);
      throw error;
    }
  };

  // Function to handle auto location detection
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

          // Create a place object similar to what Google Places Autocomplete returns
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

          onPlaceSelected(placeObject);
          setIsDetectingLocation(false);
        } catch (error) {
          setLocationError(
            "Could not determine your location. Please try again."
          );
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        let errorMessage = "Could not detect your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Please allow location access to use this feature.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred.";
        }
        setLocationError(errorMessage);
        setIsDetectingLocation(false);
      }
    );
  };

  // Update input value when initialValue changes or popup opens
  useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue);
    }
  }, [isOpen, initialValue]);

  // Handle clear location
  const handleClear = () => {
    setInputValue("");
    if (onClear) {
      onClear();
    }
  };

  // Add custom styles for the Google Places Autocomplete dropdown
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .pac-container {
        border-radius: 16px !important;
        margin-top: 12px !important;
        padding: 4px !important;
        border: none !important;
        background: white !important;
        font-family: inherit !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
        position: fixed !important;
        transform: translateY(0) !important;
        max-width: calc(100% - 32px) !important;
        min-width: 200px !important;
        max-height: 360px !important;
        overflow-y: auto !important;
        z-index: 9999 !important;
      }
      .pac-container::-webkit-scrollbar {
        width: 4px !important;
      }
      .pac-container::-webkit-scrollbar-track {
        background: transparent !important;
      }
      .pac-container::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.1) !important;
        border-radius: 20px !important;
      }
      .pac-container:after {
        display: none !important;
      }
      .pac-item {
        padding: 14px 16px !important;
        cursor: pointer !important;
        border: none !important;
        border-bottom: 1px solid #f1f5f9 !important;
        margin: 0 !important;
        font-family: inherit !important;
        display: flex !important;
        align-items: center !important;
        line-height: 1.4 !important;
        transition: all 0.2s ease-in-out !important;
      }
      .pac-item:last-child {
        border-bottom: none !important;
      }
      .pac-item:hover {
        background: #f8fafc !important;
      }
      .pac-item:hover .pac-item-query,
      .pac-item:hover span {
        color: #f43f5e !important;
      }
      .pac-item-selected {
        background: #f8fafc !important;
      }
      .pac-item-selected .pac-item-query,
      .pac-item-selected span {
        color: #f43f5e !important;
      }
      .pac-icon {
        display: none !important;
      }
      .pac-item::before {
        display: none !important;
      }
      .pac-item-query {
        font-size: 14px !important;
        color: #0f172a !important;
        font-weight: 500 !important;
        padding-right: 4px !important;
        transition: color 0.2s ease-in-out !important;
      }
      .pac-matched {
        color: #f43f5e !important;
        font-weight: 600 !important;
      }
      .pac-item:hover .pac-matched {
        color: #f43f5e !important;
      }
      .pac-item span:not(.pac-item-query) {
        font-size: 13px !important;
        color: #64748b !important;
        opacity: 0.9 !important;
        transition: color 0.2s ease-in-out !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      // title={title}
      maxWidth="max-w-md"
      showCloseButton={true}
      draggable={true}
      pos="right"
      className="md:h-auto h-[75vh]"
    >
      <div className="space-y-6 p-4">
        {/* Search Section */}
        <div className="relative">
          <div className="px-2">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-11 h-11 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <i className="fi fi-rr-search text-white text-lg"></i>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <i className="fi fi-rr-marker text-primary-500 text-[10px]"></i>
                </div>
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold text-lg leading-none mb-1">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm">
                  Search cities or regions in India
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative bg-gray-50/80 rounded-2xl">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <i className="fi fi-rr-search text-gray-400 text-base"></i>
                </div>
                <Autocomplete
                  key={isOpen ? `autocomplete-${inputValue}` : "autocomplete"}
                  apiKey={googleApiKey}
                  onPlaceSelected={(place) => {
                    setInputValue(place.name || place.formatted_address);
                    onPlaceSelected(place);
                  }}
                  options={{
                    types: ["(regions)"],
                    componentRestrictions: { country: "in" },
                    fields: ["name", "formatted_address", "geometry"],
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter city or destination name..."
                  className={`block w-full h-12 bg-transparent rounded-2xl transition-all duration-200
                    pl-11 pr-24 text-[15px] text-gray-900 placeholder:text-gray-400 
                    focus:outline-none border border-transparent
                    ${isFocused ? "bg-white border-gray-200 shadow-sm" : ""}`}
                  defaultValue={inputValue}
                />
                <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                  {inputValue && (
                    <button
                      onClick={handleClear}
                      className="h-10 w-10 flex items-center justify-center text-gray-400 
                        hover:text-red-500 transition-colors rounded-xl
                        cursor-pointer hover:bg-red-50"
                      title="Clear location"
                    >
                      <i className="fi fi-rr-cross-small text-base"></i>
                    </button>
                  )}
                  <button
                    onClick={handleAutoDetectLocation}
                    disabled={isDetectingLocation}
                    className={`h-10 w-10 flex items-center justify-center text-gray-400 
                      hover:text-primary-500 transition-colors rounded-xl
                      ${
                        isDetectingLocation
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:bg-primary-50"
                      }`}
                    title="Use current location"
                  >
                    <i
                      className={`fi fi-rr-location-crosshairs text-base ${
                        isDetectingLocation ? "animate-spin" : ""
                      }`}
                    ></i>
                  </button>
                </div>
              </div>

              {locationError && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100/50">
                  <p className="text-sm text-red-600 flex items-start gap-2.5">
                    <i className="fi fi-rr-exclamation text-base mt-0.5"></i>
                    <span>{locationError}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mx-2 px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="fi fi-rr-bulb text-white text-xs"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Choose your starting point to find the best trips available from
                your location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
}
