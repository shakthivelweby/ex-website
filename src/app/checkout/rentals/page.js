"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getRentalDetails } from "../../rentals/service";
import { checkRentalAvailability } from "../../rentals/clientService";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import { createOrder, verifyPayment, paymentFailure, reserveRentalSlot } from "./service";
import { RENTAL_MIN_BOOKING_HOURS_DEFAULT } from "../../rentals/rentalBookingConstants";
import { applyRentalAdminChargeOnly, computeRentalBookingMonetaryBreakdown, rentalPricingBasis, rentalDailyRateWithAdmin, computeBillingDaysCeilFromParts } from "../../rentals/rentalPricingCalc";

const money = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
};

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
  const [minBookingHours, setMinBookingHours] = useState(RENTAL_MIN_BOOKING_HOURS_DEFAULT);

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
          if (inner.min_booking_hours != null && inner.min_booking_hours !== "") {
            const m = Math.max(1, Number(inner.min_booking_hours) || RENTAL_MIN_BOOKING_HOURS_DEFAULT);
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
  }, [rentalItemId, start_date, end_date, pickup_time, dropoff_time, pickup_location, dropoff_location]);

  const pricing = rental?.pricing_rule || rental?.pricingRule || {};
  const pricingBasis = useMemo(
    () => rentalPricingBasis(pricing, pricingQuote),
    [pricing, pricingQuote]
  );

  const startISO = start_date && pickup_time ? `${start_date}T${pickup_time}:00` : "";
  const endISO = end_date && dropoff_time ? `${end_date}T${dropoff_time}:00` : "";
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
  const rentSubtotal = useMemo(() => {
    if (pricingBasis === "day") {
      return totalDays > 0 ? totalDays * effectivePerDay : 0;
    }
    return totalHours > 0 ? totalHours * effectivePerHour : 0;
  }, [pricingBasis, totalDays, effectivePerDay, totalHours, effectivePerHour]);
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
    if (pricingBasis === "day") return rentalDailyRateWithAdmin({ ...pricing, price_per_day: effectivePerDay });
    return applyRentalAdminChargeOnly(effectivePerHour, pricing);
  }, [pricingBasis, effectivePerDay, effectivePerHour, pricing]);

  const displayPerHourWithAdmin = displayRateWithAdmin;

  const rentSubtotalWithAdminForDisplay = useMemo(
    () => (adminChargeAmount > 0 ? rentSubtotalGross + adminChargeAmount : rentSubtotalGross),
    [rentSubtotalGross, adminChargeAmount]
  );

  const hourlySubtotalWithAdminForDisplay = useMemo(() => {
    if (pricingBasis === "day") {
      const days = Number(totalDays || 0) || 0;
      if (days <= 0) return 0;
      return days * displayRateWithAdmin;
    }
    const hrs = Number(totalHours || 0) || 0;
    if (hrs <= 0) return 0;
    return hrs * displayRateWithAdmin;
  }, [pricingBasis, totalDays, totalHours, displayRateWithAdmin]);

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
    if (pricingBasis !== "day" && h < minBookingHours) {
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
    if (pricingBasis !== "day" && slotHours < minBookingHours) {
      setError(
        `Minimum rental length is ${minBookingHours} hours. Please go back and choose a longer period.`
      );
      return;
    }

    setIsPaying(true);
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
        throw new Error(orderRes?.message || "Failed to create payment order.");
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
      setError(e?.response?.data?.message || e?.message || "Payment failed.");
    } finally {
      setIsPaying(false);
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
      <div className="mb-5 text-sm text-gray-500">
        <Link href="/rentals" className="underline">
          Rentals
        </Link>{" "}
        / Checkout
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

          <div className="mt-5 flex gap-3">
            <button
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold"
              onClick={() => router.back()}
            >
              Back
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60"
              disabled={isPaying || reserving || !reserveReady || !reservationBookingId}
              onClick={handleContinue}
            >
              {reserving ? "Reserving slot…" : isPaying ? "Processing…" : "Continue"}
            </button>
          </div>

          {reserving ? (
            <div className="mt-3 text-sm text-gray-500">Checking availability and reserving your slot…</div>
          ) : null}

          {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
        </div>

        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex gap-4">
            <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {rental.thumbnail_image_url ? (
                <Image
                  src={rental.thumbnail_image_url}
                  alt={rental.title || "Rental"}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">{rental.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {[rental.brand, rental.subtitle].filter(Boolean).join(" • ")}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {pricingBasis === "day" ? "₹/day" : "₹/hour"} (effective):{" "}
                <span className="font-semibold text-gray-900">₹{money(displayRateWithAdmin)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Advance: <span className="font-semibold text-gray-900">₹{money(payAdvanceAmount)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Deposit: <span className="font-semibold text-gray-900">₹{money(depositAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Location</span>
              <span className="text-gray-900 font-semibold text-right max-w-[65%]">
                {String(pickup_location || "").trim() === String(dropoff_location || "").trim()
                  ? pickup_location || dropoff_location || "-"
                  : `${pickup_location || "-"} → ${dropoff_location || "-"}`}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Start</span>
              <span className="text-gray-900 font-semibold text-right">
                {start_date ? `${start_date} ${pickup_time}` : "-"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">End</span>
              <span className="text-gray-900 font-semibold text-right">
                {end_date ? `${end_date} ${dropoff_time}` : "-"}
              </span>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  {pricingBasis === "day"
                    ? `${totalDays || "-"} day(s) × ₹${money(displayRateWithAdmin)}`
                    : `${totalHours || "-"} h × ₹${money(displayRateWithAdmin)}`}
                </span>
                <span className="text-gray-900 font-semibold text-right">₹{money(hourlySubtotalWithAdminForDisplay)}</span>
              </div>
              {discountAmountForDisplay > 0 ? (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-gray-900 font-semibold text-right text-green-700">
                    −₹{money(discountAmountForDisplay)}
                  </span>
                </div>
              ) : null}
              {gstAmount > 0 ? (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">GST{gstPercent > 0 ? ` (${money(gstPercent)}%)` : ""}</span>
                  <span className="text-gray-900 font-semibold text-right">₹{money(gstAmount)}</span>
                </div>
              ) : null}
              {convenienceFeeAmount > 0 ? (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">
                    Convenience{convenienceFeePercent > 0 ? ` (${money(convenienceFeePercent)}%)` : ""}
                  </span>
                  <span className="text-gray-900 font-semibold text-right">₹{money(convenienceFeeAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Refundable deposit</span>
                <span className="text-gray-900 font-semibold text-right">₹{money(depositAmount)}</span>
              </div>
              <div className="flex justify-between gap-3 pt-2 border-t border-gray-100">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-gray-900 font-bold text-right">₹{money(totalFullAmount)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">
                  Pay now ({payChoice === "full" ? "full" : "advance"})
                </span>
                <span className="text-gray-900 font-semibold text-right">₹{money(selectedPayAmount)}</span>
              </div>
              {payChoice === "advance" && canPayAdvance && (
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-gray-500">Remaining</span>
                  <span className="text-gray-900 font-semibold text-right">₹{money(balanceAmount)}</span>
                </div>
              )}
              <p className="text-[11px] text-gray-500 pt-1 leading-snug">
                Pay now + remaining equals your total (taxes included).
              </p>
              {(pricingBasis === "day" ? totalDays === 0 : totalHours === 0) && (
                <div className="text-xs text-red-600">
                  Invalid start/end date &amp; time (still showing deposit as booking amount).
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

