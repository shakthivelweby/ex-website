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
              className="bg-white rounded-xl p-6 shadow-sm mb-8"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Traveler Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name*
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name*
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Payment Options
              </h2>

              <div className="mb-8">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose Payment Option*
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Payment Card */}
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.paymentOption === "full"
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
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
                        <span className="ml-2 font-medium text-gray-900">
                          Full Payment
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        ₹{prices.total.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-600">
                        Pay the complete amount now
                      </p>
                    </div>

                    {/* Partial Payment Card */}
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.paymentOption === "partial"
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
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
                        <span className="ml-2 font-medium text-gray-900">
                          25% Advance
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 mb-1">
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
              </div>

              <div className="flex items-center mb-8">
                <input
                  type="checkbox"
                  id="termsAgreement"
                  required
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label
                  htmlFor="termsAgreement"
                  className="ml-3 block text-sm text-gray-700"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-primary-600 hover:text-primary-800"
                  >
                    Terms and Conditions
                  </a>
                  ,{" "}
                  <a
                    href="#"
                    className="text-primary-600 hover:text-primary-800"
                  >
                    Cancellation Policy
                  </a>
                  , and{" "}
                  <a
                    href="#"
                    className="text-primary-600 hover:text-primary-800"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 transition duration-150 disabled:bg-primary-400"
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
                  <span>Complete Booking</span>
                )}
              </button>
            </form>
          </div>

          {/* Right column - Order summary */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Your Trip Summary
              </h2>

              <div className="mb-6 pb-6 border-b border-gray-200">
                {/* Package details */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {packageDetails.title}
                    </h3>
                    <div className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-200 shadow-sm ml-2 flex-shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=300&auto=format&fit=crop"
                        alt="Tour Package"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span className="capitalize">{stayCategory} Stay</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      <span>Scheduled Tour</span>
                    </div>
                  </div>

                  <div className="flex items-center bg-gray-50 rounded-md px-3 py-2 mt-3 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {startDate ? (
                      <span className="text-gray-700">
                        {(() => {
                          // Calculate start and end dates
                          const start = new Date(startDate);
                          const end = new Date(startDate);
                          end.setDate(end.getDate() + packageDetails.nights);

                          // Format dates
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
                      <span className="text-gray-500">
                        Jul 15, 2024 - Jul {packageDetails.nights + 14}, 2024
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Travelers
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Adults</span>
                    <span className="text-gray-900 font-medium">
                      {travelers.adults}
                    </span>
                  </div>
                  {travelers.children > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Children</span>
                      <span className="text-gray-900 font-medium">
                        {travelers.children}
                      </span>
                    </div>
                  )}
                  {travelers.infants > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Infants</span>
                      <span className="text-gray-900 font-medium">
                        {travelers.infants}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                    <path d="M7 6a1 1 0 011-1h.01a1 1 0 110 2H8a1 1 0 01-1-1zm1 6a1 1 0 100 2h.01a1 1 0 100-2H8zm3-10a1 1 0 100 2h1a1 1 0 100-2h-1zm-1 14a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-4-5a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h.01a1 1 0 100-2H7z" />
                  </svg>
                  Price Details
                </h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price</span>
                    <span className="text-gray-900 font-medium">
                      ₹{prices.baseTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="text-gray-900 font-medium">
                      ₹{prices.taxes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-3 border-t border-gray-200">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-primary-600 text-lg">
                      ₹{prices.total.toLocaleString()}
                    </span>
                  </div>
                  {formData.paymentOption === "partial" && (
                    <div className="flex justify-between text-sm mt-3 pt-3 border-t border-dashed border-gray-300 bg-blue-50 -mx-4 px-4 pb-1">
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
  );
}
