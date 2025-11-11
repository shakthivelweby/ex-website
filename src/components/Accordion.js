"use client";
import { useState, useEffect } from "react";

export default function Accordion({
  title,
  children,
  defaultOpen = true,
  className = "",
  isControlled = false,
  isOpen: controlledIsOpen = false,
  onToggle,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Sync with controlled state if provided
  useEffect(() => {
    if (isControlled) {
      setIsOpen(controlledIsOpen);
    }
  }, [isControlled, controlledIsOpen]);

  const handleToggle = () => {
    if (isControlled && onToggle) {
      onToggle(!isOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={`border bg-[#F7F7F7] border-gray-100 rounded-2xl overflow-hidden ${className}`}
    >
      <div
        className="px-3 py-3 flex items-center justify-between cursor-pointer"
        onClick={handleToggle}
      >
        <div className="flex-1">{typeof title === 'string' ? <h3 className="text-sm font-medium tracking-wide text-gray-800 m-0">{title}</h3> : title}</div>
        <i
          className={`bg-white p-2 text-gray-700 rounded-full flex items-start justify-center ml-3 fi fi-rr-angle-small-${
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
