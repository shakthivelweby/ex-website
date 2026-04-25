"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getRentalDetails } from "../../rentals/service";
import { checkRentalAvailability } from "../../rentals/clientService";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import { createOrder, verifyPayment, paymentFailure } from "./service";

const money = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
};

const diffDaysCeil = (startISO, endISO) => {
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return 0;
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
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
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });
  const [pricingQuote, setPricingQuote] = useState(null);

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
        if (!cancelled && inner?.pricing_quote) {
          setPricingQuote(inner.pricing_quote);
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

  const startISO = start_date && pickup_time ? `${start_date}T${pickup_time}:00` : "";
  const endISO = end_date && dropoff_time ? `${end_date}T${dropoff_time}:00` : "";
  const totalDays = diffDaysCeil(startISO, endISO);
  const perDay = Number(pricing.price_per_day || 0) || 0;
  const perWeek = Number(pricing.price_per_week || 0) || 0;
  const effectiveAvgPerDay =
    pricingQuote?.billing_days > 0
      ? Number(pricingQuote.estimated_rental_subtotal || 0) / Number(pricingQuote.billing_days)
      : perDay;
  const advanceAmount = Number(pricing.advance_amount || 0) || 0;
  const depositAmount = Number(pricing.security_deposit || 0) || 0; // display only

  const expectedRentTotal = useMemo(() => {
    const days = Number(pricingQuote?.billing_days ?? totalDays) || 0;
    if (days <= 0) return 0;

    // Rule requested:
    // - if > 7 days: weeks * per_week + extra_days * per_day
    // - else: days * per_day
    if (days > 7 && perWeek > 0) {
      const weeks = Math.floor(days / 7);
      const extra = days % 7;
      return weeks * perWeek + extra * perDay;
    }
    return days * perDay;
  }, [pricingQuote?.billing_days, totalDays, perWeek, perDay]);

  // Booking payment is advance amount (fallback to deposit if advance not set).
  const totalAmount = advanceAmount > 0 ? advanceAmount : depositAmount;

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

  const handleContinue = async () => {
    setError("");
    if (paymentMethod !== "razorpay") {
      setError("Selected payment method is not available yet.");
      return;
    }
    if (!rentalItemUnitId) {
      setError("No car/unit selected for payment. Please go back and check availability again.");
      return;
    }
    if (!start_datetime || !end_datetime) {
      setError("Invalid start/end date & time.");
      return;
    }

    setIsPaying(true);
    try {
      const fd = new FormData();
      fd.append("rental_item_unit_id", String(Number(rentalItemUnitId)));
      fd.append("pickup_location", pickup_location);
      fd.append("dropoff_location", dropoff_location);
      fd.append("start_datetime", start_datetime);
      fd.append("end_datetime", end_datetime);
      fd.append("amount", String(totalAmount));
      if (documentFile) {
        fd.append("document", documentFile);
      }

      const orderRes = await createOrder(fd);

      if (!orderRes?.status) {
        throw new Error(orderRes?.message || "Failed to create payment order.");
      }

      const payRes = await initializeRazorpayPayment({
        amount: totalAmount,
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
          router.push("/rentals");
        }}
        title={successMessage.title}
        message={successMessage.message}
        actionButton={{
          label: "Back to rentals",
          onClick: () => {
            setShowSuccess(false);
            router.push("/rentals");
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

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer">
              <input
                type="radio"
                name="pm"
                value="razorpay"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">Razorpay</div>
                <div className="text-xs text-gray-500">
                  Card / UPI / Netbanking
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer opacity-60">
              <input
                type="radio"
                name="pm"
                value="cod"
                disabled
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Pay later
                </div>
                <div className="text-xs text-gray-500">
                  (Not available yet)
                </div>
              </div>
            </label>
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
              disabled={isPaying}
              onClick={handleContinue}
            >
              {isPaying ? "Processing…" : "Continue"}
            </button>
          </div>

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
                Regular ₹/day: <span className="font-semibold text-gray-900">₹{money(perDay)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Expected total:{" "}
                <span className="font-semibold text-gray-900">₹{money(expectedRentTotal)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Advance: <span className="font-semibold text-gray-900">₹{money(advanceAmount)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Deposit (ref): <span className="font-semibold text-gray-900">₹{money(depositAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Pickup</span>
              <span className="text-gray-900 font-semibold text-right">{pickup_location || "-"}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Dropoff</span>
              <span className="text-gray-900 font-semibold text-right">{dropoff_location || "-"}</span>
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
                <span className="text-gray-500">Total days</span>
                <span className="text-gray-900 font-semibold text-right">
                  {(pricingQuote?.billing_days ?? totalDays) || "-"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Booking amount</span>
                <span className="text-gray-900 font-semibold text-right">
                  {advanceAmount > 0 ? "Advance" : "Deposit"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-900 font-bold">Total amount</span>
                <span className="text-gray-900 font-bold text-right">
                  ₹{money(totalAmount)}
                </span>
              </div>
              {totalDays === 0 && (
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

