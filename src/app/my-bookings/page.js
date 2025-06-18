"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { getBookings } from "./service";
import { useQuery } from "@tanstack/react-query";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import { createOrder, verifyPayment, paymentFailure } from "../checkout/service";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";

const MyBookingsPage = () => {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    title: "",
    message: "",
    icon: null
  });

  // booking query
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useQuery({
    queryKey: ["bookings"],
    queryFn: getBookings,
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
  }, [router]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString()}`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentTypeLabel = (booking) => {
    // If balance is 0 or not present, it means full payment is done
    if (!booking.balance || parseFloat(booking.balance) === 0) {
      return 'Full Payment';
    }
    // If there is remaining balance, show the advance percentage
    if (booking.package?.payment_type === 'partial') {
      return `${booking.package.advance_percentage}% Advance`;
    }
    return 'Full Payment';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'failed':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'razorpay':
        return 'fi fi-rr-credit-card';
      default:
        return 'fi fi-rr-money-bill';
    }
  };

  const togglePaymentHistory = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const handlePayBalance = async (booking) => {
    try {
      setIsProcessingPayment(true);
      setError(null);

      // Create order for remaining payment
      const orderRes = await createOrder({
        package_id: booking.package_id,
        package_booking_id: booking.id,
        payment_type: 'balance',
        amount: parseFloat(booking.balance)
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
              )
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
              )
            });
            setShowPopup(true);
          }
        } else {
          await paymentFailure(orderRes.data.package_payment_id);
          setPopupConfig({
            title: "Payment Failed",
            message: paymentResponse.error?.description || "Payment failed. Please try again.",
            icon: (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-100" />
                <div className="relative z-10 w-16 h-16 rounded-full bg-white flex items-center justify-center">
                  <i className="fi fi-rr-cross text-2xl text-red-500"></i>
                </div>
              </div>
            )
          });
          setShowPopup(true);
        }
      } else {
        setPopupConfig({
          title: "Order Creation Failed",
          message: orderRes.message || "Failed to create payment order. Please try again.",
          icon: (
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-100" />
              <div className="relative z-10 w-16 h-16 rounded-full bg-white flex items-center justify-center">
                <i className="fi fi-rr-cross text-2xl text-red-500"></i>
              </div>
            </div>
          )
        });
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPopupConfig({
        title: "Error",
        message: error.response?.data?.message || "Payment failed. Please try again.",
        icon: (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-100" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <i className="fi fi-rr-cross text-2xl text-red-500"></i>
            </div>
          </div>
        )
      });
      setShowPopup(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (bookingsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const bookings = bookingsData?.data || [];

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col justify-center">
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              {/* Header Section */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-sm text-gray-500 mt-1">View and manage your travel bookings</p>
              </div>

              {/* Bookings List */}
              {bookingsError ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{bookingsError.message || "Failed to load bookings"}</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <i className="fi fi-rr-book-bookmark text-4xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
                  <p className="text-gray-500">You haven&apos;t made any bookings yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push('/packages')}
                    className="mt-4 !rounded-full"
                  >
                    Browse Packages
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Booking Details */}
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-base font-medium text-gray-900">
                                {booking.package?.name}
                              </h3>
                              <div className="mt-1 flex flex-col gap-2 text-sm text-gray-500">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <i className="fi fi-rr-calendar text-xs"></i>
                                    Travel Date: {formatDate(booking.booking_date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <i className="fi fi-rr-users text-xs"></i>
                                    {booking.adult_count + (booking.child_count || 0)} Travelers
                                  </span>
                                  {booking.package?.tour_type === 'fixed_departure' && (
                                    <span className="flex items-center gap-1 text-primary-600">
                                      <i className="fi fi-rr-pending text-xs"></i>
                                      Scheduled Trip
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400">
                                  Booked on: {formatDate(booking.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Price and Actions */}
                          <div className="mt-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-gray-900">
                                      {formatCurrency(booking.total_paid)}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Paid
                                    </span>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                      {getPaymentTypeLabel(booking)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {parseFloat(booking.discount_amount) > 0 && (
                                      <span className="text-sm text-green-600">
                                        Saved {formatCurrency(booking.discount_amount)}
                                      </span>
                                    )}
                                    {parseFloat(booking.balance) > 0 && (
                                      <span className="text-sm text-orange-600">
                                        Balance: {formatCurrency(booking.balance)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => togglePaymentHistory(booking.id)}
                                    className="!rounded-full"
                                  >
                                    {expandedBooking === booking.id ? 'Hide' : 'View'} Payments
                                  </Button>
                               
                                  {parseFloat(booking.balance) > 0 && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handlePayBalance(booking)}
                                      disabled={isProcessingPayment}
                                      className="!rounded-full"
                                    >
                                      {isProcessingPayment ? (
                                        <span className="flex items-center">
                                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          Processing...
                                        </span>
                                      ) : (
                                        `Pay ${formatCurrency(booking.balance)}`
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Payment History */}
                          {expandedBooking === booking.id && booking.package_payment && booking.package_payment.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-3">Payment History</h4>
                              <div className="space-y-3">
                                {booking.package_payment.map((payment) => (
                                  <div 
                                    key={payment.id} 
                                    className={`flex items-center justify-between text-sm p-3 rounded-lg ${
                                      payment.status === 'failed' ? 'bg-red-50 border border-red-100' : 'bg-white border border-gray-100'
                                    }`}
                                  >
                                    <div className="flex flex-col">
                                      <span className={`font-medium ${payment.status === 'failed' ? 'text-red-700' : 'text-gray-900'}`}>
                                        {formatCurrency(payment.amount)}
                                        <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                          {payment.payment_type === 'partial' ? 'Partial' : 'Full'}
                                        </span>
                                      </span>
                                      <span className={`text-xs ${payment.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
                                        {formatDateTime(payment.created_at)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={`text-xs flex items-center gap-1 ${payment.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
                                        <i className={getPaymentMethodIcon(payment.payment_method)}></i>
                                        {payment.payment_method}
                                      </span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(payment.status)}`}>
                                        {payment.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
                  <p className="flex items-center">
                    <i className="fi fi-rr-exclamation mr-2"></i>
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Popup */}
      <SuccessPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        title={popupConfig.title}
        message={popupConfig.message}
        icon={popupConfig.icon}
      />
    </main>
  );
};

export default MyBookingsPage; 