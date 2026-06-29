import InlineSpinner from "./InlineSpinner";

export default function PageLoader({
  message,
  className = "",
  spinnerClassName = "h-12 w-12 text-primary-500",
}) {
  return (
    <div
      className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        <InlineSpinner className={`mx-auto mb-4 ${spinnerClassName}`} />
        {message ? <p className="text-gray-600">{message}</p> : null}
      </div>
    </div>
  );
}
