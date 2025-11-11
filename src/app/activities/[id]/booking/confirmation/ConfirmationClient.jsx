"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

const ConfirmationClient = ({ activityId }) => {
  const router = useRouter();
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    // Get booking confirmation from sessionStorage
    const confirmation = sessionStorage.getItem("bookingConfirmation");
    if (confirmation) {
      setBookingData(JSON.parse(confirmation));
    } else {
      // If no booking data, redirect to activity page
      router.push(`/activities/${activityId}`);
    }
  }, [activityId, router]);

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <i className="fi fi-rr-check text-4xl text-green-500"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your booking has been successfully confirmed
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Booking ID Header */}
          <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="text-xl font-semibold text-gray-900">
                  {bookingData.bookingId}
                </p>
              </div>
              <div className="px-4 py-2 bg-green-100 rounded-full">
                <span className="text-sm font-medium text-green-800">
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="p-6 space-y-6">
            {/* Activity Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Activity Details
              </h3>
              <div className="space-y-2">
                {bookingData.selectedTicket && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ticket Type</span>
                    <span className="text-gray-900 font-medium">
                      {bookingData.selectedTicket.name || bookingData.selectedTicket.type}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="text-gray-900 font-medium">
                    {bookingData.selectedDate
                      ? new Date(bookingData.selectedDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time Slot</span>
                  <span className="text-gray-900 font-medium">
                    {bookingData.selectedTimeSlot}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Adults</span>
                  <span className="text-gray-900 font-medium">
                    {bookingData.adultCount}
                  </span>
                </div>
                {bookingData.childCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Children</span>
                    <span className="text-gray-900 font-medium">
                      {bookingData.childCount}
                    </span>
                  </div>
                )}
                {bookingData.needBuggy && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Transport Service</span>
                    <span className="text-gray-900 font-medium flex items-center gap-1">
                      <i className="fi fi-rr-car text-primary-500"></i>
                      Buggy Requested
                    </span>
                  </div>
                )}
              </div>
            </div>

            {bookingData.specialRequests && (
              <>
                <div className="border-t border-gray-200"></div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Special Requests
                  </h3>
                  <p className="text-gray-700">{bookingData.specialRequests}</p>
                </div>
              </>
            )}

            <div className="border-t border-gray-200"></div>

            {/* Payment Summary */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-primary-500">
                    ₹{bookingData.totalPrice.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <i className="fi fi-rr-info-circle"></i>
            Important Information
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <i className="fi fi-rr-check-circle mt-0.5"></i>
              <span>Your booking has been confirmed and saved</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fi fi-rr-check-circle mt-0.5"></i>
              <span>Please arrive 15 minutes before your scheduled time</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fi fi-rr-check-circle mt-0.5"></i>
              <span>Bring a valid ID proof for verification</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fi fi-rr-check-circle mt-0.5"></i>
              <span>
                For any queries, contact us at support@example.com or call +91
                1234567890
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push("/")}
            size="lg"
            className="flex-1 rounded-full"
            icon={<i className="fi fi-rr-home mr-2"></i>}
          >
            Back to Home
          </Button>
          <Button
            onClick={() => router.push(`/activities/${activityId}`)}
            size="lg"
            variant="outline"
            className="flex-1 rounded-full"
            icon={<i className="fi fi-rr-eye mr-2"></i>}
          >
            View Activity
          </Button>
        </div>

        {/* Download/Print Section */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium"
          >
            <i className="fi fi-rr-print"></i>
            <span>Print Confirmation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationClient;

