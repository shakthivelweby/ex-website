"use client";

import { useState, useEffect } from "react";
import Popup from "@/components/Popup";
import { getDetailsForBooking } from "./service";

const TicketSelectionPopup = ({ isOpen, onClose, eventId, onContinue }) => {
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [expandedDate, setExpandedDate] = useState(null);
  const [expandedShow, setExpandedShow] = useState(null);

  // Fetch booking details when popup opens
  useEffect(() => {
    if (isOpen && eventId) {
      fetchBookingDetails();
    }
  }, [isOpen, eventId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await getDetailsForBooking(eventId);
      setBookingData(response.data);
    } catch (error) {
      console.error("Error fetching booking details:", error);
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
      // If removing all tickets for this show, just remove it
      const newSelectedTickets = { ...selectedTickets };
      delete newSelectedTickets[key];
      setSelectedTickets(newSelectedTickets);
    } else {
      // Add or update the selection
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
    if (onContinue) {
      onContinue(selectedTickets, getTotalPrice());
    }
    onClose();
  };

  if (loading) {
    return (
      <Popup
        isOpen={isOpen}
        onClose={onClose}
        title="Select Tickets"
        pos="bottom"
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </Popup>
    );
  }

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="Select Tickets"
      pos="bottom"
      draggable={true}
      className="w-full rounded-t-3xl"
      pannelStyle="h-[85vh]"
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {bookingData?.map((date) => (
            <div
              key={date.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Date Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleDateClick(date.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {formatDate(date.date)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {date.event_shows.length} show
                      {date.event_shows.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <i
                      className={`fi fi-rr-chevron-down text-gray-400 transition-transform ${
                        expandedDate === date.id ? "rotate-180" : ""
                      }`}
                    ></i>
                  </div>
                </div>
              </div>

              {/* Shows Section */}
              {expandedDate === date.id && (
                <div className="border-t border-gray-100">
                  {date.event_shows.map((show) => (
                    <div
                      key={show.id}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      {/* Show Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleShowClick(date.id, show.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">
                              {show.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatTime(show.start_time)} -{" "}
                              {formatTime(show.end_time)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <i
                              className={`fi fi-rr-chevron-down text-gray-400 transition-transform ${
                                expandedShow === `${date.id}-${show.id}`
                                  ? "rotate-180"
                                  : ""
                              }`}
                            ></i>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Types Section */}
                      {expandedShow === `${date.id}-${show.id}` && (
                        <div className="bg-gray-50 p-4 space-y-3">
                          {date.event_ticket_prices.map((ticketPrice) => {
                            const key = `${date.id}-${show.id}-${ticketPrice.event_ticket_type_id}`;
                            const isSelected = selectedTickets[key] > 0;
                            const ticketType =
                              ticketPrice.event_ticket_type
                                .event_ticket_type_master;

                            return (
                              <div
                                key={ticketPrice.id}
                                className={`bg-white rounded-lg p-3 border transition-colors ${
                                  isSelected
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h5
                                      className={`font-medium ${
                                        isSelected
                                          ? "text-green-800"
                                          : "text-gray-800"
                                      }`}
                                    >
                                      {ticketType.name}
                                    </h5>
                                    <div className="flex items-center gap-4 mt-1">
                                      <p
                                        className={`text-sm ${
                                          isSelected
                                            ? "text-green-600"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        ₹{ticketPrice.price}
                                      </p>
                                      {ticketPrice.discount > 0 && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                          {ticketPrice.discount}% off
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-500">
                                        {ticketPrice.available_slots} slots left
                                      </span>
                                    </div>
                                    {ticketPrice.description && (
                                      <div
                                        className="text-xs text-gray-600 mt-2"
                                        dangerouslySetInnerHTML={{
                                          __html: ticketPrice.description,
                                        }}
                                      />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          handleQuantityChange(
                                            date.id,
                                            show.id,
                                            ticketPrice.event_ticket_type_id,
                                            -1
                                          )
                                        }
                                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                                          isSelected
                                            ? "border-green-300 bg-green-100 text-green-600 hover:bg-green-200"
                                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                                        }`}
                                      >
                                        <i className="fi fi-rr-minus text-sm"></i>
                                      </button>
                                      <span
                                        className={`w-8 text-center font-medium ${
                                          isSelected
                                            ? "text-green-700"
                                            : "text-gray-700"
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
                                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                                          isSelected
                                            ? "border-green-300 bg-green-100 text-green-600 hover:bg-green-200"
                                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                      >
                                        <i className="fi fi-rr-plus text-sm"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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

      {/* Footer with Summary and Continue Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Tickets: </span>
            <span className="font-medium text-gray-800">
              {getTotalSelectedTickets()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total: </span>
            <span className="text-lg font-semibold text-gray-800">
              ₹{getTotalPrice().toFixed(2)}
            </span>
          </div>
          {/* Show selected tickets summary */}
          {getTotalSelectedTickets() > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Selected:</p>
              <div className="space-y-1">
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
                    <div
                      key={key}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-600">
                        {formatDate(date?.date)} - {show?.name} -{" "}
                        {ticketType?.name}
                      </span>
                      <span className="text-gray-800 font-medium">
                        {quantity} × ₹{ticketPrice?.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleContinue}
          disabled={getTotalSelectedTickets() === 0}
          className="w-full bg-primary-500 text-white py-3 px-6 rounded-full font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
        >
          Continue with {getTotalSelectedTickets()} ticket
          {getTotalSelectedTickets() !== 1 ? "s" : ""}
        </button>
      </div>
    </Popup>
  );
};

export default TicketSelectionPopup;
