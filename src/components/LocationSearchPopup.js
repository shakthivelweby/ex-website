"use client";

import Popup from "./Popup";
import Autocomplete from "react-google-autocomplete";
import { useEffect, useState } from "react";

export default function LocationSearchPopup({ 
  isOpen, 
  onClose, 
  onPlaceSelected,
  googleApiKey,
  title
}) {
  const [isFocused, setIsFocused] = useState(false);

  // Add custom styles for the Google Places Autocomplete dropdown
  useEffect(() => {
    // Style the autocomplete dropdown
    const style = document.createElement('style');
    style.textContent = `
      .pac-container {
        border-radius: 8px !important;
        margin-top: 4px !important;
        padding: 4px !important;
        border: 1px solid #e5e7eb !important;
        background: white !important;
        font-family: inherit !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
        position: fixed !important;
        transform: translateY(0) !important;
        max-width: calc(100% - 32px) !important;
        min-width: 200px !important;
        max-height: 300px !important;
        overflow-y: auto !important;
        z-index: 9999 !important;
      }
      .pac-container::-webkit-scrollbar {
        width: 6px !important;
      }
      .pac-container::-webkit-scrollbar-track {
        background: transparent !important;
      }
      .pac-container::-webkit-scrollbar-thumb {
        background-color: #e5e7eb !important;
        border-radius: 20px !important;
      }
      .pac-container:after {
        display: none !important;
      }
      .pac-item {
        padding: 6px 8px !important;
        cursor: pointer !important;
        border: none !important;
        margin: 1px 0 !important;
        font-family: inherit !important;
        display: block !important;
        line-height: 1.3 !important;
        transition: all 0.15s ease-in-out !important;
        background: white !important;
      }
      .pac-item:hover {
        background: #f43f5e !important;
        color: white !important;
      }
      .pac-item:hover .pac-item-query,
      .pac-item:hover span {
        color: white !important;
      }
      .pac-item-selected {
        background: #f43f5e !important;
        color: white !important;
      }
      .pac-item-selected .pac-item-query,
      .pac-item-selected span {
        color: white !important;
      }
      .pac-icon {
        display: none !important;
      }
      .pac-item::before {
        display: none !important;
      }
      .pac-item-query {
        font-size: 13px !important;
        color: #111827 !important;
        font-weight: 500 !important;
        padding-right: 4px !important;
      }
      .pac-matched {
        color: #f43f5e !important;
        font-weight: 600 !important;
      }
      .pac-item:hover .pac-matched {
        color: white !important;
      }
      .pac-item span:not(.pac-item-query) {
        font-size: 11px !important;
        color: #6b7280 !important;
        opacity: 0.9 !important;
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
      title={title}
      maxWidth="max-w-md"
      showCloseButton={true}
    >
      <div className="space-y-3">
        <div className="relative">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <i className="fi fi-rr-search text-white text-sm"></i>
              </div>
              <div>
                <h3 className="text-gray-900 font-medium text-base leading-none mb-1">Find Location</h3>
                <p className="text-gray-500 text-xs">Search cities or regions in India</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <i className="fi fi-rr-marker text-primary-500 text-sm"></i>
              </div>
              <Autocomplete
                apiKey={googleApiKey}
                onPlaceSelected={onPlaceSelected}
                options={{
                  types: ['(regions)'],
                  componentRestrictions: { country: 'in' },
                  fields: ['name', 'formatted_address', 'geometry']
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter city or destination name..."
                className="block w-full h-9 rounded-lg bg-white border border-gray-200 
                  pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 
                  focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                  focus:outline-none transition-all duration-200"
                defaultValue=""
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Quick:</span>
              {['Kerala', 'Goa', 'Rajasthan'].map((place) => (
                <button
                  key={place}
                  onClick={() => {
                    const input = document.querySelector('.pac-target-input');
                    if (input) {
                      input.value = place;
                      input.focus();
                    }
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700
                    hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors duration-150"
                >
                  {place}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
} 