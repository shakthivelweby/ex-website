"use client";

export default function PickupLocationPicker({
  options = [],
  selectedName = "",
  onSelect,
  label = "Choose your pickup location",
  required = false,
}) {
  if (!options.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
        No pickup locations available.
      </div>
    );
  }

  if (options.length === 1) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
        {options[0].name}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-600">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </p>
      <div className="space-y-2" role="radiogroup" aria-label="Pickup location">
        {options.map((opt) => {
          const selected = selectedName === opt.name;
          return (
            <button
              key={String(opt.id)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect?.(opt)}
              className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${
                selected
                  ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                  : "border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 ${
                    selected ? "border-primary-500 bg-primary-500" : "border-gray-300 bg-white"
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 leading-snug">{opt.name}</p>
                  {opt.is_primary ? (
                    <p className="text-xs text-gray-500 mt-0.5">Main pickup point</p>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
