"use client";

import { useState, useEffect } from "react";
import Popup from "@/components/Popup";
import { getDetailsForBooking } from "./service";

const TicketSelectionPopup = ({ isOpen, onClose, attractionId, onContinue }) => {
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [expandedTicketType, setExpandedTicketType] = useState(null);

  // Fetch booking details when popup opens
  useEffect(() => {
    if (isOpen && attractionId) {
      fetchBookingDetails();
    }
  }, [isOpen, attractionId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await getDetailsForBooking(attractionId);
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

  const handleTicketTypeClick = (ticketTypeId) => {
    if (expandedTicketType === ticketTypeId) {
      setExpandedTicketType(null);
    } else {
      setExpandedTicketType(ticketTypeId);
    }
  };

  const handleQuantityChange = (ticketTypeId, change) => {
    const currentQuantity = selectedTickets[ticketTypeId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);

    if (newQuantity === 0) {
      // If removing all tickets for this type, just remove it
      const newSelectedTickets = { ...selectedTickets };
      delete newSelectedTickets[ticketTypeId];
      setSelectedTickets(newSelectedTickets);
    } else {
      // Add or update the selection
      setSelectedTickets({
        ...selectedTickets,
        [ticketTypeId]: newQuantity,
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
    if (bookingData && bookingData.length > 0) {
      const dateData = bookingData[0]; // Use first (and only) date
      Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
        const ticketPrice = dateData.attraction_ticket_prices.find(
          (t) => t.attraction_ticket_type_id == ticketTypeId
        );

        if (ticketPrice && quantity > 0) {
          total += parseFloat(ticketPrice.price) * quantity;
        }
      });
    }
    return total;
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue(selectedTickets, getTotalPrice());
    }
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
          {/* Date Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Visit Date</h3>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                className="w-full px-4 py-3 pr-10 border !border-gray-300 rounded-lg focus:ring-none focus:outline-none text-gray-700 [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="Choose your visit date"
              />
              <i className="fi fi-rr-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>

          {/* Ticket Types */}
          {bookingData && bookingData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Available Tickets
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {bookingData[0].attraction_ticket_prices.length} ticket type
                  {bookingData[0].attraction_ticket_prices.length !== 1 ? "s" : ""} available
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {bookingData[0].attraction_ticket_prices.map((ticketPrice) => {
                  const ticketTypeId = ticketPrice.attraction_ticket_type_id;
                  const isSelected = selectedTickets[ticketTypeId] > 0;
                  const ticketType = ticketPrice.attraction_ticket_type.attraction_ticket_type_master;

                  return (
                    <div
                      key={ticketPrice.id}
                      className={`p-4 transition-colors ${
                        isSelected
                          ? "bg-green-50 border-l-4 border-green-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">
                            {ticketType.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {ticketType.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <p
                              className={`text-lg font-semibold ${
                                isSelected ? "text-green-700" : "text-gray-800"
                              }`}
                            >
                              ₹{ticketPrice.price}
                            </p>
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
                                handleQuantityChange(ticketTypeId, -1)
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
                                isSelected ? "text-green-700" : "text-gray-700"
                              }`}
                            >
                              {selectedTickets[ticketTypeId] || 0}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(ticketTypeId, 1)
                              }
                              disabled={
                                selectedTickets[ticketTypeId] >=
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
            </div>
          )}
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
                {Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
                  if (quantity === 0) return null;
                  const ticketPrice = bookingData?.[0]?.attraction_ticket_prices.find(
                    (t) => t.attraction_ticket_type_id == ticketTypeId
                  );
                  const ticketType = ticketPrice?.attraction_ticket_type.attraction_ticket_type_master;

                  return (
                    <div
                      key={ticketTypeId}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-600">
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
          disabled={getTotalSelectedTickets() === 0 || !selectedDate}
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
