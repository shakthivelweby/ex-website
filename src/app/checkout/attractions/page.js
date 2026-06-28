"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { attractionInfo } from "../../attractions/[id]/service";
import PaymentProcessingOverlay from "@/components/PaymentProcessingOverlay/PaymentProcessingOverlay";
import PaymentSuccessPopup from "@/components/PaymentSuccessPopup/PaymentSuccessPopup";
import ErrorPopup from "@/components/ErrorPopup/ErrorPopup";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import { book, createOrder, verifyPayment, paymentFailure } from "./service";
import { getLoggedInUserEmail } from "@/utils/authSession";
import { getPaymentErrorPayload, money } from "@/utils/paymentCheckoutUi";

export default function AttractionCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedBookingId, setCompletedBookingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: "",
    emailSent: false,
    userEmail: "",
    itemTitle: "",
    amountPaid: "",
    visitDate: "",
    guestSummary: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "card",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [attractionData, setAttractionData] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [paymentPhase, setPaymentPhase] = useState(null);
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [pendingCheckout, setPendingCheckout] = useState(null);

  // Fetch attraction and booking details from API
  useEffect(() => {
    const fetchAttractionDetails = async () => {
      try {
        setIsLoadingData(true);
        const attractionId = searchParams.get("attraction_id");
        const ticketsData = searchParams.get("tickets");
        
        if (!attractionId || !ticketsData) {
          setLoadError("Missing attraction or ticket information");
          return;
        }

        // Parse selected tickets from URL params
        const parsedTickets = JSON.parse(decodeURIComponent(ticketsData));
        setSelectedTickets(parsedTickets);

        // Fetch attraction details
        const attractionResponse = await attractionInfo(attractionId);

        if (attractionResponse.status) {
          setAttractionData(attractionResponse.data);
        } else {
          setLoadError("Failed to load attraction details");
        }
      } catch (error) {      
        setLoadError("Failed to load attraction details. Please try again.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAttractionDetails();
  }, [searchParams]);

  // Populate user details from local storage
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const data = JSON.parse(user);
      setFormData(prev => ({
        ...prev,
        firstName: data.name,
        email: data.email,
        phone: data.phone || "",
      }));
    }
  }, []);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cancelBooking = () => {
    router.push("/attractions");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getTotalSelectedTickets = () => {
    if (selectedTickets.bookingTickets) {
      return selectedTickets.bookingTickets.reduce(
        (sum, ticket) => sum + ticket.quantity,
        0
      );
    }
    return 0;
  };

  /** Pre-discount total from booking flow (admin-inclusive ticket bases + guide); backend uses this with discount_amount. */
  const getPreDiscountTotal = () => Number(selectedTickets.total_amount || 0);

  /** Amount taxes apply to: matches API subtotal_after_discount = total_amount − discount_amount. */
  const getTaxableSubtotalExTax = () => {
    const pre = getPreDiscountTotal();
    const disc = Number(selectedTickets.discount_amount || 0);
    return Math.max(0, Math.round((pre - disc) * 100) / 100);
  };

  const getTicketDetails = () => {
    const ticketDetails = [];
    
    if (selectedTickets.bookingTickets) {
      selectedTickets.bookingTickets.forEach((ticket) => {
        if (ticket.quantity === 0) return;
        
        ticketDetails.push({
          ticketType: `Adult: ${ticket.adult_quantity || 0}, Child: ${ticket.child_quantity || 0}`,
          quantity: ticket.quantity,
          price: ticket.price || ticket.adult_price || 0,
          total: ticket.total,
        });
      });
    }
    
    // Add guide charge if guide is needed
    if (selectedTickets.include_guide && selectedTickets.guide_rate > 0) {
      ticketDetails.push({
        ticketType: "Guide Service",
        quantity: 1,
        price: selectedTickets.guide_rate,
        total: selectedTickets.guide_rate,
      });
    }
    
    return ticketDetails;
  };

  const closePaymentError = () => {
    setShowPaymentError(false);
    setPaymentError(null);
  };

  const showPaymentErrorModal = (payload) => {
    setPaymentError(payload);
    setShowPaymentError(true);
  };

  const getOrderErrorPayload = (message) => ({
    variant: "warning",
    title: "Couldn't start payment",
    message: String(message || "We couldn't prepare your payment. Please try again."),
    hint: "Your booking is saved. You can continue to payment when you're ready.",
    canRetry: true,
    primaryLabel: "Continue to payment",
    primaryIcon: "fi-rr-refresh",
    secondaryLabel: "Stay on checkout",
  });

  const resolveBookingIdFromVerify = (verificationResponse, fallbackBookingId) =>
    verificationResponse?.data?.payment?.attraction_booking_id ??
    verificationResponse?.data?.payment?.attractionBooking?.id ??
    verificationResponse?.data?.attraction_booking_id ??
    verificationResponse?.data?.attractionBooking?.id ??
    fallbackBookingId;

  const openRazorpayAndVerify = async (orderRes, paymentAmount, bookingId) => {
    setPaymentPhase(null);
    const paymentResponse = await initializeRazorpayPayment({
      amount: paymentAmount,
      currency: "INR",
      name: "Explore World",
      description: `Payment for ${attractionData?.attraction?.name || "attraction"} tickets`,
      orderId: orderRes.data.order_id,
      key: orderRes.data.key,
      email: formData.email,
      contact: formData.phone,
    });

    if (!paymentResponse.status) {
      setPaymentPhase(null);
      try {
        await paymentFailure(orderRes.data.attraction_payment_id);
      } catch (_) {}
      showPaymentErrorModal(getPaymentErrorPayload(paymentResponse));
      return false;
    }

    setPaymentPhase("verifying");
    const verificationResponse = await verifyPayment({
      order_id: orderRes.data.order_id,
      payment_id: paymentResponse.data.razorpay_payment_id,
      signature: paymentResponse.data.razorpay_signature,
      customer_email: getLoggedInUserEmail() || formData.email || undefined,
    });

    if (!verificationResponse.status) {
      setPaymentPhase(null);
      try {
        await paymentFailure(orderRes.data.attraction_payment_id);
      } catch (_) {}
      showPaymentErrorModal({
        variant: "error",
        title: "Payment verification failed",
        message: verificationResponse?.message || "We couldn't confirm your payment on our end.",
        hint: "If an amount was deducted from your account, please contact support with your payment reference.",
        canRetry: false,
        primaryLabel: "Close",
      });
      return false;
    }

    setPaymentPhase("confirming");
    await new Promise((resolve) => setTimeout(resolve, 450));
    setPaymentPhase(null);

    const resolvedBookingId = resolveBookingIdFromVerify(verificationResponse, bookingId);
    if (!resolvedBookingId) {
      showPaymentErrorModal({
        variant: "warning",
        title: "Payment received",
        message: "Your payment went through, but we couldn't load your ticket id. Check My Bookings for your confirmation.",
        hint: "If you don't see your booking within a few minutes, contact support.",
        canRetry: false,
        primaryLabel: "Close",
      });
      return false;
    }

    const userEmail = getLoggedInUserEmail() || formData.email || "";
    const emailSent = Boolean(verificationResponse?.data?.confirmation_email_sent);
    const totalAdultCount = selectedTickets.bookingTickets?.reduce(
      (sum, ticket) => sum + (ticket.adult_quantity || 0),
      0
    ) || 0;
    const totalChildCount = selectedTickets.bookingTickets?.reduce(
      (sum, ticket) => sum + (ticket.child_quantity || 0),
      0
    ) || 0;

    setPendingCheckout(null);
    setCompletedBookingId(resolvedBookingId);
    setSuccessMessage({
      title: "You're all set!",
      message: "Your attraction tickets have been booked successfully.",
      emailSent,
      userEmail,
      itemTitle: attractionData?.attraction?.name || "Attraction",
      amountPaid: money(paymentAmount),
      visitDate: selectedTickets.visit_date ? formatDate(selectedTickets.visit_date) : "—",
      guestSummary: `${totalAdultCount} adult(s), ${totalChildCount} child(ren)`,
    });
    setShowSuccess(true);
    return true;
  };

  const executeCheckout = async () => {
    setIsLoading(true);
    setFormError(null);

    try {
      if (!formData.firstName || !formData.email || !formData.phone) {
        setFormError("Please fill in all required fields");
        return;
      }

      const finalTotalAmount = selectedTickets.total_amount || 0;
      const totalAdultCount = selectedTickets.bookingTickets?.reduce((sum, ticket) => {
        return sum + (ticket.adult_quantity || 0);
      }, 0) || 0;
      const totalChildCount = selectedTickets.bookingTickets?.reduce((sum, ticket) => {
        return sum + (ticket.child_quantity || 0);
      }, 0) || 0;

      const enhancedBookingTickets = selectedTickets.bookingTickets?.map(ticket => ({
        ...ticket,
        attraction_ticket_type_id: ticket.attraction_ticket_type_id || ticket.id,
        unit_price: ticket.unit_price || ticket.adult_price || ticket.price || 0,
        total_price: ticket.total_price || ticket.total || 0,
      })) || [];

      const attractionId = parseInt(searchParams.get("attraction_id"), 10);
      let bookingId = pendingCheckout?.bookingId;
      let paymentAmount = pendingCheckout?.paymentAmount;

      if (!bookingId) {
        const apiBookingData = {
          attraction_id: attractionId,
          visit_date: selectedTickets.visit_date,
          total_amount: finalTotalAmount,
          discount_amount: Number(selectedTickets.discount_amount || 0),
          adult_count: totalAdultCount,
          child_count: totalChildCount,
          bookingTickets: enhancedBookingTickets,
          include_guide: selectedTickets.include_guide || false,
          guide_rate: selectedTickets.guide_rate || 0,
        };

        const response = await book(apiBookingData);
        if (!response.status) {
          setFormError(response.message || "Failed to complete booking. Please try again.");
          return;
        }

        bookingId = response.data.id;
        paymentAmount =
          response?.data?.grand_total != null && response.data.grand_total !== ""
            ? Number(response.data.grand_total)
            : finalTotalAmount;

        setPendingCheckout({ bookingId, attractionId, paymentAmount });
      }

      setPaymentPhase("preparing");
      const orderRes = await createOrder({
        attraction_id: attractionId,
        attraction_booking_id: bookingId,
        amount: paymentAmount,
      });

      if (!orderRes.status) {
        setPaymentPhase(null);
        showPaymentErrorModal(getOrderErrorPayload(orderRes.message));
        return;
      }

      await openRazorpayAndVerify(orderRes, paymentAmount, bookingId);
    } catch (error) {
      setPaymentPhase(null);
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        showPaymentErrorModal({
          variant: "warning",
          title: "Verification taking longer",
          message: "Payment verification is taking longer than expected.",
          hint: "Please check My Bookings to confirm whether your payment was successful before trying again.",
          canRetry: false,
          primaryLabel: "Close",
        });
      } else {
        showPaymentErrorModal({
          variant: "error",
          title: "Something went wrong",
          message: error.response?.data?.message || error.message || "Failed to complete booking. Please try again.",
          hint: "Your details are still on this page. You can try again in a moment.",
          canRetry: true,
          primaryLabel: "Try again",
          primaryIcon: "fi-rr-refresh",
          secondaryLabel: "Close",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentRetry = async () => {
    closePaymentError();
    setFormError(null);
    await executeCheckout();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await executeCheckout();
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Attraction
          </h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <Link href="/attractions" className="text-primary-600 hover:text-primary-700">
            Back to Attractions
          </Link>
        </div>
      </div>
    );
  }

  if (!attractionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Attraction not found
          </h2>
          <p className="text-gray-600">
            The attraction you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const ticketDetails = getTicketDetails();
  const discountAmountUi = Number(selectedTickets.discount_amount || 0);
  const subtotalExTax = getTaxableSubtotalExTax();
  const gstPercent = 18;
  const conveniencePercent = 2;
  const gstAmount = (subtotalExTax * gstPercent) / 100;
  const afterGst = subtotalExTax + gstAmount;
  const convenienceAmount = (afterGst * conveniencePercent) / 100;
  const grandTotalUi = afterGst + convenienceAmount;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="mb-3">
          <Link href="/attractions" className="text-primary-600 hover:text-primary-700 flex items-center transition-colors group">
            <div className="w-7 h-7 bg-primary-50 group-hover:bg-primary-100 rounded-full flex items-center justify-center mr-2 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium text-sm">Back to Attractions</span>
          </Link>
        </div>
       
        {/* Mobile Layout - Attraction Summary First */}
        <div className="block md:hidden">
          {/* Attraction Summary - Mobile */}
          <div className="bg-white rounded-xl p-3 shadow-sm mb-3 border border-gray-200/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-primary-100 rounded-lg flex items-center justify-center">
                <i className="fi fi-rr-document text-primary-600 text-xs"></i>
              </div>
              <h2 className="text-base font-bold text-gray-900">Attraction Summary</h2>
            </div>

            <div className="space-y-3">
              <div className="bg-gradient-to-r from-gray-50 to-gray-25 rounded-lg p-2.5 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    {attractionData?.attraction?.cover_image && (
                      <Image
                        src={attractionData?.attraction?.cover_image}
                        alt={attractionData?.attraction?.name}
                        className="object-cover"
                        fill
                        sizes="40px"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                      {attractionData?.attraction?.name || 'Loading...'}
                    </h3>
                    <div className="flex items-center text-xs text-gray-600 mt-0.5">
                      <div className="w-2.5 h-2.5 bg-primary-100 rounded-full flex items-center justify-center mr-1">
                        <i className="fi fi-rr-calendar text-primary-600 text-[6px]"></i>
                      </div>
                      <span className="font-medium">
                        Visit Date: {formatDate(selectedTickets.visit_date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-25 p-2.5 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-1.5 text-sm flex items-center">
                  <div className="w-3.5 h-3.5 bg-blue-100 rounded-md flex items-center justify-center mr-1.5">
                    <i className="fi fi-rr-ticket text-blue-600 text-[8px]"></i>
                  </div>
                  Tickets
                </h4>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Total Tickets</span>
                    <span className="text-gray-900 font-semibold">{getTotalSelectedTickets()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Attraction Type</span>
                    <span className="text-gray-900 font-semibold">{attractionData?.attraction?.attraction_category_master?.name || 'Loading...'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-25 p-2.5 rounded-lg border border-green-100">
                <h4 className="font-semibold text-gray-900 mb-1.5 text-sm flex items-center">
                  <div className="w-3.5 h-3.5 bg-green-100 rounded-md flex items-center justify-center mr-1.5">
                    <i className="fi fi-rr-money-bill-wave text-green-600 text-[8px]"></i>
                  </div>
                  Price Details
                </h4>
                <div className="space-y-1">
                  {discountAmountUi > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-gray-900 font-semibold">
                        −₹{discountAmountUi.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Subtotal (excl. taxes)</span>
                    <span className="text-gray-900 font-semibold">
                      ₹{subtotalExTax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="text-gray-900 font-semibold">₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Convenience (2%)</span>
                    <span className="text-gray-900 font-semibold">₹{convenienceAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1.5 border-t border-green-200">
                    <span className="text-gray-900 text-sm">Total Amount</span>
                    <span className="text-primary-600 text-sm">₹{grandTotalUi.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form - Mobile */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-3 shadow-sm mb-3 border border-gray-200/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-primary-100 rounded-lg flex items-center justify-center">
                <i className="fi fi-rr-user text-primary-600 text-xs"></i>
              </div>
              <h2 className="text-base font-bold text-gray-900">Visitor Details</h2>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 px-0 pr-10 border-b text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[16px] focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium tracking-tight"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 px-0 pr-10 border-b text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[16px] focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium tracking-tight"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 px-0 pr-10 border-b text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[16px] focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium tracking-tight"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="flex items-start mb-4 p-2.5 bg-yellow-50 rounded-lg border border-yellow-200">
              <input
                type="checkbox"
                id="termsAgreement"
                required
                className="w-3.5 h-3.5 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500/20 focus:ring-offset-0 cursor-pointer transition-colors mt-0.5"
              />
              <label htmlFor="termsAgreement" className="ml-2.5 block text-xs text-gray-700 cursor-pointer">
                I agree to the{" "}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold underline">Terms and Conditions</a>,{" "}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold underline">Cancellation Policy</a>, and{" "}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold underline">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || Boolean(paymentPhase)}
              className="w-full h-10 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-semibold rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading && !paymentPhase ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <i className="fi fi-rr-shield-check mr-2 text-sm"></i>
                  Complete Booking
                </span>
              )}
            </button>
            
            {(isLoading || paymentPhase) && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">Please don&apos;t close this window while processing...</p>
              </div>
            )}

            {formError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 font-medium">{formError}</p>
              </div>
            )}
          </form>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-6">
          {/* Left Column - Form */}
          <div className="md:col-span-7">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <i className="fi fi-rr-user text-primary-600 text-sm"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Visitor Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 px-4 border text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[16px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 rounded-lg font-medium"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 px-4 border text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[16px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 rounded-lg font-medium"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 px-4 border text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[16px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 rounded-lg font-medium"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <input
                    type="checkbox"
                    id="termsAgreement"
                    required
                    className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500/20 focus:ring-offset-0 cursor-pointer transition-colors mt-1"
                  />
                  <label htmlFor="termsAgreement" className="ml-3 block text-sm text-gray-700 cursor-pointer">
                    I agree to the{" "}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold underline">Terms and Conditions</a>,{" "}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold underline">Cancellation Policy</a>, and{" "}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold underline">Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || Boolean(paymentPhase)}
                  className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-base font-semibold rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading && !paymentPhase ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <i className="fi fi-rr-shield-check mr-2 text-base"></i>
                      Complete Booking
                    </span>
                  )}
                </button>

                {(isLoading || paymentPhase) && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Please don&apos;t close this window while processing...</p>
                  </div>
                )}

                {formError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">{formError}</p>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="md:col-span-5">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <i className="fi fi-rr-document text-primary-600 text-sm"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Booking Summary</h2>
              </div>

              <div className="space-y-6">
                {/* Attraction Info */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-25 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                      {attractionData?.attraction?.cover_image && (
                        <Image
                          src={attractionData?.attraction?.cover_image}
                          alt={attractionData?.attraction?.name}
                          className="object-cover"
                          fill
                          sizes="48px"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">
                        {attractionData?.attraction?.name || 'Loading...'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <div className="w-3 h-3 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                          <i className="fi fi-rr-calendar text-primary-600 text-[8px]"></i>
                        </div>
                        <span className="font-medium">
                          Visit Date: {formatDate(selectedTickets.visit_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-25 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-3 text-base flex items-center">
                    <div className="w-4 h-4 bg-blue-100 rounded-md flex items-center justify-center mr-2">
                      <i className="fi fi-rr-ticket text-blue-600 text-xs"></i>
                    </div>
                    Ticket Details
                  </h4>
                  <div className="space-y-2">
                    {ticketDetails.map((ticket, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{ticket.ticketType}</span>
                        <span className="text-gray-900 font-semibold">₹{parseFloat(ticket.total).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-25 p-4 rounded-lg border border-green-100">
                  <h4 className="font-semibold text-gray-900 mb-3 text-base flex items-center">
                    <div className="w-4 h-4 bg-green-100 rounded-md flex items-center justify-center mr-2">
                      <i className="fi fi-rr-money-bill-wave text-green-600 text-xs"></i>
                    </div>
                    Price Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Tickets</span>
                      <span className="text-gray-900 font-semibold">{getTotalSelectedTickets()}</span>
                    </div>
                    {discountAmountUi > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-gray-900 font-semibold">
                          −₹{discountAmountUi.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal (excl. taxes)</span>
                      <span className="text-gray-900 font-semibold">
                        ₹{subtotalExTax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (18%)</span>
                      <span className="text-gray-900 font-semibold">₹{gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Convenience fee (2%)</span>
                      <span className="text-gray-900 font-semibold">₹{convenienceAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-green-200">
                      <span className="text-gray-900">Total Amount</span>
                      <span className="text-primary-600">₹{grandTotalUi.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentProcessingOverlay show={Boolean(paymentPhase)} stage={paymentPhase || "verifying"} />
      <PaymentSuccessPopup
        show={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          if (completedBookingId) {
            router.push(`/my-bookings/attraction/ticket/${completedBookingId}`);
          } else {
            router.push("/my-bookings?tab=attractions");
          }
        }}
        title={successMessage.title}
        message={successMessage.message}
        itemLabel="Your visit"
        itemTitle={successMessage.itemTitle}
        amountPaid={successMessage.amountPaid}
        detailLeftLabel="Visit date"
        detailLeft={successMessage.visitDate}
        detailRightLabel="Guests"
        detailRight={successMessage.guestSummary}
        emailSent={successMessage.emailSent}
        userEmail={successMessage.userEmail}
        primaryAction={{
          label: "View ticket",
          icon: "fi-rr-ticket",
          onClick: () => {
            setShowSuccess(false);
            if (completedBookingId) {
              router.push(`/my-bookings/attraction/ticket/${completedBookingId}`);
            } else {
              router.push("/my-bookings?tab=attractions");
            }
          },
        }}
        secondaryAction={{
          label: "Stay on checkout",
          onClick: () => setShowSuccess(false),
        }}
      />
      <ErrorPopup
        show={showPaymentError}
        onClose={closePaymentError}
        variant={paymentError?.variant || "error"}
        title={paymentError?.title}
        message={paymentError?.message}
        hint={paymentError?.hint}
        closeOnBackdrop={paymentError?.variant === "cancelled"}
        primaryAction={
          paymentError?.canRetry
            ? {
                label: paymentError?.primaryLabel || "Try again",
                icon: paymentError?.primaryIcon,
                isLoading: isLoading && !paymentPhase,
                loadingLabel: "Opening payment…",
                onClick: handlePaymentRetry,
              }
            : { label: paymentError?.primaryLabel || "Close", onClick: closePaymentError }
        }
        secondaryAction={
          paymentError?.canRetry
            ? { label: paymentError?.secondaryLabel || "Close", onClick: closePaymentError }
            : null
        }
      />
    </div>
  );
}
