"use client";

import { forwardRef } from "react";
import { createPortal } from "react-dom";

export const DETAIL_DATEPICKER_POPPER_CLASS = "detail-booking-datepicker-popper";

/** Render calendar popper on document.body so sticky/overflow-hidden sidebars do not clip it. */
export function detailDatePickerPopperContainer({ children }) {
  if (typeof document === "undefined") return children;
  return createPortal(children, document.body);
}

export const detailDatePickerPopperProps = {
  popperContainer: detailDatePickerPopperContainer,
  popperClassName: DETAIL_DATEPICKER_POPPER_CLASS,
  showPopperArrow: false,
};

export const DetailDatePickerTrigger = forwardRef(function DetailDatePickerTrigger(
  { value, onClick },
  ref
) {
  return (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className="fi-box h-9 w-9 shrink-0 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100"
      aria-label={value ? `Change date, currently ${value}` : "Choose visit date"}
    >
      <i className="fi fi-rr-calendar text-sm" aria-hidden="true" />
    </button>
  );
});
