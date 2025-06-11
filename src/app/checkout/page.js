"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { checkoutData, book, createOrder, verifyPayment } from "./service";
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
        total_amount: packageDetails.total_price
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
  
          console.log(paymentResponse)
          if (paymentResponse.status) {
            // Verify payment with the correct parameters
            const verificationResponse = await verifyPayment({
              razorpay_order_id: paymentResponse.data.razorpay_order_id,
              razorpay_signature: paymentResponse.data.razorpay_signature
            });

            if (verificationResponse.status) {
              setSuccessMessage({
                title: "Booking Successful!",
                message: "Your trip has been booked successfully. Check your email for details.",
              });
              setShowSuccess(true);
              
              // Redirect after a short delay
              setTimeout(() => {
                router.push("/my-bookings");
              }, 2000);
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } else {
            setError(paymentResponse.error?.description || "Payment failed. Please try again.");
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/package" className="text-primary-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Package
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - Form */}
          <div className="w-full md:w-2/3">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 shadow-sm mb-8 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                Traveler Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer placeholder:font-normal font-medium tracking-tight"
                    placeholder="Enter your full name"
                  />
                </div>
               
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer placeholder:font-normal font-medium tracking-tight"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer placeholder:font-normal font-medium tracking-tight"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                Payment Options
              </h2>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Choose Payment Option <span className="text-red-500">*</span>
                </label>

                <div className={`grid grid-cols-1 ${prices.showAdvance ? 'md:grid-cols-2' : ''} gap-6`}>
                  {/* Full Payment Card */}
                  <div
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                      formData.paymentOption === "full"
                        ? "border-primary-500 bg-primary-50/50"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentOption: "full",
                      }))
                    }
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentOption === "full"
                            ? "border-primary-500"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.paymentOption === "full" && (
                          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                        )}
                      </div>
                      <span className="ml-2 font-medium text-gray-800">
                        Full Payment
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-800 mb-1">
                      ₹{prices.total.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600">
                      Pay the complete amount now
                    </p>
                  </div>

                  {/* Partial Payment Card - Only show if advance payment is available and less than full amount */}
                  {prices.showAdvance && (
                    <div
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                        formData.paymentOption === "partial"
                          ? "border-primary-500 bg-primary-50/50"
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentOption: "partial",
                        }))
                      }
                    >
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.paymentOption === "partial"
                              ? "border-primary-500"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.paymentOption === "partial" && (
                            <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                          )}
                        </div>
                        <span className="ml-2 font-medium text-gray-800">
                          {prices.advancePercentage}% Advance
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-800 mb-1">
                        ₹{prices.advanceAmount.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-600">
                        Pay {prices.advancePercentage}% now and ₹
                        {(prices.total - prices.advanceAmount).toLocaleString()}{" "}
                        later
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center mb-8">
                <input
                  type="checkbox"
                  id="termsAgreement"
                  required
                  className="w-4 h-4 text-primary-600 bg-gray-50 border-gray-200 rounded focus:ring-primary-500/20 focus:ring-offset-0 cursor-pointer transition-colors"
                />
                <label
                  htmlFor="termsAgreement"
                  className="ml-3 block text-sm text-gray-600 cursor-pointer"
                >
                  I agree to the{" "}
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    Terms and Conditions
                  </a>
                  ,{" "}
                  <a
                    href="#"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Cancellation Policy
                  </a>
                  , and{" "}
                  <a
                    href="#"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-primary-600 text-white text-base font-medium rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed shadow-sm hover:shadow"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  "Complete Booking"
                )}
              </button>
            </form>
          </div>

          {/* Right column - Order summary */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-2xl p-8 shadow-sm sticky top-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Your Trip Summary
              </h2>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                        <img  
                          src={packageDetails.package_image}
                          alt={packageDetails.package_name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-gray-900 leading-snug">
                            {packageDetails.package_name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <i className="fi fi-rr-calendar mr-2"></i>
                            <span>
                              {packageDetails.startDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="">
                  <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                    <i className="fi fi-rr-users mr-2"></i>
                    Travelers
                  </h3>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Adults</span>
                      <span className="text-gray-800 font-medium">
                        {packageDetails.travelers.adults}
                      </span>
                    </div>
                    {packageDetails.travelers.children > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Children</span>
                        <span className="text-gray-800 font-medium">
                          {packageDetails.travelers.children}
                        </span>
                      </div>
                    )}
                    {packageDetails.travelers.infants > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Infants</span>
                        <span className="text-gray-800 font-medium">
                          {packageDetails.travelers.infants}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                    <i className="fi fi-rr-money-bill-wave mr-2"></i>
                    Price Details
                  </h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base Price</span>
                      <span className="text-gray-800 font-medium">
                        ₹{prices.baseTotal.toLocaleString()}
                      </span>
                    </div>
                    {packageDetails.discount_percentage > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({packageDetails.discount_percentage}%)</span>
                        <span className="font-medium">
                          -₹{packageDetails.discount_price.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-3 border-t border-gray-200">
                      <span className="text-gray-800">Total Amount</span>
                      <span className="text-primary-600 text-lg">
                        ₹{prices.total.toLocaleString()}
                      </span>
                    </div>
                    {formData.paymentOption === "partial" && prices.showAdvance && (
                      <div className="flex justify-between text-sm mt-3 pt-3 border-t border-dashed border-gray-300 bg-blue-50 -mx-4 px-4 pb-4">
                        <span className="text-blue-700">
                          {prices.advancePercentage === 25 ? "Due Now (25% Advance)" : 
                           prices.advancePercentage === 50 ? "Due Now (50% Advance)" :
                           `Due Now (${prices.advancePercentage}% Advance)`}
                        </span>
                        <span className="text-blue-700 font-bold">
                          ₹{prices.advanceAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs text-gray-700">
                      By completing this booking, you agree to our{" "}
                      <a href="#" className="text-primary-600 font-medium">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary-600 font-medium">
                        Cancellation Policy
                      </a>
                      .
                    </p>
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
