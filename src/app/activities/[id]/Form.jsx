"use client";

import { useState, useMemo, useEffect } from "react";
import Button from "@/components/common/Button";
import ActivityTimeSlotPicker from "@/components/activities/ActivityTimeSlotPicker";
import ActivityVisitDatePicker from "@/components/activities/ActivityVisitDatePicker";
import isLogin from "@/utils/isLogin";
import { useNavigateWithLoading } from "@/hooks/useNavigateWithLoading";
import { buildActivitySlotOptions, mergeSelectedSlotIntoOptions } from "@/utils/activityTimeSlotUtils";
import { resolveActivityTicketUnitPricing, toActivityVisitYmd, computeActivityLineTotal } from "@/utils/activityTicketPricing";

function formatVisitDateLabel(date) {
  if (!date) return null;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
  return toActivityVisitYmd(date);
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
  onVisitContextChange,
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

  const handleVisitDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot("");
    setErrors((prev) => ({ ...prev, date: null, timeSlot: null }));
    onVisitContextChange?.({ visitDate: date, visitTimeSlot: "" });
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

  const getEffectiveTicketUnitPrices = () => {
    if (!selectedTicket) return null;
    return resolveActivityTicketUnitPricing({
      ticket: selectedTicket,
      activityDetails,
      visitYmd: selectedYmd,
      timeSlotId: selectedTimeSlot,
    });
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
                  const effective = resolveActivityTicketUnitPricing({
                    ticket: selectedTicket,
                    activityDetails,
                    visitYmd: selectedYmd || "",
                    timeSlotId: selectedTimeSlot || "",
                  });
                  const guideRate = pickNumber(selectedTicket, ["guide_rate", "guideRate"], 0);
                  const total = computeActivityLineTotal(effective, {
                    adultCount,
                    childCount,
                    ticketCount,
                    guideRate,
                    includeGuide,
                  });
                  const isSeasonalPreview =
                    effective?.source === "seasonal" || effective?.source === "slot-seasonal";
                  return (
                    <div>
                      <span className="text-xl font-bold tabular-nums">
                        ₹{Number(total || 0).toFixed(0)}{" "}
                        <span className="text-xs font-normal text-gray-400">{unitLabel}</span>
                      </span>
                      {isSeasonalPreview ? (
                        <p className="text-[10px] text-primary-200">Seasonal rate applied</p>
                      ) : null}
                    </div>
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
          <label className="block text-sm font-medium text-gray-800">Visit date</label>
          <p className="text-xs text-gray-500">
            Green dates are available to book. Amber dates use seasonal rates. Red dates are unavailable.
          </p>
          <div className="relative">
            {isMobilePopup ? (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <ActivityVisitDatePicker
                  activityDetails={activityDetails}
                  selectedTicketId={selectedTicket?.id}
                  selected={selectedDate}
                  onChange={handleVisitDateChange}
                  inline
                />
              </div>
            ) : (
              <>
                <ActivityVisitDatePicker
                  activityDetails={activityDetails}
                  selectedTicketId={selectedTicket?.id}
                  selected={selectedDate}
                  onChange={handleVisitDateChange}
                  placeholderText="Choose date"
                  className="w-full h-11 px-3 pr-10 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer font-medium bg-white"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <i className="fi fi-rr-calendar text-lg" />
                </div>
              </>
            )}
          </div>
          {isMobilePopup && selectedDate ? (
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">Selected:</span>{" "}
              {formatVisitDateLabel(selectedDate)}
            </p>
          ) : null}
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
                  onVisitContextChange?.({ visitDate: selectedDate, visitTimeSlot: slotId });
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

        {!isMobilePopup ? (
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
        ) : null}
      </div>

      {isMobilePopup ? (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            onClick={handleBooking}
            size="lg"
            className="w-full h-12 text-base font-semibold"
            isLoading={isNavigating || isLoading}
            loadingLabel={enquireOnly ? "Sending enquiry…" : "Continuing…"}
          >
            {enquireOnly ? "Send enquiry" : "Continue to booking"}
          </Button>
          <div className="mt-2 flex w-full items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <i className="fi fi-rr-shield-check relative top-0 text-[11px]" aria-hidden="true" />
            <span>Secure checkout · Instant confirmation</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Form;

