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

  const handleChange = (option) => {
    setSelected(option);
    if (onChange) {
      onChange(option);
    }
  };

  // Determine if a value has been set
  const hasValue = selected ? true : false;
  console.log("selected", hasValue);

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
              {options.map((option, index) => (
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
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default Dropdown;
