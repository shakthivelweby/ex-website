"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { attractionInfo } from "../../attractions/[id]/service";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import { book, createOrder, verifyPayment, paymentFailure } from "./service";

export default function AttractionCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: "",
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
  const [error, setError] = useState(null);

  // Fetch attraction and booking details from API
  useEffect(() => {
    const fetchAttractionDetails = async () => {
      try {
        setIsLoadingData(true);
        const attractionId = searchParams.get("attraction_id");
        const ticketsData = searchParams.get("tickets");
        
        if (!attractionId || !ticketsData) {
          setError("Missing attraction or ticket information");
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
          setError("Failed to load attraction details");
        }
      } catch (error) {      
        setError("Failed to load attraction details. Please try again.");
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

  const getTotalPrice = () => {
    let total = 0;
    
    if (selectedTickets.total_amount) {
      total = selectedTickets.total_amount;
    }
    
    // Add guide charge if guide is needed
    if (selectedTickets.need_guide && selectedTickets.guide_rate > 0) {
      total += parseFloat(selectedTickets.guide_rate);
    }
    
    return total;
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
    if (selectedTickets.need_guide && selectedTickets.guide_rate > 0) {
      ticketDetails.push({
        ticketType: "Guide Service",
        quantity: 1,
        price: selectedTickets.guide_rate,
        total: selectedTickets.guide_rate,
      });
    }
    
    return ticketDetails;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.firstName || !formData.email || !formData.phone) {
        setError("Please fill in all required fields");
        return;
      }

      // Calculate the correct total amount including guide charge
      const baseAmount = selectedTickets.total_amount || 0;
      const guideAmount = (selectedTickets.need_guide && selectedTickets.guide_rate) ? parseFloat(selectedTickets.guide_rate) : 0;
      const finalTotalAmount = baseAmount + guideAmount;

      // Calculate total adult and child counts from booking tickets
      const totalAdultCount = selectedTickets.bookingTickets?.reduce((sum, ticket) => {
        return sum + (ticket.adult_quantity || 0);
      }, 0) || 0;

      const totalChildCount = selectedTickets.bookingTickets?.reduce((sum, ticket) => {
        return sum + (ticket.child_quantity || 0);
      }, 0) || 0;

      // Add missing fields to booking tickets for API compatibility
      const enhancedBookingTickets = selectedTickets.bookingTickets?.map(ticket => ({
        ...ticket,
        attraction_ticket_type_id: ticket.attraction_ticket_type_id || ticket.id, // Ensure attraction_ticket_type_id is present
        unit_price: ticket.unit_price || ticket.adult_price || ticket.price || 0,
        total_price: ticket.total_price || ticket.total || 0,
      })) || [];

      console.log("Checkout - enhancedBookingTickets:", enhancedBookingTickets);

      // Prepare booking data according to API requirements
      const apiBookingData = {
        attraction_id: parseInt(searchParams.get("attraction_id")),
        visit_date: selectedTickets.visit_date,
        total_amount: finalTotalAmount,
        discount_amount: 0, // Add required discount_amount field
        adult_count: totalAdultCount, // Add required adult_count field
        child_count: totalChildCount, // Add required child_count field
        bookingTickets: enhancedBookingTickets,
        need_guide: selectedTickets.need_guide || false,
        guide_rate: selectedTickets.guide_rate || 0,
      };

      console.log("Checkout - apiBookingData:", apiBookingData);

      // First create booking to get order ID
      const response = await book(apiBookingData);
     
      if (response.status) {
        const paymentAmount = finalTotalAmount; // Full payment including guide charge
        
        // Create order for payment
        const orderRes = await createOrder({
          attraction_id: apiBookingData.attraction_id,
          attraction_booking_id: response.data.id,
          amount: paymentAmount
        });

        if (orderRes.status) {
          // Initialize Razorpay payment
          const paymentResponse = await initializeRazorpayPayment({
            amount: paymentAmount * 100, // Razorpay expects amount in paise
            currency: "INR",
            name: "Explore World",
            description: `Payment for ${attractionData?.attraction?.name || 'attraction'} tickets`,
            orderId: orderRes.data.order_id,
            email: formData.email,
            contact: formData.phone,
          });

          if (paymentResponse.status) {
            // Verify payment
            const verificationResponse = await verifyPayment({
              order_id: orderRes.data.order_id,
              payment_id: paymentResponse.data.razorpay_payment_id,
              signature: paymentResponse.data.razorpay_signature,
            });

            console.log("Attraction Payment Verification Response:", verificationResponse);

            if (verificationResponse.status) {
              console.log("Payment verification successful, email should be sent by backend");
              
              // Debug email addresses
              console.log("📧 Email Debug Info:");
              console.log("- User email (from profile):", verificationResponse.data.user?.email);
              console.log("- Payment form email:", formData.email);
              console.log("- Email will be sent to:", verificationResponse.data.user?.email || "user profile email");
              console.log("- Email status:", verificationResponse.data.email_status || "Not specified in response");
              console.log("- Check your email for booking confirmation");
              setSuccessMessage({
                title: "Booking Successful!",
                message: "Your attraction tickets have been booked successfully. Check your email for details.",
              });
              setShowSuccess(true);
            } else {
              // Payment verification failed - mark payment as failed
              const failRes = await paymentFailure(orderRes.data.attraction_payment_id);
              console.log(failRes);
              
              setError("Payment verification failed. Please contact support.");
            }
          } else {
            // Payment initialization failed - mark payment as failed
            const failRes = await paymentFailure(orderRes.data.attraction_payment_id);
            console.log(failRes);
            
            setError("Payment initialization failed. Please try again.");
          }
        } else {
          setError(orderRes.message || "Failed to create payment order. Please try again.");
        }
      } else {
        setError(response.message || "Failed to complete booking. Please try again.");
      }

    } catch (error) {
      console.error("Booking error:", error);
      
      // Handle specific timeout errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setError("Payment verification is taking longer than expected. Please check your bookings page to confirm if the payment was successful.");
      } else {
        setError(error.response?.data?.message || "Failed to complete booking. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Attraction
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
            The attraction you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const ticketDetails = getTicketDetails();
  const totalAmount = getTotalPrice();

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
                  <div className="flex justify-between font-bold pt-1.5 border-t border-green-200">
                    <span className="text-gray-900 text-sm">Total Amount</span>
                    <span className="text-primary-600 text-sm">₹{Math.round(totalAmount)}</span>
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
              disabled={isLoading}
              className="w-full h-10 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-semibold rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
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
            
            {isLoading && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">Please don't close this window while processing...</p>
              </div>
            )}

            {error && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 font-medium">{error}</p>
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
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-base font-semibold rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
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
                
                {isLoading && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Please don't close this window while processing...</p>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
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
                        <span className="text-gray-900 font-semibold">₹{Math.round(ticket.total)}</span>
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
                    <div className="flex justify-between font-bold pt-2 border-t border-green-200">
                      <span className="text-gray-900">Total Amount</span>
                      <span className="text-primary-600">₹{Math.round(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <SuccessPopup
          show={showSuccess}
          title={successMessage.title}
          message={successMessage.message}
          onClose={() => {
            setShowSuccess(false);
            router.push("/my-bookings");
          }}
        />
      )}
    </div>
  );
}
