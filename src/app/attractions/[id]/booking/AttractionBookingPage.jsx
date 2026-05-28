"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  attractionInfo,
  getDetailsForBooking,
} from "../service";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";
import { formatTimeTo12Hour } from "@/utils/formatDate";

function attractionAdminPct(ticket) {
  return Math.max(0, Number(ticket?.admin_charge ?? 0));
}

function applyAdminCharge(amountRaw, adminPctRaw) {
  const amount = Number(amountRaw || 0);
  return Math.round(amount * 100) / 100;
}

/** Discount applies on the admin-inclusive amount. */
function applyDiscountOnAmount(amountRaw, discountPctRaw) {
  const amount = Number(amountRaw || 0);
  const pct = Math.max(0, Number(discountPctRaw || 0));
  if (pct <= 0) return amount;
  return Math.round((amount - (amount * pct) / 100) * 100) / 100;
}

function resolvePaxAdultChildRaw(ticket) {
  let adultPrice = parseFloat(ticket.adult_price || 0);
  let childPrice = parseFloat(ticket.child_price || 0);
  if (adultPrice === 0 && childPrice === 0 && ticket.full_rate) {
    adultPrice = parseFloat(ticket.full_rate);
    childPrice = parseFloat(ticket.full_rate);
  }
  return { adultPrice, childPrice };
}

const AttractionBookingPage = ({
  attractionId,
  closeoutDates = [],
  guideRate = 0,
  initialAttractionData = null,
}) => {
  const router = useRouter();
  const [attractionData, setAttractionData] = useState(initialAttractionData);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [adultChildTickets, setAdultChildTickets] = useState({});
  const [expandedTicketType, setExpandedTicketType] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [needGuide, setNeedGuide] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Function to check if a date should be disabled (same as Form.jsx)
  const isDateDisabled = (date) => {
    // Use local date format to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    // Check closeout_dates for date range restrictions
    if (closeoutDates && closeoutDates.length > 0) {
      for (const closeout of closeoutDates) {
        // Check date range restrictions
        if (closeout.start_date && closeout.end_date) {
          if (dateStr >= closeout.start_date && dateStr <= closeout.end_date) {
            return true;
          }
        }

        // Check day-of-week restrictions from applicable_days
        if (closeout.applicable_days) {
          const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
          const dayName = dayNames[dayOfWeek];

          // If the day is set to 0 in applicable_days, disable it
          if (closeout.applicable_days[dayName] === 0) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // Initialise visit date from localStorage (detail page) or today, then load tickets for that date.
  useEffect(() => {
    if (!attractionId) return;

    const storedDate =
      typeof window !== "undefined"
        ? localStorage.getItem(`attraction_${attractionId}_selectedDate`)
        : null;
    const visitDate =
      storedDate && /^\d{4}-\d{2}-\d{2}$/.test(storedDate)
        ? storedDate
        : new Date().toISOString().split("T")[0];
    setSelectedDate(visitDate);

    const loadBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await getDetailsForBooking(attractionId, visitDate);
        if (response?.data) {
          setAttractionData(response.data);
          setTicketData(response.data);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [attractionId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleQuantityChange = (ticketTypeId, change) => {
    const currentQuantity = selectedTickets[ticketTypeId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);

    if (newQuantity === 0) {
      const newSelectedTickets = { ...selectedTickets };
      delete newSelectedTickets[ticketTypeId];
      setSelectedTickets(newSelectedTickets);
    } else {
      setSelectedTickets({
        ...selectedTickets,
        [ticketTypeId]: newQuantity,
      });
    }
  };

  const handleAdultChildQuantityChange = (ticketTypeId, type, change) => {
    const currentTickets = adultChildTickets[ticketTypeId] || {
      adult: 0,
      child: 0,
    };
    const newQuantity = Math.max(0, currentTickets[type] + change);

    const updatedTickets = {
      ...adultChildTickets,
      [ticketTypeId]: {
        ...currentTickets,
        [type]: newQuantity,
      },
    };

    // Remove the ticket type if both adult and child are 0
    if (
      updatedTickets[ticketTypeId].adult === 0 &&
      updatedTickets[ticketTypeId].child === 0
    ) {
      const newTickets = { ...updatedTickets };
      delete newTickets[ticketTypeId];
      setAdultChildTickets(newTickets);
    } else {
      setAdultChildTickets(updatedTickets);
    }
  };

  const handleTicketTypeClick = (ticketTypeId) => {
    if (expandedTicketType === ticketTypeId) {
      setExpandedTicketType(null);
    } else {
      setExpandedTicketType(ticketTypeId);
    }
  };

  const getTotalSelectedTickets = () => {
    return Object.values(adultChildTickets).reduce(
      (sum, tickets) => sum + tickets.adult + tickets.child,
      0
    );
  };

  const getTotalPrice = () => {
    let total = 0;

    // Calculate adult/child tickets
    Object.entries(adultChildTickets).forEach(([ticketTypeId, tickets]) => {
      const ticket = ticketData?.attraction_ticket_type_prices?.find(
        (t) => t.attraction_ticket_type_id == ticketTypeId
      );
      if (ticket && (tickets.adult > 0 || tickets.child > 0)) {
        const adm = attractionAdminPct(ticket);
        if (ticket.rate_type === "full") {
          const raw = Number(ticket.full_rate || 0);
          const afterAdmin = applyAdminCharge(raw, adm);
          const unit = applyDiscountOnAmount(afterAdmin, ticket.discount);
          total += unit * (tickets.adult + tickets.child);
        } else if (ticket.rate_type === "pax") {
          const { adultPrice: adultRaw, childPrice: childRaw } =
            resolvePaxAdultChildRaw(ticket);
          const adultAfterAdmin = applyAdminCharge(adultRaw, adm);
          const childAfterAdmin = applyAdminCharge(childRaw, adm);
          const adultUnit = applyDiscountOnAmount(
            adultAfterAdmin,
            ticket.discount
          );
          const childUnit = applyDiscountOnAmount(
            childAfterAdmin,
            ticket.discount
          );
          total += adultUnit * tickets.adult + childUnit * tickets.child;
        }
      }
    });

    // Add guide price if guide is selected
    if (needGuide && guideRate > 0) {
      total += parseFloat(guideRate);
    }
    return total;
  };

  const handleContinue = () => {
    if (getTotalSelectedTickets() === 0) {
      return;
    }
    if (!selectedDate) {
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const gstPercent = 18;
  const conveniencePercent = 2;

  // Compute discount-aware subtotal for summary
  let subtotalOriginal = 0;
  let discountForSummary = 0;
  Object.entries(adultChildTickets).forEach(([ticketTypeId, tickets]) => {
    const ticket = ticketData?.attraction_ticket_type_prices?.find(
      (t) => t.attraction_ticket_type_id == ticketTypeId
    );
    if (!ticket || (tickets.adult === 0 && tickets.child === 0)) return;

    const qty = tickets.adult + tickets.child;
    const pct = Number(ticket.discount || 0);

    const adm = attractionAdminPct(ticket);
    if (ticket.rate_type === "full") {
      const originalUnit = applyAdminCharge(Number(ticket.full_rate || 0), adm);
      const discountedUnit = applyDiscountOnAmount(originalUnit, pct);
      subtotalOriginal += originalUnit * qty;
      discountForSummary += (originalUnit - discountedUnit) * qty;
      return;
    }

    // pax
    const { adultPrice: adultRaw, childPrice: childRaw } =
      resolvePaxAdultChildRaw(ticket);
    const adultUnit = applyAdminCharge(adultRaw, adm);
    const childUnit = applyAdminCharge(childRaw, adm);
    const discountedAdult = applyDiscountOnAmount(adultUnit, pct);
    const discountedChild = applyDiscountOnAmount(childUnit, pct);
    subtotalOriginal +=
      adultUnit * tickets.adult + childUnit * tickets.child;
    discountForSummary +=
      (adultUnit - discountedAdult) * tickets.adult +
      (childUnit - discountedChild) * tickets.child;
  });

  if (needGuide && guideRate > 0) {
    subtotalOriginal += Number(guideRate || 0);
  }

  const subtotalForSummary = Math.max(0, subtotalOriginal - discountForSummary);
  const gstAmount = (Number(subtotalForSummary || 0) * gstPercent) / 100;
  const afterGst = Number(subtotalForSummary || 0) + gstAmount;
  const convenienceAmount = (afterGst * conveniencePercent) / 100;
  const grandTotalForSummary = afterGst + convenienceAmount;

  const handleProceedToPayment = () => {
    if (!isLogin()) {
      const event = new CustomEvent("showLogin");
      window.dispatchEvent(event);
      return;
    }

    // Format the selected tickets data according to API requirements
    const formattedTickets = [];
    let totalAmount = 0;
    let discountAmount = 0;

    // Process adult/child tickets
    Object.entries(adultChildTickets).forEach(([ticketTypeId, tickets]) => {
      if (tickets.adult === 0 && tickets.child === 0) return;

      const ticket = ticketData?.attraction_ticket_type_prices?.find(
        (t) => t.attraction_ticket_type_id == ticketTypeId
      );

      if (ticket && (tickets.adult > 0 || tickets.child > 0)) {
        const totalQuantity = tickets.adult + tickets.child;
        const adm = attractionAdminPct(ticket);

        if (ticket.rate_type === "full") {
          const originalRaw = Number(ticket.full_rate || 0);
          const afterAdmin = applyAdminCharge(originalRaw, adm);
          let ticketPrice = afterAdmin;
          if (ticket.discount > 0) {
            ticketPrice = applyDiscountOnAmount(afterAdmin, ticket.discount);
            discountAmount += (afterAdmin - ticketPrice) * totalQuantity;
          }

          const ticketTotal = ticketPrice * totalQuantity;
          totalAmount += ticketTotal;

          formattedTickets.push({
            id: parseInt(ticketTypeId),
            attraction_ticket_type_id: parseInt(ticketTypeId),
            quantity: totalQuantity,
            adult_quantity: tickets.adult,
            child_quantity: tickets.child,
            price: ticketPrice,
            unit_price: ticketPrice,
            total_price: ticketTotal,
            total: ticketTotal,
          });
        } else if (ticket.rate_type === "pax") {
          let adultPrice = parseFloat(ticket.adult_price || 0);
          let childPrice = parseFloat(ticket.child_price || 0);
          if (adultPrice === 0 && childPrice === 0 && ticket.full_rate) {
            adultPrice = parseFloat(ticket.full_rate);
            childPrice = parseFloat(ticket.full_rate);
          }

          const adultAfterAdmin = applyAdminCharge(adultPrice, adm);
          const childAfterAdmin = applyAdminCharge(childPrice, adm);
          let adultFinal = adultAfterAdmin;
          let childFinal = childAfterAdmin;

          if (ticket.discount > 0) {
            adultFinal = applyDiscountOnAmount(adultAfterAdmin, ticket.discount);
            childFinal = applyDiscountOnAmount(childAfterAdmin, ticket.discount);
            discountAmount +=
              (adultAfterAdmin - adultFinal) * tickets.adult +
              (childAfterAdmin - childFinal) * tickets.child;
          }

          const ticketTotal =
            adultFinal * tickets.adult + childFinal * tickets.child;
          totalAmount += ticketTotal;

          formattedTickets.push({
            id: parseInt(ticketTypeId),
            attraction_ticket_type_id: parseInt(ticketTypeId),
            quantity: totalQuantity,
            adult_quantity: tickets.adult,
            child_quantity: tickets.child,
            adult_price: adultFinal,
            child_price: childFinal,
            unit_price: adultFinal,
            total_price: ticketTotal,
            total: ticketTotal,
          });
        }
      }
    });

    // Add guide rate if needed
    if (needGuide && guideRate > 0) {
      totalAmount += parseFloat(guideRate);
    }

    // Prepare the booking data for checkout
    const apiBookingData = {
      attraction_id: attractionId,
      visit_date: selectedDate,
      // Send original subtotal (pre-discount) so backend can persist discount_amount correctly
      total_amount: parseFloat((totalAmount + discountAmount).toFixed(2)),
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      bookingTickets: formattedTickets,
      include_guide: needGuide,
      guide_rate: needGuide ? guideRate : 0,
    };

    // Clean up stored date from localStorage
    localStorage.removeItem(`attraction_${attractionId}_selectedDate`);

    // Encode the data and redirect to checkout
    const encodedData = encodeURIComponent(JSON.stringify(apiBookingData));
    router.push(
      `/checkout/attractions?attraction_id=${attractionId}&tickets=${encodedData}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!attractionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {loading ? "Loading..." : "Attraction not found"}
          </h2>
          <p className="text-gray-600">
            {loading
              ? "Please wait while we fetch the attraction details..."
              : "The attraction you're looking for doesn't exist or there was an error loading the data."}
          </p>
          {!loading && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Mobile Attraction Details Header - Only visible on mobile */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                {attractionData.cover_image || attractionData.thumb_image ? (
                  <Image
                    src={
                      attractionData.cover_image || attractionData.thumb_image
                    }
                    alt={attractionData.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <i className="fi fi-rr-image text-gray-400 text-xl"></i>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  Book Tickets
                </h1>
                <p className="text-sm text-gray-600">{attractionData.name}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-clock text-primary-500 text-sm"></i>
                <span className="text-gray-700 text-sm">
                  {attractionData.start_time || "TBD"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-map-marker text-primary-500 text-sm"></i>
                <span className="text-gray-700 text-sm">
                  {attractionData.location}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-tag text-primary-500 text-sm"></i>
                {attractionData.attraction_category_master?.name && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                    {attractionData.attraction_category_master.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          {/* Left Column - Ticket Selection */}
          <div className="lg:col-span-2">
            {currentStep === 1 ? (
              <div className="bg-white rounded-lg shadow border">
                <div className="p-4 space-y-6">
                  {/* Ticket Types */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-800">
                        Available Tickets
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {ticketData?.attraction_ticket_type_prices?.map(
                        (ticket, index) => {
                          const isSelected =
                            adultChildTickets[ticket.attraction_ticket_type_id]
                              ?.adult > 0 ||
                            adultChildTickets[ticket.attraction_ticket_type_id]
                              ?.child > 0;
                          const isExpanded =
                            expandedTicketType ===
                            ticket.attraction_ticket_type_id;
                          return (
                            <div
                              key={ticket.id}
                              className={`${
                                isSelected
                                  ? "bg-primary-50 border-primary-200"
                                  : "bg-white hover:bg-gray-50"
                              } border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
                                index !==
                                ticketData.attraction_ticket_type_prices
                                  .length -
                                  1
                                  ? "border-b"
                                  : ""
                              }`}
                            >
                              <div
                                className="flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                                onClick={() =>
                                  handleTicketTypeClick(
                                    ticket.attraction_ticket_type_id
                                  )
                                }
                              >
                                {/* Left Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h5
                                      className={`text-sm font-semibold ${
                                        isSelected
                                          ? "text-primary-800"
                                          : "text-gray-800"
                                      }`}
                                    >
                                      {
                                        ticket.attraction_ticket_type
                                          ?.attraction_ticket_type_master?.name
                                      }
                                    </h5>
                                    {ticket.discount > 0 && (
                                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                        {ticket.discount}% OFF
                                      </span>
                                    )}
                                  </div>

                                  {/* Price and Description */}
                                  <div className="flex items-center gap-4 mb-2">
                                    <div className="flex items-baseline gap-2">
                                      {(() => {
                                        const adm = attractionAdminPct(ticket);
                                        const pct = Number(ticket.discount || 0);
                                        let rawRepresentative = 0;
                                        if (ticket.rate_type === "full") {
                                          rawRepresentative = Number(
                                            ticket.full_rate || 0
                                          );
                                        } else if (ticket.rate_type === "pax") {
                                          rawRepresentative =
                                            resolvePaxAdultChildRaw(
                                              ticket
                                            ).adultPrice;
                                        }
                                        const priceAfterAdmin =
                                          applyAdminCharge(
                                            rawRepresentative,
                                            adm
                                          );
                                        const priceFinal =
                                          applyDiscountOnAmount(
                                            priceAfterAdmin,
                                            pct
                                          );

                                        if (pct > 0) {
                                          return (
                                            <>
                                              <div className="flex items-baseline gap-1">
                                                <span className="text-xs text-gray-500">
                                                  Price:
                                                </span>
                                                <span
                                                  className={`text-lg font-bold line-through ${
                                                    isSelected
                                                      ? "text-gray-500"
                                                      : "text-gray-500"
                                                  }`}
                                                >
                                                  ₹{priceAfterAdmin}
                                                </span>
                                              </div>
                                              <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-bold text-green-600">
                                                  ₹{priceFinal.toFixed(2)}
                                                </span>
                                              </div>
                                            </>
                                          );
                                        }

                                        return (
                                          <>
                                            <span className="text-xs text-gray-500">
                                              Price:
                                            </span>
                                            <span
                                              className={`text-lg font-bold ${
                                                isSelected
                                                  ? "text-primary-700"
                                                  : "text-gray-900"
                                              }`}
                                            >
                                              ₹{priceAfterAdmin}
                                            </span>
                                          </>
                                        );
                                      })()}
                                    </div>
                                    {ticket.available_slots && (
                                      <div className="flex items-center gap-1">
                                        <i className="fi fi-rr-ticket text-xs text-gray-400"></i>
                                        <span className="text-xs text-gray-500">
                                          {ticket.available_slots} slots
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Description */}
                                  {ticket.description && (
                                    <div
                                      className="text-xs text-gray-600 leading-relaxed"
                                      dangerouslySetInnerHTML={{
                                        __html: ticket.description,
                                      }}
                                    />
                                  )}
                                </div>

                                {/* Expand/Collapse Arrow */}
                                <div className="flex items-center justify-center">
                                  <i
                                    className={`fi fi-rr-angle-down text-gray-400 transition-transform duration-200 ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  ></i>
                                </div>
                              </div>

                              {/* Adult and Child Quantity Selectors - Only show when expanded */}
                              {isExpanded && (
                                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                                  <h5 className="text-sm font-medium text-gray-700 mb-3">
                                    Select Adult & Child
                                  </h5>

                                  {/* Adults Section */}
                                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-800">
                                        Adults
                                      </h3>
                                      <p className="text-xs text-gray-500">
                                        Over 18+ —{" "}
                                        {(() => {
                                          const adm = attractionAdminPct(ticket);
                                          const pct = Number(
                                            ticket.discount || 0
                                          );
                                          const raw =
                                            ticket.rate_type === "full"
                                              ? Number(ticket.full_rate || 0)
                                              : resolvePaxAdultChildRaw(
                                                  ticket
                                                ).adultPrice;
                                          const afterAd = applyAdminCharge(
                                            raw,
                                            adm
                                          );
                                          const final = applyDiscountOnAmount(
                                            afterAd,
                                            pct
                                          );
                                          return pct > 0 ? (
                                            <>
                                              <span className="line-through text-gray-400">
                                                ₹{afterAd}
                                              </span>{" "}
                                              <span className="font-medium text-green-700">
                                                ₹{final}
                                              </span>
                                            </>
                                          ) : (
                                            <>₹{afterAd}</>
                                          );
                                        })()}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          handleAdultChildQuantityChange(
                                            ticket.attraction_ticket_type_id,
                                            "adult",
                                            -1
                                          )
                                        }
                                        disabled={
                                          (adultChildTickets[
                                            ticket.attraction_ticket_type_id
                                          ]?.adult || 0) <= 0
                                        }
                                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        <i className="fi fi-rr-minus text-xs"></i>
                                      </button>
                                      <div className="w-12 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-sm font-medium text-gray-800">
                                        {adultChildTickets[
                                          ticket.attraction_ticket_type_id
                                        ]?.adult || 0}
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleAdultChildQuantityChange(
                                            ticket.attraction_ticket_type_id,
                                            "adult",
                                            1
                                          )
                                        }
                                        disabled={
                                          (adultChildTickets[
                                            ticket.attraction_ticket_type_id
                                          ]?.adult || 0) >=
                                          (ticket.maximum_allowed_bookings_per_user ||
                                            10)
                                        }
                                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        <i className="fi fi-rr-plus text-xs"></i>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Children Section */}
                                  <div className="flex items-center justify-between py-3">
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-800">
                                        Child
                                      </h3>
                                      <p className="text-xs text-gray-500">
                                        Under 18 —{" "}
                                        {(() => {
                                          const adm = attractionAdminPct(ticket);
                                          const pct = Number(
                                            ticket.discount || 0
                                          );
                                          const raw =
                                            ticket.rate_type === "full"
                                              ? Number(ticket.full_rate || 0)
                                              : resolvePaxAdultChildRaw(
                                                  ticket
                                                ).childPrice;
                                          const afterAd = applyAdminCharge(
                                            raw,
                                            adm
                                          );
                                          const final = applyDiscountOnAmount(
                                            afterAd,
                                            pct
                                          );
                                          return pct > 0 ? (
                                            <>
                                              <span className="line-through text-gray-400">
                                                ₹{afterAd}
                                              </span>{" "}
                                              <span className="font-medium text-green-700">
                                                ₹{final}
                                              </span>
                                            </>
                                          ) : (
                                            <>₹{afterAd}</>
                                          );
                                        })()}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          handleAdultChildQuantityChange(
                                            ticket.attraction_ticket_type_id,
                                            "child",
                                            -1
                                          )
                                        }
                                        disabled={
                                          (adultChildTickets[
                                            ticket.attraction_ticket_type_id
                                          ]?.child || 0) <= 0
                                        }
                                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        <i className="fi fi-rr-minus text-xs"></i>
                                      </button>
                                      <div className="w-12 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-sm font-medium text-gray-800">
                                        {adultChildTickets[
                                          ticket.attraction_ticket_type_id
                                        ]?.child || 0}
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleAdultChildQuantityChange(
                                            ticket.attraction_ticket_type_id,
                                            "child",
                                            1
                                          )
                                        }
                                        disabled={
                                          (adultChildTickets[
                                            ticket.attraction_ticket_type_id
                                          ]?.child || 0) >=
                                          (ticket.maximum_allowed_bookings_per_user ||
                                            10)
                                        }
                                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        <i className="fi fi-rr-plus text-xs"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Guide Section */}
                  {guideRate > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-sm font-medium text-gray-800 mb-3">
                        Guide
                      </h3>
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <i className="fi fi-rr-user-guide text-primary-500 text-lg"></i>
                          <div>
                            <span className="text-sm font-medium text-gray-700 block">
                              Need a guide
                            </span>
                            <span className="text-xs text-gray-500">
                              ₹{guideRate} per booking
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setNeedGuide(!needGuide)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            needGuide ? "bg-primary-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                              needGuide ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow border">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-base font-medium text-gray-800">
                    Booking Summary
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Review your ticket selection before proceeding
                  </p>
                </div>

                <div className="p-4 space-y-4">
                  {/* Visit Date */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <i className="fi fi-rr-calendar text-blue-600"></i>
                      <span className="text-sm font-medium text-blue-800">
                        Visit Date: {formatDate(selectedDate)}
                      </span>
                    </div>
                  </div>

                  {/* Adult/Child Tickets */}
                  {Object.entries(adultChildTickets).map(
                    ([ticketTypeId, tickets]) => {
                      if (tickets.adult === 0 && tickets.child === 0)
                        return null;
                      const ticket =
                        ticketData?.attraction_ticket_type_prices?.find(
                          (t) => t.attraction_ticket_type_id == ticketTypeId
                        );
                      const totalQuantity = tickets.adult + tickets.child;

                      return (
                        <div
                          key={ticketTypeId}
                          className="bg-gray-50 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-800">
                                {
                                  ticket?.attraction_ticket_type
                                    ?.attraction_ticket_type_master?.name
                                }
                              </h4>
                              <div className="text-xs text-gray-600 space-y-1">
                                {tickets.adult > 0 && (
                                  <p>Adults: {tickets.adult}</p>
                                )}
                                {tickets.child > 0 && (
                                  <p>Children: {tickets.child}</p>
                                )}
                                <p>Total: {totalQuantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {(() => {
                                const adm = attractionAdminPct(ticket);
                                const pct = Number(ticket?.discount || 0);
                                if (ticket?.rate_type === "full") {
                                  const afterAdmin = applyAdminCharge(
                                    Number(ticket.full_rate || 0),
                                    adm
                                  );
                                  const ticketPrice =
                                    applyDiscountOnAmount(afterAdmin, pct);

                                  return (
                                    <>
                                      <p className="text-sm text-gray-800">
                                        ₹
                                        {parseFloat(ticketPrice).toFixed(2)} ×{" "}
                                        {totalQuantity}
                                      </p>
                                      <p className="text-base font-semibold text-primary-600">
                                        ₹
                                        {(
                                          parseFloat(ticketPrice) *
                                          totalQuantity
                                        ).toFixed(2)}
                                      </p>
                                    </>
                                  );
                                }
                                if (ticket?.rate_type === "pax") {
                                  let adultRaw = parseFloat(
                                    ticket?.adult_price || 0
                                  );
                                  let childRaw = parseFloat(
                                    ticket?.child_price || 0
                                  );
                                  if (
                                    adultRaw === 0 &&
                                    childRaw === 0 &&
                                    ticket?.full_rate
                                  ) {
                                    adultRaw = parseFloat(ticket.full_rate);
                                    childRaw = parseFloat(ticket.full_rate);
                                  }

                                  const adultAfterAdmin =
                                    applyAdminCharge(adultRaw, adm);
                                  const childAfterAdmin =
                                    applyAdminCharge(childRaw, adm);
                                  const adultPrice = applyDiscountOnAmount(
                                    adultAfterAdmin,
                                    pct
                                  );
                                  const childPrice = applyDiscountOnAmount(
                                    childAfterAdmin,
                                    pct
                                  );

                                  const adultTotal =
                                    adultPrice * tickets.adult;
                                  const childTotal =
                                    childPrice * tickets.child;
                                  const grandTotal = adultTotal + childTotal;

                                  return (
                                    <>
                                      <div className="text-sm text-gray-800 space-y-1">
                                        {tickets.adult > 0 && (
                                          <p>
                                            Adult: ₹
                                            {adultPrice.toFixed(2)} ×{" "}
                                            {tickets.adult}
                                          </p>
                                        )}
                                        {tickets.child > 0 && (
                                          <p>
                                            Child: ₹
                                            {childPrice.toFixed(2)} ×{" "}
                                            {tickets.child}
                                          </p>
                                        )}
                                      </div>
                                      <p className="text-base font-semibold text-primary-600">
                                        ₹{grandTotal.toFixed(2)}
                                      </p>
                                    </>
                                  );
                                }

                                return null;
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Attraction Details & Summary - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Attraction Details Card */}
              <div className="bg-white rounded-lg shadow border p-4">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-3">
                  {attractionData.cover_image || attractionData.thumb_image ? (
                    <Image
                      src={
                        attractionData.cover_image || attractionData.thumb_image
                      }
                      alt={attractionData.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <i className="fi fi-rr-image text-gray-400 text-4xl"></i>
                    </div>
                  )}
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-2">
                  {attractionData.name}
                </h3>
                {attractionData.attraction_category_master?.name && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 mb-3">
                    {attractionData.attraction_category_master.name}
                  </span>
                )}

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <i className="fi fi-rr-clock text-primary-500 text-sm"></i>
                    <span className="text-gray-700 text-sm">
                      Start Time:{" "}
                      {formatTimeTo12Hour(attractionData.start_time) || "TBD"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fi fi-rr-map-marker text-primary-500 text-sm"></i>
                    <span className="text-gray-700 text-sm">
                      {attractionData.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Summary Card */}
              <div className="bg-white rounded-lg shadow border p-4">
                <h3 className="text-base font-medium text-gray-800 mb-3">
                  Booking Summary
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Total Tickets:
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {getTotalSelectedTickets()}
                    </span>
                  </div>

                  {/* Guide Price - Only show when guide is selected */}
                  {needGuide && guideRate > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Guide Price:
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        ₹{guideRate}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subtotal (excl. taxes)</span>
                    <span className="text-sm font-medium text-gray-800">
                      ₹{subtotalForSummary.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">GST (18%)</span>
                    <span className="text-sm font-medium text-gray-800">₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Convenience (2%)</span>
                    <span className="text-sm font-medium text-gray-800">₹{convenienceAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-800">Total Amount:</span>
                    <span className="text-lg font-semibold text-primary-600">
                      ₹{grandTotalForSummary.toFixed(2)}
                    </span>
                  </div>
                </div>

                {currentStep === 1 ? (
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className="w-full"
                    disabled={getTotalSelectedTickets() === 0 || !selectedDate}
                  >
                    Continue to Review
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      Back to Selection
                    </Button>
                    <Button
                      onClick={handleProceedToPayment}
                      size="lg"
                      className="w-full"
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Booking Summary - Fixed above navigation on mobile */}
        <div className="lg:hidden fixed bottom-14 left-0 right-0 bg-white shadow-lg z-10">
          {/* Gray line separator */}
          <div className="h-px bg-gray-100"></div>
          {/* Summary Section */}
          <div className="flex items-center justify-between p-4">
            {/* Left side - Total Tickets */}
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-lg font-semibold text-gray-800">
                {getTotalSelectedTickets()}
              </p>
            </div>

            {/* Right side - Total Amount */}
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-lg font-semibold text-gray-800">
                ₹{grandTotalForSummary.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Gray line separator */}
          <div className="h-px bg-gray-100"></div>

          {/* Action Buttons */}
          <div className="p-4">
            {currentStep === 1 ? (
              <button
                onClick={handleContinue}
                disabled={getTotalSelectedTickets() === 0 || !selectedDate}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Continue to Review
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Back to selection
                </button>
                <button
                  onClick={handleProceedToPayment}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Proceed to Payment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom padding for mobile to prevent content from being hidden by fixed summary and navigation */}
        <div className="lg:hidden h-48"></div>
      </div>
    </div>
  );
};

export default AttractionBookingPage;
