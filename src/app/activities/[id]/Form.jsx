"use client";

import { useState, useMemo, useEffect, forwardRef } from "react";
import Button from "@/components/common/Button";
import ActivityTimeSlotPicker from "@/components/activities/ActivityTimeSlotPicker";
import isLogin from "@/utils/isLogin";
import { useNavigateWithLoading } from "@/hooks/useNavigateWithLoading";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isActivityCloseoutDate, normalizeCloseoutDates, dateToYmd } from "@/utils/closeoutUtils";
import { detailDatePickerPopperProps } from "@/components/booking/detailDatePickerProps";
import { buildActivitySlotOptions, mergeSelectedSlotIntoOptions } from "@/utils/activityTimeSlotUtils";

function formatVisitDateLabel(date) {
  if (!date) return null;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const DatePickerTrigger = forwardRef(function DatePickerTrigger({ value, onClick }, ref) {
  return (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      className="fi-box h-9 w-9 shrink-0 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100"
      aria-label={value ? `Change date, currently ${value}` : "Choose date"}
    >
      <i className="fi fi-rr-calendar text-sm" aria-hidden="true" />
    </button>
  );
});

function CounterRow({ label, value, onDec, onInc, disabled, min = 0 }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDec}
          disabled={disabled || value <= min}
          className="fi-box h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-600 disabled:opacity-40"
          aria-label={`Decrease ${label}`}
        >
          <i className="fi fi-rr-minus text-xs" aria-hidden="true" />
        </button>
        <span className="min-w-6 text-center text-sm font-bold tabular-nums text-gray-900">{value}</span>
        <button
          type="button"
          onClick={onInc}
          disabled={disabled}
          className="fi-box h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-600 disabled:opacity-40"
          aria-label={`Increase ${label}`}
        >
          <i className="fi fi-rr-plus text-xs" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function formatTime(timeString) {
  if (!timeString) return "TBD";
  try {
    const [hoursStr, minutes] = String(timeString).split(":");
    const hour = parseInt(hoursStr, 10);
    if (!Number.isFinite(hour)) return "TBD";
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes || "00"} ${period}`;
  } catch {
    return "TBD";
  }
}

function toYmd(date) {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    // Force Indian timezone (Asia/Kolkata) so close-out/season dates match backend.
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(d);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    return y && m && day ? `${y}-${m}-${day}` : "";
  } catch {
    return "";
  }
}

function isDateInRange(ymd, start, end) {
  if (!ymd || !start || !end) return false;
  return ymd >= start && ymd <= end;
}

function getSeasonalPriceForTicket(seasonalDates, ticketTypeId, ymd) {
  if (!Array.isArray(seasonalDates) || !ticketTypeId || !ymd) return null;
  const row = seasonalDates.find((r) => {
    const rid =
      r.activity_ticket_type_id ??
      r.activityTicketTypeId ??
      r.ticket_type_id ??
      r.ticketTypeId ??
      r.activity_ticket_type?.id;
    const start = r.start_date ?? r.startDate;
    const end = r.end_date ?? r.endDate;
    return String(rid) === String(ticketTypeId) && isDateInRange(ymd, start, end);
  });
  return row || null;
}

/** Normalize HH:MM(:ss) for matching catalogue slot to seasonal slot rows. */
function normalizeSlotTimeKey(timeString) {
  if (timeString == null || timeString === "") return "";
  const s = String(timeString).trim();
  const parts = s.split(":");
  if (parts.length < 2) return s.slice(0, 8);
  const h = String(parseInt(parts[0], 10)).padStart(2, "0");
  const m = String(parseInt(parts[1], 10)).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * When seasonal pricing includes per–activity-time-slot rows, merge those amounts
 * for the slot the user selected (matches activity_time_slot_id, else same start_time).
 */
function mergeSeasonalWithSelectedSlot(seasonalRow, activitySlotObj) {
  if (!seasonalRow || !activitySlotObj) return seasonalRow;
  const merged = { ...seasonalRow };
  const slots = seasonalRow.time_slots || seasonalRow.timeSlots || [];
  if (!Array.isArray(slots) || slots.length === 0) return merged;

  const slotId = activitySlotObj.id != null ? String(activitySlotObj.id) : "";
  const slotStart = activitySlotObj.start_time ?? activitySlotObj.startTime;

  let match = null;
  if (slotId) {
    match = slots.find((ts) => {
      const tsSid = ts.activity_time_slot_id ?? ts.activityTimeSlotId;
      return tsSid != null && String(tsSid) === slotId;
    });
  }
  if (!match && slotStart) {
    const key = normalizeSlotTimeKey(slotStart);
    match = slots.find((ts) => {
      const tsSid = ts.activity_time_slot_id ?? ts.activityTimeSlotId;
      if (tsSid != null) return false;
      return normalizeSlotTimeKey(ts.start_time ?? ts.startTime) === key;
    });
  }

  if (!match) return merged;

  const oFull = match.full_rate ?? match.fullRate;
  const oAdult = match.adult_price ?? match.adultPrice;
  const oChild = match.child_price ?? match.childPrice;

  const hasOverride =
    (oFull !== undefined && oFull !== null && oFull !== "") ||
    (oAdult !== undefined && oAdult !== null && oAdult !== "") ||
    (oChild !== undefined && oChild !== null && oChild !== "");

  if (!hasOverride) return merged;

  if (oFull !== undefined && oFull !== null && oFull !== "") merged.full_rate = oFull;
  if (oAdult !== undefined && oAdult !== null && oAdult !== "") merged.adult_price = oAdult;
  if (oChild !== undefined && oChild !== null && oChild !== "") merged.child_price = oChild;

  return merged;
}

function applyDiscountAndAdminCharge(amountRaw, discountRaw, adminChargeRaw) {
  const amount = Number(amountRaw || 0);
  const discount = Number(discountRaw || 0);
  if (!Number.isFinite(amount) || amount <= 0) return 0;

  // Admin charge is informational only; apply discount on base price.
  const discounted = amount - (amount * Math.max(0, discount)) / 100;
  return Number.isFinite(discounted) ? discounted : 0;
}

function pickNumber(obj, keys, fallback = 0) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== "") {
      const n = Number(obj[k]);
      if (Number.isFinite(n)) return n;
    }
  }
  return fallback;
}

function normalizeRateType(rateTypeRaw, { adultPrice, childPrice, fullRate } = {}) {
  const rt = String(rateTypeRaw || "pax").toLowerCase();
  const adult = Number(adultPrice || 0);
  const child = Number(childPrice || 0);
  const full = Number(fullRate || 0);

  // If backend explicitly says full and full price exists, treat as full.
  // Only fall back to pax if full price is missing but pax fields exist.
  if (rt === "full") {
    if (full > 0) return "full";
    if (adult > 0 || child > 0) return "pax";
    return "full";
  }

  // For pax/other: if pax fields exist, treat as pax.
  if (adult > 0 || child > 0) return "pax";
  return "pax";
}

const Form = ({
  activityDetails,
  isMobilePopup = false,
  enquireOnly = false,
  selectedTicket = null,
}) => {
  const { isNavigating, navigate } = useNavigateWithLoading();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [ticketCount, setTicketCount] = useState(1);
  const [includeGuide, setIncludeGuide] = useState(false);
  const [errors, setErrors] = useState({});

  const isSlotBased = Boolean(activityDetails?.time_slot_based);
  const selectedYmd = selectedDate ? toYmd(selectedDate) : "";

  const getSlotRawById = (slotId) => {
    if (!slotId) return null;
    const list = Array.isArray(activityDetails?.time_slot_pricing)
      ? activityDetails.time_slot_pricing
      : [];
    return list.find((s) => String(s.id) === String(slotId)) || null;
  };

  const availableSlotOptions = useMemo(
    () =>
      buildActivitySlotOptions(activityDetails?.time_slot_pricing, {
        visitYmd: selectedYmd,
        ticketTypeId: selectedTicket?.id,
        formatTime,
      }),
    [activityDetails?.time_slot_pricing, selectedYmd, selectedTicket?.id]
  );

  const pickerSlotOptions = useMemo(
    () =>
      mergeSelectedSlotIntoOptions(
        availableSlotOptions,
        selectedTimeSlot,
        activityDetails?.time_slot_pricing,
        formatTime
      ),
    [availableSlotOptions, selectedTimeSlot, activityDetails?.time_slot_pricing]
  );

  useEffect(() => {
    if (!selectedTimeSlot || !selectedYmd) return;
    if (pickerSlotOptions.length === 0) return;
    const stillAvailable = pickerSlotOptions.some((slot) => slot.id === String(selectedTimeSlot));
    if (!stillAvailable) {
      setSelectedTimeSlot("");
    }
  }, [pickerSlotOptions, selectedTimeSlot, selectedYmd]);

  const getSlotTicketUnitPrices = () => {
    if (!isSlotBased || !selectedTicket || !selectedTimeSlot) return null;
    const slot = getSlotRawById(selectedTimeSlot);
    if (!slot) return null;
    const ticketPriceRow = Array.isArray(slot.ticket_prices || slot.ticketPrices)
      ? (slot.ticket_prices || slot.ticketPrices).find(
          (p) => String(p.activity_ticket_type_id) === String(selectedTicket.id)
        )
      : null;
    if (!ticketPriceRow) return null;

    const rateType = normalizeRateType(ticketPriceRow.rate_type || selectedTicket.rateType, {
      adultPrice: ticketPriceRow.adult_price,
      childPrice: ticketPriceRow.child_price,
      fullRate: ticketPriceRow.full_rate,
    });
    // Admin/discount are typically stored on ticket base pricing. Some APIs may also provide them on slot rows.
    // IMPORTANT: Prefer `selectedTicket` first, because slot rows often include `admin_charge: 0` which would
    // otherwise override the real ticket admin percentage.
    const pricingFallback = activityDetails?.current_pricing || {};
    const discountFromTicket = pickNumber(
      selectedTicket,
      ["discount", "discount_percentage", "discountPercent"],
      0
    );
    const discountFromActivity = pickNumber(
      pricingFallback,
      ["discount", "discount_percentage", "discountPercent"],
      0
    );
    const discountFromSlot = pickNumber(
      ticketPriceRow,
      ["discount", "discount_percentage", "discountPercent"],
      0
    );
    const discountPct =
      discountFromTicket > 0
        ? discountFromTicket
        : discountFromActivity > 0
          ? discountFromActivity
          : discountFromSlot;

    const adminFromTicket = pickNumber(
      selectedTicket,
      ["admin_charge", "adminCharge", "admin_charge_percentage"],
      0
    );
    const adminFromActivity = pickNumber(
      pricingFallback,
      ["admin_charge", "adminCharge", "admin_charge_percentage"],
      0
    );
    const adminFromSlot = pickNumber(
      ticketPriceRow,
      ["admin_charge", "adminCharge", "admin_charge_percentage"],
      0
    );
    const adminChargePct =
      adminFromTicket > 0
        ? adminFromTicket
        : adminFromActivity > 0
          ? adminFromActivity
          : adminFromSlot;

    // Prefer backend-computed admin-inclusive slot prices when available.
    const hasBackendAdmin =
      ticketPriceRow?.adult_price_with_admin !== undefined ||
      ticketPriceRow?.full_rate_with_admin !== undefined;

    const adultUnitBase =
      rateType === "full"
        ? Number((hasBackendAdmin ? ticketPriceRow.full_rate_with_admin : ticketPriceRow.full_rate) || 0)
        : Number((hasBackendAdmin ? ticketPriceRow.adult_price_with_admin : ticketPriceRow.adult_price) || 0);
    const childUnitBase = Number((hasBackendAdmin ? ticketPriceRow.child_price_with_admin : ticketPriceRow.child_price) || 0);

    const adminPctToApply = hasBackendAdmin ? 0 : adminChargePct;
    const adultUnit = applyDiscountAndAdminCharge(adultUnitBase, discountPct, adminPctToApply);
    const childUnit = applyDiscountAndAdminCharge(childUnitBase, discountPct, adminPctToApply);

    const adminPctRaw = pickNumber(
      ticketPriceRow,
      ["admin_charge", "adminCharge", "admin_charge_percentage"],
      adminChargePct
    );

    return {
      rateType,
      adultUnit,
      childUnit,
      adultUnitBase,
      childUnitBase,
      discountPct,
      // If backend already included admin in *_with_admin, never apply admin again in UI math.
      adminChargePct: hasBackendAdmin ? 0 : adminChargePct,
      // Catalogue admin % (ticket / activity / slot resolution) for applying to seasonal bases
      // when slot prices are already admin-inclusive (adminChargePct is forced to 0 above).
      catalogAdminChargePct: adminChargePct,
      // Keep raw admin % only for reference/debugging if needed.
      adminChargePctRaw: adminPctRaw,
    };
  };

  const getEffectiveTicketUnitPrices = () => {
    if (!selectedTicket) return null;

    const seasonalRowRaw = getSeasonalPriceForTicket(
      activityDetails?.seasonal_dates,
      selectedTicket.id,
      selectedYmd
    );
    const selectedSlotRaw =
      isSlotBased && selectedTimeSlot ? getSlotRawById(selectedTimeSlot) : null;
    const seasonalRow =
      seasonalRowRaw && selectedSlotRaw
        ? mergeSeasonalWithSelectedSlot(seasonalRowRaw, selectedSlotRaw)
        : seasonalRowRaw;

    const slotUnit = getSlotTicketUnitPrices();

    // Slot + season: when the date is in season, use seasonal row prices only (ignore slot catalogue base).
    if (slotUnit && seasonalRow) {
      const rateType = normalizeRateType(
        seasonalRow.rate_type || slotUnit.rateType || selectedTicket.rateType,
        {
          adultPrice: seasonalRow.adult_price,
          childPrice: seasonalRow.child_price,
          fullRate: seasonalRow.full_rate,
        }
      );
      const discountPct =
        pickNumber(seasonalRow, ["discount", "discount_percentage", "discountPercent"], null) ??
        slotUnit.discountPct;
      const adminChargePct =
        pickNumber(seasonalRow, ["admin_charge", "adminCharge", "admin_charge_percentage"], null) ??
        slotUnit.catalogAdminChargePct ??
        pickNumber(selectedTicket, ["admin_charge", "adminCharge", "admin_charge_percentage"], 0);

      const adultUnitBase =
        rateType === "full"
          ? Number(seasonalRow.full_rate || 0)
          : Number(seasonalRow.adult_price || 0);
      const childUnitBase = Number(seasonalRow.child_price || 0);
      const adultUnit = applyDiscountAndAdminCharge(adultUnitBase, discountPct, adminChargePct);
      const childUnit = applyDiscountAndAdminCharge(childUnitBase, discountPct, adminChargePct);

      return {
        source: "slot-seasonal",
        rateType,
        adultUnit,
        childUnit,
        adultUnitBase,
        childUnitBase,
        discountPct,
        adminChargePct,
        adminChargePctRaw: slotUnit.adminChargePctRaw,
      };
    }

    if (slotUnit) return { source: "slot", ...slotUnit };

    // Non-slot + season: seasonal row replaces catalogue base for that date.
    if (seasonalRow) {
      const rateType = normalizeRateType(seasonalRow.rate_type || selectedTicket.rateType, {
        adultPrice: seasonalRow.adult_price,
        childPrice: seasonalRow.child_price,
        fullRate: seasonalRow.full_rate,
      });
      const discountPct =
        pickNumber(seasonalRow, ["discount", "discount_percentage", "discountPercent"], null) ??
        pickNumber(selectedTicket, ["discount", "discount_percentage", "discountPercent"], 0);
      const adminChargePct =
        pickNumber(seasonalRow, ["admin_charge", "adminCharge", "admin_charge_percentage"], null) ??
        pickNumber(selectedTicket, ["admin_charge", "adminCharge", "admin_charge_percentage"], 0);

      const adultUnitBase =
        rateType === "full"
          ? Number(seasonalRow.full_rate || 0)
          : Number(seasonalRow.adult_price || 0);
      const childUnitBase = Number(seasonalRow.child_price || 0);

      const adultUnit = applyDiscountAndAdminCharge(adultUnitBase, discountPct, adminChargePct);
      const childUnit = applyDiscountAndAdminCharge(childUnitBase, discountPct, adminChargePct);

      return { source: "seasonal", rateType, adultUnit, childUnit, adultUnitBase, childUnitBase, discountPct, adminChargePct };
    }

    const rateType = normalizeRateType(selectedTicket.rateType, {
      adultPrice: selectedTicket.adult_price,
      childPrice: selectedTicket.child_price,
      fullRate: selectedTicket.full_rate ?? selectedTicket.price,
    });
    const discountPct = pickNumber(selectedTicket, ["discount", "discount_percentage", "discountPercent"]);
    const adminChargePct = pickNumber(selectedTicket, ["admin_charge", "adminCharge", "admin_charge_percentage"]);

    const adultUnitBase =
      rateType === "full"
        ? Number(selectedTicket.price || selectedTicket.full_rate || 0)
        : Number(selectedTicket.price || selectedTicket.adult_price || 0);
    const childUnitBase = Number(selectedTicket.child_price || 0);

    const adultUnit = applyDiscountAndAdminCharge(adultUnitBase, discountPct, adminChargePct);
    const childUnit = applyDiscountAndAdminCharge(childUnitBase, discountPct, adminChargePct);

    return { source: "base", rateType, adultUnit, childUnit, adultUnitBase, childUnitBase, discountPct, adminChargePct };
  };

  const getTotalParts = () => {
    if (!selectedTicket) return null;
    const effective = getEffectiveTicketUnitPrices();
    if (!effective) return null;

    const discountPct = Number(effective.discountPct || 0);
    const adminChargePct = Number(effective.adminChargePct || 0);

    const originalAdultUnit = applyDiscountAndAdminCharge(effective.adultUnitBase ?? effective.adultUnit, 0, adminChargePct);
    const originalChildUnit = applyDiscountAndAdminCharge(effective.childUnitBase ?? effective.childUnit, 0, adminChargePct);
    const guideRate = pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0);

    if (effective.rateType === "full") {
      const qty = Math.max(1, Number(ticketCount) || 1);
      const originalTotal = Number(originalAdultUnit || 0) * qty;
      const finalTotal = Number(effective.adultUnit || 0) * qty;
      const guideTotal = includeGuide && guideRate > 0 ? guideRate : 0;
      return {
        originalTotal: originalTotal + guideTotal,
        finalTotal: finalTotal + guideTotal,
        hasDiscount: discountPct > 0,
        guideTotal,
      };
    }

    const adultTotal = Number(effective.adultUnit || 0) * adultCount;
    const childUnit = Number(effective.childUnit || 0);
    const childTotal =
      childUnit > 0
        ? childUnit * childCount
        : Number(effective.adultUnit || 0) * 0.7 * childCount;
    const finalTotal = adultTotal + childTotal;

    const originalAdultTotal = Number(originalAdultUnit || 0) * adultCount;
    const originalChildUnitAdj = Number(originalChildUnit || 0);
    const originalChildTotal =
      originalChildUnitAdj > 0
        ? originalChildUnitAdj * childCount
        : Number(originalAdultUnit || 0) * 0.7 * childCount;
    const originalTotal = originalAdultTotal + originalChildTotal;

    const guideTotal = includeGuide && guideRate > 0 ? guideRate : 0;
    return {
      originalTotal: originalTotal + guideTotal,
      finalTotal: finalTotal + guideTotal,
      hasDiscount: discountPct > 0,
      guideTotal,
    };
  };

  // Calculate total price based on selected ticket and counts
  const calculateTotalPrice = () => {
    if (!selectedTicket) {
      return activityDetails.price || "Price TBA";
    }

    const effective = getEffectiveTicketUnitPrices();
    if (!effective) return activityDetails.price || "Price TBA";

    if (effective.rateType === "full") {
      const qty = Math.max(1, Number(ticketCount) || 1);
      const guideRate = pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0);
      const guideTotal = includeGuide && guideRate > 0 ? guideRate : 0;
      const total = Number(effective.adultUnit || 0) * qty + guideTotal;
      return total > 0 ? `₹${total.toFixed(0)}` : activityDetails.price || "Price TBA";
    }

    const adultTotal = Number(effective.adultUnit || 0) * adultCount;
    const childUnit = Number(effective.childUnit || 0);
    const childTotal =
      childUnit > 0
        ? childUnit * childCount
        : Number(effective.adultUnit || 0) * 0.7 * childCount;
    const guideRate = pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0);
    const guideTotal = includeGuide && guideRate > 0 ? guideRate : 0;
    const total = adultTotal + childTotal + guideTotal;
    return total > 0 ? `₹${total.toFixed(0)}` : activityDetails.price || "Price TBA";
  };

  const displayPrice = selectedTicket 
    ? calculateTotalPrice()
    : activityDetails.price || "Price TBA";

  const effectivePricing = getEffectiveTicketUnitPrices();
  const currentPricing = activityDetails?.current_pricing;
  const uiRateType = selectedTicket
    ? normalizeRateType(effectivePricing?.rateType || selectedTicket?.rateType, {
        adultPrice: effectivePricing?.adultUnit,
        childPrice: effectivePricing?.childUnit,
        fullRate: effectivePricing?.adultUnit,
      })
    : normalizeRateType(currentPricing?.rate_type, {
        adultPrice: currentPricing?.adult_price,
        childPrice: currentPricing?.child_price,
        fullRate: currentPricing?.full_rate,
      });
  const totalPaxCount = adultCount + childCount;
  const showSeasonAddonNote = Boolean(
    effectivePricing?.source === "seasonal" ||
      effectivePricing?.source === "slot-seasonal"
  );

  const validateForm = () => {
    const newErrors = {};

    if (!selectedTicket) {
      newErrors.ticket = "Please select a ticket option";
    }

    if (!selectedDate) {
      newErrors.date = "Please select a visit date";
    }

    if (selectedTicket && uiRateType === "full") {
      if (!ticketCount || Number(ticketCount) < 1) {
        newErrors.ticketCount = "At least 1 ticket is required";
      }
    }

    if (selectedTicket && uiRateType !== "full") {
      if (!adultCount || Number(adultCount) < 1) {
        newErrors.adultCount = "At least 1 adult is required";
      }
      if (Number(childCount) < 0) {
        newErrors.childCount = "Invalid child count";
      }
    }

    if (isSlotBased && selectedTicket) {
      if (!selectedDate) {
        newErrors.timeSlot = "Select a visit date first";
      } else if (availableSlotOptions.length === 0 && pickerSlotOptions.length === 0) {
        newErrors.timeSlot = "No time slots available for this date. Try another date.";
      } else if (!selectedTimeSlot) {
        newErrors.timeSlot = "Please select a time slot";
      } else if (!pickerSlotOptions.some((s) => s.id === String(selectedTimeSlot))) {
        newErrors.timeSlot = "Selected time slot is no longer available";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = () => {
    if (!isLogin()) {
      const event = new CustomEvent("showLogin");
      window.dispatchEvent(event);
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Store booking data in sessionStorage
    const effective = getEffectiveTicketUnitPrices();
    const bookingData = {
      selectedDate,
      selectedTimeSlot: isSlotBased ? String(selectedTimeSlot || "") : "",
      selectedTimeSlotLabel: isSlotBased
        ? pickerSlotOptions.find((s) => s.id === String(selectedTimeSlot))?.label || ""
        : "",
      adultCount,
      childCount,
      ticketCount,
      includeGuide,
      selectedTicket,
      rateType: effective?.rateType || selectedTicket?.rateType || "pax",
      activityDetails: {
        id: activityDetails.id,
        title: activityDetails.title,
        location: activityDetails.location,
        price: activityDetails.price,
        duration: activityDetails.activityGuide.duration,
        time_slot_based: isSlotBased,
        time_slot_pricing: activityDetails.time_slot_pricing || [],
        seasonal_dates: activityDetails.seasonal_dates || [],
        closeout_dates: activityDetails.closeout_dates || [],
        current_pricing: activityDetails.current_pricing || null,
        cancellation_policies: Array.isArray(activityDetails.cancellation_policies)
          ? activityDetails.cancellation_policies
          : [],
      },
    };
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    navigate(`/activities/${activityDetails.id}/booking`);
  };

  const submitHandler = async () => {
    try {
      setIsLoading(true);

      if (!isLogin()) {
        const event = new CustomEvent("showLogin");
        window.dispatchEvent(event);
        setIsLoading(false);
        return;
      }

      // Validate form
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      // Redirect to booking page
      navigate(`/activities/${activityDetails.id}/booking`);
    } catch (error) {
      console.error("Error:", error);
      alert(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDirections = () => {
    // Use map link if available, otherwise open Google Maps with the location
    if (activityDetails.mapLink) {
      window.open(activityDetails.mapLink, "_blank");
    } else if (activityDetails.latitude && activityDetails.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${activityDetails.latitude},${activityDetails.longitude}`,
        "_blank"
      );
    } else {
      const address = encodeURIComponent(
        activityDetails.address || activityDetails.location
      );
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${address}`,
        "_blank"
      );
    }
  };

  return (
    <div className={isMobilePopup ? "pb-24" : ""}>
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="border-b border-gray-100 px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Book this activity
          </p>
          <h2 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-gray-900">
            {activityDetails.title}
          </h2>
          {activityDetails.categories?.[0] ? (
            <span className="mt-1.5 inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
              {activityDetails.categories[0]}
            </span>
          ) : null}
          {selectedTicket ? (
            <p className="mt-2 truncate text-xs text-gray-500">
              Ticket: <span className="font-semibold text-gray-700">{selectedTicket.type || selectedTicket.name}</span>
            </p>
          ) : (
            <p className="mt-2 text-xs text-amber-700">Select a ticket option below to continue</p>
          )}
        </div>

        <div className="border-b border-gray-100 px-4 py-3.5">
          <div className="flex items-center justify-between rounded-lg bg-gray-900 px-3.5 py-2.5 text-white">
            <span className="text-xs font-medium text-gray-400">
              {selectedTicket && selectedDate && (!isSlotBased || selectedTimeSlot) ? "Total" : "From"}
            </span>
            <div className="text-right">
              {(() => {
                const readyForTotal =
                  Boolean(selectedTicket) &&
                  Boolean(selectedDate) &&
                  (!isSlotBased || Boolean(selectedTimeSlot));
                const parts = getTotalParts();
                const unitLabel = !selectedTicket
                  ? "per person"
                  : uiRateType === "full"
                    ? `× ${ticketCount}`
                    : `for ${totalPaxCount} pax`;

                if (!readyForTotal && selectedTicket) {
                  const effective = getEffectiveTicketUnitPrices();
                  const adminPct = Number(
                    effective?.adminChargePct ??
                      pickNumber(selectedTicket, ["admin_charge", "adminCharge", "admin_charge_percentage"], null) ??
                      pickNumber(activityDetails?.current_pricing || {}, ["admin_charge", "adminCharge", "admin_charge_percentage"], 0) ??
                      0
                  );
                  const rateType = effective?.rateType || uiRateType;
                  const qty = rateType === "full" ? Math.max(1, Number(ticketCount) || 1) : totalPaxCount;
                  const base = Number(effective?.adultUnitBase ?? selectedTicket.price ?? selectedTicket.adult_price ?? 0);
                  const unit = applyDiscountAndAdminCharge(base, 0, adminPct);
                  const total = unit * qty;
                  return (
                    <span className="text-xl font-bold tabular-nums">
                      ₹{Number(total || 0).toFixed(0)}{" "}
                      <span className="text-xs font-normal text-gray-400">{unitLabel}</span>
                    </span>
                  );
                }

                if (!parts) {
                  return (
                    <span className="text-xl font-bold tabular-nums">
                      {displayPrice}{" "}
                      <span className="text-xs font-normal text-gray-400">{unitLabel}</span>
                    </span>
                  );
                }

                return (
                  <div>
                    {parts.hasDiscount && parts.originalTotal > parts.finalTotal ? (
                      <p className="text-xs text-gray-400 line-through">₹{parts.originalTotal.toFixed(0)}</p>
                    ) : null}
                    <p className="text-xl font-bold tabular-nums">
                      ₹{parts.finalTotal.toFixed(0)}{" "}
                      <span className="text-xs font-normal text-gray-400">{unitLabel}</span>
                    </p>
                    {showSeasonAddonNote ? (
                      <p className="text-[10px] text-primary-200">Seasonal rate applied</p>
                    ) : null}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="space-y-3 border-b border-gray-100 px-4 py-3.5">
          <p className="text-xs font-semibold text-gray-900">Visit date</p>
          {isMobilePopup ? (
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedTimeSlot("");
                setErrors((prev) => ({ ...prev, date: null, timeSlot: null }));
              }}
              minDate={new Date()}
              filterDate={(date) => {
                const ymd = toYmd(date);
                return !isActivityCloseoutDate(
                  normalizeCloseoutDates(activityDetails?.closeout_dates),
                  ymd,
                  date
                );
              }}
              inline
              dateFormat="dd/MM/yyyy"
            />
          ) : (
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
              <div
                className={`flex h-11 w-11 flex-col items-center justify-center rounded-md border ${
                  selectedDate
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                {selectedDate ? (
                  <>
                    <span className="text-[8px] font-semibold uppercase leading-none opacity-80">
                      {selectedDate.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-base font-bold leading-none">{selectedDate.getDate()}</span>
                  </>
                ) : (
                  <span className="text-lg font-bold leading-none">—</span>
                )}
              </div>
              <p className="min-w-0 truncate text-sm font-semibold text-gray-900">
                {selectedDate ? formatVisitDateLabel(selectedDate) : "Choose a date"}
              </p>
              <div className="shrink-0 [&_.react-datepicker-wrapper]:!w-auto">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setSelectedTimeSlot("");
                    setErrors((prev) => ({ ...prev, date: null, timeSlot: null }));
                  }}
                  minDate={new Date()}
                  filterDate={(date) => {
                    const ymd = toYmd(date);
                    return !isActivityCloseoutDate(
                      normalizeCloseoutDates(activityDetails?.closeout_dates),
                      ymd,
                      date
                    );
                  }}
                  customInput={<DatePickerTrigger />}
                  popperPlacement="bottom-end"
                  {...detailDatePickerPopperProps}
                />
              </div>
            </div>
          )}
          {errors.date ? <p className="text-xs text-red-500">{errors.date}</p> : null}
          {errors.ticket ? <p className="text-xs text-red-500">{errors.ticket}</p> : null}

          {isSlotBased && selectedTicket ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Time slot</label>
              <ActivityTimeSlotPicker
                slots={pickerSlotOptions}
                value={String(selectedTimeSlot || "")}
                onChange={(slotId) => {
                  setSelectedTimeSlot(slotId);
                  setErrors((prev) => ({ ...prev, timeSlot: null }));
                }}
                error={errors.timeSlot}
                disabled={!selectedDate}
              />
            </div>
          ) : null}

          {selectedTicket && uiRateType === "full" ? (
            <CounterRow
              label="Tickets"
              value={ticketCount}
              min={1}
              disabled={!selectedTicket}
              onDec={() => setTicketCount(Math.max(1, Number(ticketCount) - 1))}
              onInc={() => setTicketCount(Number(ticketCount) + 1)}
            />
          ) : null}

          {selectedTicket && uiRateType !== "full" ? (
            <>
              <CounterRow
                label="Adults"
                value={adultCount}
                min={1}
                disabled={!selectedTicket}
                onDec={() => setAdultCount(Math.max(1, adultCount - 1))}
                onInc={() => setAdultCount(adultCount + 1)}
              />
              <CounterRow
                label="Children"
                value={childCount}
                disabled={!selectedTicket}
                onDec={() => setChildCount(Math.max(0, childCount - 1))}
                onInc={() => setChildCount(childCount + 1)}
              />
            </>
          ) : null}

          {selectedTicket && pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0) > 0 ? (
            <div className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-800">Need guide</p>
                <p className="text-xs text-gray-500">
                  +₹{pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0).toFixed(0)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIncludeGuide((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  includeGuide ? "bg-primary-600" : "bg-gray-300"
                }`}
                aria-pressed={includeGuide}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    includeGuide ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ) : null}
        </div>

        <div className="space-y-2.5 px-4 py-3.5">
          <Button
            onClick={handleBooking}
            size="lg"
            className="w-full h-12 text-base font-semibold"
            isLoading={isNavigating || isLoading}
            loadingLabel={enquireOnly ? "Sending enquiry…" : "Continue to booking"}
          >
            {enquireOnly ? "Send enquiry" : "Continue to booking"}
          </Button>
          <div className="flex w-full items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <i className="fi fi-rr-shield-check relative top-0 text-[11px]" aria-hidden="true" />
            <span>Secure checkout · Instant confirmation</span>
          </div>
        </div>
      </div>

      {isMobilePopup ? (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-100 bg-white p-4">
          <Button
            onClick={handleBooking}
            size="lg"
            className="w-full"
            isLoading={isNavigating || isLoading}
            loadingLabel="Continuing…"
          >
            Continue to booking
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default Form;

