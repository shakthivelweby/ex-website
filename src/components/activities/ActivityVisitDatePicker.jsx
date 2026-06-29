"use client";

import { useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { offset, flip, shift } from "@floating-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isActivityCloseoutDate, normalizeCloseoutDates } from "@/utils/closeoutUtils";
import { getSeasonalPriceForTicket, toActivityVisitYmd } from "@/utils/activityTicketPricing";

function isDateInRange(ymd, start, end) {
  if (!ymd || !start || !end) return false;
  return ymd >= start && ymd <= end;
}

export function renderActivityCalendarHeader({
  date,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) {
  return (
    <div className="pkg-cal-header">
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          type="button"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30"
          aria-label="Previous month"
        >
          <i className="fi fi-rr-angle-left text-sm" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {date.toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30"
          aria-label="Next month"
        >
          <i className="fi fi-rr-angle-right text-sm" />
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5 px-1 pb-2">
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
          Book
        </span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
          Season
        </span>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600">
          N/A
        </span>
      </div>
    </div>
  );
}

function DatePickerPopperContainer({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

const activityDatePickerPopperModifiers = [
  offset(8),
  flip({
    fallbackPlacements: ["bottom-start", "bottom-end"],
    padding: { top: 120 },
  }),
  shift({ padding: { top: 120, bottom: 16, left: 8, right: 8 } }),
];

export function useActivityVisitCalendarProps({
  activityDetails,
  selectedTicketId = null,
  selected,
  onChange,
}) {
  const closeoutDates = useMemo(
    () => normalizeCloseoutDates(activityDetails?.closeout_dates),
    [activityDetails?.closeout_dates]
  );

  const isCalendarDateBlocked = useCallback(
    (date) => {
      const ymd = toActivityVisitYmd(date);
      return isActivityCloseoutDate(closeoutDates, ymd, date);
    },
    [closeoutDates]
  );

  const isSeasonalCalendarDay = useCallback(
    (date) => {
      const ymd = toActivityVisitYmd(date);
      const seasonal = activityDetails?.seasonal_dates;
      if (!Array.isArray(seasonal) || !ymd || isCalendarDateBlocked(date)) return false;
      if (selectedTicketId) {
        return Boolean(getSeasonalPriceForTicket(seasonal, selectedTicketId, ymd));
      }
      return seasonal.some((row) => {
        const start = row.start_date ?? row.startDate;
        const end = row.end_date ?? row.endDate;
        return isDateInRange(ymd, start, end);
      });
    },
    [activityDetails?.seasonal_dates, selectedTicketId, isCalendarDateBlocked]
  );

  const getCalendarDayClassName = useCallback(
    (date) => {
      if (isCalendarDateBlocked(date)) return "pkg-day--unavailable";
      if (isSeasonalCalendarDay(date)) return "pkg-day--enquiry";
      return "pkg-day--bookable";
    },
    [isCalendarDateBlocked, isSeasonalCalendarDay]
  );

  return useMemo(
    () => ({
      selected,
      onChange,
      dateFormat: "dd/MM/yyyy",
      minDate: new Date(),
      filterDate: (date) => !isCalendarDateBlocked(date),
      renderDayContents: (day) => <span className="pkg-day-num">{day}</span>,
      renderCustomHeader: renderActivityCalendarHeader,
      dayClassName: getCalendarDayClassName,
      calendarClassName: "package-booking-datepicker",
    }),
    [selected, onChange, isCalendarDateBlocked, getCalendarDayClassName]
  );
}

export default function ActivityVisitDatePicker({
  activityDetails,
  selectedTicketId = null,
  selected,
  onChange,
  inline = false,
  className = "",
  placeholderText = "Choose date",
}) {
  const calendarPickerProps = useActivityVisitCalendarProps({
    activityDetails,
    selectedTicketId,
    selected,
    onChange,
  });

  if (inline) {
    return <DatePicker {...calendarPickerProps} inline />;
  }

  return (
    <DatePicker
      {...calendarPickerProps}
      placeholderText={placeholderText}
      className={className}
      popperPlacement="bottom-start"
      popperClassName="package-booking-datepicker-popper"
      popperContainer={DatePickerPopperContainer}
      popperProps={{ strategy: "fixed" }}
      popperModifiers={activityDatePickerPopperModifiers}
    />
  );
}
