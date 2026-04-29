"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/common/Button";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";
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

const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString()}`;

const statusPill = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "confirmed") return "bg-green-50 text-green-700";
  if (s === "pending") return "bg-yellow-50 text-yellow-700";
  if (s === "cancelled") return "bg-red-50 text-red-700";
  if (s === "completed") return "bg-green-50 text-green-700";
  return "bg-gray-50 text-gray-700";
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
        icon: (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-green-100 animate-success-ring" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <i className="fi fi-rr-check text-2xl text-green-500 animate-success-check"></i>
            </div>
          </div>
        ),
      });
      setShowPopup(true);
      refetch();
    } catch (e) {
      setPopupConfig({
        title: "Payment Failed",
        message: e?.response?.data?.message || e?.message || "Payment failed. Please try again.",
        icon: (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-100" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <i className="fi fi-rr-cross text-2xl text-red-500"></i>
            </div>
          </div>
        ),
      });
      setShowPopup(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pagination = data?.data || {};
  const bookings = pagination.data || [];
  const currentPageData = pagination.current_page || 1;
  const lastPage = pagination.last_page || 1;
  const total = pagination.total || 0;
  const perPage = pagination.per_page || 10;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-red-100">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <i className="fi fi-rr-exclamation text-xl text-red-500"></i>
          </div>
          <p className="text-red-600 font-medium">
            {error.response?.data?.message || error.message || "Failed to load rental bookings"}
          </p>
        </div>
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <i className="fi fi-rr-car text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No rental bookings yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Explore rentals and book your next ride.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/rentals")}
            className="!rounded-full !px-6 !py-2.5 !text-sm !font-medium"
          >
            <i className="fi fi-rr-search mr-2"></i>
            Explore Rentals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <SuccessPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        title={popupConfig.title}
        message={popupConfig.message}
        icon={popupConfig.icon}
      />
      <div className="space-y-4">
        {bookings.map((b) => {
          const payment = Array.isArray(b.rental_payments) ? b.rental_payments[0] : null;
          const title = b.item?.title || "Rental";
          const full = parseFloat(b.total_full_amount || 0);
          const paid = parseFloat(b.total_paid || 0);
          const balance = parseFloat(b.balance || 0);
          return (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                        <i className="fi fi-rr-calendar text-blue-500"></i>
                        {formatDateTime(b.start_datetime)}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                        <i className="fi fi-rr-calendar text-blue-500"></i>
                        {formatDateTime(b.end_datetime)}
                      </span>
                      {b.pickup_location ? (
                        <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1.5">
                          <i className="fi fi-rr-marker"></i>
                          {b.pickup_location}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Booked on {formatDateTime(b.created_at)}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(full || b.total_price)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusPill(b.status)}`}>
                      {b.status || "pending"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Paid: <span className="font-semibold text-gray-900">{formatCurrency(paid)}</span>
                    {balance > 0 ? (
                      <>
                        {" "}
                        · Balance: <span className="font-semibold text-orange-600">{formatCurrency(balance)}</span>
                      </>
                    ) : (
                      <> · <span className="text-green-700 font-semibold">Paid in full</span></>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Paid via {payment?.payment_method || "razorpay"}
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
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1 text-gray-600">
                    <div className="flex justify-between gap-3">
                      <span>Booking ID:</span>
                      <span className="font-medium text-gray-900">#{b.id}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Pickup:</span>
                      <span className="font-medium text-gray-900 text-right">{b.pickup_location || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Dropoff:</span>
                      <span className="font-medium text-gray-900 text-right">{b.dropoff_location || "-"}</span>
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
                    <div className="flex justify-between gap-3">
                      <span>Full amount:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(full)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Paid:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(paid || b.total_price)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Balance:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(balance)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Order ID:</span>
                      <span className="font-medium text-gray-900">{payment?.order_id || "-"}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {lastPage > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPageData - 1) * perPage + 1} to{" "}
            {Math.min(currentPageData * perPage, total)} of {total} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPageData - 1)}
              disabled={currentPageData <= 1}
              className="!px-3 !py-2"
            >
              <i className="fi fi-rr-angle-left mr-1"></i>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPageData + 1)}
              disabled={currentPageData >= lastPage}
              className="!px-3 !py-2"
            >
              Next
              <i className="fi fi-rr-angle-right ml-1"></i>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

