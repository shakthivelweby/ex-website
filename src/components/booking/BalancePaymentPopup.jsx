"use client";

import { useEffect } from "react";
import Button from "@/components/common/Button";

export default function BalancePaymentPopup({
  show,
  itemTitle,
  paidAmount,
  remainingBalance,
  isPaying = false,
  onPayNow,
  onPayLater,
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && !isPaying) onPayLater?.();
    };
    if (show) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [show, isPaying, onPayLater]);

  if (!show) return null;

  const paid = Number(paidAmount || 0);
  const remaining = Number(remainingBalance || 0);

  return (
    <div
      className="fixed inset-0 z-[75] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="balance-payment-title"
    >
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-gray-900/45 backdrop-blur-[2px]" />

        <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-100 animate-modal-pop">
          <div className="bg-gradient-to-b from-amber-50 to-white px-6 pt-8 pb-5 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-amber-100">
              <i className="fi fi-rr-credit-card text-2xl text-amber-600" aria-hidden="true" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
              Step 2 of 2
            </span>
            <h2 id="balance-payment-title" className="mt-3 text-xl font-bold text-gray-900">
              Complete your payment
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              ₹{paid.toFixed(2)} received. Pay the remaining balance now to confirm your booking.
            </p>
          </div>

          <div className="space-y-3 px-6 pb-6">
            {itemTitle ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Booking
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{itemTitle}</p>
              </div>
            ) : null}

            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Paid just now</span>
                <span className="font-semibold tabular-nums text-emerald-700">₹{paid.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-sm">
                <span className="font-medium text-gray-800">Balance due</span>
                <span className="text-lg font-bold tabular-nums text-gray-900">
                  ₹{remaining.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              onClick={onPayNow}
              size="lg"
              className="w-full h-12 text-base font-semibold"
              isLoading={isPaying}
              loadingLabel="Opening payment…"
            >
              Pay ₹{remaining.toFixed(2)} now
            </Button>

            <button
              type="button"
              onClick={onPayLater}
              disabled={isPaying}
              className="w-full text-sm font-medium text-gray-500 transition-colors hover:text-gray-800 disabled:opacity-50"
            >
              Pay later from My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
