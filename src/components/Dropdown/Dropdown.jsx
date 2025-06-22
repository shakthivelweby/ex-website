"use client";

import { useState, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";

const Dropdown = ({
  options = [],
  placeholder = "--",
  onChange,
  value = null,
  className = "",
}) => {
  const [selected, setSelected] = useState(value);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (option) => {
    setSelected(option);
    setSearchQuery(""); // Clear search when option is selected
    if (onChange) {
      onChange(option);
    }
  };

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine if a value has been set
  const hasValue = selected ? true : false;

  return (
    <div className={`relative ${className}`}>
      <Listbox value={selected} onChange={handleChange}>
        <div className="relative">
          <Listbox.Button
            className={`relative w-full h-10 cursor-pointer  ${
              hasValue
                ? "border-b-2 border-primary-500"
                : "border-b border-gray-300"
            }  py-2  pr-10 text-left   text-sm font-medium`}
          >
            <span
              className={`block truncate ${
                hasValue ? "text-gray-800 font-bold" : "text-gray-500"
              }`}
            >
              {selected ? selected.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <i className="fi fi-rr-angle-small-down text-gray-800 text-base"></i>
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-gray-200 focus:outline-none">
              {/* Search Input */}
              <div className="sticky top-0 bg-white px-3 py-2 border-b border-gray-100 z-20">
                <div className="relative">
                  <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Filtered Options */}
              {filteredOptions.map((option, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2.5 px-4 ${
                      active ? "bg-primary-50" : ""
                    }`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <div className="flex items-center justify-between">
                      <span
                        className={`block truncate ${
                          selected
                            ? "font-medium text-primary-600"
                            : "font-normal text-gray-800"
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="text-primary-600">
                          <i className="fi fi-rr-check text-base"></i>
                        </span>
                      ) : null}
                    </div>
                  )}
                </Listbox.Option>
              ))}

              {/* No results message */}
              {filteredOptions.length === 0 && (
                <div className="py-2.5 px-4 text-gray-500 text-center">
                  No results found
                </div>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default Dropdown;
