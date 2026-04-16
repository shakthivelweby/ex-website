"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/common/Button";
import { getActivityBookings } from "./service";

const ActivityBookings = () => {
  const router = useRouter();
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: activityBookingsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["activityBookings", currentPage],
    queryFn: () => getActivityBookings(currentPage),
  });

  const paginationData = activityBookingsData?.data || {};
  const bookings = paginationData.data || [];
  const currentPageData = paginationData.current_page || 1;
  const lastPage = paginationData.last_page || 1;
  const total = paginationData.total || 0;
  const perPage = paginationData.per_page || 10;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString()}`;

  const getStatusColor = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "confirmed":
      case "completed":
        return "bg-green-50 text-green-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "failed":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const toggleDetails = (id) => {
    setExpandedBooking(expandedBooking === id ? null : id);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedBooking(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-red-100">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <i className="fi fi-rr-exclamation text-xl text-red-500"></i>
          </div>
          <p className="text-red-600 font-medium">
            {error.message || "Failed to load activity bookings"}
          </p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <i className="fi fi-rr-ticket text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No activity bookings yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Explore activities and book your next experience.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/activities")}
            className="!rounded-full !px-6 !py-2.5 !text-sm !font-medium"
          >
            <i className="fi fi-rr-search mr-2"></i>
            Explore Activities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {bookings.map((booking) => {
          const ticketRows =
            booking.activity_booking_tickets ||
            booking.activityBookingTickets ||
            [];
          const ticketCount = Array.isArray(ticketRows)
            ? ticketRows.reduce((sum, t) => sum + Number(t.quantity || 0), 0)
            : Number(booking.total_count || 0);

          return (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      {booking.activity?.name || "Activity"}
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
                        {ticketCount} Tickets
                      </span>
                      {booking.activity?.location && (
                        <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1.5">
                          <i className="fi fi-rr-marker"></i>
                          {booking.activity.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Booked on {formatDate(booking.created_at)}
                  </p>
                  {booking.booking_reference && (
                    <p className="text-xs text-gray-500 mt-1">
                      Ref: <span className="font-semibold text-gray-700">{booking.booking_reference}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(booking.total_amount || 0)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                        booking.booking_status || booking.payment_status
                      )}`}
                    >
                      {booking.booking_status || "Confirmed"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDetails(booking.id)}
                  className="!rounded-full !text-xs !px-4 !py-2"
                >
                  <i
                    className={`fi fi-rr-${
                      expandedBooking === booking.id ? "angle-up" : "angle-down"
                    } mr-1.5`}
                  ></i>
                  {expandedBooking === booking.id ? "Hide" : "View"} Details
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/activities/${booking.activity_id}`)}
                  className="!rounded-full !text-xs !px-4 !py-2"
                >
                  <i className="fi fi-rr-eye mr-1.5"></i>
                  View Activity
                </Button>
              </div>

              {expandedBooking === booking.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-900 mb-3">
                        Booking Details
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Booking ID:</span>
                          <span className="font-medium">#{booking.id}</span>
                        </div>
                      {booking.booking_reference && (
                        <div className="flex justify-between">
                          <span>Reference:</span>
                          <span className="font-medium">{booking.booking_reference}</span>
                        </div>
                      )}
                        <div className="flex justify-between">
                          <span>Visit Date:</span>
                          <span className="font-medium">
                            {booking.visit_date ? formatDate(booking.visit_date) : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tickets:</span>
                          <span className="font-medium">{ticketCount}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-gray-900 mb-3">
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
                          <span>Payment Status:</span>
                          <span className="font-medium">
                            {booking.payment_status || "paid"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {Array.isArray(ticketRows) && ticketRows.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-medium text-gray-900 mb-3">
                        Ticket Breakdown
                      </h4>
                      <div className="space-y-2">
                        {ticketRows.map((t, idx) => (
                          <div
                            key={t.id || idx}
                            className="flex items-center justify-between text-sm bg-gray-50 border border-gray-100 rounded-xl p-3"
                          >
                            <span className="text-gray-700 font-medium">
                              {t.activity_ticket_type?.name ||
                                t.activityTicketType?.name ||
                                "Ticket"}
                            </span>
                            <span className="text-gray-700">
                              Qty: {t.quantity} • {formatCurrency(t.total_price || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

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
    </div>
  );
};

export default ActivityBookings;

