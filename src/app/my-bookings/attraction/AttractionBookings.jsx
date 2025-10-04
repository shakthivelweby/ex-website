"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { getAttractionBookings } from "./service";
import { useQuery } from "@tanstack/react-query";

const AttractionBookings = () => {
  const router = useRouter();
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // attraction booking query with pagination
  const {
    data: attractionBookingsData,
    isLoading: attractionBookingsLoading,
    error: attractionBookingsError,
  } = useQuery({
    queryKey: ["attractionBookings", currentPage],
    queryFn: () => getAttractionBookings(currentPage),
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
      case "confirmed":
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

  if (attractionBookingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (attractionBookingsError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <i className="fi fi-rr-exclamation-triangle text-4xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Bookings
        </h3>
        <p className="text-gray-600 mb-4">
          {attractionBookingsError.response?.data?.message ||
            "Something went wrong while loading your attraction bookings."}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Handle different API response structures
  let attractionBookings = [];
  let pagination = {};

  if (attractionBookingsData) {
    // Check if data is directly an array
    if (Array.isArray(attractionBookingsData)) {
      attractionBookings = attractionBookingsData;
    }
    // Check if data is in a nested structure (Laravel pagination format)
    else if (attractionBookingsData.data) {
      if (Array.isArray(attractionBookingsData.data)) {
        attractionBookings = attractionBookingsData.data;
        pagination =
          attractionBookingsData.pagination ||
          attractionBookingsData.meta ||
          {};
      } else if (
        attractionBookingsData.data.data &&
        Array.isArray(attractionBookingsData.data.data)
      ) {
        // Laravel pagination format: { data: { data: [...], current_page: 1, ... } }
        attractionBookings = attractionBookingsData.data.data;
        pagination = {
          current_page: attractionBookingsData.data.current_page || 1,
          last_page: attractionBookingsData.data.last_page || 1,
          total: attractionBookingsData.data.total || 0,
          per_page: attractionBookingsData.data.per_page || 10,
        };
      } else {
        // If data is not an array, try to extract bookings from nested structure
        attractionBookings =
          attractionBookingsData.data.bookings ||
          attractionBookingsData.data.attraction_bookings ||
          [];
        pagination =
          attractionBookingsData.pagination ||
          attractionBookingsData.meta ||
          {};
      }
    }
    // Check if bookings are at root level
    else if (attractionBookingsData.bookings) {
      attractionBookings = attractionBookingsData.bookings;
      pagination =
        attractionBookingsData.pagination || attractionBookingsData.meta || {};
    }
    // Check if attraction_bookings exists
    else if (attractionBookingsData.attraction_bookings) {
      attractionBookings = attractionBookingsData.attraction_bookings;
      pagination =
        attractionBookingsData.pagination || attractionBookingsData.meta || {};
    }
  }

  const currentPageData = pagination.current_page || 1;
  const lastPage = pagination.last_page || 1;
  const total = pagination.total || 0;

  // Ensure attractionBookings is always an array
  if (!Array.isArray(attractionBookings)) {
    attractionBookings = [];
  }

  if (attractionBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <i className="fi fi-rr-ticket text-6xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Attraction Bookings Yet
        </h3>
        <p className="text-gray-600 mb-6">
          You haven't booked any attractions yet. Explore our amazing
          attractions and book your next adventure!
        </p>
        <Button
          onClick={() => router.push("/attractions")}
          variant="primary"
          size="md"
        >
          <i className="fi fi-rr-ticket mr-2"></i>
          Explore Attractions
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {attractionBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Attraction Info */}
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    {booking.attraction?.name || "Attraction Name"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                      <i className="fi fi-rr-calendar text-blue-500"></i>
                      {booking.visit_date
                        ? formatDate(booking.visit_date)
                        : formatDate(booking.created_at)}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                      <i className="fi fi-rr-users text-blue-500"></i>
                      {booking.total_count ||
                        parseInt(booking.adult_count || 0) +
                          parseInt(booking.child_count || 0)}{" "}
                      Visitors
                    </span>
                    {booking.attraction?.location && (
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1.5">
                        <i className="fi fi-rr-marker"></i>
                        {booking.attraction.location}
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
                    {formatCurrency(booking.total_amount || 0)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status || "Confirmed"}
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
                onClick={() => togglePaymentHistory(booking.id)}
                variant="outline"
                size="sm"
                className="!px-3 !py-2 flex items-center justify-center"
              >
                <i className="fi fi-rr-document-text mr-1.5"></i>
                {expandedBooking === booking.id ? "Hide" : "View"} Details
              </Button>

              <Button
                onClick={() =>
                  router.push(`/attractions/${booking.attraction_id}`)
                }
                variant="outline"
                size="sm"
                className="!px-3 !py-2 flex items-center justify-center"
              >
                <i className="fi fi-rr-eye mr-1.5"></i>
                View Attraction
              </Button>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <i
                  className={`${getPaymentMethodIcon(booking.payment_method)}`}
                ></i>
                <span>{booking.payment_method || "Razorpay"}</span>
              </div>
            </div>

            {/* Expanded Booking Details */}
            {expandedBooking === booking.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Booking Details
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Booking ID:</span>
                        <span className="font-medium">#{booking.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Visit Date:</span>
                        <span className="font-medium">
                          {booking.visit_date
                            ? formatDate(booking.visit_date)
                            : "Not specified"}
                        </span>
                      </div>
                      {/* Ticket Type Breakdown */}
                      {booking.booking_tickets &&
                      booking.booking_tickets.length > 0 ? (
                        <>
                          <div className="mb-3">
                            <span className="text-sm font-semibold text-gray-800">
                              📋 Ticket Breakdown:
                            </span>
                          </div>
                          {booking.booking_tickets.map((ticket, index) => {
                            console.log(`Ticket ${index + 1}:`, {
                              ticket_type_name: ticket.ticket_type_name,
                              adult_quantity: ticket.adult_quantity,
                              child_quantity: ticket.child_quantity,
                              adult_price: ticket.adult_price,
                              child_price: ticket.child_price,
                              total_price: ticket.total_price,
                              full_ticket_data: ticket,
                            });

                            return (
                              <div
                                key={index}
                                className="mb-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-blue-600">
                                    {ticket.ticket_type_name ||
                                      ticket.name ||
                                      `Ticket Type ${index + 1}`}
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {parseInt(ticket.adult_quantity || 0)}{" "}
                                    Adult(s) +{" "}
                                    {parseInt(ticket.child_quantity || 0)}{" "}
                                    Child(ren)
                                  </span>
                                </div>
                                {(ticket.adult_price > 0 ||
                                  ticket.child_price > 0) && (
                                  <div className="flex justify-between mt-2 text-xs">
                                    <span className="text-gray-600">Rate:</span>
                                    <span className="text-gray-700">
                                      Adult: ₹
                                      {parseFloat(
                                        ticket.adult_price || 0
                                      ).toFixed(2)}{" "}
                                      | Child: ₹
                                      {parseFloat(
                                        ticket.child_price || 0
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="font-semibold">
                              Total Visitors:
                            </span>
                            <span className="font-semibold">
                              {booking.total_count ||
                                parseInt(booking.adult_count || 0) +
                                  parseInt(booking.child_count || 0)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Adults:</span>
                            <span className="font-medium">
                              {booking.adult_count || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Children:</span>
                            <span className="font-medium">
                              {booking.child_count || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Visitors:</span>
                            <span className="font-medium">
                              {booking.total_count ||
                                parseInt(booking.adult_count || 0) +
                                  parseInt(booking.child_count || 0)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Payment Details
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium">
                          {formatCurrency(booking.total_amount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Paid Amount:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            booking.total_paid || booking.total_amount || 0
                          )}
                        </span>
                      </div>
                      {booking.balance && parseFloat(booking.balance) > 0 && (
                        <div className="flex justify-between">
                          <span>Balance:</span>
                          <span className="font-medium text-orange-600">
                            {formatCurrency(booking.balance)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="font-medium">
                          {booking.payment_method || "Razorpay"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status || "Confirmed"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {booking.attraction && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Attraction Information
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-medium">
                          {booking.attraction.name}
                        </span>
                      </div>
                      {booking.attraction.location && (
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="font-medium">
                            {booking.attraction.location}
                          </span>
                        </div>
                      )}
                      {booking.attraction.address && (
                        <div className="flex justify-between">
                          <span>Address:</span>
                          <span className="font-medium">
                            {booking.attraction.address}
                          </span>
                        </div>
                      )}
                      {booking.attraction.start_time &&
                        booking.attraction.end_time && (
                          <div className="flex justify-between">
                            <span>Timings:</span>
                            <span className="font-medium">
                              {booking.attraction.start_time} -{" "}
                              {booking.attraction.end_time}
                            </span>
                          </div>
                        )}
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
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {(currentPageData - 1) * (pagination.per_page || 10) + 1} to{" "}
            {Math.min(currentPageData * (pagination.per_page || 10), total)} of{" "}
            {total} bookings
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
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
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
              ))}
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
  );
};

export default AttractionBookings;
