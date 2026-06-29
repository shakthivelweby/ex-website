"use client";

/** Site header (52px mobile / 60px sm+) + this bar (h-14) for sticky sidebar offset */
export const DETAIL_SIDEBAR_STICKY_TOP = "top-[108px] sm:top-[116px]";

export default function DetailSubHeader({
  backLabel,
  onBack,
  onShare,
  shareAriaLabel,
  title,
}) {
  return (
    <div className="sticky top-[52px] z-40 border-b border-gray-200/80 bg-white sm:top-[60px]">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="fi-inline shrink-0 rounded-full px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 -ml-2"
        >
          <i className="fi fi-rr-arrow-left text-sm" aria-hidden="true" />
          <span>{backLabel}</span>
        </button>
        {title ? (
          <p className="hidden min-w-0 flex-1 truncate px-4 text-center text-sm font-medium text-gray-900 md:block">
            {title}
          </p>
        ) : (
          <span className="flex-1" aria-hidden="true" />
        )}
        <button
          type="button"
          onClick={onShare}
          className="fi-box h-9 w-9 shrink-0 rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
          aria-label={shareAriaLabel}
        >
          <i className="fi fi-rr-share text-sm" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
