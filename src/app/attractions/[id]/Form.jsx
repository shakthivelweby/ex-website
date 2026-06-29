"use client";

import { useState, useEffect, useMemo } from "react";
import Button from "@/components/common/Button";
import PaymentTrustPanel from "@/components/booking/PaymentTrustPanel";
import isLogin from "@/utils/isLogin";
import { useNavigateWithLoading } from "@/hooks/useNavigateWithLoading";
import AttractionVisitDatePicker from "@/components/attractions/AttractionVisitDatePicker";
import { getTicketPricesForDate } from "./service";
import {
  dateToYmd,
} from "@/utils/closeoutUtils";
import { minDisplayedEntryFeeFromRows } from "@/utils/attractionPricing";
import InlineSpinner from "@/components/loading/InlineSpinner";

function formatVisitDateLabel(dateStr) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MetaChip({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <span className="fi-box h-8 w-8 shrink-0 rounded-md border border-gray-200 bg-white text-primary-600">
        <i className={`${icon} text-sm`} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className="truncate text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

const Form = ({
  attractionDetails,
  isMobilePopup = false,
  enquireOnly = false,
  selectedTickets: propSelectedTickets,
  totalPrice: propTotalPrice,
}) => {
  const { isNavigating, navigate } = useNavigateWithLoading();
  const isFreeBooking = enquireOnly || Boolean(attractionDetails?.freeBooking);
  const [isLoading, setIsLoading] = useState(false);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState(propSelectedTickets || {});
  const [totalPrice, setTotalPrice] = useState(propTotalPrice || 0);
  const [selectedDate, setSelectedDate] = useState(attractionDetails?.selectedDate || "");
  const [ticketPrices, setTicketPrices] = useState(attractionDetails?.dateSpecificPricing || []);

  const ticketTypeIds = useMemo(
    () =>
      (ticketPrices || [])
        .map((row) => row?.attraction_ticket_type_id)
        .filter(Boolean),
    [ticketPrices]
  );

  useEffect(() => {
    if (attractionDetails?.dateSpecificPricing && attractionDetails?.selectedDate) {
      setTicketPrices(attractionDetails.dateSpecificPricing);
      setSelectedDate(attractionDetails.selectedDate);
    }
  }, [attractionDetails?.dateSpecificPricing, attractionDetails?.selectedDate]);

  useEffect(() => {
    if (propSelectedTickets) setSelectedTickets(propSelectedTickets);
    if (propTotalPrice) setTotalPrice(propTotalPrice);
  }, [propSelectedTickets, propTotalPrice]);

  const handleDateChange = async (date) => {
    const dateString = date ? dateToYmd(date) : "";
    setSelectedDate(dateString);
    if (!dateString || !attractionDetails?.id) return;

    localStorage.setItem(`attraction_${attractionDetails.id}_selectedDate`, dateString);
    try {
      setPricesLoading(true);
      const response = await getTicketPricesForDate(attractionDetails.id, dateString);
      if (response?.data?.ticket_prices) {
        setTicketPrices(response.data.ticket_prices);
      }
    } catch (error) {
      console.error("Error fetching date-specific pricing:", error);
    } finally {
      setPricesLoading(false);
    }
  };

  const handleTicketSelection = () => {
    if (!isLogin()) {
      window.dispatchEvent(new CustomEvent("showLogin"));
      return;
    }
    if (selectedDate) {
      localStorage.setItem(`attraction_${attractionDetails.id}_selectedDate`, selectedDate);
    }
    navigate(`/attractions/${attractionDetails.id}/booking`);
  };

  const submitHandler = async () => {
    setIsLoading(true);
    try {
      if (!isLogin()) {
        window.dispatchEvent(new CustomEvent("showLogin"));
        return;
      }
      if (Object.keys(selectedTickets).length === 0 || !selectedDate) return;
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedTicketsCount = () =>
    Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0);

  const displayPrice = (() => {
    if (isFreeBooking) return "Free booking";
    const minFee = minDisplayedEntryFeeFromRows(ticketPrices);
    if (minFee != null && minFee > 0) return `₹${minFee}`;
    return attractionDetails.price;
  })();

  const visitDateObj = selectedDate ? new Date(`${selectedDate}T12:00:00`) : null;
  const hoursLabel = [attractionDetails.openingTime, attractionDetails.closingTime]
    .filter(Boolean)
    .join(" – ");

  return (
    <div className={isMobilePopup ? "pb-24" : ""}>
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="border-b border-gray-100 px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Book your visit
          </p>
          <h2 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-gray-900">
            {attractionDetails.title}
          </h2>
          {attractionDetails.categoryName || attractionDetails.categories?.[0] ? (
            <span className="mt-1.5 inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
              {attractionDetails.categoryName || attractionDetails.categories[0]}
            </span>
          ) : null}
        </div>

        <div className="space-y-2 border-b border-gray-100 px-4 py-3.5">
          {hoursLabel ? (
            <MetaChip icon="fi fi-rr-clock" label="Open hours" value={hoursLabel} />
          ) : null}
          <div className="flex items-center justify-between rounded-lg bg-gray-900 px-3.5 py-2.5 text-white">
            <span className="text-xs font-medium text-gray-400">From</span>
            <span className="text-xl font-bold tabular-nums">{displayPrice}</span>
          </div>
        </div>

        <div className="border-b border-gray-100 px-4 py-3.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className="text-xs font-semibold text-gray-900">Visit date</label>
            {pricesLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <InlineSpinner className="h-3.5 w-3.5 text-primary-500" />
                Updating prices…
              </span>
            ) : null}
          </div>
          <p className="mb-2.5 text-xs text-gray-500">
            Green dates are available to book. Amber dates use seasonal rates. Red dates are
            unavailable.
          </p>
          <div className="relative">
            {isMobilePopup ? (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <AttractionVisitDatePicker
                  closeoutDates={attractionDetails.closeoutDates}
                  seasonalDates={attractionDetails.seasonalDates}
                  ticketTypeIds={ticketTypeIds}
                  selected={visitDateObj}
                  onChange={handleDateChange}
                  inline
                />
              </div>
            ) : (
              <>
                <AttractionVisitDatePicker
                  closeoutDates={attractionDetails.closeoutDates}
                  seasonalDates={attractionDetails.seasonalDates}
                  ticketTypeIds={ticketTypeIds}
                  selected={visitDateObj}
                  onChange={handleDateChange}
                  placeholderText="Choose date"
                  className="h-11 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 pr-10 font-medium text-gray-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <i className="fi fi-rr-calendar text-lg" aria-hidden="true" />
                </div>
              </>
            )}
          </div>
          {isMobilePopup && selectedDate ? (
            <p className="mt-3 text-sm text-gray-600">
              <span className="font-medium text-gray-800">Selected:</span>{" "}
              {formatVisitDateLabel(selectedDate)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2.5 px-4 py-3.5">
          {!isMobilePopup ? (
            <>
              {getSelectedTicketsCount() === 0 ? (
                <Button
                  onClick={handleTicketSelection}
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  disabled={!selectedDate}
                  isLoading={isNavigating}
                  loadingLabel={isFreeBooking ? "Opening booking…" : "Opening tickets…"}
                >
                  {isFreeBooking ? "Book visit" : "Select tickets"}
                </Button>
              ) : (
                <Button
                  onClick={submitHandler}
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  isLoading={isLoading}
                  loadingLabel={enquireOnly ? "Sending enquiry…" : "Booking…"}
                >
                  {enquireOnly ? "Send enquiry" : "Book now"}
                </Button>
              )}
            </>
          ) : null}
          <div className="pt-1">
            <PaymentTrustPanel compact />
          </div>
        </div>
      </div>

      {isMobilePopup ? (
        <>
          <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              onClick={handleTicketSelection}
              size="lg"
              className="w-full"
              disabled={!selectedDate}
              isLoading={isNavigating}
              loadingLabel={isFreeBooking ? "Opening booking…" : "Opening tickets…"}
            >
              {isFreeBooking ? "Book visit" : "Select tickets"}
            </Button>
          </div>
          <div className="h-20" aria-hidden />
        </>
      ) : null}
    </div>
  );
};

export default Form;
