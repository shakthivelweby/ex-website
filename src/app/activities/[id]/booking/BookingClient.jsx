"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingClient = ({ activityId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [activityDetails, setActivityDetails] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    selectedDate: null,
    selectedTimeSlot: "",
    adultCount: 1,
    childCount: 0,
    specialRequests: "",
    agreeToTerms: false,
    needBuggy: false,
  });

  const [errors, setErrors] = useState({});

  // Time slots
  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  // Fetch activity details
  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
        // Get booking data from sessionStorage
        const bookingDataStr = sessionStorage.getItem("bookingData");
        if (bookingDataStr) {
          const data = JSON.parse(bookingDataStr);
          
          // Set activity details from sessionStorage or use defaults
          if (data.activityDetails) {
            setActivityDetails(data.activityDetails);
          }
          
          setFormData((prev) => ({
            ...prev,
            selectedDate: data.selectedDate ? new Date(data.selectedDate) : null,
            selectedTimeSlot: data.selectedTimeSlot || "",
            adultCount: data.adultCount || 1,
            childCount: data.childCount || 0,
          }));
          setSelectedTicket(data.selectedTicket);
          
          // Mark that data was successfully loaded
          if (data.selectedDate || data.selectedTimeSlot) {
            setDataLoaded(true);
          }
        } else {
          // If no booking data, set a default activity
          setActivityDetails({
            id: activityId,
            title: "Adventure Activity",
            location: "Location",
            price: 2500,
            duration: "2-3 hours",
          });
        }
      } catch (error) {
        console.error("Error loading booking data:", error);
        // Set default activity on error
        setActivityDetails({
          id: activityId,
          title: "Adventure Activity",
          location: "Location",
          price: 2500,
          duration: "2-3 hours",
        });
      }
    };

    fetchActivityDetails();
  }, [activityId]);

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedTicket && !activityDetails) {
      return 0;
    }

    const basePrice = selectedTicket?.price || activityDetails?.price || 0;
    const adultPrice = basePrice * formData.adultCount;
    const childPrice = selectedTicket?.child_price
      ? selectedTicket.child_price * formData.childCount
      : (basePrice * 0.7) * formData.childCount;

    return adultPrice + childPrice;
  };

  const totalPrice = calculateTotalPrice();

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.selectedDate) {
      newErrors.selectedDate = "Please select a date";
    }

    if (!formData.selectedTimeSlot) {
      newErrors.selectedTimeSlot = "Please select a time slot";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin()) {
      const event = new CustomEvent("showLogin");
      window.dispatchEvent(event);
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Here you would make an API call to create the booking
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Store booking confirmation data
      const bookingConfirmation = {
        bookingId: `BK${Date.now()}`,
        activityId,
        ...formData,
        totalPrice,
        selectedTicket,
        bookingDate: new Date().toISOString(),
      };

      sessionStorage.setItem("bookingConfirmation", JSON.stringify(bookingConfirmation));
      
      // Clear booking data
      sessionStorage.removeItem("bookingData");

      // Show success message
      alert("Booking confirmed! Redirecting to confirmation page...");
      
      // Redirect to confirmation page (you can create this later)
      router.push(`/activities/${activityId}/booking/confirmation`);
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  if (!activityDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <i className="fi fi-rr-arrow-left"></i>
            <span>Back to Activity</span>
          </button>
          <h1 className="text-2xl lg:text-3xl font-medium text-gray-900 tracking-tight">
            Complete Your Booking
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Fill in your details to book this amazing activity
          </p>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Booking Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                {/* Activity & Ticket Information */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-medium text-gray-900 mb-2 tracking-tight">
                        {activityDetails.title}
                      </h2>
                      {selectedTicket && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 border border-primary-300">
                            <i className="fi fi-rr-ticket mr-1.5"></i>
                            {selectedTicket.name || selectedTicket.type}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {formData.selectedDate && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <i className="fi fi-rr-calendar text-primary-500"></i>
                            <span className="font-medium">
                              {formData.selectedDate.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        {formData.selectedTimeSlot && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <i className="fi fi-rr-clock text-primary-500"></i>
                            <span className="font-medium">{formData.selectedTimeSlot}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-700">
                          <i className="fi fi-rr-users text-primary-500"></i>
                          <span className="font-medium">
                            {formData.adultCount} Adult{formData.adultCount > 1 ? "s" : ""}
                            {formData.childCount > 0 &&
                              `, ${formData.childCount} Child${formData.childCount > 1 ? "ren" : ""}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900 tracking-tight">
                    Booking Details
                  </h2>
                </div>
                {dataLoaded && (
                  <div className="hidden mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 flex items-start gap-2">
                      <i className="fi fi-rr-info-circle mt-0.5"></i>
                      <span>
                        Your booking details have been automatically filled from the previous page. You can still modify them if needed.
                      </span>
                    </p>
                  </div>
                )}
                <div className="space-y-4">
                  {/* Date Picker */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span>Select Date </span>
                   
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={formData.selectedDate}
                        onChange={(date) => handleInputChange("selectedDate", date)}
                        minDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Choose a date"
                        className={`w-full px-4 py-3 pl-12 border ${
                          errors.selectedDate
                            ? "border-red-500"
                            : formData.selectedDate
                            ? ""
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-500 text-gray-800 outline-none`}
                      />
                      <i className="fi fi-rr-calendar absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 text-lg pointer-events-none"></i>
                    </div>
                    {errors.selectedDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.selectedDate}
                      </p>
                    )}
                  </div>

                  {/* Time Slot */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 bg-white">
                      <span>Select Time Slot </span>
                    </label>
                    <select
                      value={formData.selectedTimeSlot}
                      onChange={(e) =>
                        handleInputChange("selectedTimeSlot", e.target.value)
                      }
                      className={`w-full px-4 py-3 border ${
                        errors.selectedTimeSlot
                          ? "border-red-500"
                          : formData.selectedTimeSlot
                          ? ""
                          : "border-gray-300"
                      } rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-500 text-gray-800 outline-none`}
                    >
                      <option value="" className="text-gray-500 bg-white">Select a time slot</option>
                      {timeSlots.map((slot, index) => (
                        <option key={index} value={slot} className="bg-white text-gray-800">
                          {slot}
                        </option>
                      ))}
                    </select>
                    {errors.selectedTimeSlot && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.selectedTimeSlot}
                      </p>
                    )}
                  </div>

                  {/* Guest Count - Flex Layout */}
                  <div className="flex  gap-10">
                    {/* Adult Count */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span>Number of Adults</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleInputChange(
                              "adultCount",
                              Math.max(1, formData.adultCount - 1)
                            )
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          <i className="fi fi-rr-minus text-sm text-gray-500"></i>
                        </button>
                        <span className="flex-1 text-center text-lg font-medium text-gray-800">
                          {formData.adultCount}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleInputChange("adultCount", formData.adultCount + 1)
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          <i className="fi fi-rr-plus text-sm text-gray-500"></i>
                        </button>
                      </div>
                    </div>

                    {/* Child Count */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span>Number of Children</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleInputChange(
                              "childCount",
                              Math.max(0, formData.childCount - 1)
                            )
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          <i className="fi fi-rr-minus text-sm text-gray-500"></i>
                        </button>
                        <span className="flex-1 text-center text-lg font-medium text-gray-800">
                          {formData.childCount}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleInputChange("childCount", formData.childCount + 1)
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          <i className="fi fi-rr-plus text-sm text-gray-500"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Buggy Option */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <input
                        type="checkbox"
                        id="buggy"
                        checked={formData.needBuggy}
                        onChange={(e) =>
                          handleInputChange("needBuggy", e.target.checked)
                        }
                        className="mt-1 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 accent-primary-500"
                      />
                      <label htmlFor="buggy" className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="fi fi-rr-car text-primary-500"></i>
                          <span className="text-sm font-semibold text-gray-900">
                            Need Buggy/Transport Service
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          We can arrange transportation to the activity location. Additional charges may apply.
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) =>
                        handleInputChange("specialRequests", e.target.value)
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fi fi-rr-shield-check text-primary-500"></i>
                  Cancellation Policy
                </h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <i className="fi fi-rr-check-circle text-green-500 mt-0.5"></i>
                    <p>
                      <strong>Free Cancellation:</strong> Cancel up to 48 hours before the activity for a full refund
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fi fi-rr-clock text-orange-500 mt-0.5"></i>
                    <p>
                      <strong>24-48 Hours Before:</strong> 50% refund if cancelled within 24-48 hours
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fi fi-rr-cross-circle text-red-500 mt-0.5"></i>
                    <p>
                      <strong>Less than 24 Hours:</strong> No refund for cancellations within 24 hours of activity
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fi fi-rr-time-forward text-blue-500 mt-0.5"></i>
                    <p>
                      <strong>Rescheduling:</strong> You can reschedule your booking once without any charges up to 24 hours before the activity
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <i className="fi fi-rr-info mr-1"></i>
                      <strong>Note:</strong> In case of bad weather or unforeseen circumstances, we reserve the right to cancel the activity. A full refund or rescheduling option will be provided.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      handleInputChange("agreeToTerms", e.target.checked)
                    }
                    className="mt-1 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-primary-500 hover:text-primary-600 font-medium"
                    >
                      terms and conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-primary-500 hover:text-primary-600 font-medium"
                    >
                      cancellation policy
                    </a>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.agreeToTerms}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Booking Summary - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4 tracking-tight">
                Booking Summary
              </h2>

              {/* Activity Info */}
              <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {activityDetails.title}
                </h3>
                {selectedTicket && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
                      <i className="fi fi-rr-ticket mr-1"></i>
                      {selectedTicket.name || selectedTicket.type}
                    </span>
                  </div>
                )}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <i className="fi fi-rr-marker text-primary-500"></i>
                    <span>{activityDetails.location}</span>
                  </div>
                  {formData.selectedDate && (
                    <div className="flex items-center gap-2">
                      <i className="fi fi-rr-calendar text-primary-500"></i>
                      <span>
                        {formData.selectedDate.toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  )}
                  {formData.selectedTimeSlot && (
                    <div className="flex items-center gap-2">
                      <i className="fi fi-rr-clock text-primary-500"></i>
                      <span>{formData.selectedTimeSlot}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <i className="fi fi-rr-users text-primary-500"></i>
                    <span>
                      {formData.adultCount} Adult{formData.adultCount > 1 ? "s" : ""}
                      {formData.childCount > 0 &&
                        `, ${formData.childCount} Child${formData.childCount > 1 ? "ren" : ""}`}
                    </span>
                  </div>
                  {formData.needBuggy && (
                    <div className="flex items-center gap-2">
                      <i className="fi fi-rr-car text-primary-500"></i>
                      <span>Buggy Service Requested</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                    <i className="fi fi-rr-money text-primary-500"></i>
                    <span className="font-semibold text-gray-900">
                      Total: ₹{totalPrice.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Adults × {formData.adultCount}
                  </span>
                  <span className="text-gray-900 font-medium">
                    ₹
                    {(
                      (selectedTicket?.price || activityDetails?.price || 0) *
                      formData.adultCount
                    ).toFixed(0)}
                  </span>
                </div>
                {formData.childCount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Children × {formData.childCount}
                    </span>
                    <span className="text-gray-900 font-medium">
                      ₹
                      {(
                        (selectedTicket?.child_price ||
                          (selectedTicket?.price || activityDetails?.price || 0) *
                            0.7) * formData.childCount
                      ).toFixed(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total Price */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-gray-900">
                  Total Price
                </span>
                <span className="text-2xl font-bold text-primary-500">
                  ₹{totalPrice.toFixed(0)}
                </span>
              </div>

              {/* Submit Button - Desktop */}
              <div className="">
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="w-full rounded-full"
                  isLoading={isLoading}
                  icon={<i className="fi fi-rr-check ml-2"></i>}
                >
                  Confirm Booking
                </Button>
              </div>

              {/* Info Message */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <i className="fi fi-rr-info mr-1"></i>
                  You'll receive a confirmation email after booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingClient;

