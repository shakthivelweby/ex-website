"use client";

export const fieldClass =
  "w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/15";

export const inputClass = `${fieldClass} text-gray-700 placeholder:text-[11px] placeholder:text-gray-400 placeholder:font-normal`;

export const selectClass = `listing-filter-select rental-filter-select ${fieldClass}`;

export const getSelectClass = (hasValue) =>
  `${selectClass} ${hasValue ? "text-gray-800" : "text-gray-400"}`;

export const pillClass = (active) =>
  `rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
    active
      ? "bg-primary-500 text-white shadow-sm"
      : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
  }`;

export const FilterField = ({ icon, label, onClear, showClear, children }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        <i className={`${icon} text-[11px] text-gray-400`} aria-hidden />
        {label}
      </label>
      {showClear && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] font-medium text-primary-600 hover:text-primary-700"
        >
          Clear
        </button>
      ) : null}
    </div>
    {children}
  </div>
);

export const FilterSidebarShell = ({ activeCount, onClearAll, children, footer }) => (
  <div className="h-fit overflow-visible rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <i className="fi fi-rr-settings-sliders text-sm" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900">Filters</p>
          <p className="text-[11px] text-gray-500">Refine your search</p>
        </div>
      </div>
      {activeCount > 0 ? (
        <button
          type="button"
          onClick={onClearAll}
          className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-primary-600 transition-colors hover:bg-primary-50"
        >
          Clear ({activeCount})
        </button>
      ) : null}
    </div>
    <div className="overflow-visible px-4 py-4">{children}</div>
    {footer}
  </div>
);

export const FilterMobileFooter = ({ onClearAll, onClose }) => (
  <div className="flex gap-3 border-t border-gray-100 pt-4">
    <button
      type="button"
      onClick={onClearAll}
      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
    >
      Clear all
    </button>
    <button
      type="button"
      onClick={onClose}
      className="flex-1 rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
    >
      Show results
    </button>
  </div>
);
