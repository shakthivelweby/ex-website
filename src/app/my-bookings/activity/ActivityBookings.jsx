"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/common/Button";
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
                        {paxGuestSummary || `${ticketCount} Tickets`}
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

