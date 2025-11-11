"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Form = ({
  activityDetails,
  isMobilePopup = false,
  enquireOnly = false,
  selectedTicket = null,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [errors, setErrors] = useState({});

  // Dummy time slots
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

  // Calculate total price based on selected ticket and counts
  const calculateTotalPrice = () => {
    if (!selectedTicket) {
      return activityDetails.price || "Price TBA";
    }
    
    const ticketPrice = selectedTicket.price || selectedTicket.adult_price || 0;
    const adultPrice = ticketPrice * adultCount;
    const childPrice = selectedTicket.child_price 
      ? selectedTicket.child_price * childCount 
      : (ticketPrice * 0.7) * childCount; // 30% discount for children if not specified
    
    const total = adultPrice + childPrice;
    return total > 0 ? `₹${total.toFixed(0)}` : activityDetails.price || "Price TBA";
  };

  const displayPrice = selectedTicket 
    ? calculateTotalPrice()
    : activityDetails.price || "Price TBA";

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedDate) {
      newErrors.date = "Please select a date";
    }
    
    if (!selectedTimeSlot) {
      newErrors.timeSlot = "Please select a time slot";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = () => {
    if (!isLogin()) {
      const event = new CustomEvent("showLogin");
      window.dispatchEvent(event);
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Store booking data in sessionStorage
    const bookingData = {
      selectedDate,
      selectedTimeSlot,
      adultCount,
      childCount,
      selectedTicket,
      activityDetails: {
        id: activityDetails.id,
        title: activityDetails.title,
        location: activityDetails.location,
        price: activityDetails.price,
        duration: activityDetails.activityGuide.duration,
      },
    };
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    // Redirect to booking page
    router.push(`/activities/${activityDetails.id}/booking`);
  };

  const submitHandler = async () => {
    try {
      setIsLoading(true);

      if (!isLogin()) {
        const event = new CustomEvent("showLogin");
        window.dispatchEvent(event);
        setIsLoading(false);
        return;
      }

      // Validate form
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      // Redirect to booking page
      router.push(`/activities/${activityDetails.id}/booking`);
    } catch (error) {
      console.error("Error:", error);
      alert(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDirections = () => {
    // Use map link if available, otherwise open Google Maps with the location
    if (activityDetails.mapLink) {
      window.open(activityDetails.mapLink, "_blank");
    } else if (activityDetails.latitude && activityDetails.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${activityDetails.latitude},${activityDetails.longitude}`,
        "_blank"
      );
    } else {
      const address = encodeURIComponent(
        activityDetails.address || activityDetails.location
      );
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${address}`,
        "_blank"
      );
    }
  };

  return (
    <div className={`${isMobilePopup ? "pb-24" : ""}`}>
      <div className="!bg-[#f7f7f7] rounded-xl p-3 shadow-sm">
        {/* Title and Categories */}
        <div className="hidden bg-white rounded-xl p-4 mb-4">
          <h1 className="text-xl font-medium text-gray-800 tracking-tight mb-3">
            {activityDetails.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {activityDetails.categories.map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#f7f7f7] text-gray-700"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

      
      

        {/* Location Section */}
        {(activityDetails.location || activityDetails.address) && (
          <div className="hidden bg-white rounded-xl p-4 mb-4">
            <h2 className="text-base font-medium text-gray-800 mb-2">Location</h2>
            <div className="flex flex-col">
              {activityDetails.location && (
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  {activityDetails.location}
                </h3>
              )}
              {activityDetails.address && (
                <p className="text-sm text-gray-600 mb-3">
                  {activityDetails.address}
                </p>
              )}
              <button
                onClick={handleGetDirections}
                className="flex items-center gap-2 text-primary-500 text-sm font-medium"
              >
                <i className="fi fi-rr-map-marker text-base"></i>
                Get Directions
              </button>
            </div>
          </div>
        )}
        {/* Booking Form Card */}
        <div className="bg-white rounded-xl p-4">
          {/* Price Display */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <span className="text-gray-700 text-sm font-medium">Starting from</span>
            <span className="text-xl lg:text-2xl font-semibold text-gray-800">
              {displayPrice} <span className="text-sm text-gray-500 font-normal">per person</span>
            </span>
          </div>

          {/* Date Picker */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date 
            </label>
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  if (errors.date) {
                    setErrors({ ...errors, date: null });
                  }
                }}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                placeholderText="Choose a date"
                className={`w-full px-4 py-3 pl-12 text-gray-800 border cursor-pointer ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-500 outline-none`}
                required
              />
              <i className="fi fi-rr-calendar absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none"></i>
            </div>
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Time Slot Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time Slot 
            </label>
            <select
              value={selectedTimeSlot}
              onChange={(e) => {
                setSelectedTimeSlot(e.target.value);
                if (errors.timeSlot) {
                  setErrors({ ...errors, timeSlot: null });
                }
              }}
              className={`w-full px-4 py-3 text-gray-800 bg-transparent border ${errors.timeSlot ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-500 outline-none`}
              required
            >
              <option value="" className="text-gray-500 bg-white">Select a time slot</option>
              {timeSlots.map((slot, index) => (
                <option key={index} value={slot} className="text-gray-500 bg-white">
                  {slot}
                </option>
              ))}
            </select>
            {errors.timeSlot && (
              <p className="text-red-500 text-xs mt-1">{errors.timeSlot}</p>
            )}
          </div>

          {/* Adult Count */}
          <div className="mb-4">
            <div className="block text-sm font-medium text-gray-700 mb-2">
               <div className="flex items-center justify-between">
                  <div>Adults</div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 focus:bg-primary-50 group"
                    >
                      <i className="fi fi-rr-minus text-sm text-gray-500 group-focus:text-primary-700"></i>
                    </button>
                    <span className="flex-1 text-center text-lg font-medium text-gray-800">
                      {adultCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdultCount(adultCount + 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 focus:bg-primary-50 group"
                    >
                      <i className="fi fi-rr-plus text-sm text-gray-500 group-focus:text-primary-700"></i>
                    </button>
                  </div>
               </div>
            </div>
           
          </div>

          {/* Child Count */}
          <div className="mb-4">
            <div className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center justify-between">
                <div>Children</div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildCount(Math.max(0, childCount - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 focus:bg-primary-50 group"
                  >
                    <i className="fi fi-rr-minus text-sm text-gray-500 group-focus:text-primary-700"></i>
                  </button>
                  <span className="flex-1 text-center text-lg font-medium text-gray-800">
                    {childCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setChildCount(childCount + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:ring-0 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 focus:bg-primary-50 group"
                  >
                    <i className="fi fi-rr-plus text-sm text-gray-500 group-focus:text-primary-700"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {isMobilePopup ? (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10">
              <Button
                onClick={handleBooking}
                size="lg"
                className="w-full rounded-full"
                isLoading={isLoading}
                icon={<i className="fi fi-rr-arrow-right ml-2"></i>}
              >
                {enquireOnly ? "Send Enquiry" : "Book Now"}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleBooking}
              size="lg"
              className="w-full rounded-full"
              isLoading={isLoading}
              icon={<i className="fi fi-rr-arrow-right ml-2"></i>}
            >
              {enquireOnly ? "Send Enquiry" : "Book Now"}
            </Button>
          )}
        </div>
      </div>

      {/* Add padding at bottom when in popup to account for fixed button */}
      {isMobilePopup && <div className="h-20"></div>}
    </div>
  );
};

export default Form;

