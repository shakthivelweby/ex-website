"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { getEventBookings } from "./service";
import { useQuery } from "@tanstack/react-query";

const EventBookings = () => {
  const router = useRouter();
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // event booking query with pagination
  const {
    data: eventBookingsData,
    isLoading: eventBookingsLoading,
    error: eventBookingsError,
  } = useQuery({
    queryKey: ["eventBookings", currentPage],
    queryFn: () => getEventBookings(currentPage),
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-50 text-green-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "failed":
        return "bg-red-50 text-red-700";
      case "approved":
        return "bg-green-50 text-green-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "razorpay":
        return "fi fi-rr-credit-card";
      default:
        return "fi fi-rr-money-bill";
    }
  };

  const togglePaymentHistory = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedBooking(null); // Reset expanded booking when changing pages
  };

  if (eventBookingsLoading) {
    return (
      <div className="min-h-[400px] bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Extract pagination data and bookings from the API structure
  const paginationData = eventBookingsData?.data || {};
  const eventBookings = paginationData.data || [];
  const currentPageData = paginationData.current_page || 1;
  const lastPage = paginationData.last_page || 1;
  const total = paginationData.total || 0;
  const perPage = paginationData.per_page || 10;

  return (
    <div className="p-6">
      {eventBookingsError ? (
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-red-100">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <i className="fi fi-rr-exclamation text-xl text-red-500"></i>
          </div>
          <p className="text-red-600 font-medium">
            {eventBookingsError.message || "Failed to load event bookings"}
          </p>
        </div>
      ) : eventBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <i className="fi fi-rr-calendar text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No event bookings yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start your adventure today by exploring our exciting events
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/events")}
            className="!rounded-full !px-6 !py-2.5 !text-sm !font-medium"
          >
            <i className="fi fi-rr-search mr-2"></i>
            Explore Events
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {eventBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Event Info */}
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <h3 className="text-base font-semibold text-gray-900">
                        {booking.event?.name || "Event Name"}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                          <i className="fi fi-rr-calendar text-blue-500"></i>
                          {booking.event?.starting_date
                            ? formatDate(booking.event.starting_date)
                            : formatDate(booking.created_at)}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                          <i className="fi fi-rr-clock text-blue-500"></i>
                          {booking.event?.duration || "Duration not specified"}
                        </span>
                        {booking.event?.location && (
                          <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1.5">
                            <i className="fi fi-rr-marker"></i>
                            {booking.event.location}
                          </span>
                        )}
                        {booking.event?.layout && (
                          <span className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-600 flex items-center gap-1.5">
                            <i className="fi fi-rr-layout"></i>
                            {booking.event.layout}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      Booked on {formatDate(booking.created_at)}
                    </p>
                  </div>

                  {/* Price Info */}
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(
                          booking.total_amount || booking.amount || 0
                        )}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {booking.payment_status || "Paid"}
                      </span>
                    </div>

                    {booking.discount_amount &&
                      parseFloat(booking.discount_amount) > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                          Saved {formatCurrency(booking.discount_amount)}
                        </span>
                      )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePaymentHistory(booking.id)}
                    className="!rounded-full !text-xs !px-4 !py-2"
                  >
                    <i
                      className={`fi fi-rr-${
                        expandedBooking === booking.id
                          ? "angle-up"
                          : "angle-down"
                      } mr-1.5`}
                    ></i>
                    {expandedBooking === booking.id ? "Hide" : "View"} Details
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/events/${booking.event_id}`)}
                    className="!rounded-full !text-xs !px-4 !py-2"
                  >
                    <i className="fi fi-rr-eye mr-1.5"></i>
                    View Event
                  </Button>
                </div>

                {/* Event Details */}
                {expandedBooking === booking.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-medium text-gray-900 mb-3">
                      Event Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <i className="fi fi-rr-calendar text-gray-400"></i>
                          <span className="text-sm text-gray-600">
                            {booking.event?.starting_date &&
                              booking.event?.ending_date &&
                              `${booking.event.starting_date} - ${booking.event.ending_date}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fi fi-rr-clock text-gray-400"></i>
                          <span className="text-sm text-gray-600">
                            {booking.event?.duration ||
                              "Duration not specified"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <i className="fi fi-rr-map-pin text-gray-400"></i>
                          <span className="text-sm text-gray-600">
                            {booking.event?.address ||
                              booking.event?.location ||
                              "Location not specified"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fi fi-rr-users text-gray-400"></i>
                          <span className="text-sm text-gray-600">
                            Age Limit:{" "}
                            {booking.event?.age_limit || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment History */}
                    {booking.event_payment &&
                      booking.event_payment.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-xs font-medium text-gray-900 mb-3">
                            Payment History
                          </h4>
                          <div className="space-y-3">
                            {booking.event_payment.map((payment) => (
                              <div
                                key={payment.id}
                                className={`flex flex-col md:flex-row md:items-center justify-between rounded-xl p-3 gap-3 ${
                                  payment.status === "failed"
                                    ? "bg-red-50/50 border border-red-100"
                                    : "bg-gray-50/50 border border-gray-100"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                      payment.status === "failed"
                                        ? "bg-red-100"
                                        : "bg-white"
                                    }`}
                                  >
                                    <i
                                      className={`${getPaymentMethodIcon(
                                        payment.payment_method
                                      )} text-base ${
                                        payment.status === "failed"
                                          ? "text-red-500"
                                          : "text-gray-500"
                                      }`}
                                    ></i>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-sm font-medium ${
                                          payment.status === "failed"
                                            ? "text-red-700"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {formatCurrency(payment.amount)}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-1 rounded-full ${
                                          payment.payment_method === "razorpay"
                                            ? "bg-blue-50 text-blue-600"
                                            : "bg-purple-50 text-purple-600"
                                        }`}
                                      >
                                        {payment.payment_method}
                                      </span>
                                    </div>
                                    <span
                                      className={`text-xs ${
                                        payment.status === "failed"
                                          ? "text-red-600"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {payment.created_at}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                    payment.status
                                  )}`}
                                >
                                  {payment.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPageData - 1) * perPage + 1} to{" "}
                {Math.min(currentPageData * perPage, total)} of {total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPageData - 1)}
                  disabled={currentPageData <= 1}
                  className="!px-3 !py-2"
                >
                  <i className="fi fi-rr-angle-left mr-1"></i>
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: lastPage }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          page === currentPageData
                            ? "bg-blue-600 text-white"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPageData + 1)}
                  disabled={currentPageData >= lastPage}
                  className="!px-3 !py-2"
                >
                  Next
                  <i className="fi fi-rr-angle-right ml-1"></i>
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventBookings;
