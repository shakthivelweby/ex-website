"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import Button from "@/components/common/Button";

const STATUS_STYLES = {
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const SHARE_PATHS = {
  activity: (id) => `/my-bookings/activity/ticket/${id}`,
  event: (id) => `/my-bookings/event/ticket/${id}`,
  attraction: (id) => `/my-bookings/attraction/ticket/${id}`,
};

function getExperience(ticket) {
  return (
    ticket?.experience ||
    ticket?.activity ||
    ticket?.event ||
    ticket?.attraction ||
    {}
  );
}

function formatCurrency(amount) {
  return `₹ ${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function TicketPerforation({ className = "" }) {
  return (
    <div className={`relative h-6 ${className}`} aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-300 dark:border-gray-600" />
      <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-gray-950/70 dark:bg-black/80" />
      <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-gray-950/70 dark:bg-black/80" />
    </div>
  );
}

function ActionButton({ icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-1 flex-col items-center gap-2 rounded-2xl border border-gray-200/80 bg-white/70 px-3 py-4 text-center text-xs font-medium text-gray-700 backdrop-blur-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-200 dark:hover:bg-gray-900"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg dark:bg-gray-800">
        <i className={icon} />
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function BookingTicket({
  ticket,
  bookingId,
  bookingType = "activity",
  onDownloadPdf,
  onClose,
  showThemeToggle = true,
}) {
  const [detailsHidden, setDetailsHidden] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const experience = getExperience(ticket);
  const verifyUrl = ticket?.verification?.verify_url || "";
  const statusTone = ticket?.status?.tone || "neutral";
  const statusLabel = ticket?.status?.label || "Confirmed";
  const sharePath = SHARE_PATHS[bookingType]?.(bookingId) || SHARE_PATHS.activity(bookingId);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    if (!verifyUrl) return;
    let cancelled = false;
    QRCode.toDataURL(verifyUrl, {
      width: 280,
      margin: 1,
      color: { dark: "#111827", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [verifyUrl]);

  const shareText = useMemo(() => {
    const ref = ticket?.booking_reference || "";
    const name = experience.name || "Booking";
    const date = ticket?.visit_date_formatted || ticket?.visit_date || "";
    return `Explore World ticket for ${name}${date ? ` on ${date}` : ""}. Booking ID: ${ref}`;
  }, [ticket, experience.name]);

  const handleShare = async () => {
    const shareUrl =
      typeof window !== "undefined" ? `${window.location.origin}${sharePath}` : "";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Explore World Ticket",
          text: shareText,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareMessage("Link copied to clipboard");
      setTimeout(() => setShareMessage(""), 2500);
    } catch {
      setShareMessage("Could not share ticket");
      setTimeout(() => setShareMessage(""), 2500);
    }
  };

  const handleDownloadPdf = async () => {
    if (!onDownloadPdf) return;
    try {
      setPdfLoading(true);
      const blob = await onDownloadPdf(bookingId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `explore-world-ticket-${ticket?.booking_reference || bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setShareMessage("PDF download failed");
      setTimeout(() => setShareMessage(""), 2500);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDirections = () => {
    const url = experience.directions_url;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSupport = () => {
    window.open("/contact", "_blank", "noopener,noreferrer");
  };

  const pricing = ticket?.pricing || {};
  const customer = ticket?.customer || {};

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-gray-950/75 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full max-w-lg flex-col px-3 py-4 sm:px-4 sm:py-8">
        <div className="mb-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Your Ticket</h1>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full p-2 hover:bg-white/10"
              aria-label="Share ticket"
            >
              <i className="fi fi-rr-share" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {showThemeToggle && (
              <button
                type="button"
                onClick={() => setIsDark((v) => !v)}
                className="rounded-full p-2 hover:bg-white/10"
                aria-label="Toggle theme"
              >
                <i className={`fi fi-rr-${isDark ? "sun" : "moon"}`} />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-lg"
                aria-label="Close"
              >
                <i className="fi fi-rr-cross-small text-lg" />
              </button>
            )}
          </div>
        </div>

        {shareMessage && (
          <div className="mb-3 rounded-xl bg-white/10 px-4 py-2 text-center text-sm text-white">
            {shareMessage}
          </div>
        )}

        <div className="overflow-hidden rounded-[28px] border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/90">
          <div className="relative p-4 sm:p-5">
            <div className="flex gap-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                {experience.thumb_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={experience.thumb_image}
                    alt={experience.name || "Booking"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <i className="fi fi-rr-picture text-2xl" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold leading-tight text-gray-900 dark:text-white">
                    {experience.name}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[statusTone] || STATUS_STYLES.neutral}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {ticket?.visit_date_formatted || ticket?.visit_date}
                  {ticket?.visit_time_slot ? ` · ${ticket.visit_time_slot}` : ""}
                </p>
                {experience.location && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    <i className="fi fi-rr-marker mr-1" />
                    {experience.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          <TicketPerforation />

          <div className="px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() => setDetailsHidden((v) => !v)}
              className="mx-auto block rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              {detailsHidden ? "Tap to show details" : "Tap to hide details"}
            </button>
          </div>

          {!detailsHidden && (
            <div className="space-y-1 px-4 pb-4 text-center sm:px-5">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {ticket?.ticket_quantity || 1} Ticket(s)
              </p>
              {experience.location && (
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  {experience.location.split(",")[0]}
                </p>
              )}
              <div className="mt-3 grid grid-cols-1 gap-2 text-left text-sm">
                <div className="flex justify-between gap-3 border-b border-gray-100 py-2 dark:border-gray-800">
                  <span className="text-gray-500">Guest</span>
                  <span className="font-medium text-gray-900 dark:text-white">{customer.name || "—"}</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-gray-100 py-2 dark:border-gray-800">
                  <span className="text-gray-500">Email</span>
                  <span className="truncate font-medium text-gray-900 dark:text-white">{customer.email || "—"}</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-gray-100 py-2 dark:border-gray-800">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-900 dark:text-white">{customer.phone || "—"}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center px-4 pb-4 sm:px-5">
            {qrDataUrl ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-inner dark:border-gray-700 dark:bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="Ticket QR code" className="h-52 w-52" />
              </div>
            ) : (
              <div className="flex h-52 w-52 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                <span className="text-sm text-gray-500">Generating QR…</span>
              </div>
            )}
            <p className="mt-4 text-sm font-bold tracking-wide text-gray-900 dark:text-white">
              BOOKING ID: {ticket?.booking_reference}
            </p>
          </div>

          {ticket?.cancellation_policy && (
            <div className="mx-4 mb-4 rounded-xl bg-gray-100 px-4 py-3 text-center text-xs leading-relaxed text-gray-600 dark:bg-gray-800 dark:text-gray-300 sm:mx-5">
              {ticket.cancellation_policy}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-4 sm:px-5">
            <ActionButton
              icon="fi fi-rr-download"
              label={pdfLoading ? "Downloading…" : "Download PDF"}
              onClick={handleDownloadPdf}
              disabled={pdfLoading || !onDownloadPdf}
            />
            <ActionButton icon="fi fi-rr-share" label="Share Ticket" onClick={handleShare} />
            <ActionButton
              icon="fi fi-rr-map-marker"
              label="Directions"
              onClick={handleDirections}
              disabled={!experience.directions_url}
            />
            <ActionButton icon="fi fi-rr-headset" label="Support" onClick={handleSupport} />
          </div>

          <TicketPerforation />

          <div className="space-y-2 px-4 py-5 sm:px-5">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Ticket(s) price ({ticket?.ticket_quantity || 1})</span>
                <span>{formatCurrency(pricing.subtotal_after_discount)}</span>
              </div>
              {Number(pricing.gst_amount) > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>GST ({pricing.gst_percent}%)</span>
                  <span>{formatCurrency(pricing.gst_amount)}</span>
                </div>
              )}
              {Number(pricing.convenience_fee_amount) > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Convenience fee</span>
                  <span>{formatCurrency(pricing.convenience_fee_amount)}</span>
                </div>
              )}
              {Number(pricing.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span>-{formatCurrency(pricing.discount_amount)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(pricing.grand_total)}
              </span>
            </div>
          </div>
        </div>

        {onClose && (
          <div className="mt-4 hidden sm:block">
            <Button variant="outline" className="w-full !bg-white/10 !text-white !border-white/20" onClick={onClose}>
              Back to My Bookings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
