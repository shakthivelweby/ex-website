"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/common/Button";
import SuccessPopup, { PopupErrorIcon } from "@/components/SuccessPopup/SuccessPopup";
import {
  BookingsLoading,
  BookingsError,
  BookingsEmpty,
  BookingsPagination,
  BookingsList,
  bookingCardClass,
  BookingCardImage,
  resolveBookingImage,
} from "@/components/my-bookings/BookingsUI";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import {
  createRentalBalanceOrder,
  getRentalBookings,
  rentalPaymentFailure,
  verifyRentalPayment,
} from "./service";

const formatDateTime = (dateString) => {
  const d = new Date(dateString);
  if (!Number.isFinite(d.getTime())) return "-";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateString) => {
  const d = new Date(dateString);
  if (!Number.isFinite(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString()}`;

/** One line for UI: same pickup/dropoff collapsed; otherwise both without separate labels. */
const displayRentalLocation = (b) => {
  const p = String(b?.pickup_location || "").trim();
  const d = String(b?.dropoff_location || "").trim();
  const itemLoc = String(b?.item?.location || "").trim();
  if (p && d && p !== d) return `${p} · ${d}`;
  if (p) return p;
  if (d) return d;
  return itemLoc || "-";
};

const statusPill = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "confirmed") return "bg-green-50 text-green-700";
  if (s === "pending") return "bg-yellow-50 text-yellow-700";
  if (s === "cancelled") return "bg-red-50 text-red-700";
  if (s === "completed") return "bg-green-50 text-green-700";
  return "bg-gray-50 text-gray-700";
};

const getPaymentMethodIcon = (method) => {
  switch (String(method || "").toLowerCase()) {
    case "razorpay":
      return "fi fi-rr-credit-card";
    default:
      return "fi fi-rr-money-bill";
  }
};

export default function RentalBookings() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({ title: "", message: "", icon: null });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["rentalBookings", currentPage],
    queryFn: () => getRentalBookings(currentPage),
  });

  const handlePayBalance = async (booking) => {
    try {
      setIsProcessingPayment(true);

      const orderRes = await createRentalBalanceOrder({
        rental_booking_id: booking.id,
      });

      if (!orderRes?.status) {
        throw new Error(orderRes?.message || "Failed to create payment order.");
      }

      const userData = (() => {
        try {
          return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
          return null;
        }
      })();

      const payRes = await initializeRazorpayPayment({
        amount: parseFloat(orderRes?.data?.amount || 0),
        currency: "INR",
        name: "Explore World",
        description: `Balance payment for ${booking.item?.title || "rental"}`,
        orderId: orderRes?.data?.order_id,
        key: orderRes?.data?.key,
        email: userData?.email || "",
        contact: userData?.phone || "",
      });

      if (!payRes?.status) {
        try {
          await rentalPaymentFailure(orderRes?.data?.rental_payment_id);
        } catch (_) {}
        throw new Error(payRes?.error?.description || "Payment was not completed.");
      }

      const verifyRes = await verifyRentalPayment({
        order_id: orderRes?.data?.order_id,
        payment_id: payRes?.data?.razorpay_payment_id,
        signature: payRes?.data?.razorpay_signature,
      });

      if (!verifyRes?.status) {
        try {
          await rentalPaymentFailure(orderRes?.data?.rental_payment_id);
        } catch (_) {}
        throw new Error("Payment verification failed.");
      }

      setPopupConfig({
        title: "Payment Successful!",
        message: "Your balance payment has been processed successfully.",
        icon: null,
      });
      setShowPopup(true);
      refetch();
    } catch (e) {
      setPopupConfig({
        title: "Payment Failed",
        message: e?.response?.data?.message || e?.message || "Payment failed. Please try again.",
        icon: <PopupErrorIcon />,
      });
      setShowPopup(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return <BookingsLoading />;
  }

  const pagination = data?.data || {};
  const bookings = pagination.data || [];
  const currentPageData = pagination.current_page || 1;
  const lastPage = pagination.last_page || 1;
  const total = pagination.total || 0;
  const perPage = pagination.per_page || 10;

  if (error) {
    return (
      <BookingsError
        message={
          error.response?.data?.message || error.message || "Failed to load rental bookings"
        }
        onRetry={() => refetch()}
      />
    );
  }

  if (!bookings.length) {
    return (
      <BookingsEmpty
        icon="fi fi-rr-car"
        title="No rental bookings yet"
        description="Explore rentals and book your next ride."
        actionLabel="Explore Rentals"
        onAction={() => router.push("/rentals")}
      />
    );
  }

  return (
    <>
      <SuccessPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        title={popupConfig.title}
        message={popupConfig.message}
        icon={popupConfig.icon}
      />
      <BookingsList>
        {bookings.map((b) => {
          const title = b.item?.title || "Rental";
          const full = parseFloat(b.total_full_amount || 0);
          const paid = parseFloat(b.total_paid || 0);
          const balance = parseFloat(b.balance || 0);
          const locationLabel = displayRentalLocation(b);
          const pb = b.pricing_breakdown || null;
          const breakdownMatchesTotal =
            pb && Number.isFinite(full) && Math.abs(Number(pb.grand_total) - full) <= 0.05;
          const rentalPayments = Array.isArray(b.rental_payments)
            ? [...b.rental_payments]
                .filter((p) => String(p?.status || "").toLowerCase() === "completed")
                .sort((a, c) => new Date(c?.created_at || 0) - new Date(a?.created_at || 0))
            : [];
          const paymentPill =
            b.payment_status ||
            (balance <= 0.009 ? "Paid" : "Partial payment");

          return (
            <div
              key={b.id}
              className={bookingCardClass}
            >
              <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
                <BookingCardImage
                  src={resolveBookingImage(b, "rental")}
                  alt={title}
                  fallbackIcon="fi fi-rr-car"
                  href={
                    b.rental_item_id
                      ? `/rentals/${b.rental_item_id}`
                      : undefined
                  }
                />
                <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                        <i className="fi fi-rr-calendar text-primary-500"></i>
                        {formatDateTime(b.start_datetime)}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                        <i className="fi fi-rr-calendar text-primary-500"></i>
                        {formatDateTime(b.end_datetime)}
                      </span>
                      {locationLabel !== "-" ? (
                        <span className="text-xs px-3 py-1 rounded-full bg-primary-50 text-primary-600 flex items-center gap-1.5">
                          <i className="fi fi-rr-marker"></i>
                          {locationLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Booked on {formatDate(b.created_at)}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(
                        full > 0 ? full : parseFloat(b.total_price || paid || 0)
                      )}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {paymentPill}
                    </span>
                  </div>
                  {balance > 0.009 ? (
                    <p className="text-xs text-gray-500 text-right">
                      Paid {formatCurrency(paid)} · Balance {formatCurrency(balance)}
                    </p>
                  ) : null}
                  <div className="flex flex-col items-start md:items-end gap-1 w-full md:w-auto">
                    <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                      {breakdownMatchesTotal && (pb.discount_amount ?? 0) > 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                          Saved {formatCurrency(pb.discount_amount)}
                        </span>
                      ) : null}
                    </div>
                    {breakdownMatchesTotal && (pb.gst_amount > 0 || pb.gst_percent) ? (
                      <div className="text-[11px] text-gray-500 text-right">
                        <span className="font-semibold text-gray-700">
                          GST {pb.gst_percent}% · Convenience {pb.convenience_fee_percent}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Includes GST &amp; convenience fee where applicable</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedBooking(expandedBooking === b.id ? null : b.id)}
                  className="!rounded-full !text-xs !px-4 !py-2"
                >
                  <i
                    className={`fi fi-rr-${expandedBooking === b.id ? "angle-up" : "angle-down"} mr-1.5`}
                  ></i>
                  {expandedBooking === b.id ? "Hide" : "View"} Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/rentals/${b.rental_item_id}`)}
                  className="!rounded-full !text-xs !px-4 !py-2"
                >
                  <i className="fi fi-rr-eye mr-1.5"></i>
                  View Rental
                </Button>
                {balance > 0 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePayBalance(b)}
                    disabled={isProcessingPayment}
                    className="!rounded-full !text-xs !px-4 !py-2"
                  >
                    {isProcessingPayment ? "Processing..." : `Pay Balance ${formatCurrency(balance)}`}
                  </Button>
                ) : null}
              </div>

                {expandedBooking === b.id ? (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-medium text-gray-900 mb-3">Payments</h4>
                  {rentalPayments.length ? (
                    <div className="space-y-3 mb-4">
                      {rentalPayments.map((payment) => (
                        <div
                          key={payment.id}
                          className={`flex flex-col md:flex-row md:items-center justify-between rounded-xl p-3 gap-3 ${
                            payment.status === "failed"
                              ? "bg-red-50/50 border border-red-100"
                              : "bg-gray-50/50 border border-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                payment.status === "failed" ? "bg-red-100" : "bg-white"
                              }`}
                            >
                              <i
                                className={`${getPaymentMethodIcon(payment.payment_method)} text-base ${
                                  payment.status === "failed" ? "text-red-500" : "text-gray-500"
                                }`}
                              ></i>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-medium ${
                                    payment.status === "failed" ? "text-red-700" : "text-gray-900"
                                  }`}
                                >
                                  {formatCurrency(payment.amount)}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                                  Payment
                                </span>
                              </div>
                              <span
                                className={`text-xs ${
                                  payment.status === "failed" ? "text-red-600" : "text-gray-500"
                                }`}
                              >
                                {formatDateTime(payment.created_at)}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${statusPill(payment.status)}`}
                          >
                            {payment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mb-4">No completed payments to show.</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1 text-gray-600">
                      <h4 className="text-xs font-semibold text-gray-900 mb-2">Booking details</h4>
                      <div className="flex justify-between gap-3">
                        <span>Booking ID:</span>
                        <span className="font-medium text-gray-900">#{b.id}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>Status:</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusPill(b.status)}`}>
                          {b.status || "pending"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>Location:</span>
                        <span className="font-medium text-gray-900 text-right">{locationLabel}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>Start:</span>
                        <span className="font-medium text-gray-900 text-right">{formatDateTime(b.start_datetime)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>End:</span>
                        <span className="font-medium text-gray-900 text-right">{formatDateTime(b.end_datetime)}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-gray-600">
                      <h4 className="text-xs font-semibold text-gray-900 mb-2">Price summary</h4>
                      <div className="flex justify-between gap-3">
                        <span>Full amount:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(full)}</span>
                      </div>
                      {breakdownMatchesTotal ? (
                        <>
                          <div className="flex justify-between gap-3">
                            <span>Rental subtotal:</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(pb.rent_subtotal_gross ?? pb.rent_subtotal)}
                            </span>
                          </div>
                          {(pb.discount_amount ?? 0) > 0 ? (
                            <>
                              <div className="flex justify-between gap-3">
                                <span>Discount:</span>
                                <span className="font-medium text-green-700">
                                  −{formatCurrency(pb.discount_amount)}
                                </span>
                              </div>
                              <div className="flex justify-between gap-3 text-xs text-gray-500">
                                <span>Rental after discount:</span>
                                <span className="font-medium text-gray-800">
                                  {formatCurrency(pb.rent_subtotal)}
                                </span>
                              </div>
                            </>
                          ) : null}
                          <div className="flex justify-between gap-3">
                            <span>GST ({pb.gst_percent}%):</span>
                            <span className="font-medium text-gray-900">{formatCurrency(pb.gst_amount)}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span>Convenience fee ({pb.convenience_fee_percent}%):</span>
                            <span className="font-medium text-gray-900">{formatCurrency(pb.convenience_fee_amount)}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span>Security deposit:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(pb.security_deposit)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between gap-3">
                          <span>Taxes &amp; fees:</span>
                          <span className="font-medium text-gray-900 text-right">
                            18% GST and 2% convenience fee included in total where applicable
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between gap-3">
                        <span>Paid:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(paid || b.total_price)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>Balance:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(balance)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </BookingsList>

      <BookingsPagination
        currentPage={currentPageData}
        lastPage={lastPage}
        total={total}
        perPage={perPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          setExpandedBooking(null);
        }}
      />
    </>
  );
}

