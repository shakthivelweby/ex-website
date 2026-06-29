"use client";

import { useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { offset, flip, shift } from "@floating-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  dateToYmd,
  isActivityCloseoutDate,
  normalizeCloseoutDates,
} from "@/utils/closeoutUtils";
import { renderActivityCalendarHeader } from "@/components/activities/ActivityVisitDatePicker";

function isDateInRange(ymd, start, end) {
  if (!ymd || !start || !end) return false;
  return ymd >= start && ymd <= end;
}

function isAttractionSeasonalDay(ymd, seasonalDates, ticketTypeId) {
  if (!Array.isArray(seasonalDates) || !ymd) return false;

  return seasonalDates.some((row) => {
    const start = row.start_date ?? row.startDate;
    const end = row.end_date ?? row.endDate;
    if (!isDateInRange(ymd, start, end)) return false;

    if (ticketTypeId) {
      const rowTicketId =
        row.attraction_ticket_type_id ??
        row.attraction_ticket_type?.id ??
        row.attractionTicketType?.id;
      return String(rowTicketId) === String(ticketTypeId);
    }

    return true;
  });
}

function DatePickerPopperContainer({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

const attractionDatePickerPopperModifiers = [
  offset(8),
  flip({
    fallbackPlacements: ["bottom-start", "bottom-end"],
    padding: { top: 120 },
  }),
  shift({ padding: { top: 120, bottom: 16, left: 8, right: 8 } }),
];

export function useAttractionVisitCalendarProps({
  closeoutDates = [],
  seasonalDates = [],
  ticketTypeIds = null,
  selectedTicketTypeId = null,
  selected,
  onChange,
}) {
  const normalizedCloseouts = useMemo(
    () => normalizeCloseoutDates(closeoutDates),
    [closeoutDates]
  );

  const isCalendarDateBlocked = useCallback(
    (date) => {
      const ymd = dateToYmd(date);
      return isActivityCloseoutDate(
        normalizedCloseouts,
        ymd,
        date,
        Array.isArray(ticketTypeIds) && ticketTypeIds.length ? ticketTypeIds : null
      );
    },
    [normalizedCloseouts, ticketTypeIds]
  );

  const isSeasonalCalendarDay = useCallback(
    (date) => {
      const ymd = dateToYmd(date);
      if (!ymd || isCalendarDateBlocked(date)) return false;
      return isAttractionSeasonalDay(ymd, seasonalDates, selectedTicketTypeId);
    },
    [seasonalDates, selectedTicketTypeId, isCalendarDateBlocked]
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

export default function AttractionVisitDatePicker({
  closeoutDates = [],
  seasonalDates = [],
  ticketTypeIds = null,
  selectedTicketTypeId = null,
  selected,
  onChange,
  inline = false,
  className = "",
  placeholderText = "Choose date",
}) {
  const calendarPickerProps = useAttractionVisitCalendarProps({
    closeoutDates,
    seasonalDates,
    ticketTypeIds,
    selectedTicketTypeId,
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
      popperModifiers={attractionDatePickerPopperModifiers}
    />
  );
}
