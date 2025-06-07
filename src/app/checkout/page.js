"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
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
  const [travelers, setTravelers] = useState({
    adults: 2,
    children: 0,
    infants: 0,
  });
  const [startDate, setStartDate] = useState("");
  const [stayCategory, setStayCategory] = useState("standard");

  useEffect(() => {
    // In a real app, you'd fetch this from an API or get it from URL params
    // For now, we'll use mock data
    const adults = parseInt(searchParams.get("adults") || "2");
    const children = parseInt(searchParams.get("children") || "0");
    const infants = parseInt(searchParams.get("infants") || "0");
    const date = searchParams.get("date") || "";
    const stayCategory = searchParams.get("stayCategory") || "standard";
    const duration = searchParams.get("duration") || "12n13d";

    setTravelers({ adults, children, infants });
    setStartDate(date);
    setStayCategory(stayCategory);

    // Mock package data
    setPackageDetails({
      id: "raj-jais-kash-amr-del-agra",
      title: "Rajasthan - Jaisalmer - Kashmir - Amritsar - Delhi - Agra",
      basePrice: 20500,
      nights: duration === "11n12d" ? 11 : 12,
      days: duration === "11n12d" ? 12 : 13,
      image:
        "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      stayPriceMultipliers: {
        budget: 0.85,
        standard: 1,
        luxury: 1.3,
      },
    });
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert(
        "Booking successful! You will receive a confirmation email shortly."
      );
      router.push("/booking-confirmation?id=123456");
    }, 1500);
  };

  // Calculate prices
  const calculatePrices = () => {
    if (!packageDetails) return { baseTotal: 0, total: 0, advanceAmount: 0 };

    const pricePerAdult =
      packageDetails.basePrice *
      (packageDetails.stayPriceMultipliers[stayCategory] || 1);
    const pricePerChild = pricePerAdult * 0.7; // 70% of adult price

    const baseTotal =
      travelers.adults * pricePerAdult + travelers.children * pricePerChild;

    // Add any taxes or fees here
    const taxes = baseTotal * 0.05; // Example: 5% tax
    const total = baseTotal + taxes;

    // Calculate advance amount (25%)
    const advanceAmount = total * 0.25;

    return {
      baseTotal: Math.round(baseTotal),
      taxes: Math.round(taxes),
      total: Math.round(total),
      advanceAmount: Math.round(advanceAmount),
    };
  };

  const prices = calculatePrices();

  if (!packageDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
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
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-none focus:border-primary-500 transition-colors"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-none focus:border-primary-500 transition-colors"
                    placeholder="Enter your last name"
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
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-none focus:border-primary-500 transition-colors"
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
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-none focus:border-primary-500 transition-colors"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  {/* Partial Payment Card */}
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
                        25% Advance
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-800 mb-1">
                      ₹{prices.advanceAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600">
                      Pay 25% now and ₹
                      {(prices.total - prices.advanceAmount).toLocaleString()}{" "}
                      30 days before trip
                    </p>
                  </div>
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
                {/* <h2 className="text-xl font-semibold text-gray-900">
                  Package Details
                </h2> */}

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  {/* Package details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                        <img  
                          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=300&auto=format&fit=crop"
                          alt="Tour Package"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-900 leading-snug">
                              {packageDetails.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600">
                                <i className="fi fi-rr-calendar mr-2"></i>
                                {startDate ? (
                                  <span>
                                    {(() => {
                                      const start = new Date(startDate);
                                      const end = new Date(startDate);
                                      end.setDate(end.getDate() + packageDetails.nights);
                                      
                                      const formatDate = (date) => {
                                        return date.toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        });
                                      };
                                      
                                      return (
                                        <>
                                          {formatDate(start)} - {formatDate(end)}
                                        </>
                                      );
                                    })()}
                                  </span>
                                ) : (
                                  <span>
                                    jul-12-2025 - jul-20-2025 
                                  </span>
                                )}
                            </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-4">
                            <div className="inline-flex items-center">
                              <i className="fi fi-rr-hotel mr-1.5"></i>
                              <span className="capitalize">{stayCategory} Stay</span>
                            </div>
                            <span className="text-gray-400 mx-2">|</span>
                            <div className="inline-flex items-center">
                              <i className="fi fi-rr-pending mr-1.5"></i>
                              <span>Scheduled Trip</span>
                            </div>
                    </div>
                   
                  </div>
                </div>

                {/* <div className="border-t border-gray-200"></div> */}
                
            
                <div className="">
                  <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                  <i className="fi fi-rr-users mr-2"></i>
                    Travelers
                  </h3>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Adults</span>
                      <span className="text-gray-800 font-medium">
                        {travelers.adults}
                      </span>
                    </div>
                    {travelers.children > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Children</span>
                        <span className="text-gray-800 font-medium">
                          {travelers.children}
                        </span>
                      </div>
                    )}
                    {travelers.infants > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Infants</span>
                        <span className="text-gray-800 font-medium">
                          {travelers.infants}
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
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span className="text-gray-800 font-medium">
                        ₹{prices.taxes.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-3 border-t border-gray-200">
                      <span className="text-gray-800">Total Amount</span>
                      <span className="text-primary-600 text-lg">
                        ₹{prices.total.toLocaleString()}
                      </span>
                    </div>
                    {formData.paymentOption === "partial" && (
                      <div className="flex justify-between text-sm mt-3 pt-3 border-t border-dashed border-gray-300 bg-blue-50 -mx-4 px-4 pb-4">
                        <span className="text-blue-700">Due Now (25%)</span>
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
    </div>
  );
}
