"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { eventInfo } from "../../events/[id]/service";
import { getDetailsForBooking } from "../../events/[id]/service";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import { book, createOrder, verifyPayment, paymentFailure } from "./service";

export default function EventCheckoutPage() {
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
  const [eventData, setEventData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Fetch event and booking details from API
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoadingData(true);
        const eventId = searchParams.get("event_id");
        const ticketsData = searchParams.get("tickets");
        
        if (!eventId || !ticketsData) {
          setError("Missing event or ticket information");
          return;
        }

        // Parse selected tickets from URL params
        const parsedTickets = JSON.parse(decodeURIComponent(ticketsData));
        setSelectedTickets(parsedTickets);

        // Fetch event and booking details
        const [eventResponse, bookingResponse] = await Promise.all([
          eventInfo(eventId),
          getDetailsForBooking(eventId),
        ]);

        if (eventResponse.status && bookingResponse.status) {
          setEventData(eventResponse.data);
          setBookingData(bookingResponse.data);
        } else {
          setError("Failed to load event details");
        }
      } catch (error) {      
        setError("Failed to load event details. Please try again.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchEventDetails();
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
    router.push("/events");
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

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };
 
  const getTotalSelectedTickets = () => {
    // Handle new data structure
    if (selectedTickets.bookingTickets) {
      return selectedTickets.bookingTickets.reduce(
        (sum, ticket) => sum + ticket.quantity,
        0
      );
    }
    // Fallback to old structure
    return Object.values(selectedTickets).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
  };

  const getTotalPrice = () => {
    // Handle new data structure
    if (selectedTickets.total_amount) {
      return selectedTickets.total_amount;
    }
    // Fallback to old structure
    let total = 0;
    Object.entries(selectedTickets).forEach(([key, quantity]) => {
      const [dateId, showId, ticketTypeId] = key.split("-");
      const date = bookingData?.find((d) => d.id == dateId);
      const ticketPrice = date?.event_ticket_prices.find(
        (t) => t.event_ticket_type_id == ticketTypeId
      );

      if (ticketPrice && quantity > 0) {
        total += parseFloat(ticketPrice.price) * quantity;
      }
    });
    return total;
  };

  const getTicketDetails = () => {
    const ticketDetails = [];
    
    // Handle new data structure
    if (selectedTickets.bookingTickets) {
      // For new structure, we need to get additional details from bookingData
      selectedTickets.bookingTickets.forEach((ticket) => {
        if (ticket.quantity === 0) return;
        
        // Find the corresponding date and show from the first ticket
        const dateId = selectedTickets.event_day_id;
        const showId = selectedTickets.event_show_id;
        
        const date = bookingData?.find((d) => d.id == dateId);
        const show = date?.event_shows.find((s) => s.id == showId);
        const ticketType = date?.event_ticket_prices.find(
          (t) => t.event_ticket_type_id == ticket.event_ticket_type_id
        )?.event_ticket_type?.event_ticket_type_master;

        if (date && show && ticketType) {
          ticketDetails.push({
            date: date.date,
            showName: show.name,
            startTime: show.start_time,
            endTime: show.end_time,
            ticketType: ticketType.name,
            quantity: ticket.quantity,
            price: ticket.price,
            total: ticket.total,
          });
        }
      });
      return ticketDetails;
    }
    
    // Fallback to old structure
    Object.entries(selectedTickets).forEach(([key, quantity]) => {
      if (quantity === 0) return;
      
      const [dateId, showId, ticketTypeId] = key.split("-");
      const date = bookingData?.find((d) => d.id == dateId);
      const show = date?.event_shows.find((s) => s.id == showId);
      const ticketPrice = date?.event_ticket_prices.find(
        (t) => t.event_ticket_type_id == ticketTypeId
      );
      const ticketType = ticketPrice?.event_ticket_type.event_ticket_type_master;

      if (date && show && ticketPrice && ticketType) {
        ticketDetails.push({
          date: date.date,
          showName: show.name,
          startTime: show.start_time,
          endTime: show.end_time,
          ticketType: ticketType.name,
          quantity: quantity,
          price: ticketPrice.price,
          total: parseFloat(ticketPrice.price) * quantity,
        });
      }
    });
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

      // Prepare booking data according to API requirements
      const apiBookingData = {
        event_id: parseInt(searchParams.get("event_id")),
        event_day_id: selectedTickets.event_day_id,
        event_show_id: selectedTickets.event_show_id,
        total_amount: selectedTickets.total_amount,
        discount_amount: selectedTickets.discount_amount,
        bookingTickets: selectedTickets.bookingTickets
      };

      // First create booking to get order ID
      const response = await book(apiBookingData);
     
      if (response.status) {
        const paymentAmount = selectedTickets.total_amount; // Full payment
        
        // Create order for payment
        const orderRes = await createOrder({
          event_id: apiBookingData.event_id,
          event_booking_id: response.data.id,
          amount: paymentAmount
        });

        if (orderRes.status) {
          // Initialize Razorpay payment
          const paymentResponse = await initializeRazorpayPayment({
            amount: paymentAmount * 100, // Razorpay expects amount in paise
            currency: "INR",
            name: "Explore World",
            description: `Payment for ${eventData.name} tickets`,
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

            if (verificationResponse.status) {
              setSuccessMessage({
                title: "Booking Successful!",
                message: "Your event tickets have been booked successfully. Check your email for details.",
              });
              setShowSuccess(true);
            } else {
              // Payment verification failed - mark payment as failed
              const failRes = await paymentFailure(orderRes.data.event_payment_id);
              console.log(failRes);
              
              setError("Payment verification failed. Please contact support.");
            }
          } else {
            // Payment initialization failed - mark payment as failed
            const failRes = await paymentFailure(orderRes.data.event_payment_id);
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
      setError(error.response?.data?.message || "Failed to complete booking. Please try again.");
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
            Error Loading Event
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/events" className="text-primary-600 hover:text-primary-700">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!eventData || !bookingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Event not found
          </h2>
          <p className="text-gray-600">
            The event you&apos;re looking for doesn&apos;t exist.
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
          <Link href="/events" className="text-primary-600 hover:text-primary-700 flex items-center transition-colors group">
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
            <span className="font-medium text-sm">Back to Events</span>
          </Link>
        </div>
       
        {/* Mobile Layout - Event Summary First */}
        <div className="block md:hidden">
          {/* Event Summary - Mobile */}
          <div className="bg-white rounded-xl p-3 shadow-sm mb-3 border border-gray-200/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-primary-100 rounded-lg flex items-center justify-center">
                <i className="fi fi-rr-document text-primary-600 text-xs"></i>
              </div>
              <h2 className="text-base font-bold text-gray-900">Event Summary</h2>
            </div>

            <div className="space-y-3">
              <div className="bg-gradient-to-r from-gray-50 to-gray-25 rounded-lg p-2.5 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    <Image
                      src={eventData.cover_image}
                      alt={eventData.name}
                      className="object-cover"
                      fill
                      sizes="40px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                      {eventData.name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-600 mt-0.5">
                      <div className="w-2.5 h-2.5 bg-primary-100 rounded-full flex items-center justify-center mr-1">
                        <i className="fi fi-rr-calendar text-primary-600 text-[6px]"></i>
                      </div>
                      <span className="font-medium">
                        {formatDate(eventData.starting_date)} - {formatDate(eventData.ending_date)}
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
                    <span className="text-gray-600">Event Type</span>
                    <span className="text-gray-900 font-semibold">{eventData.event_category_master?.name}</span>
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
                    <span className="text-primary-600 text-sm">₹{totalAmount.toFixed(2)}</span>
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
              <h2 className="text-base font-bold text-gray-900">Attendee Details</h2>
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
              <button
                type="button"
                onClick={cancelBooking}
                className="w-full h-10 mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg flex items-center justify-center transition-all shadow-sm hover:shadow-md"
              >
                <i className="fi fi-rr-cross mr-2 text-sm"></i>
                Cancel Booking
              </button>
            )}
          </form>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mt-10">
          {/* Form Section - Desktop */}
          <div className="col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200/50 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-primary-100 rounded-xl flex items-center justify-center">
                  <i className="fi fi-rr-user text-primary-600 text-sm"></i>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Attendee Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                    className="w-full h-12 px-0 pr-10 border-b text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[16px] focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium tracking-tight"
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
                    className="w-full h-12 px-0 pr-10 border-b text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[16px] focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium tracking-tight"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="md:col-span-2">
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
                    className="w-full h-12 px-0 pr-10 border-b text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[16px] focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium tracking-tight"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="flex items-start mb-6 p-3 bg-gradient-to-r from-yellow-50 to-amber-25 rounded-xl border border-yellow-200">
                <input
                  type="checkbox"
                  id="termsAgreement"
                  required
                  className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500/20 focus:ring-offset-0 cursor-pointer transition-colors mt-0.5"
                />
                <label htmlFor="termsAgreement" className="ml-3 block text-sm text-gray-700 cursor-pointer leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-primary-200 hover:decoration-primary-400 transition-colors">Terms and Conditions</a>,{" "}
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-primary-200 hover:decoration-primary-400 transition-colors">Cancellation Policy</a>, and{" "}
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-primary-200 hover:decoration-primary-400 transition-colors">Privacy Policy</a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-base font-bold rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
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
                    <i className="fi fi-rr-shield-check mr-2.5 text-base"></i>
                    Complete Booking
                  </span>
                )}
              </button>
              
              {isLoading && (
                <button
                  type="button"
                  onClick={cancelBooking}
                  className="w-full h-12 mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-base font-medium rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                >
                  <i className="fi fi-rr-cross mr-2.5 text-base"></i>
                  Cancel Booking
                </button>
              )}
            </form>
          </div>

          {/* Event Summary - Desktop */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200/50 backdrop-blur-sm sticky top-4">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-primary-100 rounded-xl flex items-center justify-center">
                  <i className="fi fi-rr-document text-primary-600 text-sm"></i>
                </div>
                <h2 className="text-base font-bold text-gray-900">Event Summary</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-50 to-gray-25 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
                      <Image
                        src={eventData.cover_image}
                        alt={eventData.name}
                        className="object-cover"
                        fill
                        sizes="56px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 mb-1.5 text-sm">
                        {eventData.name}
                      </h3>
                      <div className="flex items-center text-xs text-gray-600">
                        <span className="font-semibold">
                          {formatDate(eventData.starting_date)} - {formatDate(eventData.ending_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-25 p-3 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-gray-900 mb-2 text-sm flex items-center">
                    <div className="w-4 h-4 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                      <i className="fi fi-rr-ticket text-blue-600 text-xs"></i>
                    </div>
                    Tickets
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Total Tickets</span>
                      <span className="text-gray-900 font-bold">{getTotalSelectedTickets()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Event Type</span>
                      <span className="text-gray-900 font-bold">{eventData.event_category_master?.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Location</span>
                      <span className="text-gray-900 font-bold">{eventData.location}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-25 p-3 rounded-xl border border-green-100">
                  <h4 className="font-bold text-gray-900 mb-2 text-sm flex items-center">
                    <div className="w-4 h-4 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                      <i className="fi fi-rr-money-bill-wave text-green-600 text-xs"></i>
                    </div>
                    Price Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold pt-2 border-t border-green-200">
                      <span className="text-gray-900 text-sm">Total Amount</span>
                      <span className="text-primary-600 text-sm">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-25 p-3 rounded-xl border border-purple-100">
                  <h4 className="font-bold text-gray-900 mb-2 text-sm flex items-center">
                    <div className="w-4 h-4 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                      <i className="fi fi-rr-calendar text-purple-600 text-xs"></i>
                    </div>
                    Selected Tickets
                  </h4>
                  <div className="space-y-2">
                    {ticketDetails.map((ticket, index) => (
                      <div key={index} className="text-xs border-b border-purple-200 pb-2 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-gray-700 font-medium">{ticket.ticketType} × {ticket.quantity}</span>
                          <span className="text-gray-900 font-bold">₹{ticket.total.toFixed(2)}</span>
                        </div>
                        <p className="text-gray-600">
                          {formatDate(ticket.date)} - {ticket.showName}
                        </p>
                        <p className="text-gray-500">
                          {formatTime(ticket.startTime)} - {formatTime(ticket.endTime)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      <SuccessPopup
        show={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.push("/my-bookings");
        }}
        title={successMessage.title}
        message={successMessage.message}
      />
      
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
  );
}
