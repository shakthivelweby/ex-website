"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/common/Button";

const isUsableImageUrl = (value) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  !value.endsWith("/thumb/") &&
  !value.endsWith("/cover/") &&
  !value.endsWith("/thumbnails/") &&
  !value.endsWith("/gallery/");

const firstImageUrl = (...candidates) =>
  candidates.find((url) => isUsableImageUrl(url)) || null;

export function resolveBookingImage(booking, type) {
  if (!booking) return null;

  switch (type) {
    case "package": {
      const pkg = booking.package;
      return firstImageUrl(
        pkg?.images?.[0]?.image_url,
        pkg?.cover_image,
        pkg?.thumb_image,
        pkg?.image_url
      );
    }
    case "event": {
      const ev = booking.event;
      return firstImageUrl(ev?.cover_image, ev?.thumb_image);
    }
    case "attraction": {
      const att = booking.attraction;
      return firstImageUrl(att?.cover_image, att?.thumb_image);
    }
    case "activity": {
      const act = booking.activity;
      return firstImageUrl(act?.cover_image, act?.thumb_image, act?.image);
    }
    case "rental": {
      const item = booking.item;
      return firstImageUrl(
        item?.thumbnail_image_url,
        item?.gallery_images?.[0]?.image_url,
        item?.images?.[0]?.image_url
      );
    }
    default:
      return null;
  }
}

export function BookingCardImage({ src, alt, fallbackIcon = "fi fi-rr-image", href }) {
  const imageBlock = (
    <div className="relative w-full sm:w-36 md:w-44 lg:w-48 aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 shrink-0 shadow-sm">
      {src ? (
        <Image
          src={src}
          alt={alt || "Booking"}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, 192px"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
          <i className={`${fallbackIcon} text-3xl text-primary-400/80`} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block shrink-0 group">
        {imageBlock}
      </Link>
    );
  }

  return imageBlock;
}

export const bookingCardClass =
  "group bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-100 transition-all duration-300";

export const metaPillClass =
  "text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5 border border-gray-100/80";

export const metaIconClass = "text-primary-500";

export const accentPillClass =
  "text-xs px-3 py-1 rounded-full bg-primary-50 text-primary-700 flex items-center gap-1.5 border border-primary-100/80";

export function BookingsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-primary-100" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-sm text-gray-500">Loading your bookings…</p>
    </div>
  );
}

export function BookingsError({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-white/90 backdrop-blur-sm p-8 text-center shadow-sm">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
        <i className="fi fi-rr-exclamation text-2xl text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-red-600/90 text-sm max-w-md mx-auto mb-6">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="!rounded-full">
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function BookingsEmpty({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-10 md:p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
        <i className={`${icon} text-2xl text-primary-500`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm leading-relaxed">{description}</p>
      <Button
        variant="primary"
        size="lg"
        onClick={onAction}
        className="!rounded-full !px-6 !py-2.5 !text-sm !font-semibold !shadow-md !shadow-primary-500/20"
      >
        <i className="fi fi-rr-search mr-2" />
        {actionLabel}
      </Button>
    </div>
  );
}

export function BookingsPagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
}) {
  if (lastPage <= 1) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200/80">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{from}</span>–
        <span className="font-medium text-gray-700">{to}</span> of{" "}
        <span className="font-medium text-gray-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="!rounded-full !px-4 !py-2"
        >
          <i className="fi fi-rr-angle-left mr-1" />
          Prev
        </Button>
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-[2.25rem] h-9 px-2 text-sm font-medium rounded-full transition-all ${
                page === currentPage
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                  : "text-gray-500 hover:text-primary-600 hover:bg-primary-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <span className="sm:hidden text-sm text-gray-500 px-2">
          {currentPage} / {lastPage}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="!rounded-full !px-4 !py-2"
        >
          Next
          <i className="fi fi-rr-angle-right ml-1" />
        </Button>
      </div>
    </div>
  );
}

export function BookingsList({ children }) {
  return <div className="space-y-4 md:space-y-5">{children}</div>;
}
