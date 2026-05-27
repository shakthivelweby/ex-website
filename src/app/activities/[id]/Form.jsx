"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

function isCloseoutDate(closeouts, ymd, weekdayName) {
  if (!Array.isArray(closeouts) || !ymd) return false;
  return closeouts.some((c) => {
    const start = c.start_date ?? c.startDate;
    const end = c.end_date ?? c.endDate;
    if (!isDateInRange(ymd, start, end)) return false;

    const days = c.applicable_days || c.applicableDays || [];
    if (!Array.isArray(days) || days.length === 0) return true;

    // Try to match weekday
    const dayNames = days
      .map((d) => d.day_name || d.day || d.name || d.weekday)
      .filter(Boolean)
      .map((s) => String(s).toLowerCase());
    if (dayNames.length === 0) return true;
    return dayNames.includes(String(weekdayName || "").toLowerCase());
  });
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
  const router = useRouter();
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

  const slotOptions = Array.isArray(activityDetails?.time_slot_pricing)
    ? activityDetails.time_slot_pricing.map((slot) => {
        const label = `${formatTime(slot.start_time)} - ${formatTime(
          slot.end_time
        )}`;
        return {
          id: String(slot.id),
          label,
          raw: slot,
        };
      })
    : [];

  const getSlotTicketUnitPrices = () => {
    if (!isSlotBased || !selectedTicket || !selectedTimeSlot) return null;
    const slot = slotOptions.find((s) => s.id === String(selectedTimeSlot))?.raw;
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
      isSlotBased && selectedTimeSlot
        ? slotOptions.find((s) => s.id === String(selectedTimeSlot))?.raw
        : null;
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
    } else {
      if (!selectedDate) {
        newErrors.date = "Please select a date";
      }

      if (isSlotBased && !selectedTimeSlot) {
        newErrors.timeSlot = "Please select a time slot";
      }

      if (uiRateType === "full") {
        if (!ticketCount || Number(ticketCount) < 1) {
          newErrors.ticketCount = "Please select ticket count";
        }
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
      selectedTimeSlot: isSlotBased ? selectedTimeSlot : "",
      selectedTimeSlotLabel: isSlotBased
        ? slotOptions.find((s) => s.id === String(selectedTimeSlot))?.label || ""
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

    // Redirect to booking page
    router.push(`/activities/${activityDetails.id}/booking`);
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
      router.push(`/activities/${activityDetails.id}/booking`);
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
    <div className={`${isMobilePopup ? "pb-24" : ""}`}>
      <div className="!bg-[#f7f7f7] rounded-xl p-3 shadow-sm">
        {/* Title and Categories */}
        <div className="hidden bg-white rounded-xl p-4 mb-4">
          <h1 className="text-xl font-medium text-gray-800 tracking-tight mb-3">
            {activityDetails.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {activityDetails.categories.map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#f7f7f7] text-gray-700"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

      
      

        {/* Location Section */}
        {(activityDetails.location || activityDetails.address) && (
          <div className="hidden bg-white rounded-xl p-4 mb-4">
            <h2 className="text-base font-medium text-gray-800 mb-2">Location</h2>
            <div className="flex flex-col">
              {activityDetails.location && (
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  {activityDetails.location}
                </h3>
              )}
              {activityDetails.address && (
                <p className="text-sm text-gray-600 mb-3">
                  {activityDetails.address}
                </p>
              )}
              <button
                onClick={handleGetDirections}
                className="flex items-center gap-2 text-primary-500 text-sm font-medium"
              >
                <i className="fi fi-rr-map-marker text-base"></i>
                Get Directions
              </button>
            </div>
          </div>
        )}
        {/* Booking Form Card */}
        <div className="bg-white rounded-xl p-4">
          {/* Price Display */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <span className="text-gray-700 text-sm font-medium">
              {selectedTicket && selectedDate && (!isSlotBased || selectedTimeSlot)
                ? "Total price"
                : "Starting from"}
            </span>
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

              // If we are NOT ready (no date/slot), don't show discounted totals.
              // Show base + admin only (no discount) for the selected/lowest ticket.
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
                  <span className="text-xl lg:text-2xl font-semibold text-gray-800">
                    ₹{Number(total || 0).toFixed(0)}{" "}
                    <span className="text-sm text-gray-500 font-normal">
                      {unitLabel}
                    </span>
                  </span>
                );
              }

              if (!parts) {
                return (
                  <span className="text-xl lg:text-2xl font-semibold text-gray-800">
                    {displayPrice}{" "}
                    <span className="text-sm text-gray-500 font-normal">
                      {unitLabel}
                    </span>
                  </span>
                );
              }

              return (
                <div className="text-right">
                  {parts.hasDiscount && parts.originalTotal > parts.finalTotal ? (
                    <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
                      <span className="line-through">₹{parts.originalTotal.toFixed(0)}</span>
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                        Before discount
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-end gap-2">
                    <div className="text-xl lg:text-2xl font-semibold text-gray-800">
                      ₹{parts.finalTotal.toFixed(0)}{" "}
                      <span className="text-sm text-gray-500 font-normal">
                        {unitLabel}
                      </span>
                    </div>
                    {(() => {
                      const effective = getEffectiveTicketUnitPrices();
                      const pct = Number(effective?.discountPct || 0);
                      if (!(pct > 0) || !(parts.originalTotal > parts.finalTotal)) return null;
                      return (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-red-600 ring-1 ring-red-200">
                          {pct.toFixed(0)}% OFF
                        </span>
                      );
                    })()}
                  </div>
                  {showSeasonAddonNote ? (
                    <div className="text-xs text-blue-700 mt-1">
                      Seasonal / special rate applied
                    </div>
                  ) : null}
                </div>
              );
            })()}
          </div>

          {/* Date Picker */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date 
            </label>
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  if (errors.date) {
                    setErrors({ ...errors, date: null });
                  }
                }}
                minDate={new Date()}
                filterDate={(date) => {
                  const ymd = toYmd(date);
                  const weekdayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
                  return !isCloseoutDate(activityDetails?.closeout_dates, ymd, weekdayName);
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Choose a date"
                className={`w-full px-4 py-3 pl-12 text-gray-800 border ${
                  "cursor-pointer"
                } ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-500 outline-none`}
                disabled={false}
              />
              <i className="fi fi-rr-calendar absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none"></i>
            </div>
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
            {!selectedTicket ? (
              <p className="text-gray-500 text-xs mt-1">
                You can pick a date now. Select a ticket option to continue booking.
              </p>
            ) : null}
          </div>

          {/* Time Slot Selection */}
          {isSlotBased && selectedTicket && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time Slot
              </label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => {
                  setSelectedTimeSlot(e.target.value);
                  if (errors.timeSlot) {
                    setErrors({ ...errors, timeSlot: null });
                  }
                }}
                className={`w-full px-4 py-3 text-gray-800 bg-transparent border ${
                  errors.timeSlot ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-500 outline-none`}
              >
                <option value="" className="text-gray-500 bg-white">
                  Select a time slot
                </option>
                {slotOptions.map((slot) => (
                  <option
                    key={slot.id}
                    value={slot.id}
                    className="text-gray-700 bg-white"
                  >
                    {slot.label}
                  </option>
                ))}
              </select>
              {errors.timeSlot && (
                <p className="text-red-500 text-xs mt-1">{errors.timeSlot}</p>
              )}
            </div>
          )}

          {uiRateType === "full" ? (
            <div className="mb-4">
              <div className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center justify-between">
                  <div>Ticket Count</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTicketCount(Math.max(1, Number(ticketCount) - 1))}
                      disabled={!selectedTicket}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 focus:bg-primary-50 group"
                    >
                      <i className="fi fi-rr-minus text-sm text-gray-500 group-focus:text-primary-700"></i>
                    </button>
                    <span className="min-w-10 text-center text-lg font-medium text-gray-800">
                      {ticketCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTicketCount(Number(ticketCount) + 1)}
                      disabled={!selectedTicket}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 focus:bg-primary-50 group"
                    >
                      <i className="fi fi-rr-plus text-sm text-gray-500 group-focus:text-primary-700"></i>
                    </button>
                  </div>
                </div>
              </div>
              {errors.ticketCount && (
                <p className="text-red-500 text-xs mt-1">{errors.ticketCount}</p>
              )}
            </div>
          ) : (
            <>
              {/* Adult Count */}
              <div className="mb-4">
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center justify-between">
                    <div>Adults</div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                        disabled={!selectedTicket}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 focus:bg-primary-50 group"
                      >
                        <i className="fi fi-rr-minus text-sm text-gray-500 group-focus:text-primary-700"></i>
                      </button>
                      <span className="flex-1 text-center text-lg font-medium text-gray-800">
                        {adultCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdultCount(adultCount + 1)}
                        disabled={!selectedTicket}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 focus:bg-primary-50 group"
                      >
                        <i className="fi fi-rr-plus text-sm text-gray-500 group-focus:text-primary-700"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Child Count */}
              <div className="mb-4">
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center justify-between">
                    <div>Children</div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setChildCount(Math.max(0, childCount - 1))}
                        disabled={!selectedTicket}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 focus:bg-primary-50 group"
                      >
                        <i className="fi fi-rr-minus text-sm text-gray-500 group-focus:text-primary-700"></i>
                      </button>
                      <span className="flex-1 text-center text-lg font-medium text-gray-800">
                        {childCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setChildCount(childCount + 1)}
                        disabled={!selectedTicket}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 focus:bg-primary-50 group"
                      >
                        <i className="fi fi-rr-plus text-sm text-gray-500 group-focus:text-primary-700"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedTicket && pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0) > 0 ? (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">Need Guide</div>
                  <div className="text-xs text-gray-500">
                    +₹{pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0).toFixed(0)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeGuide((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    includeGuide ? "bg-primary-600" : "bg-gray-300"
                  }`}
                  aria-pressed={includeGuide}
                  aria-label="Toggle guide"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      includeGuide ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          ) : null}

          {/* Action buttons */}
          {isMobilePopup ? (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10">
              <Button
                onClick={handleBooking}
                size="lg"
                className="w-full rounded-full"
                isLoading={isLoading}
                icon={<i className="fi fi-rr-arrow-right ml-2"></i>}
              >
                {enquireOnly ? "Send Enquiry" : "Book Now"}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleBooking}
              size="lg"
              className="w-full rounded-full"
              isLoading={isLoading}
              icon={<i className="fi fi-rr-arrow-right ml-2"></i>}
            >
              {enquireOnly ? "Send Enquiry" : "Book Now"}
            </Button>
          )}
        </div>
      </div>

      {/* Add padding at bottom when in popup to account for fixed button */}
      {isMobilePopup && <div className="h-20"></div>}
    </div>
  );
};

export default Form;

