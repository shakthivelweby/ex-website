import { useEffect } from "react";

const VARIANTS = {
  cancelled: {
    eyebrow: "Payment incomplete",
    icon: "fi-rr-cross-circle",
    ring: "bg-amber-100/60",
    glow: "radial-gradient(circle at center, #f59e0b 0%, transparent 70%)",
    blob: "rgba(245, 158, 11, 0.12)",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50 border-amber-100",
    badge: "bg-amber-50 text-amber-800 border-amber-100",
  },
  error: {
    eyebrow: "Payment error",
    icon: "fi-rr-exclamation",
    ring: "bg-red-100/60",
    glow: "radial-gradient(circle at center, #ef4444 0%, transparent 70%)",
    blob: "rgba(239, 68, 68, 0.1)",
    iconColor: "text-red-500",
    iconBg: "bg-red-50 border-red-100",
    badge: "bg-red-50 text-red-700 border-red-100",
  },
  warning: {
    eyebrow: "Action needed",
    icon: "fi-rr-info",
    ring: "bg-orange-100/60",
    glow: "radial-gradient(circle at center, #f97316 0%, transparent 70%)",
    blob: "rgba(249, 115, 22, 0.1)",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50 border-orange-100",
    badge: "bg-orange-50 text-orange-800 border-orange-100",
  },
};

const ErrorPopup = ({
  show,
  onClose,
  title,
  message,
  hint,
  variant = "error",
  primaryAction,
  secondaryAction,
  closeOnBackdrop = true,
}) => {
  const styles = VARIANTS[variant] || VARIANTS.error;

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (show) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-popup-title"
      aria-describedby="error-popup-message"
    >
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={closeOnBackdrop ? onClose : undefined}
        />

        <div className="relative w-full max-w-md transform rounded-3xl bg-white shadow-2xl shadow-gray-900/10 ring-1 ring-gray-100 transition-all duration-300 animate-modal-pop">
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div
              className="absolute -right-16 -top-16 h-48 w-48 rounded-full"
              style={{
                background: `radial-gradient(circle at center, ${styles.blob} 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full"
              style={{
                background: `radial-gradient(circle at center, ${styles.blob} 0%, transparent 70%)`,
              }}
            />
          </div>

          <div className="relative px-6 sm:px-8 pt-7 pb-6 sm:pb-7">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <i className="fi fi-rr-cross text-sm"></i>
            </button>

            <div className="flex flex-col items-center text-center">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border mb-5 ${styles.badge}`}
              >
                {styles.eyebrow}
              </span>

              <div className="relative w-[72px] h-[72px] mb-5">
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{ background: styles.glow }}
                />
                <div className={`absolute inset-1.5 rounded-full ${styles.ring}`} />
                <div
                  className={`relative z-10 w-full h-full rounded-full border flex items-center justify-center shadow-sm ${styles.iconBg}`}
                >
                  <i className={`fi ${styles.icon} text-[1.65rem] ${styles.iconColor}`}></i>
                </div>
              </div>

              <h2
                id="error-popup-title"
                className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight animate-fade-in"
              >
                {title || "Something went wrong"}
              </h2>
              <p
                id="error-popup-message"
                className="mt-2 text-sm sm:text-[15px] leading-relaxed text-gray-600 max-w-[320px] animate-fade-in-delay"
              >
                {message || "Please try again."}
              </p>

              {hint ? (
                <div className="mt-4 w-full rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-start gap-3 text-left animate-fade-in-delay">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <i className="fi fi-rr-shield-check text-xs"></i>
                  </span>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{hint}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-7 flex flex-col-reverse sm:flex-row gap-3 animate-fade-in-delay-2">
              {secondaryAction ? (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  disabled={secondaryAction.isLoading || primaryAction?.isLoading}
                  className="flex-1 h-11 sm:h-12 px-4 border border-gray-200 bg-white text-gray-700 text-sm font-semibold rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {secondaryAction.label}
                </button>
              ) : null}
              {primaryAction ? (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.isLoading}
                  className={`flex-1 h-11 sm:h-12 px-4 bg-primary-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-md shadow-primary-600/15 hover:shadow-primary-600/25 disabled:opacity-70 disabled:cursor-not-allowed ${
                    secondaryAction ? "" : "w-full"
                  }`}
                >
                  {primaryAction.isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {primaryAction.loadingLabel || "Please wait…"}
                    </>
                  ) : (
                    <>
                      {primaryAction.label}
                      {primaryAction.icon ? (
                        <i className={`${primaryAction.icon} text-sm`}></i>
                      ) : null}
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;
