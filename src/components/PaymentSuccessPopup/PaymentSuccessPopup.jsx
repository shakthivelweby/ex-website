"use client";

import { useEffect } from "react";

export default function PaymentSuccessPopup({
  show,
  onClose,
  title,
  message,
  rentalTitle,
  itemLabel,
  itemTitle,
  amountPaid,
  tripPickup,
  tripReturn,
  detailLeftLabel,
  detailLeft,
  detailRightLabel,
  detailRight,
  emailSent,
  userEmail,
  primaryAction,
  secondaryAction,
}) {
  const resolvedItemTitle = itemTitle || rentalTitle;
  const resolvedItemLabel = itemLabel || (rentalTitle ? "Your rental" : null);
  const resolvedDetailLeft = detailLeft || tripPickup;
  const resolvedDetailRight = detailRight || tripReturn;
  const resolvedDetailLeftLabel = detailLeftLabel || (tripPickup ? "Pickup" : null);
  const resolvedDetailRightLabel = detailRightLabel || (tripReturn ? "Return" : null);
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (show) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-success-title"
    >
      <div className="flex min-h-full sm:min-h-screen items-end sm:items-center justify-center p-4 pb-6 sm:p-6">
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px]"
          onClick={onClose}
        />

        <div className="relative w-full max-w-md transform rounded-3xl bg-white shadow-2xl shadow-gray-900/10 ring-1 ring-gray-100 transition-all duration-300 animate-modal-pop overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute -right-16 -top-16 h-48 w-48 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(16,185,129,0.14) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(15,118,110,0.1) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative">
            <div className="bg-gradient-to-b from-primary-50/80 to-white px-6 sm:px-8 pt-8 pb-6 text-center">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-colors"
                aria-label="Close"
              >
                <i className="fi fi-rr-cross text-sm" />
              </button>

              <div className="relative mx-auto mb-5 h-[76px] w-[76px]">
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: "radial-gradient(circle at center, #10b981 0%, transparent 70%)",
                  }}
                />
                <div className="absolute inset-1.5 rounded-full bg-emerald-100/70 animate-pulse" />
                <div className="relative flex h-full w-full items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-emerald-100">
                    <i className="fi fi-rr-check text-[1.65rem] text-emerald-500 animate-success-check" />
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100 mb-3">
                <i className="fi fi-rr-badge-check text-xs" />
                Booking confirmed
              </span>

              <h2
                id="payment-success-title"
                className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight animate-fade-in"
              >
                {title || "Payment successful!"}
              </h2>
              {message ? (
                <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-gray-600 animate-fade-in-delay">
                  {message}
                </p>
              ) : null}
            </div>

            {(resolvedItemTitle || amountPaid || resolvedDetailLeft) && (
              <div className="px-6 sm:px-8 pb-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 space-y-3 animate-fade-in-delay">
                  {resolvedItemTitle ? (
                    <div>
                      {resolvedItemLabel ? (
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                          {resolvedItemLabel}
                        </p>
                      ) : null}
                      <p className="text-sm font-bold text-gray-900">{resolvedItemTitle}</p>
                    </div>
                  ) : null}

                  {(resolvedDetailLeft || resolvedDetailRight) && (
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-200/80">
                      {resolvedDetailLeft ? (
                        <div>
                          {resolvedDetailLeftLabel ? (
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
                              {resolvedDetailLeftLabel}
                            </p>
                          ) : null}
                          <p className="text-xs font-semibold text-gray-800 leading-snug">{resolvedDetailLeft}</p>
                        </div>
                      ) : null}
                      {resolvedDetailRight ? (
                        <div>
                          {resolvedDetailRightLabel ? (
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
                              {resolvedDetailRightLabel}
                            </p>
                          ) : null}
                          <p className="text-xs font-semibold text-gray-800 leading-snug">{resolvedDetailRight}</p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {amountPaid ? (
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200/80">
                      <span className="text-xs text-gray-600">Amount paid</span>
                      <span className="text-base font-bold text-primary-700">₹{amountPaid}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {emailSent && userEmail ? (
              <div className="px-6 sm:px-8 pt-3 pb-1">
                <div className="flex items-start gap-3 rounded-xl bg-primary-50/60 border border-primary-100 px-4 py-3 text-left">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm">
                    <i className="fi fi-rr-envelope text-xs" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-primary-800">Confirmation email sent</p>
                    <p className="text-xs text-primary-700/80 mt-0.5 break-all">{userEmail}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="px-6 sm:px-8 py-6 flex flex-col-reverse sm:flex-row gap-3 animate-fade-in-delay-2">
              {secondaryAction ? (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className="w-full sm:flex-1 shrink-0 min-h-11 h-11 sm:min-h-12 sm:h-12 px-4 border border-gray-200 bg-white text-gray-700 text-sm font-semibold rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  {secondaryAction.label}
                </button>
              ) : null}
              {primaryAction ? (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  className="w-full sm:flex-1 shrink-0 min-h-11 h-11 sm:min-h-12 sm:h-12 px-4 bg-primary-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-md shadow-primary-600/15"
                >
                  {primaryAction.label}
                  {primaryAction.icon ? <i className={`${primaryAction.icon} text-sm`} /> : null}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
