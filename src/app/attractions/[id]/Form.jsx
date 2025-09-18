"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";

const Form = ({
  attractionDetails,
  isMobilePopup = false,
  enquireOnly = false,
  selectedTickets: propSelectedTickets,
  totalPrice: propTotalPrice,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState(
    propSelectedTickets || {}
  );
  const [totalPrice, setTotalPrice] = useState(propTotalPrice || 0);
  const [selectedDate, setSelectedDate] = useState("");

  // Update local state when props change
  useEffect(() => {
    if (propSelectedTickets) {
      setSelectedTickets(propSelectedTickets);
    }
    if (propTotalPrice) {
      setTotalPrice(propTotalPrice);
    }
  }, [propSelectedTickets, propTotalPrice]);

  const handleTicketSelection = () => {
    if (!isLogin()) {
      const event = new CustomEvent("showLogin");
      window.dispatchEvent(event);
      return;
    }
    // Redirect to booking page
    router.push(`/attractions/${attractionDetails.id}/booking`);
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

      if (Object.keys(selectedTickets).length === 0) {
        alert("Please select tickets first");
        setIsLoading(false);
        return;
      }

      if (!selectedDate) {
        alert("Please select a date");
        setIsLoading(false);
        return;
      }

      // Add your booking logic here
      console.log("Selected tickets:", selectedTickets);
      console.log("Selected date:", selectedDate);
      console.log("Total price:", totalPrice);
      alert("Booking functionality will be implemented here");
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
    // Use map link if available, otherwise open Google Maps with the venue location
    if (attractionDetails.mapLink) {
      window.open(attractionDetails.mapLink, "_blank");
    } else {
      const address = encodeURIComponent(
        attractionDetails.address || attractionDetails.location
      );
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${address}`,
        "_blank"
      );
    }
  };

  const getSelectedTicketsCount = () => {
    return Object.values(selectedTickets).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className={`${isMobilePopup ? "pb-24" : ""} hidden lg:block`}>
      <div className="!bg-[#f7f7f7] rounded-xl p-3 shadow-sm">
        {/* Title and Categories */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <h1 className="text-xl font-medium text-gray-800 tracking-tight mb-3">
            {attractionDetails.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {attractionDetails.categories.map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#f7f7f7] text-gray-700"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Attraction Info Card */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                <i className="fi fi-rr-clock text-base text-primary-500"></i>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Opening & Closing Time</p>
                <p className="text-gray-700 font-medium">
                  {attractionDetails.openingTime} - {attractionDetails.closingTime}
                </p>
              </div>
            </div>
          </div>
          {/* Date Selection */}
         <div className="mt-4">
          <h2 className="text-base font-medium text-gray-800 mb-3">Select Date</h2>
          <div className="relative">
            <input
              type="date"
              name="visitDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-gray-700 appearance-none"
              required
            />
            {/* <i className="fi fi-rr-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i> */}
          </div>
        </div>
        </div>

        

        {/* Venue Section */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <h2 className="text-base font-medium text-gray-800 mb-2">Location</h2>
          <div className="flex flex-col">
            <p className="text-sm text-gray-600 mb-3">
              {attractionDetails.address}
            </p>
            <button
              onClick={handleGetDirections}
              className="flex items-center gap-2 text-primary-500 text-sm font-medium"
            >
              <i className="fi fi-rr-map-marker text-base"></i>
              Get Directions
            </button>
          </div>
        </div>

        {/* Price and Booking Card */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">Entry fee</span>
            <span className="text-xl lg:text-2xl font-semibold text-gray-800">
              {attractionDetails.price}
            </span>
          </div>

          {/* Selected Tickets Summary */}
          {getSelectedTicketsCount() > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-ticket text-green-600"></i>
                  <span className="text-sm font-medium text-green-800">
                    {getSelectedTicketsCount()} ticket
                    {getSelectedTicketsCount() !== 1 ? "s" : ""} selected
                  </span>
                </div>
                <span className="text-sm font-semibold text-green-800">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Selected Date Summary */}
          {selectedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-calendar text-blue-600"></i>
                <span className="text-sm font-medium text-blue-800">
                  Visit Date: {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {isMobilePopup ? (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10">
              {getSelectedTicketsCount() === 0 ? (
                <Button
                  onClick={handleTicketSelection}
                  size="lg"
                  className="w-full rounded-full"
                  icon={<i className="fi fi-rr-ticket ml-2"></i>}
                >
                  Select Tickets
                </Button>
              ) : (
                <Button
                  onClick={submitHandler}
                  size="lg"
                  className="w-full rounded-full"
                  isLoading={isLoading}
                  icon={<i className="fi fi-rr-arrow-right ml-2"></i>}
                >
                  {enquireOnly ? "Send Enquiry" : "Book Now"}
                </Button>
              )}
            </div>
          ) : (
            <>
              {getSelectedTicketsCount() === 0 ? (
                <Button
                  onClick={handleTicketSelection}
                  size="lg"
                  className="w-full rounded-full"
                  icon={<i className="fi fi-rr-ticket ml-2"></i>}
                >
                  Select Tickets
                </Button>
              ) : (
                <Button
                  onClick={submitHandler}
                  size="lg"
                  className="w-full rounded-full"
                  isLoading={isLoading}
                  icon={<i className="fi fi-rr-arrow-right ml-2"></i>}
                >
                  {enquireOnly ? "Send Enquiry" : "Book Now"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add padding at bottom when in popup to account for fixed button */}
      {isMobilePopup && <div className="h-20"></div>}
    </div>
  );
};

export default Form;
