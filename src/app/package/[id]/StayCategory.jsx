"use client";

import { useState } from "react";

const StayCategory = ({
  stays,
  selectedStayCategory,
  setSelectedStayCategory,
}) => {
  return stays.map((stay) => {
    const { title, id } = stay.stay_category;
    return (
      <label
        key={id}
        className={`bg-[#F7F7F7] flex items-center border rounded-full py-2 px-2 text-sm cursor-pointer transition-all ${
          selectedStayCategory === id
            ? "border-gray-100 bg-[#dfeeff] text-[#0057C9] border-1 font-medium"
            : "border-gray-200 text-gray-700 hover:bg-gray-50 border-1 hover:border-gray-300 font-medium"
        }`}
      >
        <input
          type="radio"
          name="stayCategory"
          value={id}
          checked={selectedStayCategory === id}
          className="sr-only"
          onChange={() => setSelectedStayCategory(id)}
        />
        <div className="flex items-center">
          <div
            className={`w-4 h-4 rounded-full border flex-shrink-0 flex justify-center items-center mr-2 ${
              selectedStayCategory === id
                ? "border-[#0057C9] bg-white"
                : "border-gray-400 bg-white"
            }`}
          >
            {selectedStayCategory === id && (
              <div className="w-2 h-2 rounded-full bg-[#0057C9] m-auto flex items-center justify-center"></div>
            )}
          </div>
          <span
            className={`${
              selectedStayCategory === id ? "font-medium" : ""
            } whitespace-nowrap`}
          >
            {title}
          </span>
        </div>
      </label>
    );
  });
};

export default StayCategory;
