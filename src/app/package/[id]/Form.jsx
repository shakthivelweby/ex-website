"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Form = ({ packageData, selectedStayCategory }) => {
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);

  const { total_days, total_nights } = packageData.data;

  return (
    <div className="sticky top-6 bg-[#f7f7f7] rounded-xl p-3  shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-3xl font-bold text-gray-800">₹</span>
          <span className="text-gray-700 text-sm font-medium ml-1">
            / Person
          </span>
        </div>
        <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
          {total_nights} N &nbsp; {total_days} D
        </div>
      </div>

      {/* Stay Category Badge */}

      {/* Starting Date */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Starting Date
        </label>
        <div className="relative">
          <DatePicker
            minDate={new Date()} // Prevents selecting dates in the past
            placeholderText="Choose Date"
            className="w-full h-11 px-4 pr-10 border text-gray-800 border-gray-300 bg-white rounded-full focus:outline-none focus:ring-none  focus:border-primary-500 cursor-pointer"
            dateFormat="dd/MM/yyyy"
            // inline
            popperPlacement="bottom-start"
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [0, 2],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true,
                },
              },
            ]}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
            <i className="fi fi-rr-calendar text-lg"></i>
          </div>
        </div>
      </div>

      {/* No. of Tickets */}
      <div className="mb-6 bg-white rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-800 mb-4">
          No. of Tickets
        </label>

        {/* Adults */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
          <div>
            <p className="font-medium text-gray-800">Adult</p>
            <p className="text-xs text-gray-500">Over 18+</p>
          </div>
          <div className="flex items-center">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
              onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
            >
              <i className="fi fi-rr-minus text-xs"></i>
            </button>
            <span className="mx-4 w-6 text-center text-gray-800">
              {adultCount}
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
              onClick={() => setAdultCount(adultCount + 1)}
            >
              <i className="fi fi-rr-plus text-xs"></i>
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
          <div>
            <p className="font-medium text-gray-800">Child</p>
            <p className="text-xs text-gray-500">Ages 2-17</p>
          </div>
          <div className="flex items-center">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
              onClick={() => setChildCount(Math.max(0, childCount - 1))}
            >
              <i className="fi fi-rr-minus text-xs"></i>
            </button>
            <span className="mx-4 w-6 text-center text-gray-800">
              {childCount}
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
              onClick={() => setChildCount(childCount + 1)}
            >
              <i className="fi fi-rr-plus text-xs"></i>
            </button>
          </div>
        </div>

        {/* Infants */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Infants</p>
            <p className="text-xs text-gray-500">Under 2</p>
          </div>
          <div className="flex items-center">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
              onClick={() => setInfantCount(Math.max(0, infantCount - 1))}
            >
              <i className="fi fi-rr-minus text-xs"></i>
            </button>
            <span className="mx-4 w-6 text-center text-gray-800">
              {infantCount}
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
              onClick={() => setInfantCount(infantCount + 1)}
            >
              <i className="fi fi-rr-plus text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Book Now Button */}
      <button className="w-full h-12 bg-primary-600 text-white font-medium rounded-full flex items-center justify-center mb-3 hover:bg-primary-700 transition duration-150 cursor-pointer">
        Book Now
        <i className="fi fi-rr-arrow-right ml-2"></i>
      </button>

      {/* Download Itinerary */}
      <button className="w-full h-12 text-center text-gray-800 flex items-center bg-white rounded-full justify-center hover:text-gray-800 cursor-pointer">
        Download Itinerary
        <i className="fi fi-rr-download ml-2"></i>
      </button>
    </div>
  );
};

export default Form;
