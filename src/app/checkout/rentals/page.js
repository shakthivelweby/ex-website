"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getRentalDetails } from "../../rentals/service";
import { checkRentalAvailability } from "../../rentals/clientService";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import { createOrder, verifyPayment, paymentFailure, reserveRentalSlot, cancelRentalReservation } from "./service";
import { RENTAL_MIN_BOOKING_HOURS_DEFAULT, RENTAL_MIN_BILLING_HOURS } from "../../rentals/rentalBookingConstants";
import { requiresExtendedMinBookingHours } from "../../rentals/rentalFilterUtils";
import {
  readRentalBookingDraft,
  rentalBookingBackUrlFromCheckout,
  buildRentalBookingFields,
  hasRentalBookingSchedule,
  writeRentalBookingDraft,
} from "../../rentals/rentalBookingDraft";
import { applyRentalAdminChargeOnly, computeRentalBookingMonetaryBreakdown, rentalCatalogPricingBasis, rentalDailyRateWithAdmin, computeBillingDaysCeilFromParts, resolveRentalWindowPricing, rentalWindowPeriodSubtotalForDisplay } from "../../rentals/rentalPricingCalc";
import { hasValidAuthSession } from "@/utils/authSession";

const money = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
};

const formatTripDateTime = (date, time) => {
  if (!date) return "—";
  const value = time ? `${date}T${time}:00` : `${date}T12:00:00`;
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return time ? `${date} ${time}` : date;
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(time ? { hour: "numeric", minute: "2-digit", hour12: true } : {}),
  });
};

function SummaryLine({ label, value, valueClassName = "text-gray-900 font-medium" }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`text-right shrink-0 ${valueClassName}`}>{value}</span>
    </div>
  );
}

const diffHoursCeil = (startISO, endISO) => {
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return 0;
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
};

export default function RentalCheckoutPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const rentalItemId = sp.get("rental_item_id");
  const rentalItemUnitId = sp.get("rental_item_unit_id");
  const pickup_location = sp.get("pickup_location") || "";
  const dropoff_location = sp.get("dropoff_location") || "";
  const start_date = sp.get("start_date") || "";
  const end_date = sp.get("end_date") || "";
  const pickup_time = sp.get("pickup_time") || "";
  const dropoff_time = sp.get("dropoff_time") || "";

  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payChoice, setPayChoice] = useState("advance"); // "advance" | "full"
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });
  const [pricingQuote, setPricingQuote] = useState(null);
  const [reservationBookingId, setReservationBookingId] = useState(null);
  const [reserving, setReserving] = useState(false);
  const [reserveReady, setReserveReady] = useState(false);
  const [minBookingHours, setMinBookingHours] = useState(RENTAL_MIN_BILLING_HOURS);
  const isPayingRef = useRef(false);
  const reservationBookingIdRef = useRef(null);

  useEffect(() => {
    reservationBookingIdRef.current = reservationBookingId;
  }, [reservationBookingId]);

  useEffect(() => {
    const run = async () => {
      if (!rentalItemId) return;
      setLoading(true);
      const res = await getRentalDetails(rentalItemId);
      setRental(res?.data || null);
      setLoading(false);
    };
    run();
  }, [rentalItemId]);

  const enforceExtendedMinHours = requiresExtendedMinBookingHours(rental);

  useEffect(() => {
    if (!rental) return;
    setMinBookingHours(
      enforceExtendedMinHours ? RENTAL_MIN_BOOKING_HOURS_DEFAULT : RENTAL_MIN_BILLING_HOURS
    );
  }, [rental, enforceExtendedMinHours]);

  useEffect(() => {
    try {
      const dataUrl = sessionStorage.getItem("rental_booking_doc_data_url");
      const name = sessionStorage.getItem("rental_booking_doc_name") || "document";
      const type = sessionStorage.getItem("rental_booking_doc_type") || "application/octet-stream";
      if (!dataUrl) return;

      // Convert dataURL -> Blob -> File
      const parts = dataUrl.split(",");
      if (parts.length < 2) return;
      const base64 = parts[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type });
      const file = new File([blob], name, { type });
      setDocumentFile(file);
    } catch (_) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!rentalItemId) return;
    const payload = {
      pickup_location,
      dropoff_location,
      start_date,
      end_date,
      pickup_time,
      dropoff_time,
    };
    writeRentalBookingDraft(rentalItemId, payload);
    const onPageHide = () => writeRentalBookingDraft(rentalItemId, payload);
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [
    rentalItemId,
    pickup_location,
    dropoff_location,
    start_date,
    end_date,
    pickup_time,
    dropoff_time,
  ]);

  // Availability quote kept for compatibility, but totals are computed on UI.
  useEffect(() => {
    if (!rentalItemId || !start_date || !end_date || !pickup_time || !dropoff_time) {
      setPricingQuote(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await checkRentalAvailability(rentalItemId, {
          pickup_location: pickup_location?.trim() || "—",
          dropoff_location: dropoff_location?.trim() || "—",
          start_date,
          end_date,
          pickup_time,
          dropoff_time,
        });
        const inner = res?.data;
        if (!cancelled && inner) {
          if (inner.pricing_quote) setPricingQuote(inner.pricing_quote);
          if (
            enforceExtendedMinHours &&
            inner.min_booking_hours != null &&
            inner.min_booking_hours !== ""
          ) {
            const m = Math.max(
              1,
              Number(inner.min_booking_hours) || RENTAL_MIN_BOOKING_HOURS_DEFAULT
            );
            setMinBookingHours(m);
          }
        }
      } catch {
        if (!cancelled) setPricingQuote(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rentalItemId, start_date, end_date, pickup_time, dropoff_time, pickup_location, dropoff_location, enforceExtendedMinHours]);

  const pricing = rental?.pricing_rule || rental?.pricingRule || {};
  const weekdayPrices = rental?.weekday_prices || rental?.weekdayPrices || [];
  const catalogBasis = useMemo(() => rentalCatalogPricingBasis(pricing), [pricing]);

  const windowPricing = useMemo(
    () =>
      resolveRentalWindowPricing({
        pricing,
        startDate: start_date,
        endDate: end_date,
        pickupTime: pickup_time,
        dropoffTime: dropoff_time,
        weekdayPrices,
        quote: pricingQuote,
      }),
    [pricing, start_date, end_date, pickup_time, dropoff_time, weekdayPrices, pricingQuote]
  );

  const pricingBasis = windowPricing.basis || catalogBasis;

  const startISO = start_date && pickup_time ? `${start_date}T${pickup_time}:00` : "";
  const endISO = end_date && dropoff_time ? `${end_date}T${dropoff_time}:00` : "";

  const checkoutBookingFields = useMemo(
    () =>
      buildRentalBookingFields({
        pickup_location,
        dropoff_location,
        start_date,
        end_date,
        pickup_time,
        dropoff_time,
      }),
    [
      pickup_location,
      dropoff_location,
      start_date,
      end_date,
      pickup_time,
      dropoff_time,
    ]
  );

  const basePerHour = Number(pricing.price_per_hour || 0) || 0;
  const basePerDay = Number(pricing.price_per_day || 0) || 0;

  const effectivePerHour = useMemo(() => {
    const fromQuote = pricingQuote?.effective_rates?.price_per_hour;
    if (fromQuote !== undefined && fromQuote !== null && String(fromQuote) !== "") {
      const n = Number(fromQuote);
      if (Number.isFinite(n) && n > 0) return n;
    }

    // Match backend: weekday override by pickup day-of-week (0=Sun..6=Sat)
    if (start_date) {
      const d = new Date(`${start_date}T12:00:00`);
      if (Number.isFinite(d.getTime())) {
        const dow = d.getDay();
        const rows = rental?.weekday_prices || rental?.weekdayPrices || [];
        if (Array.isArray(rows) && rows.length) {
          const match = rows.find((r) => Number(r?.day_of_week) === dow);
          const v = match?.price_per_hour;
          if (v !== undefined && v !== null && String(v) !== "") {
            const n = Number(v);
            if (Number.isFinite(n) && n > 0) return n;
          }
        }
      }
    }

    return basePerHour;
  }, [pricingQuote, rental, start_date, basePerHour]);

  const effectivePerDay = useMemo(() => {
    const fromQuote = pricingQuote?.effective_rates?.price_per_day;
    if (fromQuote !== undefined && fromQuote !== null && String(fromQuote) !== "") {
      const n = Number(fromQuote);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return basePerDay;
  }, [pricingQuote, basePerDay]);
  const advanceType = pricing.advance_type || null;
  const advanceValueRaw = pricing.advance_value;
  const advanceValue =
    advanceValueRaw === "" || advanceValueRaw === null || advanceValueRaw === undefined
      ? null
      : Number(advanceValueRaw);
  const legacyAdvanceAmount = Number(pricing.advance_amount || 0) || 0;
  const depositAmount = Number(pricing.security_deposit || 0) || 0;

  const totalHours = useMemo(() => diffHoursCeil(startISO, endISO), [startISO, endISO]);
  const totalDays = useMemo(
    () => computeBillingDaysCeilFromParts(start_date, end_date, pickup_time, dropoff_time),
    [start_date, end_date, pickup_time, dropoff_time]
  );
  const rentSubtotal = useMemo(() => windowPricing.subtotal, [windowPricing]);
  const monetary = useMemo(
    () => computeRentalBookingMonetaryBreakdown(rentSubtotal, pricing),
    [rentSubtotal, pricing]
  );
  const totalFullAmount = monetary.grandTotal;
  const feesBeforeDeposit = monetary.feesBeforeDeposit;
  const rentSubtotalGross = monetary.rentSubtotalGross;
  const discountAmount = monetary.discountAmount;
  const adminChargeAmount = monetary.adminCharge;
  const gstAmount = monetary.gstAmount;
  const gstPercent = monetary.gstPercent;
  const convenienceFeeAmount = monetary.convenienceFeeAmount;
  const convenienceFeePercent = monetary.convenienceFeePercent;

  const displayRateWithAdmin = useMemo(() => {
    if (windowPricing.basis === "day" || windowPricing.basis === "hybrid") {
      return rentalDailyRateWithAdmin({ ...pricing, price_per_day: windowPricing.rate });
    }
    if (windowPricing.basis === "hour") {
      return applyRentalAdminChargeOnly(windowPricing.rate, pricing);
    }
    if (catalogBasis === "day") return rentalDailyRateWithAdmin({ ...pricing, price_per_day: effectivePerDay });
    return applyRentalAdminChargeOnly(effectivePerHour, pricing);
  }, [windowPricing, catalogBasis, effectivePerDay, effectivePerHour, pricing]);

  const displayHourlyRateWithAdmin = useMemo(() => {
    if (windowPricing.basis === "hybrid") {
      return applyRentalAdminChargeOnly(windowPricing.hourlyRate, pricing);
    }
    if (windowPricing.basis === "hour") {
      return applyRentalAdminChargeOnly(windowPricing.rate, pricing);
    }
    return applyRentalAdminChargeOnly(effectivePerHour, pricing);
  }, [windowPricing, effectivePerHour, pricing]);

  const displayPerHourWithAdmin = displayRateWithAdmin;

  const rentSubtotalWithAdminForDisplay = useMemo(
    () => (adminChargeAmount > 0 ? rentSubtotalGross + adminChargeAmount : rentSubtotalGross),
    [rentSubtotalGross, adminChargeAmount]
  );

  const hourlySubtotalWithAdminForDisplay = useMemo(
    () => rentalWindowPeriodSubtotalForDisplay(windowPricing, pricing),
    [windowPricing, pricing]
  );

  const discountAmountForDisplay = useMemo(() => {
    const gross = Number(hourlySubtotalWithAdminForDisplay || 0) || 0;
    if (gross <= 0) return 0;
    const type = pricing?.discount_type || null;
    const raw = pricing?.discount_value;
    if (!type || raw === "" || raw === null || raw === undefined) return 0;
    const v = Number(raw);
    if (!Number.isFinite(v) || v <= 0) return 0;
    if (type === "percent") return (gross * Math.min(v, 100)) / 100;
    if (type === "flat") return Math.min(gross, v);
    return 0;
  }, [hourlySubtotalWithAdminForDisplay, pricing]);

  const payAdvanceAmount = useMemo(() => {
    if (advanceType && advanceValue != null && Number.isFinite(advanceValue)) {
      if (advanceType === "percent") {
        return (feesBeforeDeposit * advanceValue) / 100;
      }
      return Math.min(advanceValue, totalFullAmount || advanceValue);
    }
    if (legacyAdvanceAmount > 0) return Math.min(legacyAdvanceAmount, totalFullAmount || legacyAdvanceAmount);
    return 0;
  }, [advanceType, advanceValue, feesBeforeDeposit, totalFullAmount, legacyAdvanceAmount]);

  const canPayAdvance = payAdvanceAmount > 0;
  const selectedPayAmount =
    payChoice === "full" ? totalFullAmount : (canPayAdvance ? payAdvanceAmount : totalFullAmount);
  const balanceAmount =
    payChoice === "advance" && canPayAdvance
      ? Math.max(0, totalFullAmount - payAdvanceAmount)
      : 0;

  const summary = useMemo(() => {
    return {
      pickup_location,
      dropoff_location,
      start_date,
      end_date,
      pickup_time,
      dropoff_time,
    };
  }, [pickup_location, dropoff_location, start_date, end_date, pickup_time, dropoff_time]);

  const start_datetime =
    start_date && pickup_time ? `${start_date}T${pickup_time}:00` : "";
  const end_datetime =
    end_date && dropoff_time ? `${end_date}T${dropoff_time}:00` : "";

  const reservationKey = useMemo(() => {
    if (!rentalItemId || !start_datetime || !end_datetime) return "";
    return `rental_reservation_${rentalItemId}_${start_datetime}_${end_datetime}`;
  }, [rentalItemId, start_datetime, end_datetime]);

  const releaseReservation = async (bookingId = reservationBookingIdRef.current) => {
    if (!bookingId || isPayingRef.current) return;
    try {
      await cancelRentalReservation(bookingId);
    } catch (_) {
      // ignore release errors; reservation will expire automatically
    }
    if (reservationKey) {
      try {
        sessionStorage.removeItem(reservationKey);
      } catch (_) {}
    }
  };

  const handleBackToBooking = async () => {
    if (!rentalItemId) {
      window.location.assign("/rentals");
      return;
    }
    const fields = checkoutBookingFields;
    if (!hasRentalBookingSchedule(fields)) {
      const stored = readRentalBookingDraft(rentalItemId);
      if (stored && hasRentalBookingSchedule(stored)) {
        writeRentalBookingDraft(rentalItemId, stored);
        window.location.assign(rentalBookingBackUrlFromCheckout(rentalItemId, stored));
        return;
      }
      setError("Booking details are missing. Please go to rentals and try again.");
      return;
    }
    writeRentalBookingDraft(rentalItemId, fields);
    await releaseReservation();
    window.location.assign(rentalBookingBackUrlFromCheckout(rentalItemId, fields));
  };

  useEffect(() => {
    return () => {
      const bookingId = reservationBookingIdRef.current;
      if (!bookingId || isPayingRef.current) return;
      void cancelRentalReservation(bookingId).catch(() => {});
    };
  }, []);

  const reserveSlot = async () => {
    if (!rentalItemId || !start_datetime || !end_datetime) return null;
    const res = await reserveRentalSlot({
      rental_item_id: Number(rentalItemId),
      pickup_location: pickup_location || "—",
      dropoff_location: dropoff_location || "—",
      start_datetime,
      end_datetime,
    });
    const bookingId = res?.data?.rental_booking_id;
    if (bookingId && reservationKey) {
      try {
        sessionStorage.setItem(reservationKey, String(bookingId));
      } catch (_) {}
      setReservationBookingId(String(bookingId));
    }
    return bookingId ? String(bookingId) : null;
  };

  // Reserve slot as soon as user lands on checkout (temporary block).
  useEffect(() => {
    if (!rentalItemId || !start_datetime || !end_datetime) return;
    const h = diffHoursCeil(startISO, endISO);
    if (pricingBasis !== "day" && enforceExtendedMinHours && h < minBookingHours) {
      setError(
        `Minimum rental length is ${minBookingHours} hours. Please go back and choose a longer period.`
      );
      setReserveReady(false);
      return;
    }
    setError("");
    setReserveReady(false);
    let cancelled = false;
    (async () => {
      setReserving(true);
      try {
        if (reservationKey) {
          try {
            sessionStorage.removeItem(reservationKey);
          } catch (_) {}
        }
        setReservationBookingId(null);
        const bookingId = await reserveSlot();
        if (cancelled) return;
        if (!bookingId) {
          setError("Unable to reserve this slot. Please go back and choose another time.");
          setReserveReady(false);
          return;
        }
        setReserveReady(true);
      } catch (e) {
        if (!cancelled) {
          try {
            if (reservationKey) sessionStorage.removeItem(reservationKey);
          } catch (_) {}
          setReservationBookingId(null);
          setReserveReady(false);
          setError(
            e?.response?.data?.message ||
              "Unable to reserve this slot. Please go back and choose another time."
          );
        }
      } finally {
        if (!cancelled) setReserving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentalItemId, start_datetime, end_datetime, reservationKey, minBookingHours, startISO, endISO, pricingBasis]);

  const handleContinue = async () => {
    setError("");
    if (!hasValidAuthSession()) {
      setError("Your session expired. Please sign in again to continue.");
      try {
        localStorage.setItem("redirectAfterLogin", window.location.href);
        window.dispatchEvent(new CustomEvent("showLogin"));
      } catch (_) {}
      return;
    }
    if (!rentalItemId) {
      setError("Missing rental item. Please go back and try again.");
      return;
    }
    if (!start_datetime || !end_datetime) {
      setError("Invalid start/end date & time.");
      return;
    }
    if (!reserveReady || !reservationBookingId) {
      setError("This slot is not reserved yet. Please wait or go back and choose another time.");
      return;
    }
    const slotHours = diffHoursCeil(startISO, endISO);
    if (pricingBasis !== "day" && enforceExtendedMinHours && slotHours < minBookingHours) {
      setError(
        `Minimum rental length is ${minBookingHours} hours. Please go back and choose a longer period.`
      );
      return;
    }

    setIsPaying(true);
    isPayingRef.current = true;
    try {
      const buildFormData = (bookingId) => {
        const fd = new FormData();
        if (bookingId) fd.append("rental_booking_id", String(Number(bookingId)));
        fd.append("rental_item_id", String(Number(rentalItemId)));
        // Backward compatibility only (API currently validates rental_item_id).
        if (rentalItemUnitId) fd.append("rental_item_unit_id", String(Number(rentalItemUnitId)));
        fd.append("pickup_location", pickup_location);
        fd.append("dropoff_location", dropoff_location);
        fd.append("start_datetime", start_datetime);
        fd.append("end_datetime", end_datetime);
        fd.append("amount", String(selectedPayAmount));
        if (documentFile) fd.append("document", documentFile);
        return fd;
      };

      let orderRes = await createOrder(buildFormData(reservationBookingId));

      // If reservation expired / became invalid, clear and retry reserve+order once.
      if (!orderRes?.status) {
        const msg = String(orderRes?.message || "");
        const shouldRetry =
          msg.toLowerCase().includes("expired") ||
          msg.toLowerCase().includes("not in a reservable state") ||
          msg.toLowerCase().includes("booking not found") ||
          msg.toLowerCase().includes("fully booked") ||
          msg.toLowerCase().includes("not available");
        if (shouldRetry) {
          try {
            if (reservationKey) sessionStorage.removeItem(reservationKey);
          } catch (_) {}
          setReservationBookingId(null);
          const newBookingId = await reserveSlot();
          orderRes = await createOrder(buildFormData(newBookingId));
        }
      }

      if (!orderRes?.status) {
        const apiMessage = String(orderRes?.message || "");
        if (/authentication failed/i.test(apiMessage)) {
          throw new Error(
            "Payment could not be started. The payment gateway is not configured correctly — please contact support."
          );
        }
        throw new Error(apiMessage || "Failed to create payment order.");
      }

      const payRes = await initializeRazorpayPayment({
        amount: selectedPayAmount,
        currency: "INR",
        name: "Explore World",
        description: `Rental booking for ${rental?.title || "rental"}`,
        orderId: orderRes?.data?.order_id,
        key: orderRes?.data?.key,
        email: (() => {
          try {
            const u = JSON.parse(localStorage.getItem("user") || "null");
            return u?.email || "";
          } catch (_) {
            return "";
          }
        })(),
        contact: (() => {
          try {
            const u = JSON.parse(localStorage.getItem("user") || "null");
            return u?.phone || "";
          } catch (_) {
            return "";
          }
        })(),
      });

      if (!payRes?.status) {
        // user cancelled or razorpay failed
        try {
          await paymentFailure(orderRes?.data?.rental_payment_id);
        } catch (_) {}
        setError(payRes?.error?.description || "Payment was not completed.");
        return;
      }

      const verifyRes = await verifyPayment({
        order_id: orderRes?.data?.order_id,
        payment_id: payRes?.data?.razorpay_payment_id,
        signature: payRes?.data?.razorpay_signature,
      });

      if (!verifyRes?.status) {
        try {
          await paymentFailure(orderRes?.data?.rental_payment_id);
        } catch (_) {}
        setError("Payment verification failed. Please contact support.");
        return;
      }

      setSuccessMessage({
        title: "Payment Successful!",
        message: "Your rental booking is confirmed.",
      });
      setShowSuccess(true);
    } catch (e) {
      const raw = e?.response?.data?.message || e?.message || "";
      if (e?.response?.status === 401 || /session expired|sign in again/i.test(raw)) {
        setError("Your session expired. Please sign in again to continue.");
        try {
          localStorage.setItem("redirectAfterLogin", window.location.href);
          window.dispatchEvent(new CustomEvent("showLogin"));
        } catch (_) {}
      } else if (/authentication failed/i.test(raw)) {
        setError(
          "Payment could not be started. The payment gateway is not configured correctly — please contact support."
        );
      } else {
        setError(raw || "Payment failed.");
      }
    } finally {
      setIsPaying(false);
      isPayingRef.current = false;
    }
  };

  if (!rentalItemId) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-10 text-gray-600">
        Missing rental booking details.{" "}
        <Link className="text-primary underline" href="/rentals">
          Back to rentals
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-10 text-gray-600">
        Loading checkout…
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-10 text-gray-600">
        Rental not found.{" "}
        <Link className="text-primary underline" href="/rentals">
          Back to rentals
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-28 pb-10">
      <SuccessPopup
        show={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.push("/my-bookings?tab=rentals");
        }}
        title={successMessage.title}
        message={successMessage.message}
        actionButton={{
          label: "My bookings",
          onClick: () => {
            setShowSuccess(false);
            router.push("/my-bookings?tab=rentals");
          },
        }}
      />
      <div className="mb-5 flex flex-col gap-3">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <Link href="/rentals" className="underline hover:text-gray-800">
            Rentals
          </Link>
          <span aria-hidden className="text-gray-400">
            /
          </span>
          <button
            type="button"
            onClick={() => void handleBackToBooking()}
            className="underline hover:text-gray-800 text-gray-500 font-normal"
          >
            {rental?.title ? `Book ${rental.title}` : "Booking"}
          </button>
          <span aria-hidden className="text-gray-400">
            /
          </span>
          <span className="text-gray-800 font-medium">Checkout</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-gray-500">
            Need to change dates, times, or location? Use{" "}
            <button
              type="button"
              onClick={() => void handleBackToBooking()}
              className="underline font-medium text-primary hover:opacity-90"
            >
              Back to booking
            </button>
            .
          </p>
          <button
            type="button"
            onClick={() => void handleBackToBooking()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 shrink-0"
          >
            <i className="fi fi-rr-arrow-left text-base" aria-hidden />
            Back to booking
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="text-lg font-bold text-gray-900">Payment method</div>
          <div className="text-sm text-gray-500 mt-1">
            Choose your payment method to continue.
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="text-sm font-bold text-gray-900">Choose payment option</div>
            <div className="text-xs text-gray-500 mt-1">
              Pay full amount, or pay advance now and balance later.
            </div>

            <div className="mt-3 space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-white cursor-pointer">
                <input
                  type="radio"
                  name="payChoice"
                  value="full"
                  checked={payChoice === "full"}
                  onChange={() => setPayChoice("full")}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">Pay full amount</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    ₹{money(totalFullAmount)} (includes deposit)
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-white ${
                  canPayAdvance ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
                }`}
              >
                <input
                  type="radio"
                  name="payChoice"
                  value="advance"
                  disabled={!canPayAdvance}
                  checked={payChoice === "advance"}
                  onChange={() => setPayChoice("advance")}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">Pay advance</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Pay now: ₹{money(payAdvanceAmount)}
                    {canPayAdvance ? (
                      <>
                        {" "}
                        · Balance: ₹{money(balanceAmount)}
                      </>
                    ) : (
                      <> (advance not set for this rental)</>
                    )}
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Online payment
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white">
              <i className="fi fi-rr-credit-card text-primary-500 text-lg shrink-0" />
              <div>
                <div className="text-sm font-semibold text-gray-900">Razorpay</div>
                <div className="text-xs text-gray-500">Card / UPI / Netbanking</div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => void handleBackToBooking()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              <i className="fi fi-rr-arrow-left text-base" aria-hidden />
              Back to booking
            </button>
            <button
              className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60"
              disabled={isPaying || reserving || !reserveReady || !reservationBookingId}
              onClick={handleContinue}
            >
              {reserving ? "Reserving slot…" : isPaying ? "Processing…" : "Continue to payment"}
            </button>
          </div>

          {reserving ? (
            <div className="mt-3 text-sm text-gray-500">Checking availability and reserving your slot…</div>
          ) : null}

          {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
        </div>

        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <div className="flex gap-3">
              <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {rental.thumbnail_image_url ? (
                  <Image
                    src={rental.thumbnail_image_url}
                    alt={rental.title || "Rental"}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900 truncate">{rental.title}</h2>
                {[rental.brand, rental.subtitle].filter(Boolean).length > 0 ? (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {[rental.brand, rental.subtitle].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Your trip</p>
            <SummaryLine
              label="Pickup"
              value={formatTripDateTime(start_date, pickup_time)}
            />
            <SummaryLine
              label="Return"
              value={formatTripDateTime(end_date, dropoff_time)}
            />
            <SummaryLine
              label="Location"
              value={
                String(pickup_location || "").trim() === String(dropoff_location || "").trim()
                  ? pickup_location || dropoff_location || "—"
                  : `${pickup_location || "—"} → ${dropoff_location || "—"}`
              }
            />
          </div>

          <div className="px-5 py-4 border-b border-gray-100 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Rental charges
            </p>
            {windowPricing.basis === "hybrid" ? (
              <>
                {windowPricing.units > 0 ? (
                  <SummaryLine
                    label={`${windowPricing.units} day${windowPricing.units === 1 ? "" : "s"} × ₹${money(displayRateWithAdmin)}`}
                    value={`₹${money(windowPricing.units * displayRateWithAdmin)}`}
                  />
                ) : null}
                {windowPricing.extraHours > 0 ? (
                  <SummaryLine
                    label={`${windowPricing.extraHours} hr × ₹${money(displayHourlyRateWithAdmin)}`}
                    value={`₹${money(windowPricing.extraHours * displayHourlyRateWithAdmin)}`}
                  />
                ) : null}
              </>
            ) : (
              <SummaryLine
                label={
                  windowPricing.basis === "day"
                    ? `${windowPricing.units || 0} day(s) × ₹${money(displayRateWithAdmin)}`
                    : windowPricing.basis === "hour"
                      ? `${windowPricing.units || 0} hr × ₹${money(displayRateWithAdmin)}`
                      : "Rental"
                }
                value={`₹${money(hourlySubtotalWithAdminForDisplay)}`}
              />
            )}
            {discountAmountForDisplay > 0 ? (
              <SummaryLine
                label="Discount"
                value={`−₹${money(discountAmountForDisplay)}`}
                valueClassName="text-green-700 font-medium"
              />
            ) : null}
            {gstAmount > 0 ? (
              <SummaryLine
                label={`GST (${money(gstPercent)}%)`}
                value={`₹${money(gstAmount)}`}
              />
            ) : null}
            {convenienceFeeAmount > 0 ? (
              <SummaryLine
                label={`Convenience fee (${money(convenienceFeePercent)}%)`}
                value={`₹${money(convenienceFeeAmount)}`}
              />
            ) : null}
            <div className="flex justify-between gap-3 pt-2 mt-1 border-t border-gray-100 text-sm">
              <span className="font-semibold text-gray-900">Rental total</span>
              <span className="font-semibold text-gray-900">₹{money(feesBeforeDeposit)}</span>
            </div>
          </div>

          {depositAmount > 0 ? (
            <div className="px-5 py-4 border-b border-gray-100 space-y-1">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-gray-600">Refundable deposit</span>
                <span className="font-medium text-gray-900">₹{money(depositAmount)}</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Held during your trip and returned when the vehicle is returned in good condition.
              </p>
            </div>
          ) : null}

          <div className="p-5 space-y-3">
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-gray-600">Grand total</span>
              <span className="font-semibold text-gray-900">₹{money(totalFullAmount)}</span>
            </div>

            <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 space-y-2">
              <div className="flex justify-between items-center gap-3">
                <div>
                  <p className="text-xs font-medium text-primary-800 uppercase tracking-wide">
                    Pay now
                  </p>
                  <p className="text-[11px] text-primary-700/80 mt-0.5">
                    {payChoice === "full" ? "Full amount" : "Advance payment"}
                  </p>
                </div>
                <span className="text-2xl font-bold text-primary-700">₹{money(selectedPayAmount)}</span>
              </div>
              {payChoice === "advance" && canPayAdvance && balanceAmount > 0 ? (
                <p className="text-xs text-gray-600 pt-2 border-t border-primary-100">
                  <span className="font-medium text-gray-800">₹{money(balanceAmount)}</span> due before pickup
                </p>
              ) : null}
            </div>

            {windowPricing.units === 0 ? (
              <p className="text-xs text-red-600">
                Invalid dates or times — please go back and update your booking.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

