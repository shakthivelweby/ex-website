"use client";

import { useEffect } from "react";

export const PopupErrorIcon = () => (
  <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
    <i className="fi fi-rr-cross text-2xl text-red-500" />
  </div>
);

const DefaultSuccessIcon = () => (
  <div className="relative w-14 h-14">
    <div className="absolute inset-0 rounded-2xl bg-primary-500/20 animate-ping opacity-30" />
    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
      <i className="fi fi-rr-check text-2xl text-white animate-success-check" />
    </div>
  </div>
);

const SuccessPopup = ({
  show,
  onClose,
  title,
  message,
  icon,
  actionButton,
  continueLabel = "Continue",
}) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-popup-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[3px] transition-opacity"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <div className="relative w-full max-w-[380px] rounded-[24px] bg-white border border-gray-100 shadow-2xl shadow-black/10 animate-modal-pop overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400" />

        <div className="relative px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <i className="fi fi-rr-cross text-sm" />
          </button>

          <div className="flex justify-center mb-4 pt-1">
            {icon ?? <DefaultSuccessIcon />}
          </div>

          <div className="text-center space-y-1.5 mb-5 px-1">
            <h2
              id="success-popup-title"
              className="text-xl font-bold text-gray-900 tracking-tight animate-fade-in"
            >
              {title || "Success!"}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed animate-fade-in-delay">
              {message || "Your request has been processed successfully."}
            </p>
          </div>

          <div className="space-y-2.5 animate-fade-in-delay-2">
            {actionButton ? (
              <button
                type="button"
                onClick={actionButton.onClick}
                className="w-full h-11 bg-primary-500 text-white text-sm font-semibold rounded-full flex items-center justify-center hover:bg-primary-600 transition-all duration-200 shadow-md shadow-primary-500/25"
              >
                {actionButton.label}
                {actionButton.icon ? (
                  <i className={`${actionButton.icon} ml-2`} />
                ) : null}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full h-11 bg-primary-500 text-white text-sm font-semibold rounded-full flex items-center justify-center hover:bg-primary-600 transition-all duration-200 shadow-md shadow-primary-500/25"
              >
                {continueLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;
