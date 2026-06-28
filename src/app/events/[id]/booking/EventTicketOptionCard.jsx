"use client";

/** Wallet tray bg — perforation notches match this */
export const EVENT_TICKET_WALLET_BG = "#e9e9ec";

export default function EventTicketOptionCard({
  name,
  price,
  originalPrice,
  hasDiscount,
  availability,
  maxQty,
  isSoldOut,
  qty,
  isSelected,
  lineTotal,
  onDecrease,
  onIncrease,
}) {
  return (
    <div
      className={`relative transition-all duration-200 ${
        isSelected
          ? "shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
          : isSoldOut
            ? "opacity-50"
            : "hover:shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
      }`}
    >
      <div
        className={`relative flex items-stretch overflow-hidden rounded-md ${
          isSelected
            ? "bg-white ring-2 ring-gray-900"
            : "bg-white ring-1 ring-gray-200"
        }`}
      >
        {/* Perforated spine */}
        <div
          className="w-1.5 shrink-0 bg-[repeating-linear-gradient(180deg,#d4d4d8_0px,#d4d4d8_1px,transparent_1px,transparent_4px)]"
          aria-hidden="true"
        />

        {/* Body */}
        <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h5 className="truncate text-sm font-semibold tracking-tight text-gray-900">
                {name}
              </h5>
              {hasDiscount ? (
                <span className="shrink-0 text-[9px] font-medium uppercase tracking-widest text-gray-400">
                  Sale
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-[11px] text-gray-500">
              {availability}
              {!isSoldOut && maxQty < 99 ? ` · max ${maxQty}` : ""}
            </p>
          </div>

          <div className="shrink-0 text-right">
            {hasDiscount ? (
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="text-xs text-gray-400 line-through tabular-nums">
                  ₹{originalPrice}
                </span>
                <span className="text-base font-bold tabular-nums text-gray-900">
                  ₹{price}
                </span>
              </div>
            ) : (
              <span className="text-base font-bold tabular-nums text-gray-900">
                ₹{price}
              </span>
            )}
            {isSelected && lineTotal ? (
              <p className="mt-0.5 text-[10px] font-medium tabular-nums text-gray-500">
                {lineTotal}
              </p>
            ) : (
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-400">
                each
              </p>
            )}
          </div>
        </div>

        {/* Perforation tear line */}
        <div className="relative w-2.5 shrink-0 self-stretch" aria-hidden="true">
          <div className="absolute inset-y-1.5 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-gray-300" />
          <div
            className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
            style={{ backgroundColor: EVENT_TICKET_WALLET_BG }}
          />
          <div
            className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
            style={{ backgroundColor: EVENT_TICKET_WALLET_BG }}
          />
        </div>

        {/* Stub */}
        <div className="flex w-[4.25rem] shrink-0 flex-col items-center justify-center gap-1 bg-gray-50 px-1.5 py-1.5 sm:w-[4.5rem]">
          <span className="text-[7px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Admit
          </span>

          <div className="flex w-full items-center justify-between rounded border border-gray-200 bg-white p-0.5">
            <button
              type="button"
              onClick={onDecrease}
              disabled={qty <= 0}
              aria-label={`Decrease ${name} quantity`}
              className="flex h-6 w-6 items-center justify-center rounded-sm text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-25 sm:h-7 sm:w-7"
            >
              <i className="fi fi-rr-minus text-[10px]" />
            </button>

            <span
              className={`min-w-[1rem] text-center text-sm font-bold tabular-nums ${
                isSelected ? "text-gray-900" : "text-gray-700"
              }`}
              aria-live="polite"
            >
              {qty}
            </span>

            <button
              type="button"
              onClick={onIncrease}
              disabled={isSoldOut || qty >= maxQty}
              aria-label={`Increase ${name} quantity`}
              className="flex h-6 w-6 items-center justify-center rounded-sm bg-gray-900 text-white transition-colors hover:bg-gray-800 disabled:opacity-25 sm:h-7 sm:w-7"
            >
              <i className="fi fi-rr-plus text-[10px]" />
            </button>
          </div>

          <div className="flex h-1.5 w-full items-end justify-center gap-px opacity-30" aria-hidden="true">
            {[2, 1, 3, 1, 2, 3, 1, 2].map((h, i) => (
              <span
                key={i}
                className="w-px rounded-full bg-gray-800"
                style={{ height: `${h + 1}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
