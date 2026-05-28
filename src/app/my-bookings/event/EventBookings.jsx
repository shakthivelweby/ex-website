"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { getEventBookings } from "./service";
import { useQuery } from "@tanstack/react-query";
import {
  BookingsLoading,
  BookingsError,
  BookingsEmpty,
  BookingsPagination,
  BookingsList,
  bookingCardClass,
  BookingCardImage,
  resolveBookingImage,
} from "@/components/my-bookings/BookingsUI";

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
    return `₹${parseFloat(amount || 0).toLocaleString()}`;
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
    return <BookingsLoading />;
  }

  // Extract pagination data and bookings from the API structure
  const paginationData = eventBookingsData?.data || {};
  const eventBookings = paginationData.data || [];
  const currentPageData = paginationData.current_page || 1;
  const lastPage = paginationData.last_page || 1;
  const total = paginationData.total || 0;
  const perPage = paginationData.per_page || 10;

  return (
    <>
      {eventBookingsError ? (
        <BookingsError
          message={eventBookingsError.message || "Failed to load event bookings"}
        />
      ) : eventBookings.length === 0 ? (
        <BookingsEmpty
          icon="fi fi-rr-calendar-star"
          title="No event bookings yet"
          description="Start your adventure today by exploring our exciting events."
          actionLabel="Explore Events"
          onAction={() => router.push("/events")}
        />
      ) : (
        <>
          <BookingsList>
            {eventBookings.map((booking) => (
              <div
                key={booking.id}
                className={bookingCardClass}
              >
                <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
                  <BookingCardImage
                    src={resolveBookingImage(booking, "event")}
                    alt={booking.event?.name || "Event"}
                    fallbackIcon="fi fi-rr-calendar-star"
                    href={
                      booking.event_id
                        ? `/events/${booking.event_id}`
                        : undefined
                    }
                  />
                  <div className="flex-1 min-w-0">
                {/* Event Info */}
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <h3 className="text-base font-semibold text-gray-900">
                        {booking.event?.name || "Event Name"}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                          <i className="fi fi-rr-calendar text-primary-500"></i>
                          {booking.event?.starting_date
                            ? formatDate(booking.event.starting_date)
                            : formatDate(booking.created_at)}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                          <i className="fi fi-rr-clock text-primary-500"></i>
                          {booking.event?.duration || "Duration not specified"}
                        </span>
                        {booking.event?.location && (
                          <span className="text-xs px-3 py-1 rounded-full bg-primary-50 text-primary-600 flex items-center gap-1.5">
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
                    {(() => {
                      const pb = booking.pricing_breakdown || null;
                      const grand = pb?.grand_total ?? booking.grand_total ?? booking.total_amount ?? booking.amount ?? 0;
                      return (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(
                          grand
                        )}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {booking.payment_status || "Paid"}
                      </span>
                    </div>
                      );
                    })()}

                    {booking.discount_amount &&
                      parseFloat(booking.discount_amount) > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                          Saved {formatCurrency(booking.discount_amount)}
                        </span>
                      )}

                    {booking.pricing_breakdown ? (
                      <div className="text-[11px] text-gray-500">
                        <span className="font-semibold text-gray-700">
                          GST {booking.pricing_breakdown.gst_percent}% · Convenience {booking.pricing_breakdown.convenience_fee_percent}%
                        </span>
                      </div>
                    ) : null}
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

                    {/* Price Breakdown (like Rental) */}
                    {booking.pricing_breakdown ? (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-medium text-gray-900 mb-3">
                          Price Breakdown
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1 text-gray-600">
                            <div className="flex justify-between gap-3">
                              <span>Subtotal:</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(booking.pricing_breakdown.total_amount)}
                              </span>
                            </div>
                            {(booking.pricing_breakdown.discount_amount ?? 0) > 0 ? (
                              <div className="flex justify-between gap-3">
                                <span>Discount:</span>
                                <span className="font-medium text-green-700">
                                  −{formatCurrency(booking.pricing_breakdown.discount_amount)}
                                </span>
                              </div>
                            ) : null}
                            <div className="flex justify-between gap-3">
                              <span>After discount:</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(booking.pricing_breakdown.subtotal_after_discount)}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1 text-gray-600">
                            <div className="flex justify-between gap-3">
                              <span>GST ({booking.pricing_breakdown.gst_percent}%):</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(booking.pricing_breakdown.gst_amount)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span>
                                Convenience ({booking.pricing_breakdown.convenience_fee_percent}%):
                              </span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(booking.pricing_breakdown.convenience_fee_amount)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-3 pt-2 border-t border-gray-100">
                              <span className="font-semibold text-gray-900">Grand total:</span>
                              <span className="font-semibold text-primary-600">
                                {formatCurrency(booking.pricing_breakdown.grand_total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Selected Tickets (like Rental breakdown section) */}
                    {Array.isArray(booking.booking_tickets) && booking.booking_tickets.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-medium text-gray-900 mb-3">
                          Selected Tickets
                        </h4>
                        <div className="space-y-2">
                          {booking.booking_tickets.map((t) => (
                            <div
                              key={t.id}
                              className="flex items-center justify-between rounded-xl p-3 bg-gray-50/50 border border-gray-100"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {t.ticket_type_name} × {t.quantity}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Unit: {formatCurrency(t.unit_price)}
                                </div>
                              </div>
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(t.total_price)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

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
                                            ? "bg-primary-50 text-primary-600"
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
                </div>
              </div>
            ))}
          </BookingsList>

          <BookingsPagination
            currentPage={currentPageData}
            lastPage={lastPage}
            total={total}
            perPage={perPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
};

export default EventBookings;
