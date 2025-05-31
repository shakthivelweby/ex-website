"use client";
import { useState } from "react";

export default function Accordion({
  title,
  children,
  defaultOpen = true,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`mb-2 border bg-[#F7F7F7] border-gray-100 rounded-2xl overflow-hidden ${className}`}
    >
      <div
        className="px-3 py-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-base font-medium text-gray-900 m-0">{title}</h3>
        <i
          className={`bg-white p-2 rounded-full flex items-center justify-center fi fi-rr-angle-small-${
            isOpen ? "up" : "down"
          } transition-transform`}
        ></i>
      </div>

      {/* SEO-friendly: render always, hide/show with CSS only */}
      <div
        className={`mx-2 mb-2 p-4 bg-white rounded-2xl transition-all duration-300 ease-in-out ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
