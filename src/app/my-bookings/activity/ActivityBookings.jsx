"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/common/Button";
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
import { getActivityBookings } from "./service";

function ticketTypeId(row) {
  return row?.activity_ticket_type_id ?? row?.activityTicketTypeId;
}

function sortTicketRows(rows) {
  return [...(rows || [])].sort((a, b) => Number(a?.id || 0) - Number(b?.id || 0));
}

/**
 * Labels each stored ticket row for per-pax bookings (adult line + child line from website).
 * Full-rate bookings are usually a single row whose quantity is "ticket count", not adult_count.
 */
function getActivityTicketRowTitle(row, booking, sortedRows) {
  const baseName =
    row?.activity_ticket_type?.name || row?.activityTicketType?.name || "Ticket";
  const adults = Number(booking?.adult_count ?? 0);
  const children = Number(booking?.child_count ?? 0);
  const qty = Number(row?.quantity ?? 0);
  const unit = Number(row?.unit_price ?? 0);
  const rows = sortedRows || [];

  if (!rows.length) return baseName;

  const sameTypeRows = rows.filter((r) => ticketTypeId(r) === ticketTypeId(row));
  const distinctUnitPrices = new Set(
    sameTypeRows.map((r) => Number(r.unit_price || 0).toFixed(2))
  );
  const looksLikeSplitPax =
    children > 0 || (sameTypeRows.length >= 2 && distinctUnitPrices.size > 1);

  if (looksLikeSplitPax && sameTypeRows.length >= 2) {
    const byPrice = [...sameTypeRows].sort(
      (a, b) => Number(b.unit_price) - Number(a.unit_price)
    );
    const hi = Number(byPrice[0]?.unit_price || 0);
    const lo = Number(byPrice[byPrice.length - 1]?.unit_price || 0);

    if (adults > 0 && qty === adults) {
      if (children === 0 || Math.abs(unit - hi) <= 0.02) return `Adult · ${baseName}`;
    }
    if (children > 0 && qty === children) {
      if (adults === 0 || Math.abs(unit - lo) <= 0.02) return `Child · ${baseName}`;
    }
    if (adults > 0 && children > 0 && qty === adults && qty === children) {
      return Math.abs(unit - hi) <= Math.abs(unit - lo)
        ? `Adult · ${baseName}`
        : `Child · ${baseName}`;
    }
    const idx = rows.findIndex((r) => r.id === row.id);
    if (adults > 0 && idx === 0) return `Adult · ${baseName}`;
    if (children > 0 && idx === 1) return `Child · ${baseName}`;
  }

  if (rows.length === 1 && children === 0 && adults > 0 && qty === adults) {
    return `Adult · ${baseName}`;
  }

  return baseName;
}

function getPaxGuestSummary(booking, sortedRows) {
  const adults = Number(booking?.adult_count ?? 0);
  const children = Number(booking?.child_count ?? 0);
  const rows = sortedRows || [];
  if (adults <= 0 && children <= 0) return null;

  const distinctUnitPrices = new Set(rows.map((r) => Number(r.unit_price || 0).toFixed(2)));
  const splitPax = children > 0 || (rows.length >= 2 && distinctUnitPrices.size > 1);
  const adultsOnlyPax = rows.length === 1 && children === 0 && adults > 0;

  if (!splitPax && !adultsOnlyPax) return null;

  const parts = [];
  if (adults > 0) parts.push(`${adults} Adult${adults === 1 ? "" : "s"}`);
  if (children > 0) parts.push(`${children} Child${children === 1 ? "" : "ren"}`);
  return parts.join(", ");
}

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

  const getPaymentMethodIcon = (method) => {
    switch (String(method || "").toLowerCase()) {
      case "razorpay":
        return "fi fi-rr-credit-card";
      default:
        return "fi fi-rr-money-bill";
    }
  };

  const n = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  };

  const getPricingBreakdown = (booking) => {
    const br = booking.pricing_breakdown;
    if (br && br.grand_total != null) {
      return {
        hasBreakdown: true,
        subtotal: n(br.total_amount),
        discount: n(br.discount_amount),
        afterDiscount: n(br.subtotal_after_discount),
        gstPct: n(br.gst_percent) || 18,
        gstAmount: n(br.gst_amount),
        convPct: n(br.convenience_fee_percent) || 2,
        convAmount: n(br.convenience_fee_amount),
        grandTotal: n(br.grand_total),
      };
    }

    const subtotal = n(booking?.total_amount);
    const discount = n(booking?.discount_amount);
    const afterDiscount =
      booking?.subtotal_after_discount != null
        ? n(booking.subtotal_after_discount)
        : Math.max(0, subtotal - discount);
    const gstPct = n(booking?.gst_percent) || 18;
    const convPct = n(booking?.convenience_fee_percent) || 2;
    const gstAmount =
      booking?.gst_amount != null
        ? n(booking.gst_amount)
        : (afterDiscount * gstPct) / 100;
    const afterGst = afterDiscount + gstAmount;
    const convAmount =
      booking?.convenience_fee_amount != null
        ? n(booking.convenience_fee_amount)
        : (afterGst * convPct) / 100;
    const grandTotal = n(booking?.grand_total) || afterGst + convAmount;

    const hasBreakdown =
      booking?.grand_total != null ||
      booking?.gst_amount != null ||
      booking?.convenience_fee_amount != null ||
      booking?.subtotal_after_discount != null;

    return {
      hasBreakdown,
      subtotal,
      discount,
      afterDiscount,
      gstPct,
      gstAmount,
      convPct,
      convAmount,
      grandTotal,
    };
  };

  const getActivityPayments = (booking) => {
    const raw = booking.activity_payment ?? booking.activity_payments;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  };

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
    return <BookingsLoading />;
  }

  if (error) {
    return (
      <BookingsError
        message={error.message || "Failed to load activity bookings"}
        onRetry={() => refetch()}
      />
    );
  }

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return (
      <BookingsEmpty
        icon="fi fi-rr-hiking"
        title="No activity bookings yet"
        description="Explore activities and book your next experience."
        actionLabel="Explore Activities"
        onAction={() => router.push("/activities")}
      />
    );
  }

  return (
    <>
      <BookingsList>
        {bookings.map((booking) => {
          const ticketRows =
            booking.activity_booking_tickets ||
            booking.activityBookingTickets ||
            [];
          const sortedTicketRows = sortTicketRows(ticketRows);
          const ticketCount = Array.isArray(ticketRows)
            ? ticketRows.reduce((sum, t) => sum + Number(t.quantity || 0), 0)
            : Number(booking.total_count || 0);
          const paxGuestSummary = getPaxGuestSummary(booking, sortedTicketRows);
          const guideAmount = Number(booking.guide_amount ?? booking.guideAmount ?? 0);
          const includeGuide =
            booking.include_guide === true ||
            booking.include_guide === 1 ||
            booking.include_guide === "1" ||
            guideAmount > 0;

          return (
            <div
              key={booking.id}
              className={bookingCardClass}
            >
              <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
                <BookingCardImage
                  src={resolveBookingImage(booking, "activity")}
                  alt={booking.activity?.name || "Activity"}
                  fallbackIcon="fi fi-rr-hiking"
                  href={
                    booking.activity_id
                      ? `/activities/${booking.activity_id}`
                      : undefined
                  }
                />
                <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      {booking.activity?.name || "Activity"}
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
                        {paxGuestSummary || `${ticketCount} Tickets`}
                      </span>
                      {booking.activity?.location && (
                        <span className="text-xs px-3 py-1 rounded-full bg-primary-50 text-primary-600 flex items-center gap-1.5">
                          <i className="fi fi-rr-marker"></i>
                          {booking.activity.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Booked on {formatDate(booking.created_at)}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const pb = getPricingBreakdown(booking);
                      const grand =
                        booking.pricing_breakdown?.grand_total ??
                        booking.grand_total ??
                        pb.grandTotal ??
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
                    const pb = getPricingBreakdown(booking);
                    if (!pb.hasBreakdown && !booking.pricing_breakdown) return null;
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
                    const pb = getPricingBreakdown(booking);
                    if (!pb.hasBreakdown && !booking.pricing_breakdown) return null;
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
                  {(() => {
                    const payments = getActivityPayments(booking).filter(
                      (p) => String(p?.status || "").toLowerCase() === "completed"
                    );
                    if (!payments.length) return null;
                    return (
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-900 mb-3">Payment History</h4>
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
                      <h4 className="text-xs font-medium text-gray-900 mb-3">
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
                              booking.booking_status || "confirmed"
                            )}`}
                          >
                            {booking.booking_status || "Confirmed"}
                          </span>
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
                        {paxGuestSummary ? (
                          <>
                            {Number(booking.adult_count ?? 0) > 0 ? (
                              <div className="flex justify-between">
                                <span>Adults:</span>
                                <span className="font-medium">
                                  {Number(booking.adult_count ?? 0)}
                                </span>
                              </div>
                            ) : null}
                            {Number(booking.child_count ?? 0) > 0 ? (
                              <div className="flex justify-between">
                                <span>Children:</span>
                                <span className="font-medium">
                                  {Number(booking.child_count ?? 0)}
                                </span>
                              </div>
                            ) : null}
                          </>
                        ) : null}
                        {includeGuide ? (
                          <>
                            <div className="flex justify-between">
                              <span>Guide:</span>
                              <span className="font-medium text-primary-700">Yes</span>
                            </div>
                            {guideAmount > 0 ? (
                              <div className="flex justify-between">
                                <span>Guide charge:</span>
                                <span className="font-medium">
                                  {formatCurrency(guideAmount)}
                                </span>
                              </div>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-gray-900 mb-3">
                        Payment Details
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        {(() => {
                          const pb = getPricingBreakdown(booking);
                          if (!pb.hasBreakdown) {
                            return (
                              <div className="flex justify-between">
                                <span>Taxes &amp; fees:</span>
                                <span className="font-medium text-gray-900 text-right">
                                  18% GST and 2% convenience fee included in total where applicable
                                </span>
                              </div>
                            );
                          }

                          return (
                            <>
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-medium">
                                  {formatCurrency(pb.subtotal)}
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
                                      {formatCurrency(pb.afterDiscount)}
                                    </span>
                                  </div>
                                </>
                              ) : null}
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
                        {sortedTicketRows.map((t, idx) => (
                          <div
                            key={t.id || idx}
                            className="flex items-center justify-between text-sm bg-gray-50 border border-gray-100 rounded-xl p-3"
                          >
                            <span className="text-gray-700 font-medium">
                              {getActivityTicketRowTitle(t, booking, sortedTicketRows)}
                            </span>
                            <span className="text-gray-700">
                              Qty: {t.quantity} • {formatCurrency(t.total_price || 0)}
                            </span>
                          </div>
                        ))}
                        {includeGuide && guideAmount > 0 ? (
                          <div className="flex items-center justify-between text-sm bg-primary-50/60 border border-primary-100 rounded-xl p-3">
                            <span className="text-gray-700 font-medium">
                              <i className="fi fi-rr-user-skill mr-1.5 text-primary-600"></i>
                              Guide service
                            </span>
                            <span className="text-gray-700 font-medium">
                              {formatCurrency(guideAmount)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              )}
                </div>
              </div>
            </div>
          );
        })}
      </BookingsList>

      <BookingsPagination
        currentPage={currentPageData}
        lastPage={lastPage}
        total={total}
        perPage={perPage}
        onPageChange={handlePageChange}
      />
    </>
  );
};

export default ActivityBookings;

