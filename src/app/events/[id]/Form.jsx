'use client';

import { useState } from "react";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";

const Form = ({
  eventDetails,
  isMobilePopup = false,
  enquireOnly = false
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async () => {
    try {
      setIsLoading(true);

      if (!isLogin()) {
        const event = new CustomEvent('showLogin');
        window.dispatchEvent(event);
        setIsLoading(false);
        return;
      }

      // Add your booking logic here
      // For now, just show an alert
      alert('Booking functionality will be implemented here');
      
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                <i className="fi fi-rr-clock text-base text-primary-500"></i>
                </div>
                <div>
                <p className="text-gray-500 text-xs">Time</p>
                <p className="text-gray-700 font-medium">{eventDetails.time}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                <i className="fi fi-rr-marker text-base text-primary-500"></i>
                </div>
                <div>
                <p className="text-gray-500 text-xs">Venue</p>
                <p className="text-gray-700 font-medium">{eventDetails.venue}</p>
                </div>
            </div>
            </div>
        </div>

        {/* Price and Booking Card */}
        <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">Starts from</span>
            <span className="text-xl font-semibold text-gray-800">
                {eventDetails.price} <span className="text-sm text-gray-500 font-normal">onwards</span>
            </span>
            </div>
            {eventDetails.offer && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 text-center mb-4">
                <i className="fi fi-rr-badge-percent text-yellow-700 mr-2 text-lg"></i>
                {eventDetails.offer}
            </div>
            )}

            {/* Action buttons */}
            {isMobilePopup ? (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10">
                <Button
                onClick={submitHandler}
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
      </div>
      {/* Add padding at bottom when in popup to account for fixed button */}
      {isMobilePopup && <div className="h-20"></div>}
    </div>
  );
};

export default Form; 