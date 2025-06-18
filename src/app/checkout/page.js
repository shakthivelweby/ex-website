"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { checkoutData, book, createOrder, verifyPayment, paymentFailure } from "./service";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";
import { initializeRazorpayPayment } from "@/sdk/razorpay";

export default function CheckoutPage() {
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
    paymentOption: "full", // full or partial
  });
  const [isLoading, setIsLoading] = useState(false);
  const [packageDetails, setPackageDetails] = useState(null);
  const [isLoadingPackage, setIsLoadingPackage] = useState(true);
  const [error, setError] = useState(null);

  // Fetch package details from API
  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        setIsLoadingPackage(true);
        const params = {
          package_id: searchParams.get("package_id"),
          stay_category_id: searchParams.get("stay_category_id"),
          booking_date: searchParams.get("booking_date"),
          adult_count: searchParams.get("adult_count"),
          child_count: searchParams.get("child_count"),
          infant_count: searchParams.get("infant_count"),
          package_price_rate_id: searchParams.get("package_price_rate_id")
        };

        const response = await checkoutData(params);
        if (response.status) {
          setPackageDetails({
            ...response.data,
            travelers: {
              adults: parseInt(params.adult_count),
              children: parseInt(params.child_count),
              infants: parseInt(params.infant_count)
            },
            startDate: params.booking_date
          });
        } else {
          setError("Failed to load package details");
        }
      } catch (error) {
        console.error("Error fetching package details:", error);
        setError("Failed to load package details. Please try again.");
      } finally {
        setIsLoadingPackage(false);
      }
    };

    fetchPackageDetails();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      const bookingData = {
        package_id: searchParams.get("package_id"),
        stay_category_id: searchParams.get("stay_category_id"),
        booking_date: searchParams.get("booking_date"),
        adult_count: searchParams.get("adult_count"),
        child_count: searchParams.get("child_count"),
        infant_count: searchParams.get("infant_count"),
        package_price_rate_id: searchParams.get("package_price_rate_id"),
        payment_type: formData.paymentOption, // 'full' or 'partial'
        name: formData.firstName,
        email: formData.email,
        phone: formData.phone,
        total_amount: packageDetails.total_price,
        discount_amount : packageDetails.discount_price
      };

      // First create booking to get order ID
      const response = await book(bookingData);
     
     
      
      if (response.status) {
        const paymentAmount = formData.paymentOption === 'full' ? prices.total : prices.advanceAmount;
        
        // Create order for payment
        const orderRes = await createOrder({
          package_id: bookingData.package_id,
          package_booking_id: response.data.id,
          payment_type: formData.paymentOption,
          amount: paymentAmount
        });

  
      

        if (orderRes.status) {


      
      
          // Initialize Razorpay payment
          const paymentResponse = await initializeRazorpayPayment({
            amount: paymentAmount,
            currency: "INR",
            name: "Explore World",
            description: `Payment for ${packageDetails.package_name}`,
            orderId: orderRes.data.order_id,
            email: formData.email,
            contact: formData.phone,
          });

          
        

          if (paymentResponse.status) {
  
            // Verify payment with the correct parameters
            const verificationResponse = await verifyPayment({
              razorpay_order_id: paymentResponse.data.razorpay_order_id,
              razorpay_signature: paymentResponse.data.razorpay_signature,
              payment_id : paymentResponse.data.razorpay_payment_id,
            });
            console.log("verificationResponse", verificationResponse)
            if (verificationResponse.status) {
              setSuccessMessage({
                title: "Booking Successful!",
                message: "Your trip has been booked successfully. Check your email for details.",
              });
              setShowSuccess(true);
              
              // Redirect after a short delay
              // setTimeout(() => {
              //   router.push("/my-bookings");
              // }, 2000);
            } else {
              const failRes = paymentFailure(orderRes.data.package_payment_id)
           console.log(failRes)
             
              // setError("Payment verification failed. Please contact support.");
            }
          } else {
           const failRes = paymentFailure(orderRes.data.package_payment_id)
           console.log(failRes)
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

  // Calculate prices based on API data
  const calculatePrices = () => {
    if (!packageDetails) return { baseTotal: 0, total: 0, advanceAmount: 0 };

    const { adult_price, child_price, infant_price, discount_price, advance_price, total_price, final_price, advance_percentage } = packageDetails;
    const { adults, children, infants } = packageDetails.travelers;

    const baseTotal = (adults * parseFloat(adult_price)) + 
                     (children * parseFloat(child_price)) + 
                     (infants * parseFloat(infant_price));

    const total = final_price;
    const advanceAmount = advance_price || 0;

    return {
      baseTotal: Math.round(baseTotal),
      total: Math.round(total),
      advanceAmount: Math.round(advanceAmount),
      showAdvance: advance_percentage && advance_percentage < 100,
      advancePercentage: advance_percentage || 0
    };
  };

  const prices = calculatePrices();

  if (isLoadingPackage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  if (!packageDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        No package details found
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="mb-3">
          <Link href="/package" className="text-primary-600 hover:text-primary-700 flex items-center transition-colors group">
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
            <span className="font-medium text-sm">Back to Package</span>
          </Link>
        </div>

        {/* Mobile Layout - Trip Summary First */}
        <div className="block md:hidden">
          {/* Trip Summary - Mobile */}
          <div className="bg-white rounded-xl p-3 shadow-sm mb-3 border border-gray-200/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-primary-100 rounded-lg flex items-center justify-center">
                <i className="fi fi-rr-document text-primary-600 text-xs"></i>
              </div>
              <h2 className="text-base font-bold text-gray-900">Trip Summary</h2>
            </div>

            <div className="space-y-3">
              <div className="bg-gradient-to-r from-gray-50 to-gray-25 rounded-lg p-2.5 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    <Image  
                      src={packageDetails.package_image}
                      alt={packageDetails.package_name}
                      className="object-cover"
                      fill
                      sizes="40px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                      {packageDetails.package_name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-600 mt-0.5">
                      <div className="w-2.5 h-2.5 bg-primary-100 rounded-full flex items-center justify-center mr-1">
                        <i className="fi fi-rr-calendar text-primary-600 text-[6px]"></i>
                      </div>
                      <span className="font-medium">{packageDetails.startDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-25 p-2.5 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-1.5 text-sm flex items-center">
                  <div className="w-3.5 h-3.5 bg-blue-100 rounded-md flex items-center justify-center mr-1.5">
                    <i className="fi fi-rr-users text-blue-600 text-[8px]"></i>
                  </div>
                  Travelers
                </h4>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Adults</span>
                    <span className="text-gray-900 font-semibold">{packageDetails.travelers.adults}</span>
                  </div>
                  {packageDetails.travelers.children > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Children</span>
                      <span className="text-gray-900 font-semibold">{packageDetails.travelers.children}</span>
                    </div>
                  )}
                  {packageDetails.travelers.infants > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Infants</span>
                      <span className="text-gray-900 font-semibold">{packageDetails.travelers.infants}</span>
                    </div>
                  )}
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
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Base Price</span>
                    <span className="text-gray-900 font-semibold">₹{prices.baseTotal.toLocaleString()}</span>
                  </div>
                  {packageDetails.discount_percentage > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Discount ({packageDetails.discount_percentage}%)</span>
                      <span className="text-green-700 font-semibold">-₹{packageDetails.discount_price.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1.5 border-t border-green-200">
                    <span className="text-gray-900 text-sm">Total Amount</span>
                    <span className="text-primary-600 text-sm">₹{prices.total.toLocaleString()}</span>
                  </div>
                  {formData.paymentOption === "partial" && prices.showAdvance && (
                    <div className="flex justify-between text-xs mt-1.5 pt-1.5 border-t border-dashed border-green-300 bg-blue-50 -mx-2.5 px-2.5 pb-2.5 rounded-b-lg">
                      <span className="text-blue-700 font-medium">Due Now ({prices.advancePercentage}% Advance)</span>
                      <span className="text-blue-700 font-bold">₹{prices.advanceAmount.toLocaleString()}</span>
                    </div>
                  )}
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
              <h2 className="text-base font-bold text-gray-900">Traveler Details</h2>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
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

            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fi fi-rr-credit-card text-green-600 text-xs"></i>
              </div>
              <h3 className="text-base font-bold text-gray-900">Payment Options</h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choose Payment Option <span className="text-red-500">*</span>
              </label>

              <div className="space-y-2">
                {/* Full Payment Card */}
                <div
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    formData.paymentOption === "full"
                      ? "border-primary-500 bg-gradient-to-r from-primary-50 to-primary-25 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, paymentOption: "full" }))}
                >
                  <div className="flex items-center mb-1.5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.paymentOption === "full" ? "border-primary-500 bg-primary-500" : "border-gray-300"
                      }`}
                    >
                      {formData.paymentOption === "full" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="ml-2.5 font-semibold text-gray-900 text-sm">Full Payment</span>
                  </div>
                  <div className="text-base font-bold text-gray-900 mb-1">₹{prices.total.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">Pay the complete amount now</p>
                </div>

                {/* Partial Payment Card */}
                {prices.showAdvance && (
                  <div
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.paymentOption === "partial"
                        ? "border-primary-500 bg-gradient-to-r from-primary-50 to-primary-25 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, paymentOption: "partial" }))}
                  >
                    <div className="flex items-center mb-1.5">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentOption === "partial" ? "border-primary-500 bg-primary-500" : "border-gray-300"
                        }`}
                      >
                        {formData.paymentOption === "partial" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="ml-2.5 font-semibold text-gray-900 text-sm">{prices.advancePercentage}% Advance</span>
                    </div>
                    <div className="text-base font-bold text-gray-900 mb-1">₹{prices.advanceAmount.toLocaleString()}</div>
                    <p className="text-xs text-gray-600">
                      Pay {prices.advancePercentage}% now and ₹{(prices.total - prices.advanceAmount).toLocaleString()} later
                    </p>
                  </div>
                )}
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
          </form>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {/* Form Section - Desktop */}
          <div className="col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200/50 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-primary-100 rounded-xl flex items-center justify-center">
                  <i className="fi fi-rr-user text-primary-600 text-sm"></i>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Traveler Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
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

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-green-100 rounded-xl flex items-center justify-center">
                  <i className="fi fi-rr-credit-card text-green-600 text-sm"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Payment Options</h3>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Payment Option <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Full Payment Card */}
                  <div
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      formData.paymentOption === "full"
                        ? "border-primary-500 bg-gradient-to-br from-primary-50 to-primary-25 shadow-lg ring-2 ring-primary-100"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, paymentOption: "full" }))}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentOption === "full" ? "border-primary-500 bg-primary-500" : "border-gray-300"
                        }`}
                      >
                        {formData.paymentOption === "full" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="ml-2.5 font-bold text-gray-900 text-sm">Full Payment</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-1">₹{prices.total.toLocaleString()}</div>
                    <p className="text-xs text-gray-600">Pay the complete amount now</p>
                  </div>

                  {/* Partial Payment Card */}
                  {prices.showAdvance && (
                    <div
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        formData.paymentOption === "partial"
                          ? "border-primary-500 bg-gradient-to-br from-primary-50 to-primary-25 shadow-lg ring-2 ring-primary-100"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, paymentOption: "partial" }))}
                    >
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.paymentOption === "partial" ? "border-primary-500 bg-primary-500" : "border-gray-300"
                          }`}
                        >
                          {formData.paymentOption === "partial" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="ml-2.5 font-bold text-gray-900 text-sm">{prices.advancePercentage}% Advance</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 mb-1">₹{prices.advanceAmount.toLocaleString()}</div>
                      <p className="text-xs text-gray-600">
                        Pay {prices.advancePercentage}% now and ₹{(prices.total - prices.advanceAmount).toLocaleString()} later
                      </p>
                    </div>
                  )}
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
            </form>
          </div>

          {/* Trip Summary - Desktop */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200/50 backdrop-blur-sm sticky top-4">
              <div className="flex items-center gap-2.5 mb-4">
                
                <h2 className="text-base font-bold text-gray-900">Trip Summary</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-50 to-gray-25 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
                        <Image  
                          src={packageDetails.package_image}
                          alt={packageDetails.package_name}
                          className="object-cover"
                          fill
                          sizes="56px"
                        />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                      <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 mb-1.5 text-sm">
                            {packageDetails.package_name}
                          </h3>
                      <div className="flex items-center text-xs text-gray-600">
                        
                        <span className="font-semibold">{packageDetails.startDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-25 p-3 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-gray-900 mb-2 text-sm flex items-center">
                    <div className="w-4 h-4 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                      <i className="fi fi-rr-users text-blue-600 text-xs"></i>
                    </div>
                    Travelers
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Adults</span>
                      <span className="text-gray-900 font-bold">{packageDetails.travelers.adults}</span>
                    </div>
                    {packageDetails.travelers.children > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Children</span>
                        <span className="text-gray-900 font-bold">{packageDetails.travelers.children}</span>
                      </div>
                    )}
                    {packageDetails.travelers.infants > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Infants</span>
                        <span className="text-gray-900 font-bold">{packageDetails.travelers.infants}</span>
                      </div>
                    )}
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
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Base Price</span>
                      <span className="text-gray-900 font-bold">₹{prices.baseTotal.toLocaleString()}</span>
                    </div>
                    {packageDetails.discount_percentage > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-green-700">Discount ({packageDetails.discount_percentage}%)</span>
                        <span className="text-green-700 font-bold">-₹{packageDetails.discount_price.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t border-green-200">
                      <span className="text-gray-900 text-sm">Total Amount</span>
                      <span className="text-primary-600 text-sm">₹{prices.total.toLocaleString()}</span>
                    </div>
                    {formData.paymentOption === "partial" && prices.showAdvance && (
                      <div className="flex justify-between text-xs mt-2 pt-2 border-t border-dashed border-green-300 bg-gradient-to-r from-blue-50 to-indigo-25 -mx-3 px-3 pb-3 rounded-b-xl">
                        <span className="text-blue-700 font-bold">Due Now ({prices.advancePercentage}% Advance)</span>
                        <span className="text-blue-700 font-bold">₹{prices.advanceAmount.toLocaleString()}</span>
                      </div>
                    )}
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
        onClose={() => setShowSuccess(false)}
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
