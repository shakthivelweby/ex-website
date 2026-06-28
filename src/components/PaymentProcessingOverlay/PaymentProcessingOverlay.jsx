"use client";

import { useEffect } from "react";

const STAGES = {
  preparing: {
    title: "Preparing payment",
    message: "Setting up your secure checkout session…",
  },
  verifying: {
    title: "Confirming payment",
    message: "Verifying your transaction with Razorpay. This usually takes a few seconds.",
  },
  confirming: {
    title: "Finalizing booking",
    message: "Securing your reservation and sending your confirmation email…",
  },
};

export default function PaymentProcessingOverlay({ show, stage = "verifying" }) {
  const copy = STAGES[stage] || STAGES.verifying;

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-live="polite"
      aria-label={copy.title}
    >
      <div className="fixed inset-0 bg-gray-900/45 backdrop-blur-[3px]" />

      <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl shadow-gray-900/10 ring-1 ring-gray-100 animate-modal-pop overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -right-12 -top-12 h-40 w-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle at center, rgba(15,118,110,0.12) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle at center, rgba(15,118,110,0.08) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative px-8 pt-10 pb-8 text-center">
          <div className="relative mx-auto mb-6 h-[72px] w-[72px]">
            <div className="absolute inset-0 rounded-full border-2 border-primary-100" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-600 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-primary-50 flex items-center justify-center">
              <i className="fi fi-rr-shield-check text-xl text-primary-600" aria-hidden />
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-900 tracking-tight">{copy.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{copy.message}</p>

          <div className="mt-6 flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary-300 animate-pulse [animation-delay:300ms]" />
          </div>

          <p className="mt-5 text-[11px] text-gray-400">Please don&apos;t close this window</p>
        </div>
      </div>
    </div>
  );
}
