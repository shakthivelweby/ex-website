import InlineSpinner from "./InlineSpinner";

export default function SectionLoader({ message = "Loading...", className = "py-12" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-gray-500 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <InlineSpinner className="h-8 w-8 text-primary-500" />
      <p className="text-sm font-medium text-gray-600">{message}</p>
    </div>
  );
}
