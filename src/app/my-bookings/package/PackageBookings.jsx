"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { getBookings } from "./service";
import { useQuery } from "@tanstack/react-query";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import {
  createOrder,
  verifyPayment,
  paymentFailure,
} from "../../checkout/package/service";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";

const PackageBookings = () => {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [popupConfig, setPopupConfig] = useState({
    title: "",
    message: "",
    icon: null,
  });

  // booking query with pagination
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["bookings", currentPage],
    queryFn: () => getBookings(currentPage),
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString()}`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentTypeLabel = (booking) => {
    // If balance is 0 or not present, it means full payment is done
    if (!booking.balance || parseFloat(booking.balance) === 0) {
      return "Full Payment";
    }
    // If there is remaining balance, show the advance percentage
    if (booking.package?.payment_type === "partial") {
      return `${booking.package.advance_percentage}% Advance`;
    }
    return "Full Payment";
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-50 text-green-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "failed":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case "razorpay":
        return "fi fi-rr-credit-card";
      default:
        return "fi fi-rr-money-bill";
    }
  };

  const togglePaymentHistory = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedBooking(null); // Reset expanded booking when changing pages
  };

  const handlePayBalance = async (booking) => {
    try {
      setIsProcessingPayment(true);
      setError(null);

      // Create order for remaining payment
      const orderRes = await createOrder({
        package_id: booking.package_id,
        package_booking_id: booking.id,
        payment_type: "balance",
        amount: parseFloat(booking.balance),
      });

      if (orderRes.status) {
        // Get user data
        const userData = JSON.parse(localStorage.getItem("user"));

        // Initialize Razorpay payment
        const paymentResponse = await initializeRazorpayPayment({
          amount: parseFloat(booking.balance),
          currency: "INR",
          name: "Explore World",
          description: `Balance Payment for ${booking.package?.name}`,
          orderId: orderRes.data.order_id,
          email: userData.email,
          contact: userData.phone,
        });

        if (paymentResponse.status) {
          // Verify payment
          const verificationResponse = await verifyPayment({
            razorpay_order_id: paymentResponse.data.razorpay_order_id,
            razorpay_signature: paymentResponse.data.razorpay_signature,
            payment_id: paymentResponse.data.razorpay_payment_id,
          });

          if (verificationResponse.status) {
            // Show success popup
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
            // Refresh bookings data
            refetchBookings();
          } else {
            await paymentFailure(orderRes.data.package_payment_id);
            setPopupConfig({
              title: "Payment Failed",
              message: "Payment verification failed. Please try again.",
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
          }
        } else {
          await paymentFailure(orderRes.data.package_payment_id);
          setPopupConfig({
            title: "Payment Failed",
            message:
              paymentResponse.error?.description ||
              "Payment failed. Please try again.",
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
        }
      } else {
        setPopupConfig({
          title: "Order Creation Failed",
          message:
            orderRes.message ||
            "Failed to create payment order. Please try again.",
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
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPopupConfig({
        title: "Error",
        message:
          error.response?.data?.message || "Payment failed. Please try again.",
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

  if (bookingsLoading) {
    return (
      <div className="min-h-[400px] bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Extract pagination data and bookings from the new API structure
  const paginationData = bookingsData?.data || {};
  const bookings = paginationData.data || [];
  const currentPageData = paginationData.current_page || 1;
  const lastPage = paginationData.last_page || 1;
  const total = paginationData.total || 0;
  const perPage = paginationData.per_page || 10;

  return (
    <div className="p-6">
      {bookingsError ? (
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-red-100">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <i className="fi fi-rr-exclamation text-xl text-red-500"></i>
          </div>
          <p className="text-red-600 font-medium">
            {bookingsError.message || "Failed to load bookings"}
          </p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <i className="fi fi-rr-book-bookmark text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No package bookings yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start your journey today by exploring our curated collection of
            amazing destinations
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/packages")}
            className="!rounded-full !px-6 !py-2.5 !text-sm !font-medium"
          >
            <i className="fi fi-rr-search mr-2"></i>
            Explore Packages
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Package Info */}
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <h3 className="text-base font-semibold text-gray-900">
                        {booking.package?.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                          <i className="fi fi-rr-calendar text-blue-500"></i>
                          {formatDate(booking.booking_date)}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                          <i className="fi fi-rr-users text-blue-500"></i>
                          {booking.adult_count +
                            (booking.child_count || 0)}{" "}
                          Travelers
                        </span>
                        {booking.package?.tour_type === "fixed_departure" && (
                          <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1.5">
                            <i className="fi fi-rr-plane-departure"></i>
                            Scheduled Trip
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      Booked on {formatDate(booking.created_at)}
                    </p>
                  </div>

                  {/* Price Info */}
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(booking.total_paid)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {getPaymentTypeLabel(booking)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {parseFloat(booking.discount_amount) > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                          Saved {formatCurrency(booking.discount_amount)}
                        </span>
                      )}
                      {parseFloat(booking.balance) > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
                          Balance: {formatCurrency(booking.balance)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePaymentHistory(booking.id)}
                    className="!rounded-full !text-xs !px-4 !py-2"
                  >
                    <i
                      className={`fi fi-rr-${
                        expandedBooking === booking.id
                          ? "angle-up"
                          : "angle-down"
                      } mr-1.5`}
                    ></i>
                    {expandedBooking === booking.id ? "Hide" : "View"} Payment
                    History
                  </Button>

                  {parseFloat(booking.balance) > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePayBalance(booking)}
                      disabled={isProcessingPayment}
                      className="!rounded-full !text-xs !px-4 !py-2"
                    >
                      {isProcessingPayment ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <>
                          <i className="fi fi-rr-credit-card mr-1.5"></i>
                          Pay Balance {formatCurrency(booking.balance)}
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Payment History */}
                {expandedBooking === booking.id &&
                  booking.package_payment &&
                  booking.package_payment.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-medium text-gray-900 mb-3">
                        Payment History
                      </h4>
                      <div className="space-y-3">
                        {booking.package_payment.map((payment) => (
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
                                  payment.status === "failed"
                                    ? "bg-red-100"
                                    : "bg-white"
                                }`}
                              >
                                <i
                                  className={`${getPaymentMethodIcon(
                                    payment.payment_method
                                  )} text-base ${
                                    payment.status === "failed"
                                      ? "text-red-500"
                                      : "text-gray-500"
                                  }`}
                                ></i>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-medium ${
                                      payment.status === "failed"
                                        ? "text-red-700"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {formatCurrency(payment.amount)}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      payment.payment_type === "partial"
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-purple-50 text-purple-600"
                                    }`}
                                  >
                                    {payment.payment_type === "partial"
                                      ? "Partial"
                                      : "Full"}
                                  </span>
                                </div>
                                <span
                                  className={`text-xs ${
                                    payment.status === "failed"
                                      ? "text-red-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {formatDateTime(payment.created_at)}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                payment.status
                              )}`}
                            >
                              {payment.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* Pagination */}
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
                  onClick={() => handlePageChange(currentPageData - 1)}
                  disabled={currentPageData <= 1}
                  className="!px-3 !py-2"
                >
                  <i className="fi fi-rr-angle-left mr-1"></i>
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: lastPage }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          page === currentPageData
                            ? "bg-blue-600 text-white"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPageData + 1)}
                  disabled={currentPageData >= lastPage}
                  className="!px-3 !py-2"
                >
                  Next
                  <i className="fi fi-rr-angle-right ml-1"></i>
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Success/Error Popup */}
      <SuccessPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        title={popupConfig.title}
        message={popupConfig.message}
        icon={popupConfig.icon}
      />
    </div>
  );
};

export default PackageBookings;
