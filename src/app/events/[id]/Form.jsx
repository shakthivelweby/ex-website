"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";

const Form = ({
  eventDetails,
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
    // Redirect to booking page instead of opening popup
    router.push(`/events/${eventDetails.id}/booking`);
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

      // Add your booking logic here
      console.log("Selected tickets:", selectedTickets);
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
    if (eventDetails.mapLink) {
      window.open(eventDetails.mapLink, "_blank");
    } else {
      const address = encodeURIComponent(
        eventDetails.venueAddress || eventDetails.venue
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

  return (
    <div className={`${isMobilePopup ? "pb-24" : ""}`}>
      <div className="!bg-[#f7f7f7] rounded-xl p-3 shadow-sm">
        {/* Title and Categories */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <h1 className="text-xl font-medium text-gray-800 tracking-tight mb-3">
            {eventDetails.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {eventDetails.categories.map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#f7f7f7] text-gray-700"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Event Info Card */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                <i className="fi fi-rr-calendar text-base text-primary-500"></i>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Date</p>
                <p className="text-gray-700 font-medium">{eventDetails.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                <i className="fi fi-rr-clock text-base text-primary-500"></i>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Time</p>
                <p className="text-gray-700 font-medium">{eventDetails.time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Venue Section */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <h2 className="text-base font-medium text-gray-800 mb-2">Venue</h2>
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-gray-800 mb-1">
              {eventDetails.venue}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {eventDetails.venueAddress}
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
            <span className="text-gray-500 text-sm">Starts from</span>
            <span className="text-xl lg:text-2xl font-semibold text-gray-800">
              {eventDetails.price}{" "}
              <span className="text-sm text-gray-500 font-normal">onwards</span>
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
