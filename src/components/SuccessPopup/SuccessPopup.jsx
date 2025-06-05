import { useEffect } from "react";

const SuccessPopup = ({ show, onClose, title, message, icon, actionButton }) => {
  // Close popup on escape key
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300" 
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-sm transform rounded-2xl bg-white shadow-xl transition-all duration-300 animate-modal-pop">
          {/* Background Decoration */}
          <div className="absolute inset-0">
            <div 
              className="absolute -right-10 -top-10 h-40 w-40 rounded-full" 
              style={{
                background: "radial-gradient(circle at center, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0) 70%)"
              }}
            />
            <div 
              className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full" 
              style={{
                background: "radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)"
              }}
            />
          </div>

          {/* Content Container */}
          <div className="relative px-6 pt-8 pb-6">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <i className="fi fi-rr-cross text-base"></i>
            </button>

            {/* Success Icon */}
            <div className="mb-6">
              <div className="relative w-20 h-20 mx-auto">
                <div 
                  className="absolute inset-0 rounded-full opacity-25"
                  style={{
                    background: "radial-gradient(circle at center, #22c55e 0%, transparent 70%)"
                  }}
                />
                <div className="absolute inset-2 rounded-full bg-green-100/50 animate-pulse" />
                <div className="relative h-full flex items-center justify-center">
                  {icon ? (
                    icon
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-green-100 animate-success-ring" />
                      <div className="relative z-10 w-16 h-16 rounded-full bg-white flex items-center justify-center">
                        <i className="fi fi-rr-check text-2xl text-green-500 animate-success-check"></i>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 animate-fade-in">
                {title || "Success!"}
              </h2>
              <p className="text-gray-600 animate-fade-in-delay">
                {message || "Your request has been processed successfully."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {actionButton && (
                <button
                  onClick={actionButton.onClick}
                  className="w-full h-12 bg-primary-600 text-white font-medium rounded-full flex items-center justify-center hover:bg-primary-700 transition-all duration-200 animate-fade-in-delay-2 shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30"
                >
                  {actionButton.label}
                  {actionButton.icon && (
                    <i className={`${actionButton.icon} ml-2`}></i>
                  )}
                </button>
              )}
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;
