/** Shared mobile-friendly layout classes for my-bookings cards. */

export const bookingListPadding = "p-3 sm:p-6";

export const bookingCardClass =
  "bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300";

export const bookingCardHeaderClass =
  "flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between";

export const bookingCardMainClass = "flex-1 min-w-0";

export const bookingCardTitleRowClass =
  "flex flex-col gap-2 md:flex-row md:items-center md:gap-4";

export const bookingCardMetaClass = "flex flex-wrap gap-2 min-w-0";

export const bookingCardChipClass =
  "text-xs px-3 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap shrink-0";

export const bookingCardLocationChipClass =
  "text-xs px-3 py-1 rounded-full flex items-center gap-1.5 max-w-full min-w-0";

export const bookingCardPriceClass =
  "flex flex-col items-start gap-2 shrink-0 md:items-end";

export const bookingCardActionsClass =
  "grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 sm:flex sm:flex-row sm:flex-wrap sm:items-center";

export const bookingActionBtnClass =
  "!w-full sm:!w-auto !rounded-full !text-xs !px-3 sm:!px-4 !py-2.5 flex items-center justify-center";

export const bookingActionBtnWideClass = `${bookingActionBtnClass} col-span-2 sm:col-span-1`;

export const bookingPaginationClass =
  "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6 sm:mt-8 pt-6 border-t border-gray-200";
