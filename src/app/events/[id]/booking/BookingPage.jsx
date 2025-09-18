"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getDetailsForBooking } from "../service";
import { eventInfo } from "../service";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";

const BookingPage = ({ eventId }) => {
  const router = useRouter();
  const [eventData, setEventData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [expandedDate, setExpandedDate] = useState(null);
  const [expandedShow, setExpandedShow] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch both event and booking details
  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventResponse, bookingResponse] = await Promise.all([
        eventInfo(eventId),
        getDetailsForBooking(eventId),
      ]);

      setEventData(eventResponse.data);
      setBookingData(bookingResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDateClick = (dateId) => {
    if (expandedDate === dateId) {
      setExpandedDate(null);
      setExpandedShow(null);
    } else {
      setExpandedDate(dateId);
      setExpandedShow(null);
    }
  };

  const handleShowClick = (dateId, showId) => {
    const key = `${dateId}-${showId}`;
    if (expandedShow === key) {
      setExpandedShow(null);
    } else {
      setExpandedShow(key);
    }
  };

  const handleQuantityChange = (dateId, showId, ticketTypeId, change) => {
    const key = `${dateId}-${showId}-${ticketTypeId}`;
    const currentQuantity = selectedTickets[key] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);

    if (newQuantity === 0) {
      const newSelectedTickets = { ...selectedTickets };
      delete newSelectedTickets[key];
      setSelectedTickets(newSelectedTickets);
    } else {
      setSelectedTickets({
        ...selectedTickets,
        [key]: newQuantity,
      });
    }
  };

  const getTotalSelectedTickets = () => {
    return Object.values(selectedTickets).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
  };

  const getTotalPrice = () => {
    let total = 0;
    Object.entries(selectedTickets).forEach(([key, quantity]) => {
      const [dateId, showId, ticketTypeId] = key.split("-");
      const date = bookingData?.find((d) => d.id == dateId);
      const ticketPrice = date?.event_ticket_prices.find(
        (t) => t.event_ticket_type_id == ticketTypeId
      );

      if (ticketPrice && quantity > 0) {
        total += parseFloat(ticketPrice.price) * quantity;
      }
    });
    return total;
  };

  const handleContinue = () => {
    if (getTotalSelectedTickets() === 0) {
      alert("Please select at least one ticket to continue");
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
    let discountAmount = 0;

    Object.entries(selectedTickets).forEach(([key, quantity]) => {
      if (quantity === 0) return;

      const [dateId, showId, ticketTypeId] = key.split("-");
      const date = bookingData?.find((d) => d.id == dateId);
      const show = date?.event_shows.find((s) => s.id == showId);
      const ticketPrice = date?.event_ticket_prices.find(
        (t) => t.event_ticket_type_id == ticketTypeId
      );

      if (date && show && ticketPrice && quantity > 0) {
        const ticketTotal = parseFloat(ticketPrice.price) * quantity;
        totalAmount += ticketTotal;

        formattedTickets.push({
          event_ticket_type_id: parseInt(ticketTypeId),
          quantity: quantity,
          price: parseFloat(ticketPrice.price),
          total: ticketTotal,
        });
      }
    });

    // Get the first selected ticket to extract event_day_id and event_show_id
    const firstTicketKey = Object.keys(selectedTickets).find(
      (key) => selectedTickets[key] > 0
    );
    if (!firstTicketKey) {
      alert("Please select at least one ticket to continue");
      return;
    }

    const [dateId, showId] = firstTicketKey.split("-");

    // Prepare the booking data for checkout
    const apiBookingData = {
      event_id: eventId,
      event_day_id: parseInt(dateId),
      event_show_id: parseInt(showId),
      total_amount: totalAmount,
      discount_amount: discountAmount,
      bookingTickets: formattedTickets,
    };

    // Encode the data and redirect to checkout
    const encodedData = encodeURIComponent(JSON.stringify(apiBookingData));
    router.push(`/checkout/events?event_id=${eventId}&tickets=${encodedData}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!eventData || !bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Event not found
          </h2>
          <p className="text-gray-600">
            The event you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 ">
        {/* Mobile Event Details Header - Only visible on mobile */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  Book Tickets
                </h1>
                <p className="text-sm text-gray-600">{eventData.name}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-calendar text-primary-500 text-sm"></i>
                <span className="text-gray-700 text-sm">
                  {formatDate(eventData.starting_date)} -{" "}
                  {formatDate(eventData.ending_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-map-marker text-primary-500 text-sm"></i>
                <span className="text-gray-700 text-sm">
                  {eventData.location}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-clock text-primary-500 text-sm"></i>
                <span className="text-gray-700 text-sm">
                  {eventData.duration}
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
                    Choose your preferred date, show time, and ticket type
                  </p>
                </div>

                <div className="p-4 space-y-4">
                  {bookingData?.map((date) => (
                    <div
                      key={date.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {/* Date Header */}
                      <div
                        className="px-5 py-4 cursor-pointer hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent transition-all duration-200"
                        onClick={() => handleDateClick(date.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary-100 rounded-lg border border-primary-200">
                                <span className="text-xs font-bold text-primary-700 uppercase">
                                  {new Date(date.date).toLocaleDateString(
                                    "en-US",
                                    { month: "short" }
                                  )}
                                </span>
                                <span className="text-lg font-bold text-primary-800">
                                  {new Date(date.date).getDate()}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-gray-800">
                                  {formatDate(date.date)}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                                    <i className="fi fi-rr-play text-xs"></i>
                                    {date.event_shows.length} show
                                    {date.event_shows.length !== 1 ? "s" : ""}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {date.event_ticket_prices.length} ticket
                                    types
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                Starting from
                              </p>
                              <p className="text-sm font-semibold text-primary-600">
                                ₹
                                {Math.min(
                                  ...date.event_ticket_prices.map((t) =>
                                    parseFloat(t.price)
                                  )
                                )}
                              </p>
                            </div>
                            <div
                              className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-200 ${
                                expandedDate === date.id
                                  ? "bg-primary-100 text-primary-600"
                                  : "text-gray-400"
                              }`}
                            >
                              <i
                                className={`fi fi-br-angle-down flex items-center justify-center transition-transform duration-200 ${
                                  expandedDate === date.id ? "rotate-180" : ""
                                }`}
                              ></i>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shows Section */}
                      {expandedDate === date.id && (
                        <div className="border-t border-gray-100 bg-gray-50/50">
                          {date.event_shows.map((show, showIndex) => (
                            <div
                              key={show.id}
                              className={`${
                                showIndex !== date.event_shows.length - 1
                                  ? "border-b border-gray-100"
                                  : ""
                              }`}
                            >
                              {/* Show Header */}
                              <div
                                className="px-5 py-3 cursor-pointer hover:bg-white transition-colors duration-200"
                                onClick={() =>
                                  handleShowClick(date.id, show.id)
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center border border-orange-200">
                                        <i className="fi fi-rr-clock text-orange-600 text-sm"></i>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-semibold text-gray-800">
                                          {show.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200">
                                            {formatTime(show.start_time)} -{" "}
                                            {formatTime(show.end_time)}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {date.event_ticket_prices.length}{" "}
                                            options
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                                        expandedShow === `${date.id}-${show.id}`
                                          ? "bg-primary-100 text-primary-600"
                                          : "bg-gray-100 text-gray-400"
                                      }`}
                                    >
                                      <i
                                        className={`ffi fi-br-angle-down flex items-center justify-center text-xs transition-transform duration-200 ${
                                          expandedShow ===
                                          `${date.id}-${show.id}`
                                            ? "rotate-180"
                                            : ""
                                        }`}
                                      ></i>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Ticket Types Section */}
                              {expandedShow === `${date.id}-${show.id}` && (
                                <div className="bg-white border-t border-gray-100">
                                  {date.event_ticket_prices.map(
                                    (ticketPrice, index) => {
                                      const key = `${date.id}-${show.id}-${ticketPrice.event_ticket_type_id}`;
                                      const isSelected =
                                        selectedTickets[key] > 0;
                                      const ticketType =
                                        ticketPrice.event_ticket_type
                                          .event_ticket_type_master;

                                      return (
                                        <div
                                          key={ticketPrice.id}
                                          className={`${
                                            isSelected
                                              ? "bg-primary-50 border-primary-200"
                                              : "bg-white hover:bg-gray-50"
                                          } border-l-4 border-transparent transition-all duration-200 ${
                                            index !==
                                            date.event_ticket_prices.length - 1
                                              ? "border-b border-gray-100"
                                              : ""
                                          }`}
                                        >
                                          <div className="p-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
                                                    {ticketType.name}
                                                  </h5>
                                                  {ticketPrice.discount > 0 && (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                                      {ticketPrice.discount}%
                                                      OFF
                                                    </span>
                                                  )}
                                                </div>

                                                {/* Price and Slots */}
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
                                                      ₹{ticketPrice.price}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    <i className="fi fi-rr-ticket text-xs text-gray-400"></i>
                                                    <span className="text-xs text-gray-500">
                                                      {
                                                        ticketPrice.available_slots
                                                      }{" "}
                                                      slots
                                                    </span>
                                                  </div>
                                                </div>

                                                {/* Description */}
                                                {ticketPrice.description && (
                                                  <div
                                                    className="text-xs text-gray-600 leading-relaxed"
                                                    dangerouslySetInnerHTML={{
                                                      __html:
                                                        ticketPrice.description,
                                                    }}
                                                  />
                                                )}
                                              </div>

                                              {/* Right Side - Quantity Selector */}
                                              <div className="flex items-center justify-center sm:justify-end">
                                                <div
                                                  className={`flex items-center gap-2 p-2 rounded-lg ${
                                                    isSelected
                                                      ? "bg-primary-100 border border-primary-200"
                                                      : "bg-gray-100 border border-gray-200"
                                                  }`}
                                                >
                                                  <button
                                                    onClick={() =>
                                                      handleQuantityChange(
                                                        date.id,
                                                        show.id,
                                                        ticketPrice.event_ticket_type_id,
                                                        -1
                                                      )
                                                    }
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                                      isSelected
                                                        ? "bg-primary-200 text-primary-700 hover:bg-primary-300"
                                                        : "bg-white text-gray-600 hover:bg-gray-200"
                                                    } border-0 shadow-sm`}
                                                  >
                                                    <i className="fi fi-rr-minus text-xs"></i>
                                                  </button>

                                                  <span
                                                    className={`w-8 text-center font-bold text-sm ${
                                                      isSelected
                                                        ? "text-primary-800"
                                                        : "text-gray-800"
                                                    }`}
                                                  >
                                                    {selectedTickets[key] || 0}
                                                  </span>

                                                  <button
                                                    onClick={() =>
                                                      handleQuantityChange(
                                                        date.id,
                                                        show.id,
                                                        ticketPrice.event_ticket_type_id,
                                                        1
                                                      )
                                                    }
                                                    disabled={
                                                      selectedTickets[key] >=
                                                      ticketPrice.maximum_allowed_bookings_per_user
                                                    }
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                                      isSelected
                                                        ? "bg-primary-200 text-primary-700 hover:bg-primary-300"
                                                        : "bg-white text-gray-600 hover:bg-gray-200"
                                                    } border-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                                                  >
                                                    <i className="fi fi-rr-plus text-xs"></i>
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
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

                <div className="p-4 space-y-3">
                  {Object.entries(selectedTickets).map(([key, quantity]) => {
                    if (quantity === 0) return null;
                    const [dateId, showId, ticketTypeId] = key.split("-");
                    const date = bookingData?.find((d) => d.id == dateId);
                    const show = date?.event_shows.find((s) => s.id == showId);
                    const ticketPrice = date?.event_ticket_prices.find(
                      (t) => t.event_ticket_type_id == ticketTypeId
                    );
                    const ticketType =
                      ticketPrice?.event_ticket_type.event_ticket_type_master;

                    return (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-800">
                              {formatDate(date?.date)} - {show?.name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {ticketType?.name} × {quantity}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTime(show?.start_time)} -{" "}
                              {formatTime(show?.end_time)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-800">
                              ₹{ticketPrice?.price} × {quantity}
                            </p>
                            <p className="text-base font-semibold text-primary-600">
                              ₹
                              {(
                                parseFloat(ticketPrice?.price) * quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Event Details & Summary - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Event Details Card */}
              <div className="bg-white rounded-lg shadow border p-4">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-3">
                  <Image
                    src={eventData.cover_image}
                    alt={eventData.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-2">
                  {eventData.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {eventData.event_category_master?.name}
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <i className="fi fi-rr-calendar text-primary-500 text-sm"></i>
                    <span className="text-gray-700 text-sm">
                      {formatDate(eventData.starting_date)} -{" "}
                      {formatDate(eventData.ending_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fi fi-rr-map-marker text-primary-500 text-sm"></i>
                    <span className="text-gray-700 text-sm">
                      {eventData.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fi fi-rr-clock text-primary-500 text-sm"></i>
                    <span className="text-gray-700 text-sm">
                      {eventData.duration}
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
                    disabled={getTotalSelectedTickets() === 0}
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

        {/* Mobile Booking Summary - Fixed at bottom on mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-lg font-semibold text-gray-800">
                {getTotalSelectedTickets()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-primary-600">
                ₹{getTotalPrice().toFixed(2)}
              </p>
            </div>
          </div>
          {currentStep === 1 ? (
            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full"
              disabled={getTotalSelectedTickets() === 0}
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

        {/* Bottom padding for mobile to prevent content from being hidden by fixed summary */}
        <div className="lg:hidden h-32"></div>
      </div>
    </div>
  );
};

export default BookingPage;
