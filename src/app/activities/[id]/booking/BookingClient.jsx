"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  createActivityBooking,
  createActivityOrder,
  verifyActivityPayment,
  activityPaymentFailed
} from "../../service";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";

function formatCancellationPolicyRow(row) {
  if (!row) return "";
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

function isCloseoutDate(closeouts, ymd, weekdayName) {
  if (!Array.isArray(closeouts) || !ymd) return false;
  return closeouts.some((c) => {
    const start = c.start_date ?? c.startDate;
    const end = c.end_date ?? c.endDate;
    if (!isDateInRange(ymd, start, end)) return false;

    const days = c.applicable_days || c.applicableDays || [];
    if (!Array.isArray(days) || days.length === 0) return true;

    const dayNames = days
      .map((d) => d.day_name || d.day || d.name || d.weekday)
      .filter(Boolean)
      .map((s) => String(s).toLowerCase());
    if (dayNames.length === 0) return true;
    return dayNames.includes(String(weekdayName || "").toLowerCase());
  });
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
  const admin = Number(adminChargeRaw || 0);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  // Align with Events/Attractions: apply admin first, then discount on admin-inclusive amount.
  const withAdmin = amount + (amount * Math.max(0, admin)) / 100;
  const discounted = withAdmin - (withAdmin * Math.max(0, discount)) / 100;
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
  const [isLoading, setIsLoading] = useState(false);
  const [activityDetails, setActivityDetails] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
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
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: "",
  });

  const isSlotBased = Boolean(activityDetails?.time_slot_based);
  const slotOptions = Array.isArray(activityDetails?.time_slot_pricing)
    ? activityDetails.time_slot_pricing.map((slot) => ({
        id: String(slot.id),
        label: `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`,
        raw: slot,
      }))
    : [];

  const selectedSlotLabel = isSlotBased
    ? slotOptions.find((s) => s.id === String(formData.selectedTimeSlot))?.label || ""
    : "";

  const selectedYmd = formData.selectedDate ? toYmd(formData.selectedDate) : "";

  // Fetch activity details
  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
        // Get booking data from sessionStorage
        const bookingDataStr = sessionStorage.getItem("bookingData");
        if (bookingDataStr) {
          const data = JSON.parse(bookingDataStr);

          // Set activity details from sessionStorage or use defaults
          if (data.activityDetails) {
            setActivityDetails(data.activityDetails);
          }

          setFormData((prev) => ({
            ...prev,
            selectedDate: data.selectedDate ? new Date(data.selectedDate) : null,
            selectedTimeSlot: data.selectedTimeSlot || "",
            adultCount: data.adultCount || 1,
            childCount: data.childCount || 0,
          }));
          setTicketCount(data.ticketCount || 1);
          setSelectedTicket(data.selectedTicket);
          setIncludeGuide(Boolean(data.includeGuide));

          // Mark that data was successfully loaded
          if (data.selectedDate || data.selectedTimeSlot) {
            setDataLoaded(true);
          }
        } else {
          // If no booking data, set a default activity
          setActivityDetails({
            id: activityId,
            title: "Adventure Activity",
            location: "Location",
            price: 2500,
            duration: "2-3 hours",
            time_slot_based: false,
            time_slot_pricing: [],
          });
        }
      } catch (error) {
        console.error("Error loading booking data:", error);
        // Set default activity on error
        setActivityDetails({
          id: activityId,
          title: "Adventure Activity",
          location: "Location",
          price: 2500,
          duration: "2-3 hours",
          time_slot_based: false,
          time_slot_pricing: [],
        });
      }
    };

    fetchActivityDetails();
  }, [activityId]);

  const getSlotTicketUnitPrices = () => {
    if (!isSlotBased || !selectedTicket || !formData.selectedTimeSlot) return null;
    const slot = slotOptions.find((s) => s.id === String(formData.selectedTimeSlot))?.raw;
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
      // Keep raw admin % only for reference/debugging if needed.
      adminChargePctRaw: adminPctRaw,
    };
  };

  const getEffectiveTicketUnitPrices = () => {
    if (!selectedTicket) return null;

    const seasonalRow = getSeasonalPriceForTicket(
      activityDetails?.seasonal_dates,
      selectedTicket.id,
      selectedYmd
    );
    // IMPORTANT (slot-based activities):
    // When a time slot is selected, always prefer slot pricing over seasonal rows.
    const slotUnit = getSlotTicketUnitPrices();
    if (slotUnit) return { source: "slot", ...slotUnit };

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

      const baseAdultOrFull =
        rateType === "full"
          ? Number(selectedTicket.price || selectedTicket.full_rate || 0)
          : Number(selectedTicket.price || selectedTicket.adult_price || 0);
      const baseChild = Number(selectedTicket.child_price || 0);

      const adultUnitBase =
        rateType === "full"
          ? baseAdultOrFull + Number(seasonalRow.full_rate || 0)
          : baseAdultOrFull + Number(seasonalRow.adult_price || 0);
      const childUnitBase = baseChild + Number(seasonalRow.child_price || 0);

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
  const subtotalForFees = Math.max(0, Number(totalPrice || 0));
  const gstAmount = (subtotalForFees * gstPercent) / 100;
  const afterGst = subtotalForFees + gstAmount;
  const convenienceAmount = (afterGst * conveniencePercent) / 100;
  const grandTotalUi = afterGst + convenienceAmount;
  const effectivePricing = getEffectiveTicketUnitPrices();
  const showSeasonAddonNote = Boolean(effectivePricing?.source === "seasonal");
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

    if (isSlotBased && !formData.selectedTimeSlot) {
      newErrors.selectedTimeSlot = "Please select a time slot";
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

  // Handle form submission
  const handleSubmit = async (e) => {
    // handle both <form onSubmit> and Button onClick
    if (e?.preventDefault) e.preventDefault();

    if (!isLogin()) {
      const event = new CustomEvent("showLogin");
      window.dispatchEvent(event);
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      // Prepare booking tickets
      const bookingTickets = [];
      // If we have selectedTicket (from previous page), use its ID
      // If none (default activity), we might not have a ticket ID. 
      // Assuming selectedTicket is present if we came from details page with a selection.
      // If not, we might need a fallback or fail.

      if (!selectedTicket && !activityDetails.ticketOptions?.[0]) {
        throw new Error("No ticket type selected");
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
      const discountPct = Number(effective?.discountPct ?? pickNumber(selectedTicket, ["discount", "discount_percentage", "discountPercent"], 0) ?? 0);

      // Original (pre-discount) unit prices (admin charge still applies, discount removed)
      const originalAdultUnit = applyDiscountAndAdminCharge(
        effective?.adultUnitBase ?? basePrice,
        0,
        adminChargePct
      );
      const originalChildUnitBase = effective?.childUnitBase ?? selectedTicket?.child_price ?? (effective?.adultUnitBase ?? basePrice) * 0.7;
      const originalChildUnit = applyDiscountAndAdminCharge(originalChildUnitBase, 0, adminChargePct);

      let originalTotal = 0;
      let discountedTotal = 0;

      if (effective?.rateType === "full") {
        const qty = Math.max(1, Number(ticketCount) || 1);
        bookingTickets.push({
          activity_ticket_type_id: ticketId,
          quantity: qty,
          unit_price: basePrice,
          total_price:
            effective?.rateType === "full"
              ? basePrice * qty
              : basePrice * formData.adultCount
        });
        discountedTotal += (basePrice * qty);
        originalTotal += (originalAdultUnit * qty);
      } else if (formData.adultCount > 0) {
        bookingTickets.push({
          activity_ticket_type_id: ticketId,
          quantity: formData.adultCount,
          unit_price: basePrice,
          total_price: basePrice * formData.adultCount
        });
        discountedTotal += (basePrice * formData.adultCount);
        originalTotal += (originalAdultUnit * formData.adultCount);
      }

      if (effective?.rateType !== "full" && formData.childCount > 0) {
        const childPrice = effective?.childUnit > 0
          ? effective.childUnit
          : selectedTicket?.child_price
            ? selectedTicket.child_price
            : (basePrice * 0.7);

        bookingTickets.push({
          activity_ticket_type_id: ticketId,
          quantity: formData.childCount,
          unit_price: childPrice,
          total_price: childPrice * formData.childCount
        });
        discountedTotal += (childPrice * formData.childCount);
        originalTotal += (originalChildUnit * formData.childCount);
      }

      // totalPrice currently represents discounted subtotal + guide (pre-tax) in UI.
      // For backend consistency, send total_amount as original (pre-discount) subtotal (+ guide),
      // and discount_amount as the difference.
      const guideAmt = Number(pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0) || 0) * (includeGuide ? 1 : 0);
      const totalAmountForApi = Number((originalTotal + guideAmt).toFixed(2));
      const discountAmountForApi = Number(Math.max(0, originalTotal - discountedTotal).toFixed(2));

      const apiBookingData = {
        activity_id: activityId,
        visit_date: formData.selectedDate.toISOString().split('T')[0],
        total_amount: totalAmountForApi,
        discount_amount: discountAmountForApi,
        adult_count: formData.adultCount,
        child_count: formData.childCount,
        include_guide: includeGuide,
        bookingTickets: bookingTickets
      };

      // 1. Create Booking
      const bookingResponse = await createActivityBooking(apiBookingData);

      if (!isApiOk(bookingResponse)) {
        throw new Error(bookingResponse?.message || "Booking creation failed");
      }

      const bookingData = getApiData(bookingResponse) || {};
      const bookingId = bookingData.id;
      if (!bookingId) {
        throw new Error("Booking creation failed (missing booking id)");
      }

      const payableAmount =
        bookingData?.grand_total != null && bookingData.grand_total !== ""
          ? Number(bookingData.grand_total)
          : Number(grandTotalUi || 0);

      // 2. Create Order
      const orderResponse = await createActivityOrder({
        activity_id: activityId,
        activity_booking_id: bookingId,
        amount: payableAmount
      });

      if (!isApiOk(orderResponse)) {
        throw new Error(orderResponse?.message || "Payment order creation failed");
      }

      const orderData = getApiData(orderResponse) || {};

      // 3. Initialize Razorpay
      const paymentResponse = await initializeRazorpayPayment({
        amount: payableAmount,
        currency: "INR",
        name: "Explore World",
        description: `Booking for ${activityDetails.title}`,
        orderId: orderData.order_id,
        key: orderData.key,
        email: user?.email || "",
        contact: user?.phone || "",
      });

      if (!paymentResponse.status) {
        if (orderData.activity_payment_id) {
          await activityPaymentFailed({ activity_payment_id: orderData.activity_payment_id });
        }
        throw new Error("Payment initialization failed");
      }

      // 4. Verify Payment
      const verifyResponse = await verifyActivityPayment({
        payment_id: paymentResponse.data.razorpay_payment_id,
        order_id: orderData.order_id,
        signature: paymentResponse.data.razorpay_signature
      });

      if (isApiOk(verifyResponse)) {
        sessionStorage.removeItem("bookingData");

        // Store confirmation data for the confirmation page (optional)
        const confirmationData = {
          bookingId: bookingId,
          bookingReference: bookingData.booking_reference || null,
          paymentId: paymentResponse.data.razorpay_payment_id,
            amount: payableAmount,
          activity: activityDetails,
          date: formData.selectedDate
        };
        sessionStorage.setItem("bookingConfirmation", JSON.stringify(confirmationData));

        setSuccessMessage({
          title: "Booking Successful!",
          message: bookingData.booking_reference
            ? `Your booking reference is ${bookingData.booking_reference}. Redirecting to My Bookings...`
            : "Your activity has been booked successfully. Redirecting to My Bookings...",
        });
        setShowSuccess(true);
      } else {
        if (orderData.activity_payment_id) {
          await activityPaymentFailed({ activity_payment_id: orderData.activity_payment_id });
        }
        throw new Error(verifyResponse?.message || "Payment verification failed");
      }

    } catch (error) {
      console.error("Error creating booking:", error);
      setErrorMessage(error.message || "Failed to create booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  if (!activityDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <i className="fi fi-rr-arrow-left"></i>
            <span>Back to Activity</span>
          </button>
          <h1 className="text-2xl lg:text-3xl font-medium text-gray-900 tracking-tight">
            Complete Your Booking
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Fill in your details to book this amazing activity
          </p>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                  {errorMessage}
                </div>
              )}
              {/* Booking Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                {/* Activity & Ticket Information */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-medium text-gray-900 mb-2 tracking-tight">
                        {activityDetails.title}
                      </h2>
                      {selectedTicket && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 border border-primary-300">
                            <i className="fi fi-rr-ticket mr-1.5"></i>
                            {selectedTicket.name || selectedTicket.type}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {formData.selectedDate && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <i className="fi fi-rr-calendar text-primary-500"></i>
                            <span className="font-medium">
                              {formData.selectedDate.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        {formData.selectedTimeSlot && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <i className="fi fi-rr-clock text-primary-500"></i>
                            <span className="font-medium">
                              {selectedSlotLabel || formData.selectedTimeSlot}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-700">
                          <i className="fi fi-rr-users text-primary-500"></i>
                          <span className="font-medium">
                            {summaryCountLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900 tracking-tight">
                    Booking Details
                  </h2>
                </div>
                {dataLoaded && (
                  <div className="hidden mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 flex items-start gap-2">
                      <i className="fi fi-rr-info-circle mt-0.5"></i>
                      <span>
                        Your booking details have been automatically filled from the previous page. You can still modify them if needed.
                      </span>
                    </p>
                  </div>
                )}
                <div className="space-y-4">
                  {/* Date / Slot / Ticket Count (single row on desktop) */}
                  <div
                    className={`grid grid-cols-1 gap-4 ${
                      effectivePricing?.rateType === "full"
                        ? isSlotBased
                          ? "md:grid-cols-3"
                          : "md:grid-cols-2"
                        : isSlotBased
                          ? "md:grid-cols-2"
                          : "md:grid-cols-1"
                    }`}
                  >
                    {/* Date Picker */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span>Select Date </span>
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={formData.selectedDate}
                          onChange={(date) => handleInputChange("selectedDate", date)}
                          minDate={new Date()}
                          filterDate={(date) => {
                            const ymd = toYmd(date);
                            const weekdayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
                            return !isCloseoutDate(activityDetails?.closeout_dates, ymd, weekdayName);
                          }}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Choose a date"
                          className={`w-full px-4 py-3 pl-12 border ${errors.selectedDate
                            ? "border-red-500"
                            : formData.selectedDate
                              ? ""
                              : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-500 text-gray-800 outline-none`}
                        />
                        <i className="fi fi-rr-calendar absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 text-lg pointer-events-none"></i>
                      </div>
                      {errors.selectedDate && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.selectedDate}
                        </p>
                      )}
                    </div>

                    {/* Time Slot */}
                    {isSlotBased && (
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 bg-white">
                          <span>Select Time Slot </span>
                        </label>
                        <select
                          value={formData.selectedTimeSlot}
                          onChange={(e) =>
                            handleInputChange("selectedTimeSlot", e.target.value)
                          }
                          className={`w-full px-4 py-3 border ${
                            errors.selectedTimeSlot
                              ? "border-red-500"
                              : formData.selectedTimeSlot
                                ? ""
                                : "border-gray-300"
                          } rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-500 text-gray-800 outline-none`}
                        >
                          <option value="" className="text-gray-500 bg-white">
                            Select a time slot
                          </option>
                          {slotOptions.map((slot) => (
                            <option
                              key={slot.id}
                              value={slot.id}
                              className="bg-white text-gray-800"
                            >
                              {slot.label}
                            </option>
                          ))}
                        </select>
                        {errors.selectedTimeSlot && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.selectedTimeSlot}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Ticket Count (full rate only) */}
                    {effectivePricing?.rateType === "full" && (
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <span>Ticket Count</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTicketCount(Math.max(1, Number(ticketCount) - 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            <i className="fi fi-rr-minus text-sm text-gray-500"></i>
                          </button>
                          <span className="min-w-10 text-center text-lg font-medium text-gray-800">
                            {ticketCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => setTicketCount(Number(ticketCount) + 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            <i className="fi fi-rr-plus text-sm text-gray-500"></i>
                          </button>
                        </div>
                        {errors.ticketCount && (
                          <p className="text-red-500 text-xs mt-1">{errors.ticketCount}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {effectivePricing?.rateType === "full" ? null : (
                    <div className="flex gap-10">
                      {/* Adult Count */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <span>Number of Adults</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange(
                                "adultCount",
                                Math.max(1, formData.adultCount - 1)
                              )
                            }
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            <i className="fi fi-rr-minus text-sm text-gray-500"></i>
                          </button>
                          <span className="flex-1 text-center text-lg font-medium text-gray-800">
                            {formData.adultCount}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange("adultCount", formData.adultCount + 1)
                            }
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            <i className="fi fi-rr-plus text-sm text-gray-500"></i>
                          </button>
                        </div>
                      </div>

                      {/* Child Count */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <span>Number of Children</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange(
                                "childCount",
                                Math.max(0, formData.childCount - 1)
                              )
                            }
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            <i className="fi fi-rr-minus text-sm text-gray-500"></i>
                          </button>
                          <span className="flex-1 text-center text-lg font-medium text-gray-800">
                            {formData.childCount}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange("childCount", formData.childCount + 1)
                            }
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            <i className="fi fi-rr-plus text-sm text-gray-500"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buggy option removed */}

                  {selectedTicket && pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0) > 0 ? (
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
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none text-gray-800 placeholder:text-gray-500 bg-white"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fi fi-rr-shield-check text-primary-500"></i>
                  Cancellation Policy
                </h2>
                {Array.isArray(activityDetails?.cancellation_policies) &&
                activityDetails.cancellation_policies.length > 0 ? (
                  <div className="space-y-2 text-sm text-gray-700">
                    {activityDetails.cancellation_policies.map((row, idx) => (
                      <div key={row.id || idx} className="flex items-start gap-3">
                        <i className="fi fi-rr-info mt-0.5 text-primary-500"></i>
                        <p className="leading-relaxed">
                          {formatCancellationPolicyRow(row)}
                          {row.description ? (
                            <span className="text-gray-500">
                              {" "}
                              — {row.description}
                            </span>
                          ) : null}
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

              {/* Terms and Conditions */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">
                Booking Summary
              </h2>

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
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                    <i className="fi fi-rr-money text-primary-500"></i>
                    <span className="font-semibold text-gray-900">
                      Total: ₹{grandTotalUi.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
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

              {/* Total Price */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-gray-900">
                  Total Price
                </span>
                {(() => {
                  const parts = getTotalParts();
                  const summary = getDiscountAdminSummary();
                  if (parts?.hasDiscount && parts.originalTotal > parts.finalTotal) {
                    return (
                      <div className="text-right">
                        <div className="text-sm text-gray-500 line-through">
                          ₹{Number(summary?.originalSubtotalWithAdminNoDiscount ?? parts.originalTotal).toFixed(2)}
                        </div>
                        <div className="text-2xl font-bold text-primary-500">
                          ₹{grandTotalUi.toFixed(2)}
                        </div>
                        {showSeasonAddonNote ? (
                          <div className="text-xs text-blue-700 mt-1">
                            Season/special price add-on applied
                          </div>
                        ) : null}
                      </div>
                    );
                  }
                  return (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-500">
                        ₹{grandTotalUi.toFixed(2)}
                      </div>
                      {showSeasonAddonNote ? (
                        <div className="text-xs text-blue-700 mt-1">
                          Season/special price add-on applied
                        </div>
                      ) : null}
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-1 mb-6 text-sm text-gray-600">
                {(() => {
                  const s = getDiscountAdminSummary();
                  if (!s) return null;

                  const showDiscount = s.discountPct > 0 && s.discountAmount > 0.01;
                  const showGuide = s.guideTotal > 0.01;

                  if (!showDiscount && !showAdmin && !showGuide) return null;

                  return (
                    <>
                      <div className="flex justify-between">
                        <span>Base amount</span>
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
              </div>

              {/* Submit Button - Desktop */}
              <div className="">
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="w-full rounded-full"
                  isLoading={isLoading}
                  icon={<i className="fi fi-rr-check ml-2"></i>}
                >
                  Confirm Booking
                </Button>
              </div>

              {/* Info Message */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <i className="fi fi-rr-info mr-1"></i>
                  You'll receive a confirmation email after booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <SuccessPopup
          show={showSuccess}
          title={successMessage.title}
          message={successMessage.message}
          onClose={() => {
            setShowSuccess(false);
            router.push("/my-bookings?tab=activities");
          }}
        />
      )}
    </div>
  );
};

export default BookingClient;

