"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { attractionInfo, getAttractionTickets } from "../service";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";

const AttractionBookingPage = ({ attractionId }) => {
  const router = useRouter();
  const [attractionData, setAttractionData] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [adultChildTickets, setAdultChildTickets] = useState({});
  const [expandedTicketType, setExpandedTicketType] = useState(null);

  // Fetch attraction and ticket details
  useEffect(() => {
    fetchData();
  }, [attractionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attractionResponse, ticketResponse] = await Promise.all([
        attractionInfo(attractionId),
        getAttractionTickets(attractionId),
      ]);

      setAttractionData(attractionResponse.data);
      setTicketData(ticketResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

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
      const ticket = ticketData?.find((t) => t.id == ticketTypeId);
      if (ticket && (tickets.adult > 0 || tickets.child > 0)) {
        // For now, use same price for adult and child
        // You can modify this to have different prices for adult/child
        total += parseFloat(ticket.price) * (tickets.adult + tickets.child);
      }
    });

    return total;
  };

  const handleContinue = () => {
    if (getTotalSelectedTickets() === 0) {
      alert("Please select at least one ticket to continue");
      return;
    }
    if (!selectedDate) {
      alert("Please select a visit date");
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleProceedToPayment = () => {
    if (!isLogin()) {
      const event = new CustomEvent("showLogin");
      window.dispatchEvent(event);
      return;
    }

    // Format the selected tickets data according to API requirements
    const formattedTickets = [];
    let totalAmount = 0;

    // Process adult/child tickets
    Object.entries(adultChildTickets).forEach(([ticketTypeId, tickets]) => {
      if (tickets.adult === 0 && tickets.child === 0) return;

      const ticket = ticketData?.find((t) => t.id == ticketTypeId);
      if (ticket && (tickets.adult > 0 || tickets.child > 0)) {
        const totalQuantity = tickets.adult + tickets.child;
        const ticketTotal = parseFloat(ticket.price) * totalQuantity;
        totalAmount += ticketTotal;

        formattedTickets.push({
          attraction_ticket_type_id: parseInt(ticketTypeId),
          quantity: totalQuantity,
          adult_quantity: tickets.adult,
          child_quantity: tickets.child,
          price: parseFloat(ticket.price),
          total: ticketTotal,
        });
      }
    });

    // Prepare the booking data for checkout
    const apiBookingData = {
      attraction_id: attractionId,
      visit_date: selectedDate,
      total_amount: totalAmount,
      bookingTickets: formattedTickets,
    };

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

  if (!attractionData || !ticketData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Attraction not found
          </h2>
          <p className="text-gray-600">
            The attraction you're looking for doesn't exist.
          </p>
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
                <Image
                  src={attractionData.cover_image || attractionData.thumb_image}
                  alt={attractionData.name}
                  fill
                  className="object-cover"
                />
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
                  {attractionData.opening_hours || "TBD"}
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
                <span className="text-gray-700 text-sm">
                  {attractionData.attraction_category_master?.name ||
                    "Attraction"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          {/* Left Column - Ticket Selection */}
          <div className="lg:col-span-2">
            {currentStep === 1 ? (
              <div className="bg-white rounded-lg shadow border">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-base font-medium text-gray-800">
                    Select Your Tickets
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose your preferred ticket type and visit date
                  </p>
                </div>

                <div className="p-4 space-y-6">
                  {/* Date Selection */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-3">
                      Select Visit Date
                    </h3>
                    <div className="relative">
                      <input
                        type="date"
                        name="visitDate"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={getMinDate()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-none focus:outline-none focus:border-primary-300 text-gray-700 appearance-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Ticket Types */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-3">
                      Available Tickets
                    </h3>
                    <div className="space-y-3">
                      {ticketData?.map((ticket, index) => {
                        const isSelected =
                          adultChildTickets[ticket.id]?.adult > 0 ||
                          adultChildTickets[ticket.id]?.child > 0;
                        const isExpanded = expandedTicketType === ticket.id;
                        return (
                          <div
                            key={ticket.id}
                            className={`${
                              isSelected
                                ? "bg-primary-50 border-primary-200"
                                : "bg-white hover:bg-gray-50"
                            } border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
                              index !== ticketData.length - 1 ? "border-b" : ""
                            }`}
                          >
                            <div
                              className="flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                              onClick={() => handleTicketTypeClick(ticket.id)}
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
                                    {ticket.name}
                                  </h5>
                                  {ticket.discount > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                      {ticket.discount}% OFF
                                    </span>
                                  )}
                                </div>

                                {/* Price and Description */}
                                <div className="flex items-center gap-4 mb-2">
                                  <div className="flex items-baseline gap-1">
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
                                      ₹{ticket.price}
                                    </span>
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
                                      Over 18+
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        handleAdultChildQuantityChange(
                                          ticket.id,
                                          "adult",
                                          -1
                                        )
                                      }
                                      disabled={
                                        (adultChildTickets[ticket.id]?.adult ||
                                          0) <= 0
                                      }
                                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <i className="fi fi-rr-minus text-xs"></i>
                                    </button>
                                    <div className="w-12 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-sm font-medium text-gray-800">
                                      {adultChildTickets[ticket.id]?.adult || 0}
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleAdultChildQuantityChange(
                                          ticket.id,
                                          "adult",
                                          1
                                        )
                                      }
                                      disabled={
                                        (adultChildTickets[ticket.id]?.adult ||
                                          0) >=
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
                                      Under 18
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        handleAdultChildQuantityChange(
                                          ticket.id,
                                          "child",
                                          -1
                                        )
                                      }
                                      disabled={
                                        (adultChildTickets[ticket.id]?.child ||
                                          0) <= 0
                                      }
                                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <i className="fi fi-rr-minus text-xs"></i>
                                    </button>
                                    <div className="w-12 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-sm font-medium text-gray-800">
                                      {adultChildTickets[ticket.id]?.child || 0}
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleAdultChildQuantityChange(
                                          ticket.id,
                                          "child",
                                          1
                                        )
                                      }
                                      disabled={
                                        (adultChildTickets[ticket.id]?.child ||
                                          0) >=
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
                      })}
                    </div>
                  </div>
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
                      const ticket = ticketData?.find(
                        (t) => t.id == ticketTypeId
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
                                {ticket?.name}
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
                              <p className="text-sm text-gray-800">
                                ₹{ticket?.price} × {totalQuantity}
                              </p>
                              <p className="text-base font-semibold text-primary-600">
                                ₹
                                {(
                                  parseFloat(ticket?.price) * totalQuantity
                                ).toFixed(2)}
                              </p>
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
                  <Image
                    src={
                      attractionData.cover_image || attractionData.thumb_image
                    }
                    alt={attractionData.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-2">
                  {attractionData.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {attractionData.attraction_category_master?.name ||
                    "Attraction"}
                </p>

                <div className="space-y-1.5 text-sm">
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
                    <span className="text-gray-700 text-sm">
                      {attractionData.duration || "TBD"}
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-lg font-semibold text-primary-600">
                      ₹{getTotalPrice().toFixed(2)}
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
                ₹{getTotalPrice().toFixed(0)}
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
