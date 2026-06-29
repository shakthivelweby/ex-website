"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/common/Button";
import ActivityTimeSlotPicker from "@/components/activities/ActivityTimeSlotPicker";
import PaymentTrustPanel from "@/components/booking/PaymentTrustPanel";
import isLogin from "@/utils/isLogin";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  createActivityBooking,
  createActivityOrder,
  verifyActivityPayment,
  activityPaymentFailed
} from "../../service";
import apiMiddleware from "../../../api/apiMiddleware";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import PaymentSuccessPopup from "@/components/PaymentSuccessPopup/PaymentSuccessPopup";
import ErrorPopup from "@/components/ErrorPopup/ErrorPopup";
import PaymentProcessingOverlay from "@/components/PaymentProcessingOverlay/PaymentProcessingOverlay";
import { getPaymentErrorPayload, money } from "@/utils/paymentCheckoutUi";
import { getLoggedInUserEmail } from "@/utils/authSession";
import { isActivityCloseoutDate, normalizeCloseoutDates } from "@/utils/closeoutUtils";
import { detailDatePickerPopperProps } from "@/components/booking/detailDatePickerProps";
import { buildActivitySlotOptions, mergeSelectedSlotIntoOptions } from "@/utils/activityTimeSlotUtils";
import BookingPageSkeleton from "@/components/loading/BookingPageSkeleton";

function formatCancellationPolicyRow(row) {
  if (!row) return "";
  const desc = String(row.description || "").trim();
  if (desc) return desc;

  const name = row.policy_name || "Cancellation Policy";
  const refund = Number(row.refund_percentage ?? 0);

  const from = row.cancellation_days_from;
  const to = row.cancellation_days_to;
  const days = row.cancellation_days;

  let when = "";
  if (Number.isFinite(Number(from)) && Number.isFinite(Number(to))) {
    when = `${from}-${to} days before`;
  } else if (Number.isFinite(Number(days))) {
    when = `${days}+ days before`;
  }

  if (when) return `${name}: ${refund}% refund (${when})`;
  return `${name}: ${refund}% refund`;
}

function isApiOk(res) {
  return Boolean(res?.success ?? res?.status);
}

function getApiData(res) {
  return res?.data ?? res?.data?.data ?? null;
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

function normalizeRateType(rateTypeRaw, { adultPrice, childPrice, fullRate } = {}) {
  const rt = String(rateTypeRaw || "pax").toLowerCase();
  const adult = Number(adultPrice || 0);
  const child = Number(childPrice || 0);
  const full = Number(fullRate || 0);

  if (rt === "full") {
    if (full > 0) return "full";
    if (adult > 0 || child > 0) return "pax";
    return "full";
  }

  if (adult > 0 || child > 0) return "pax";
  return "pax";
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

const BookingClient = ({ activityId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState(null);
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [pendingCheckout, setPendingCheckout] = useState(null);
  const [activityDetails, setActivityDetails] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [includeGuide, setIncludeGuide] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    selectedDate: null,
    selectedTimeSlot: "",
    adultCount: 1,
    childCount: 0,
    specialRequests: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const termsSectionRef = useRef(null);
  const [completedBookingId, setCompletedBookingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: "",
    emailSent: false,
    userEmail: "",
    visitDate: "",
    detailRightLabel: "Guests",
    detailRight: "",
    amountPaid: "",
  });

  const isSlotBased = Boolean(activityDetails?.time_slot_based);
  const selectedYmd = formData.selectedDate ? toYmd(formData.selectedDate) : "";

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
        formData.selectedTimeSlot,
        activityDetails?.time_slot_pricing,
        formatTime
      ),
    [
      availableSlotOptions,
      formData.selectedTimeSlot,
      activityDetails?.time_slot_pricing,
    ]
  );

  const formatVisitDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const getGuestSummary = () =>
    `${formData.adultCount} adult(s), ${formData.childCount} child(ren)`;

  const goToCompletedTicket = () => {
    setShowSuccess(false);
    if (completedBookingId) {
      router.push(`/my-bookings/activity/ticket/${completedBookingId}`);
    } else {
      router.push("/my-bookings?tab=activities");
    }
  };

  const goToMyBookings = () => {
    setShowSuccess(false);
    router.push("/my-bookings?tab=activities");
  };

  const selectedSlotLabel = isSlotBased
    ? pickerSlotOptions.find((s) => s.id === String(formData.selectedTimeSlot))?.label ||
      (() => {
        const raw = getSlotRawById(formData.selectedTimeSlot);
        if (!raw) return "";
        return `${formatTime(raw.start_time)} – ${formatTime(raw.end_time)}`;
      })()
    : "";

  useEffect(() => {
    if (!sessionHydrated || !formData.selectedTimeSlot || !selectedYmd) return;
    if (pickerSlotOptions.length === 0) return;

    const stillAvailable = pickerSlotOptions.some(
      (slot) => slot.id === String(formData.selectedTimeSlot)
    );
    if (!stillAvailable) {
      setFormData((prev) => ({ ...prev, selectedTimeSlot: "" }));
    }
  }, [sessionHydrated, pickerSlotOptions, formData.selectedTimeSlot, selectedYmd]);

  // Load booking session + authoritative cancellation policies from API
  useEffect(() => {
    let cancelled = false;

    const fetchActivityDetails = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        let details = null;

        const bookingDataStr = sessionStorage.getItem("bookingData");
        if (bookingDataStr) {
          const data = JSON.parse(bookingDataStr);

          if (data.activityDetails) {
            details = { ...data.activityDetails };
          }

          setFormData((prev) => ({
            ...prev,
            selectedDate: data.selectedDate ? new Date(data.selectedDate) : null,
            selectedTimeSlot: data.selectedTimeSlot ? String(data.selectedTimeSlot) : "",
            adultCount: data.adultCount || 1,
            childCount: data.childCount || 0,
          }));
          setTicketCount(data.ticketCount || 1);
          setSelectedTicket(data.selectedTicket);
          setIncludeGuide(Boolean(data.includeGuide));

          if (data.selectedDate || data.selectedTimeSlot) {
            setDataLoaded(true);
          }
        } else {
          details = {
            id: activityId,
            title: "Adventure Activity",
            location: "Location",
            price: 2500,
            duration: "2-3 hours",
            time_slot_based: false,
            time_slot_pricing: [],
            cancellation_policies: [],
          };
        }

        // Session payload used to omit cancellation_policies; always merge from API when possible.
        const visitYmd = bookingDataStr
          ? (() => {
              try {
                const parsed = JSON.parse(bookingDataStr);
                return parsed.selectedDate ? toYmd(new Date(parsed.selectedDate)) : today;
              } catch {
                return today;
              }
            })()
          : today;

        try {
          const res = await apiMiddleware.get(`/activity-details/${activityId}`, {
            params: { date: visitYmd || today },
          });
          const inner = res.data?.data;
          const policies = Array.isArray(inner?.cancellation_policies)
            ? inner.cancellation_policies
            : [];
          const closeoutDates = normalizeCloseoutDates(inner?.closeout_dates);
          const apiSlots = Array.isArray(inner?.time_slot_pricing) ? inner.time_slot_pricing : [];
          if (!cancelled && details) {
            details = {
              ...details,
              time_slot_based: Boolean(
                inner?.activity?.time_slot_based ?? details.time_slot_based
              ),
              time_slot_pricing:
                apiSlots.length > 0 ? apiSlots : details.time_slot_pricing || [],
              cancellation_policies: policies,
              closeout_dates: closeoutDates,
            };
          } else if (!cancelled && !details && (policies.length || closeoutDates.length || apiSlots.length)) {
            details = {
              id: activityId,
              title: inner?.activity?.name || "Activity",
              location: inner?.activity?.location || inner?.activity?.city || "",
              price: 0,
              duration: "—",
              time_slot_based: Boolean(inner?.activity?.time_slot_based),
              time_slot_pricing: apiSlots,
              cancellation_policies: policies,
              closeout_dates: closeoutDates,
            };
          }
        } catch {
          // keep session / defaults; policies may stay empty
        }

        if (!cancelled) {
          if (details) setActivityDetails(details);
          setSessionHydrated(true);
        }
      } catch (error) {
        console.error("Error loading booking data:", error);
        if (!cancelled) {
          setActivityDetails({
            id: activityId,
            title: "Adventure Activity",
            location: "Location",
            price: 2500,
            duration: "2-3 hours",
            time_slot_based: false,
            time_slot_pricing: [],
            cancellation_policies: [],
          });
          setSessionHydrated(true);
        }
      }
    };

    fetchActivityDetails();
    return () => {
      cancelled = true;
    };
  }, [activityId]);

  const getSlotTicketUnitPrices = () => {
    if (!isSlotBased || !selectedTicket || !formData.selectedTimeSlot) return null;
    const slot = getSlotRawById(formData.selectedTimeSlot);
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
      // Catalogue admin % for seasonal / display when slot row is admin-inclusive.
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
      isSlotBased && formData.selectedTimeSlot
        ? getSlotRawById(formData.selectedTimeSlot)
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
    const discountPct = pickNumber(selectedTicket, ["discount", "discount_percentage", "discountPercent"], 0);
    const adminChargePct = pickNumber(selectedTicket, ["admin_charge", "adminCharge", "admin_charge_percentage"], 0);

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
    const effective = getEffectiveTicketUnitPrices();
    if (!effective) return null;
    const discountPct = Number(effective.discountPct || 0);
    const adminChargePct = Number(effective.adminChargePct || 0);
    const guideRate = pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0);

    const originalAdultUnit = applyDiscountAndAdminCharge(effective.adultUnitBase ?? effective.adultUnit, 0, adminChargePct);
    const originalChildUnit = applyDiscountAndAdminCharge(effective.childUnitBase ?? effective.childUnit, 0, adminChargePct);

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

    const adultTotal = Number(effective.adultUnit || 0) * formData.adultCount;
    const childUnit = Number(effective.childUnit || 0);
    const childTotal =
      childUnit > 0
        ? childUnit * formData.childCount
        : Number(effective.adultUnit || 0) * 0.7 * formData.childCount;
    const finalTotal = adultTotal + childTotal;

    const originalAdultTotal = Number(originalAdultUnit || 0) * formData.adultCount;
    const originalChildUnitAdj = Number(originalChildUnit || 0);
    const originalChildTotal =
      originalChildUnitAdj > 0
        ? originalChildUnitAdj * formData.childCount
        : Number(originalAdultUnit || 0) * 0.7 * formData.childCount;
    const originalTotal = originalAdultTotal + originalChildTotal;

    const guideTotal = includeGuide && guideRate > 0 ? guideRate : 0;
    return {
      originalTotal: originalTotal + guideTotal,
      finalTotal: finalTotal + guideTotal,
      hasDiscount: discountPct > 0,
      guideTotal,
    };
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedTicket && !activityDetails) {
      return 0;
    }

    const effective = getEffectiveTicketUnitPrices();
    const basePrice = effective
      ? effective.adultUnit
      : selectedTicket?.price || activityDetails?.price || 0;
    const guideRate = pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0);

    if (effective?.rateType === "full") {
      const qty = Math.max(1, Number(ticketCount) || 1);
      const guideTotal = includeGuide && guideRate > 0 ? guideRate : 0;
      return Number(basePrice || 0) * qty + guideTotal;
    }

    const adultPrice = Number(basePrice || 0) * formData.adultCount;
    const childUnitPrice = Number(effective?.childUnit || 0);
    const childPrice =
      childUnitPrice > 0
        ? childUnitPrice * formData.childCount
        : Number(basePrice || 0) * 0.7 * formData.childCount;

    const guideTotal = includeGuide && guideRate > 0 ? guideRate : 0;
    return adultPrice + childPrice + guideTotal;
  };

  const totalPrice = calculateTotalPrice();
  const gstPercent = 18;
  const conveniencePercent = 2;
  // Round in paise steps so UI matches API (GST on subtotal, convenience on subtotal+GST).
  const subtotalForFees = Math.max(0, Math.round(Number(totalPrice || 0) * 100) / 100);
  const gstAmount = Math.round(subtotalForFees * (gstPercent / 100) * 100) / 100;
  const afterGst = Math.round((subtotalForFees + gstAmount) * 100) / 100;
  const convenienceAmount = Math.round(afterGst * (conveniencePercent / 100) * 100) / 100;
  const grandTotalUi = Math.round((afterGst + convenienceAmount) * 100) / 100;
  const effectivePricing = getEffectiveTicketUnitPrices();
  const showSeasonAddonNote = Boolean(
    effectivePricing?.source === "seasonal" ||
      effectivePricing?.source === "slot-seasonal"
  );
  const totalPaxCount = formData.adultCount + formData.childCount;
  const summaryCountLabel =
    effectivePricing?.rateType === "full"
      ? `${ticketCount} Tickets`
      : `${totalPaxCount} Pax`;

  const getDiscountAdminSummary = () => {
    const e = effectivePricing;
    if (!e) return null;

    const discountPct = Number(e.discountPct || 0);
    const adminPct = Number(e.adminChargePct || 0);

    const qtyFull = Math.max(1, Number(ticketCount) || 1);
    const adultQty = Math.max(0, Number(formData.adultCount) || 0);
    const childQty = Math.max(0, Number(formData.childCount) || 0);

    const guideRate = Number(pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0) || 0);
    const guideTotal = includeGuide && guideRate > 0 ? guideRate : 0;

    const adultBase = Number(e.adultUnitBase ?? 0);
    const childBase = Number(e.childUnitBase ?? 0);
    const adultWithAdminNoDiscount = applyDiscountAndAdminCharge(
      adultBase,
      0,
      adminPct
    );
    const childWithAdminNoDiscount = applyDiscountAndAdminCharge(
      childBase,
      0,
      adminPct
    );

    const adultFinal = applyDiscountAndAdminCharge(adultBase, discountPct, adminPct);
    const childFinal = applyDiscountAndAdminCharge(childBase, discountPct, adminPct);

    if (e.rateType === "full") {
      const baseSubtotal = adultBase * qtyFull;
      const originalSubtotalWithAdminNoDiscount = Number(adultWithAdminNoDiscount || 0) * qtyFull;
      const finalSubtotal = Number(adultFinal || 0) * qtyFull;
      const adminAmount = Math.max(0, originalSubtotalWithAdminNoDiscount - baseSubtotal);
      const discountAmount = Math.max(0, originalSubtotalWithAdminNoDiscount - finalSubtotal);

      return {
        mode: "full",
        discountPct,
        adminPct,
        baseSubtotal,
        afterAdminSubtotal: originalSubtotalWithAdminNoDiscount,
        afterDiscountSubtotal: finalSubtotal,
        discountAmount,
        adminAmount,
        finalSubtotal,
        guideTotal,
        originalSubtotalWithAdminNoDiscount,
      };
    }

    const baseSubtotal = adultBase * adultQty + childBase * childQty;
    const originalSubtotalWithAdminNoDiscount =
      Number(adultWithAdminNoDiscount || 0) * adultQty +
      Number(childWithAdminNoDiscount || 0) * childQty;
    const finalSubtotal =
      Number(adultFinal || 0) * adultQty + Number(childFinal || 0) * childQty;
    const adminAmount = Math.max(0, originalSubtotalWithAdminNoDiscount - baseSubtotal);
    const discountAmount = Math.max(0, originalSubtotalWithAdminNoDiscount - finalSubtotal);

    return {
      mode: "pax",
      discountPct,
      adminPct,
      baseSubtotal,
      afterAdminSubtotal: originalSubtotalWithAdminNoDiscount,
      afterDiscountSubtotal: finalSubtotal,
      discountAmount,
      adminAmount,
      finalSubtotal,
      guideTotal,
      originalSubtotalWithAdminNoDiscount,
    };
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.selectedDate) {
      newErrors.selectedDate = "Please select a date";
    }

    if (isSlotBased) {
      if (!formData.selectedDate) {
        newErrors.selectedTimeSlot = "Select a visit date first";
      } else if (availableSlotOptions.length === 0 && pickerSlotOptions.length === 0) {
        newErrors.selectedTimeSlot = "No time slots available for this date. Try another date.";
      } else if (!formData.selectedTimeSlot) {
        newErrors.selectedTimeSlot = "Please select a time slot";
      } else if (
        !pickerSlotOptions.some((s) => s.id === String(formData.selectedTimeSlot))
      ) {
        newErrors.selectedTimeSlot = "Selected time slot is no longer available";
      }
    }

    if (effectivePricing?.rateType === "full") {
      if (!ticketCount || Number(ticketCount) < 1) {
        newErrors.ticketCount = "Please select ticket count";
      }
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch user details
  const [user, setUser] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const closePaymentError = () => {
    setShowPaymentError(false);
    setPaymentError(null);
  };

  const showPaymentErrorModal = (payload) => {
    setPaymentError(payload);
    setShowPaymentError(true);
  };

  const getOrderErrorPayload = (message) => {
    const text = String(message || "");
    if (/maximum amount/i.test(text)) {
      return {
        variant: "warning",
        title: "Payment amount too high",
        message:
          "This order exceeds Razorpay's per-transaction limit. Large payments are split automatically — please try again.",
        hint: "If it still fails, raise the limit in your Razorpay Dashboard (Account → Transaction limits).",
        canRetry: true,
        primaryLabel: "Try again",
        primaryIcon: "fi-rr-refresh",
        secondaryLabel: "Close",
      };
    }
    return {
      variant: "warning",
      title: "Couldn't start payment",
      message: text || "We couldn't prepare your payment. Please try again.",
      hint: "Your booking is saved. You can continue to payment when you're ready.",
      canRetry: true,
      primaryLabel: "Continue to payment",
      primaryIcon: "fi-rr-refresh",
      secondaryLabel: "Close",
    };
  };

  const buildApiBookingData = () => {
    if (!selectedTicket && !activityDetails?.ticketOptions?.[0]) {
      return null;
    }

    const ticketId = selectedTicket?.id || activityDetails.ticketOptions?.[0]?.id;
    const effective = getEffectiveTicketUnitPrices();
    const basePrice = effective
      ? effective.adultUnit
      : selectedTicket?.price || activityDetails?.price || 0;
    const adminChargePct = Number(
      effective?.adminChargePct ??
        pickNumber(selectedTicket, ["admin_charge", "adminCharge", "admin_charge_percentage"], null) ??
        pickNumber(activityDetails?.current_pricing || {}, ["admin_charge", "adminCharge", "admin_charge_percentage"], 0) ??
        0
    );

    const originalAdultUnit = applyDiscountAndAdminCharge(
      effective?.adultUnitBase ?? basePrice,
      0,
      adminChargePct
    );
    const originalChildUnitBase =
      effective?.childUnitBase ??
      selectedTicket?.child_price ??
      (effective?.adultUnitBase ?? basePrice) * 0.7;
    const originalChildUnit = applyDiscountAndAdminCharge(originalChildUnitBase, 0, adminChargePct);

    const bookingTickets = [];
    let originalTotal = 0;
    let discountedTotal = 0;

    if (effective?.rateType === "full") {
      const qty = Math.max(1, Number(ticketCount) || 1);
      bookingTickets.push({
        activity_ticket_type_id: ticketId,
        quantity: qty,
        unit_price: basePrice,
        total_price: basePrice * qty,
      });
      discountedTotal += basePrice * qty;
      originalTotal += originalAdultUnit * qty;
    } else if (formData.adultCount > 0) {
      bookingTickets.push({
        activity_ticket_type_id: ticketId,
        quantity: formData.adultCount,
        unit_price: basePrice,
        total_price: basePrice * formData.adultCount,
      });
      discountedTotal += basePrice * formData.adultCount;
      originalTotal += originalAdultUnit * formData.adultCount;
    }

    if (effective?.rateType !== "full" && formData.childCount > 0) {
      const childPrice =
        effective?.childUnit > 0
          ? effective.childUnit
          : selectedTicket?.child_price
            ? selectedTicket.child_price
            : basePrice * 0.7;

      bookingTickets.push({
        activity_ticket_type_id: ticketId,
        quantity: formData.childCount,
        unit_price: childPrice,
        total_price: childPrice * formData.childCount,
      });
      discountedTotal += childPrice * formData.childCount;
      originalTotal += originalChildUnit * formData.childCount;
    }

    const guideAmt =
      Number(pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0) || 0) * (includeGuide ? 1 : 0);
    const totalAmountForApi = Number((originalTotal + guideAmt).toFixed(2));
    const discountAmountForApi = Number(Math.max(0, originalTotal - discountedTotal).toFixed(2));

    return {
      activity_id: activityId,
      visit_date: formData.selectedDate.toISOString().split("T")[0],
      visit_time_slot_label: isSlotBased
        ? selectedSlotLabel || formData.selectedTimeSlot || null
        : null,
      total_amount: totalAmountForApi,
      discount_amount: discountAmountForApi,
      adult_count: formData.adultCount,
      child_count: formData.childCount,
      include_guide: includeGuide,
      bookingTickets,
    };
  };

  const openRazorpayAndVerify = async (orderData, paymentAmount, bookingId, bookingReference) => {
    setPaymentPhase(null);
    const chargeAmount = Number(orderData?.amount ?? paymentAmount);

    const paymentResponse = await initializeRazorpayPayment({
      amount: chargeAmount,
      currency: "INR",
      name: "Explore World",
      description: `Booking for ${activityDetails.title}`,
      orderId: orderData.order_id,
      key: orderData.key,
      email: user?.email || "",
      contact: user?.phone || "",
    });

    if (!paymentResponse.status) {
      setPaymentPhase(null);
      try {
        if (orderData.activity_payment_id) {
          await activityPaymentFailed({ activity_payment_id: orderData.activity_payment_id });
        }
      } catch (_) {}
      showPaymentErrorModal(getPaymentErrorPayload(paymentResponse));
      return false;
    }

    setPaymentPhase("verifying");
    const verifyResponse = await verifyActivityPayment({
      payment_id: paymentResponse.data.razorpay_payment_id,
      order_id: orderData.order_id,
      signature: paymentResponse.data.razorpay_signature,
      customer_email: getLoggedInUserEmail() || user?.email || undefined,
    });

    if (!isApiOk(verifyResponse)) {
      setPaymentPhase(null);
      try {
        if (orderData.activity_payment_id) {
          await activityPaymentFailed({ activity_payment_id: orderData.activity_payment_id });
        }
      } catch (_) {}
      showPaymentErrorModal({
        variant: "error",
        title: "Payment verification failed",
        message:
          verifyResponse?.message || "We couldn't confirm your payment on our end.",
        hint: "If an amount was deducted from your account, please contact support with your payment reference.",
        canRetry: true,
        primaryLabel: "Try again",
        primaryIcon: "fi-rr-refresh",
        secondaryLabel: "Close",
      });
      return false;
    }

    setPaymentPhase("confirming");
    await new Promise((resolve) => setTimeout(resolve, 450));
    setPaymentPhase(null);

    sessionStorage.removeItem("bookingData");
    setPendingCheckout(null);

    const confirmationData = {
      bookingId,
      bookingReference: bookingReference || null,
      paymentId: paymentResponse.data.razorpay_payment_id,
      amount: chargeAmount,
      activity: activityDetails,
      date: formData.selectedDate,
    };
    sessionStorage.setItem("bookingConfirmation", JSON.stringify(confirmationData));

    const emailSent = Boolean(verifyResponse?.data?.confirmation_email_sent);
    const userEmail = getLoggedInUserEmail() || user?.email || "";
    const visitDetailRight =
      isSlotBased && selectedSlotLabel
        ? `${selectedSlotLabel} · ${getGuestSummary()}`
        : getGuestSummary();

    setCompletedBookingId(bookingId);
    setSuccessMessage({
      title: "You're all set!",
      message: bookingReference
        ? `Your activity has been booked successfully. Reference: ${bookingReference}.`
        : "Your activity has been booked successfully.",
      emailSent,
      userEmail,
      visitDate: formatVisitDate(formData.selectedDate),
      detailRightLabel: isSlotBased && selectedSlotLabel ? "Time slot" : "Guests",
      detailRight: visitDetailRight,
      amountPaid: money(chargeAmount),
    });
    setShowSuccess(true);
    return true;
  };

  const executeCheckout = async () => {
    setIsPaying(true);
    setErrorMessage("");

    try {
      if (!validateForm()) {
        if (!formData.agreeToTerms) {
          termsSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        return;
      }

      const apiBookingData = buildApiBookingData();
      if (!apiBookingData) {
        showPaymentErrorModal({
          variant: "warning",
          title: "Missing booking details",
          message: "Please select a ticket type to continue.",
          canRetry: false,
          primaryLabel: "Close",
        });
        return;
      }

      let bookingId = pendingCheckout?.bookingId;
      let paymentAmount = pendingCheckout?.paymentAmount;
      let bookingReference = pendingCheckout?.bookingReference || null;

      if (!bookingId) {
        const bookingResponse = await createActivityBooking(apiBookingData);
        if (!isApiOk(bookingResponse)) {
          showPaymentErrorModal(
            getOrderErrorPayload(bookingResponse?.message || "Booking creation failed")
          );
          return;
        }

        const bookingData = getApiData(bookingResponse) || {};
        bookingId = bookingData.id;
        if (!bookingId) {
          showPaymentErrorModal(getOrderErrorPayload("Booking creation failed (missing booking id)"));
          return;
        }

        paymentAmount =
          bookingData?.grand_total != null && bookingData.grand_total !== ""
            ? Number(bookingData.grand_total)
            : Number(grandTotalUi || 0);
        bookingReference = bookingData.booking_reference || null;

        setPendingCheckout({ bookingId, paymentAmount, bookingReference });
      }

      setPaymentPhase("preparing");
      const orderResponse = await createActivityOrder({
        activity_id: activityId,
        activity_booking_id: bookingId,
        amount: paymentAmount,
      });

      if (!isApiOk(orderResponse)) {
        setPaymentPhase(null);
        showPaymentErrorModal(getOrderErrorPayload(orderResponse?.message));
        return;
      }

      const orderData = getApiData(orderResponse) || {};
      await openRazorpayAndVerify(orderData, paymentAmount, bookingId, bookingReference);
    } catch (error) {
      setPaymentPhase(null);
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        showPaymentErrorModal({
          variant: "warning",
          title: "Verification taking longer",
          message: "Payment verification is taking longer than expected.",
          hint: "Please check My Bookings to confirm whether your payment was successful before trying again.",
          canRetry: false,
          primaryLabel: "Close",
        });
      } else {
        showPaymentErrorModal({
          variant: "error",
          title: "Something went wrong",
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to complete booking. Please try again.",
          hint: "Your booking details are still saved on this page.",
          canRetry: true,
          primaryLabel: "Try again",
          primaryIcon: "fi-rr-refresh",
          secondaryLabel: "Close",
        });
      }
    } finally {
      setIsPaying(false);
    }
  };

  const handlePaymentRetry = async () => {
    closePaymentError();
    setErrorMessage("");
    await executeCheckout();
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!isLogin()) {
      const event = new CustomEvent("showLogin");
      window.dispatchEvent(event);
      return;
    }

    await executeCheckout();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "selectedDate") {
        next.selectedTimeSlot = "";
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (field === "selectedDate" && errors.selectedTimeSlot) {
      setErrors((prev) => ({ ...prev, selectedTimeSlot: null }));
    }
  };

  if (!sessionHydrated || !activityDetails) {
    return <BookingPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="fi-inline mb-4 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <i className="fi fi-rr-arrow-left text-sm" aria-hidden="true" />
            <span>Back to activity</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
            Complete your booking
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Review your details and pay securely to confirm your spot
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">

          {/* Booking Form */}
          <div className="min-w-0 max-w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              {pendingCheckout ? (
                <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
                  <p className="fi-inline items-start gap-2">
                    <i className="fi fi-rr-time-forward text-sm" aria-hidden="true" />
                    <span>
                      Your booking is saved. Complete payment to confirm your spot — no charge was made
                      if you closed the payment window.
                    </span>
                  </p>
                </div>
              ) : null}

              {errorMessage ? (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}
              {/* Booking Details */}
              <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        You&apos;re booking
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">
                        {activityDetails.title}
                      </h2>
                      {selectedTicket ? (
                        <span className="mt-2 inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700">
                          {selectedTicket.name || selectedTicket.type}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.selectedDate ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                        <i className="fi fi-rr-calendar relative top-0 text-primary-600" aria-hidden="true" />
                        {formData.selectedDate.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                    {formData.selectedTimeSlot && selectedSlotLabel ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                        <i className="fi fi-rr-clock relative top-0 text-primary-600" aria-hidden="true" />
                        {selectedSlotLabel}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                      <i className="fi fi-rr-users relative top-0 text-primary-600" aria-hidden="true" />
                      {summaryCountLabel}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-5 sm:px-6">
                  {dataLoaded ? (
                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-3.5 py-3 text-sm text-green-800">
                      <p className="fi-inline items-start gap-2">
                        <i className="fi fi-rr-check-circle text-sm" aria-hidden="true" />
                        <span>
                          Details from the previous step are pre-filled. You can still change them below.
                        </span>
                      </p>
                    </div>
                  ) : null}

                  <h3 className="mb-4 text-base font-semibold text-gray-900">Booking details</h3>
                <div className="space-y-5">
                  {/* Date / Slot / Ticket Count (single row on desktop) */}
                  <div
                    className={`grid grid-cols-1 gap-4 ${
                      effectivePricing?.rateType === "full" ? "sm:grid-cols-2" : "sm:grid-cols-1"
                    }`}
                  >
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-gray-900">
                        Visit date
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={formData.selectedDate}
                          onChange={(date) => handleInputChange("selectedDate", date)}
                          minDate={new Date()}
                          filterDate={(date) => {
                            const ymd = toYmd(date);
                            return !isActivityCloseoutDate(
                              normalizeCloseoutDates(activityDetails?.closeout_dates),
                              ymd,
                              date
                            );
                          }}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Choose a date"
                          className={`w-full rounded-xl border bg-white px-4 py-3 pl-11 text-sm text-gray-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 ${
                            errors.selectedDate ? "border-red-400" : "border-gray-200"
                          }`}
                          popperPlacement="bottom-start"
                          {...detailDatePickerPopperProps}
                        />
                        <i className="fi fi-rr-calendar pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                      {errors.selectedDate ? (
                        <p className="mt-1 text-xs text-red-500">{errors.selectedDate}</p>
                      ) : null}
                    </div>

                    {effectivePricing?.rateType === "full" ? (
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-900">
                          Tickets
                        </label>
                        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                          <span className="text-sm font-medium text-gray-800">Quantity</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setTicketCount(Math.max(1, Number(ticketCount) - 1))}
                              className="fi-box h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-600"
                            >
                              <i className="fi fi-rr-minus text-xs" aria-hidden="true" />
                            </button>
                            <span className="min-w-6 text-center text-sm font-bold tabular-nums text-gray-900">
                              {ticketCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTicketCount(Number(ticketCount) + 1)}
                              className="fi-box h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-600"
                            >
                              <i className="fi fi-rr-plus text-xs" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        {errors.ticketCount ? (
                          <p className="mt-1 text-xs text-red-500">{errors.ticketCount}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {isSlotBased ? (
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                      <label className="mb-3 block text-xs font-semibold text-gray-900">
                        Time slot
                      </label>
                      <ActivityTimeSlotPicker
                        slots={pickerSlotOptions}
                        value={String(formData.selectedTimeSlot || "")}
                        onChange={(slotId) => handleInputChange("selectedTimeSlot", slotId)}
                        error={errors.selectedTimeSlot}
                        disabled={!formData.selectedDate}
                      />
                    </div>
                  ) : null}

                  {effectivePricing?.rateType === "full" ? null : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                        <span className="text-sm font-medium text-gray-800">Adults</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange("adultCount", Math.max(1, formData.adultCount - 1))
                            }
                            className="fi-box h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-600"
                          >
                            <i className="fi fi-rr-minus text-xs" aria-hidden="true" />
                          </button>
                          <span className="min-w-6 text-center text-sm font-bold tabular-nums text-gray-900">
                            {formData.adultCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleInputChange("adultCount", formData.adultCount + 1)}
                            className="fi-box h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-600"
                          >
                            <i className="fi fi-rr-plus text-xs" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
                        <span className="text-sm font-medium text-gray-800">Children</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange("childCount", Math.max(0, formData.childCount - 1))
                            }
                            className="fi-box h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-600"
                          >
                            <i className="fi fi-rr-minus text-xs" aria-hidden="true" />
                          </button>
                          <span className="min-w-6 text-center text-sm font-bold tabular-nums text-gray-900">
                            {formData.childCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleInputChange("childCount", formData.childCount + 1)}
                            className="fi-box h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-600"
                          >
                            <i className="fi fi-rr-plus text-xs" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTicket && pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0) > 0 ? (
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5">
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
                  ) : null}

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) =>
                        handleInputChange("specialRequests", e.target.value)
                      }
                      rows={3}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>
                </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                  <i className="fi fi-rr-shield-check relative top-0 text-primary-600" aria-hidden="true" />
                  Cancellation policy
                </h2>
                {Array.isArray(activityDetails?.cancellation_policies) &&
                activityDetails.cancellation_policies.length > 0 ? (
                  <div className="space-y-2 text-sm text-gray-700">
                    {activityDetails.cancellation_policies.map((row, idx) => (
                      <div key={row.id || idx} className="flex items-start gap-3">
                        <i className="fi fi-rr-info mt-0.5 text-primary-500"></i>
                        <p className="leading-relaxed">
                          {formatCancellationPolicyRow(row)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No cancellation policy provided for this activity.
                  </div>
                )}
              </div>

              <div
                ref={termsSectionRef}
                className="scroll-mt-28 overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      handleInputChange("agreeToTerms", e.target.checked)
                    }
                    className="mt-1 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-primary-500 hover:text-primary-600 font-medium"
                    >
                      terms and conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-primary-500 hover:text-primary-600 font-medium"
                    >
                      cancellation policy
                    </a>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.agreeToTerms}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Booking Summary - Sidebar */}
          <div className="min-w-0 lg:shrink-0">
            <div className="sticky top-24 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Booking summary</h2>

              {/* Activity Info */}
              <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {activityDetails.title}
                </h3>
                {selectedTicket && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
                      <i className="fi fi-rr-ticket mr-1"></i>
                      {selectedTicket.name || selectedTicket.type}
                    </span>
                  </div>
                )}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <i className="fi fi-rr-marker text-primary-500"></i>
                    <span>{activityDetails.location}</span>
                  </div>
                  {formData.selectedDate && (
                    <div className="flex items-center gap-2">
                      <i className="fi fi-rr-calendar text-primary-500"></i>
                      <span>
                        {formData.selectedDate.toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  )}
                  {formData.selectedTimeSlot && (
                    <div className="flex items-center gap-2">
                      <i className="fi fi-rr-clock text-primary-500"></i>
                      <span>{selectedSlotLabel || formData.selectedTimeSlot}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <i className="fi fi-rr-users text-primary-500"></i>
                    <span>
                      {summaryCountLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4">
                {effectivePricing?.rateType === "full" ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Full rate</span>
                      <span className="text-gray-900 font-medium">
                        ₹{Number(effectivePricing.adultUnit || 0).toFixed(0)}
                      </span>
                    </div>
                    {includeGuide && pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0) > 0 ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Guide</span>
                        <span className="text-gray-900 font-medium">
                          ₹{pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0).toFixed(0)}
                        </span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Adults × {formData.adultCount}
                      </span>
                      <span className="text-gray-900 font-medium">
                        ₹
                        {(
                          Number(effectivePricing?.adultUnit || selectedTicket?.price || activityDetails?.price || 0) *
                          formData.adultCount
                        ).toFixed(0)}
                      </span>
                    </div>
                    {formData.childCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Children × {formData.childCount}
                        </span>
                        <span className="text-gray-900 font-medium">
                          ₹
                          {(
                            (Number(effectivePricing?.childUnit || 0) > 0
                              ? Number(effectivePricing.childUnit)
                              : Number(effectivePricing?.adultUnit || selectedTicket?.price || activityDetails?.price || 0) *
                                0.7) * formData.childCount
                          ).toFixed(0)}
                        </span>
                      </div>
                    )}
                    {includeGuide && pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0) > 0 ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Guide</span>
                        <span className="text-gray-900 font-medium">
                          ₹{pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0).toFixed(0)}
                        </span>
                      </div>
                    ) : null}
                  </>
                )}
              </div>

              <div className="space-y-1 mb-6 text-sm text-gray-600">
                {(() => {
                  const s = getDiscountAdminSummary();
                  if (!s) return null;

                  const showDiscount = s.discountPct > 0 && s.discountAmount > 0.01;
                  const showGuide = s.guideTotal > 0.01;
                  const showAdmin = (s.adminAmount ?? 0) > 0.01;

                  if (!showDiscount && !showAdmin && !showGuide) return null;

                  return (
                    <>
                      <div className="flex justify-between">
                        <span>Tickets (before discount)</span>
                        <span className="text-gray-900 font-medium">
                          ₹{Number(s.afterAdminSubtotal ?? s.baseSubtotal ?? 0).toFixed(2)}
                        </span>
                      </div>
                      {showDiscount ? (
                        <div className="flex justify-between">
                          <span>Discount ({Number(s.discountPct || 0).toFixed(0)}%)</span>
                          <span className="text-green-700 font-medium">
                            −₹{Number(s.discountAmount || 0).toFixed(2)}
                          </span>
                        </div>
                      ) : null}
                      {showDiscount ? (
                        <div className="flex justify-between">
                          <span>After discount</span>
                          <span className="text-gray-900 font-medium">
                            ₹{Number(s.afterDiscountSubtotal || 0).toFixed(2)}
                          </span>
                        </div>
                      ) : null}
                      {showGuide ? (
                        <div className="flex justify-between">
                          <span>Guide</span>
                          <span className="text-gray-900 font-medium">
                            ₹{Number(s.guideTotal || 0).toFixed(2)}
                          </span>
                        </div>
                      ) : null}
                      <div className="pt-2 border-t border-gray-100" />
                    </>
                  );
                })()}
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-medium">₹{subtotalForFees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({gstPercent}%)</span>
                  <span className="text-gray-900 font-medium">₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience fee ({conveniencePercent}%)</span>
                  <span className="text-gray-900 font-medium">₹{convenienceAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-200">
                  <span className="text-base font-semibold text-gray-900">Total Amount</span>
                  {(() => {
                    const parts = getTotalParts();
                    if (parts?.hasDiscount && parts.originalTotal > parts.finalTotal) {
                      const strikePreDiscount = Number(parts.originalTotal);
                      return (
                        <div className="text-right">
                          <div className="text-sm text-gray-500 line-through">
                            ₹{strikePreDiscount.toFixed(2)}
                          </div>
                          <div className="text-xl font-bold text-primary-500">
                            ₹{grandTotalUi.toFixed(2)}
                          </div>
                          {showSeasonAddonNote ? (
                            <div className="text-xs text-blue-700 mt-1">
                              Seasonal / special rate applied
                            </div>
                          ) : null}
                        </div>
                      );
                    }
                    return (
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary-500">
                          ₹{grandTotalUi.toFixed(2)}
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
                <p className="text-xs text-gray-500 pt-2 leading-relaxed">
                  Total = subtotal + GST ({gstPercent}% of subtotal) + convenience ({conveniencePercent}% of subtotal
                  + GST). Subtotal is ticket total after discount{includeGuide ? " plus guide fee" : ""} (excl. GST).
                </p>
              </div>

              <div className="mb-4">
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="h-12 w-full text-base font-semibold"
                  isLoading={isPaying}
                  loadingLabel="Opening payment…"
                  icon={<i className="fi fi-rr-lock" aria-hidden="true" />}
                >
                  Pay securely · Confirm booking
                </Button>
                <div className="mt-3">
                  <PaymentTrustPanel compact />
                </div>
              </div>

              <PaymentTrustPanel className="mb-4 hidden lg:block" />

              <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3.5">
                <p className="text-xs leading-relaxed text-blue-900">
                  <i className="fi fi-rr-envelope relative top-0 mr-1.5" aria-hidden="true" />
                  You&apos;ll receive an instant confirmation email with your e-ticket after payment.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentSuccessPopup
        show={showSuccess}
        onClose={goToCompletedTicket}
        title={successMessage.title}
        message={successMessage.message}
        itemLabel="Your activity"
        itemTitle={activityDetails?.title || "Activity"}
        amountPaid={successMessage.amountPaid}
        detailLeftLabel="Visit date"
        detailLeft={successMessage.visitDate}
        detailRightLabel={successMessage.detailRightLabel}
        detailRight={successMessage.detailRight}
        emailSent={successMessage.emailSent}
        userEmail={successMessage.userEmail}
        primaryAction={{
          label: "View ticket",
          icon: "fi-rr-ticket",
          onClick: goToCompletedTicket,
        }}
        secondaryAction={{
          label: "Go to my bookings",
          onClick: goToMyBookings,
        }}
      />

      <PaymentProcessingOverlay show={Boolean(paymentPhase)} stage={paymentPhase || "verifying"} />

      <ErrorPopup
        show={showPaymentError}
        onClose={closePaymentError}
        variant={paymentError?.variant || "error"}
        title={paymentError?.title}
        message={paymentError?.message}
        hint={paymentError?.hint}
        closeOnBackdrop={paymentError?.variant === "cancelled"}
        primaryAction={
          paymentError?.canRetry
            ? {
                label: paymentError?.primaryLabel || "Try again",
                icon: paymentError?.primaryIcon,
                isLoading: isPaying && !paymentPhase,
                loadingLabel: "Opening payment…",
                onClick: handlePaymentRetry,
              }
            : { label: paymentError?.primaryLabel || "Close", onClick: closePaymentError }
        }
        secondaryAction={
          paymentError?.canRetry
            ? { label: paymentError?.secondaryLabel || "Close", onClick: closePaymentError }
            : null
        }
      />
    </div>
  );
};

export default BookingClient;

