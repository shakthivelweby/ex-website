"use client";

import Button from "@/components/common/Button";

function FilterPill({ label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
      <i className="fi fi-rr-filter text-[10px] text-primary-600" aria-hidden="true" />
      {label}
    </span>
  );
}

function SuggestionChip({ label, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-all hover:border-primary-200 hover:bg-primary-50/50 hover:text-primary-700"
    >
      {icon ? <i className={`${icon} text-base text-primary-600`} aria-hidden="true" /> : null}
      <span>{label}</span>
      <i className="fi fi-rr-arrow-small-right text-xs text-gray-400" aria-hidden="true" />
    </button>
  );
}

export default function ListingsEmptyState({
  icon = "fi fi-rr-search-alt",
  title = "No results found",
  subtitle,
  description,
  hasActiveFilters = false,
  onClearFilters,
  clearLabel = "Clear all filters",
  onBrowseAll,
  browseAllLabel = "Browse everything",
  activeFilterLabels = [],
  suggestions = [],
  suggestionsTitle = "Try these instead",
}) {
  const resolvedSubtitle =
    subtitle ||
    (hasActiveFilters
      ? "Your filters are a bit too narrow"
      : "Nothing here yet");

  const resolvedDescription =
    description ||
    (hasActiveFilters
      ? "We couldn't find listings that match everything you selected. Reset filters or pick a suggestion below."
      : "Check back soon — new experiences are added regularly.");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-br from-gray-50 via-white to-primary-50/30 px-5 py-12 sm:px-10 sm:py-16">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-100/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-amber-100/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="relative mb-8">
          <div
            className="absolute inset-0 scale-110 rounded-[28px] bg-primary-500/10 blur-xl"
            aria-hidden="true"
          />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] bg-gray-900 text-white shadow-lg shadow-gray-900/20 ring-4 ring-white">
            <i className={`${icon} text-3xl`} aria-hidden="true" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary-500 text-white shadow-md">
            <i className="fi fi-rr-search text-sm" aria-hidden="true" />
          </span>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600">
          {resolvedSubtitle}
        </p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-[1.65rem]">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-600 sm:text-[15px]">
          {resolvedDescription}
        </p>

        {activeFilterLabels.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {activeFilterLabels.map((label) => (
              <FilterPill key={label} label={label} />
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {hasActiveFilters && onClearFilters ? (
            <Button type="button" size="lg" onClick={onClearFilters}>
              {clearLabel}
            </Button>
          ) : null}
          {onBrowseAll ? (
            <Button type="button" variant="outline" size="lg" onClick={onBrowseAll}>
              {browseAllLabel}
            </Button>
          ) : null}
        </div>

        {suggestions.length > 0 ? (
          <div className="mt-10 w-full border-t border-gray-200/80 pt-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
              {suggestionsTitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {suggestions.map((item) => (
                <SuggestionChip
                  key={item.id || item.label}
                  label={item.label}
                  icon={item.icon}
                  onClick={item.onClick}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
