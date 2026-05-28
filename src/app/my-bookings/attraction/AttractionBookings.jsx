"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { getAttractionBookings } from "./service";
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    if (!Number.isFinite(date.getTime())) return "—";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString()}`;
  };

  const n = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  };

  const getGrandTotal = (booking) => {
    // Prefer DB-stored grand total (includes GST + convenience fee)
    const gt = n(booking?.grand_total);
    if (gt > 0) return gt;

    // Backward-compatible fallback: compute from total_amount
    const subtotal = n(booking?.total_amount);
    const gstPct = n(booking?.gst_percent) || 18;
    const convPct = n(booking?.convenience_fee_percent) || 2;
    const gst = (subtotal * gstPct) / 100;
    const afterGst = subtotal + gst;
    const conv = (afterGst * convPct) / 100;
    return afterGst + conv;
  };

  const getAttractionPricingBreakdown = (booking) => {
    const br = booking.pricing_breakdown;
    if (br && br.grand_total != null) {
      return {
        hasAnyBreakdown: true,
        subtotalGross: n(br.total_amount),
        discount: n(br.discount_amount),
        subtotalAfterDiscount: n(br.subtotal_after_discount),
        gstPct: n(br.gst_percent) || 18,
        gstAmount: n(br.gst_amount),
        convPct: n(br.convenience_fee_percent) || 2,
        convAmount: n(br.convenience_fee_amount),
        grandTotal: n(br.grand_total),
      };
    }

    const subtotalGross = n(booking?.total_amount);
    const discount = n(booking?.discount_amount);
    const subtotalAfterDiscount =
      booking?.subtotal_after_discount != null
        ? n(booking.subtotal_after_discount)
        : Math.max(0, subtotalGross - discount);

    const gstPct = n(booking?.gst_percent) || 18;
    const convPct = n(booking?.convenience_fee_percent) || 2;

    const gstAmount =
      booking?.gst_amount != null
        ? n(booking.gst_amount)
        : (subtotalAfterDiscount * gstPct) / 100;

    const afterGst = subtotalAfterDiscount + gstAmount;

    const convAmount =
      booking?.convenience_fee_amount != null
        ? n(booking.convenience_fee_amount)
        : (afterGst * convPct) / 100;

    const grandTotal = n(booking?.grand_total) || afterGst + convAmount;

    const hasAnyBreakdown =
      booking?.gst_amount != null ||
      booking?.convenience_fee_amount != null ||
      booking?.grand_total != null ||
      booking?.subtotal_after_discount != null;

    return {
      hasAnyBreakdown,
      subtotalGross,
      discount,
      subtotalAfterDiscount,
      gstPct,
      gstAmount,
      convPct,
      convAmount,
      grandTotal,
    };
  };

  const getAttractionPayments = (booking) => {
    const raw = booking.attraction_payment ?? booking.attraction_payments;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
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
    return <BookingsLoading />;
  }

  if (attractionBookingsError) {
    return (
      <BookingsError
        message={
          attractionBookingsError.response?.data?.message ||
          "Something went wrong while loading your attraction bookings."
        }
        onRetry={() => window.location.reload()}
      />
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
      <BookingsEmpty
        icon="fi fi-rr-map-marker"
        title="No attraction bookings yet"
        description="You haven't booked any attractions yet. Explore our amazing attractions and book your next adventure!"
        actionLabel="Explore Attractions"
        onAction={() => router.push("/attractions")}
      />
    );
  }

  return (
    <>
      <BookingsList>
        {attractionBookings.map((booking) => (
          <div
            key={booking.id}
            className={bookingCardClass}
          >
            <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
              <BookingCardImage
                src={resolveBookingImage(booking, "attraction")}
                alt={booking.attraction?.name || "Attraction"}
                fallbackIcon="fi fi-rr-map-marker"
                href={
                  booking.attraction_id
                    ? `/attractions/${booking.attraction_id}`
                    : undefined
                }
              />
              <div className="flex-1 min-w-0">
            {/* Attraction Info */}
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    {booking.attraction?.name || "Attraction Name"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                      <i className="fi fi-rr-calendar text-primary-500"></i>
                      {booking.visit_date
                        ? formatDate(booking.visit_date)
                        : formatDate(booking.created_at)}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 flex items-center gap-1.5">
                      <i className="fi fi-rr-users text-primary-500"></i>
                      {booking.total_count ||
                        parseInt(booking.adult_count || 0) +
                          parseInt(booking.child_count || 0)}{" "}
                      Visitors
                    </span>
                    {booking.attraction?.location && (
                      <span className="text-xs px-3 py-1 rounded-full bg-primary-50 text-primary-600 flex items-center gap-1.5">
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
                  {(() => {
                    const pb = getAttractionPricingBreakdown(booking);
                    const grand =
                      booking.pricing_breakdown?.grand_total ??
                      booking.grand_total ??
                      pb.grandTotal ??
                      getGrandTotal(booking) ??
                      booking.total_amount ??
                      0;
                    return (
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(grand)}
                      </span>
                    );
                  })()}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {booking.payment_status || "Paid"}
                  </span>
                </div>
                {(() => {
                  const pb = getAttractionPricingBreakdown(booking);
                  if (!pb.hasAnyBreakdown && !booking.pricing_breakdown) return null;
                  const disc =
                    booking.discount_amount != null
                      ? n(booking.discount_amount)
                      : pb.discount;
                  if (disc > 0.009) {
                    return (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                        Saved {formatCurrency(disc)}
                      </span>
                    );
                  }
                  return null;
                })()}
                {(() => {
                  const pb = getAttractionPricingBreakdown(booking);
                  if (!pb.hasAnyBreakdown && !booking.pricing_breakdown) return null;
                  return (
                    <div className="text-[11px] text-gray-500 text-right">
                      <span className="font-semibold text-gray-700">
                        GST {pb.gstPct}% · Convenience {pb.convPct}%
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <Button
                onClick={() => togglePaymentHistory(booking.id)}
                variant="outline"
                size="sm"
                className="!rounded-full !text-xs !px-4 !py-2 flex items-center justify-center"
              >
                <i
                  className={`fi fi-rr-${
                    expandedBooking === booking.id ? "angle-up" : "angle-down"
                  } mr-1.5`}
                ></i>
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
            </div>

            {/* Expanded Booking Details */}
            {expandedBooking === booking.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {(() => {
                  const payments = getAttractionPayments(booking).filter(
                    (p) => String(p?.status || "").toLowerCase() === "completed"
                  );
                  if (!payments.length) return null;
                  return (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-900 mb-3">Payments</h4>
                      <div className="space-y-3">
                        {payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex flex-col md:flex-row md:items-center justify-between rounded-xl p-3 gap-3 bg-gray-50/50 border border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white">
                                <i
                                  className={`${getPaymentMethodIcon(payment.payment_method)} text-base text-gray-500`}
                                ></i>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {formatCurrency(payment.amount)}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                                    Full
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatDateTime(payment.created_at)}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                                payment.status
                              )}`}
                            >
                              {payment.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

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
                      <div className="flex justify-between items-center">
                        <span>Booking status:</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                            booking.status || "confirmed"
                          )}`}
                        >
                          {booking.status || "Confirmed"}
                        </span>
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
                      {(() => {
                        const tickets =
                          booking.booking_tickets ||
                          booking.attraction_booking_tickets ||
                          booking.attractionBookingTickets ||
                          booking.attraction_booking_tickets ||
                          [];
                        if (!tickets || tickets.length === 0) return null;
                        return (
                        <>
                          <div className="mb-3">
                            <span className="text-sm font-semibold text-gray-800">
                              📋 Ticket Breakdown:
                            </span>
                          </div>
                          {tickets.map((ticket, index) => {
                            return (
                              <div
                                key={index}
                                className="mb-2 text-xs text-gray-600 bg-primary-50 p-3 rounded-lg border border-primary-100"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-primary-600">
                                    {ticket.ticket_type_name ||
                                      ticket?.attraction_ticket_type?.attraction_ticket_type_master?.name ||
                                      ticket?.attractionTicketType?.attractionTicketTypeMaster?.name ||
                                      ticket.name ||
                                      `Ticket Type ${index + 1}`}
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    Qty: {parseInt(ticket.quantity || 0)}
                                  </span>
                                </div>
                                {(ticket.unit_price > 0 || ticket.total_price > 0) && (
                                  <div className="flex justify-between mt-2 text-xs">
                                    <span className="text-gray-600">Rate:</span>
                                    <span className="text-gray-700">
                                      {parseFloat(
                                        ticket.unit_price || 0
                                      ).toFixed(2)}{" "}
                                      (Total: ₹{parseFloat(ticket.total_price || 0).toFixed(2)})
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
                        );
                      })() || (
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
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">Price summary</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {(() => {
                        const pb = getAttractionPricingBreakdown(booking);
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span className="font-medium">
                                {formatCurrency(pb.subtotalGross)}
                              </span>
                            </div>
                            {pb.discount > 0 ? (
                              <>
                                <div className="flex justify-between">
                                  <span>Discount:</span>
                                  <span className="font-medium text-green-700">
                                    −{formatCurrency(pb.discount)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>After discount:</span>
                                  <span className="font-medium text-gray-800">
                                    {formatCurrency(pb.subtotalAfterDiscount)}
                                  </span>
                                </div>
                              </>
                            ) : null}
                            {pb.hasAnyBreakdown ? (
                              <>
                                <div className="flex justify-between">
                                  <span>GST ({pb.gstPct}%):</span>
                                  <span className="font-medium">
                                    {formatCurrency(pb.gstAmount)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Convenience fee ({pb.convPct}%):</span>
                                  <span className="font-medium">
                                    {formatCurrency(pb.convAmount)}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="flex justify-between">
                                <span>Taxes &amp; fees:</span>
                                <span className="font-medium text-gray-900 text-right">
                                  18% GST and 2% convenience fee included in total where applicable
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Total Amount:</span>
                              <span className="font-medium">
                                {formatCurrency(pb.grandTotal)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                      <div className="flex justify-between">
                        <span>Paid Amount:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            booking.total_paid || getGrandTotal(booking)
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
                </div>
          </div>
        ))}
      </BookingsList>

      <BookingsPagination
        currentPage={currentPageData}
        lastPage={lastPage}
        total={total}
        perPage={pagination.per_page || 10}
        onPageChange={handlePageChange}
      />
    </>
  );
};

export default AttractionBookings;
