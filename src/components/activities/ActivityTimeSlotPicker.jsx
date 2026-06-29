"use client";

export default function ActivityTimeSlotPicker({
  slots,
  value,
  onChange,
  error,
  disabled = false,
  disabledMessage = "Select a visit date to see available time slots",
  emptyMessage = "No time slots available for this date. Try another date.",
}) {
  if (disabled) {
    return <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-3 py-2.5 text-xs text-gray-500">{disabledMessage}</p>;
  }

  if (!slots.length) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-2">
        {slots.map((slot) => {
          const isSelected = String(value) === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onChange(slot.id)}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                isSelected
                  ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500/20"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              aria-pressed={isSelected}
            >
              <span
                className={`fi-box h-5 w-5 shrink-0 rounded-full border transition-colors ${
                  isSelected
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-gray-300 bg-white text-transparent"
                }`}
              >
                {isSelected ? <i className="fi fi-rr-check text-[10px]" aria-hidden="true" /> : null}
              </span>
              <span className="fi-inline min-w-0 flex-1 text-sm font-semibold text-gray-900">
                <i className="fi fi-rr-clock text-xs text-primary-600" aria-hidden="true" />
                <span className="truncate">{slot.label}</span>
              </span>
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-1.5 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
