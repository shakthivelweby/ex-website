"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getDetailsForBooking, getTicketPricesForDate } from "./service";

const Form = ({
  attractionDetails,
  isMobilePopup = false,
  enquireOnly = false,
  selectedTickets: propSelectedTickets,
  totalPrice: propTotalPrice,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState(
    propSelectedTickets || {}
  );
  const [totalPrice, setTotalPrice] = useState(propTotalPrice || 0);
  const [selectedDate, setSelectedDate] = useState(
    attractionDetails?.selectedDate || ""
  );
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [ticketPrices, setTicketPrices] = useState(
    attractionDetails?.dateSpecificPricing || []
  );

  // Function to check if a date should be disabled
  const isDateDisabled = (date) => {
    // Use local date format to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    // Check closeout_dates for date range restrictions
    if (
      attractionDetails?.closeoutDates &&
      attractionDetails.closeoutDates.length > 0
    ) {
      for (const closeout of attractionDetails.closeoutDates) {
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

  // Initialize with pre-loaded data on component mount
  useEffect(() => {
    if (
      attractionDetails?.dateSpecificPricing &&
      attractionDetails?.selectedDate
    ) {
      setTicketPrices(attractionDetails.dateSpecificPricing);
      setSelectedDate(attractionDetails.selectedDate);
    }
  }, []);

  // Update local state when props change
  useEffect(() => {
    if (propSelectedTickets) {
      setSelectedTickets(propSelectedTickets);
    }
    if (propTotalPrice) {
      setTotalPrice(propTotalPrice);
    }
  }, [propSelectedTickets, propTotalPrice]);

  const handleTicketSelection = () => {
    if (!isLogin()) {
      const event = new CustomEvent("showLogin");
      window.dispatchEvent(event);
      return;
    }

    // Store selected date in localStorage if available
    if (selectedDate) {
      localStorage.setItem(
        `attraction_${attractionDetails.id}_selectedDate`,
        selectedDate
      );
    } else {
      console.log("No date selected to store");
    }

    // Redirect to booking page
    router.push(`/attractions/${attractionDetails.id}/booking`);
  };

  const submitHandler = async () => {
    try {
      setIsLoading(true);

      if (!isLogin()) {
        const event = new CustomEvent("showLogin");
        window.dispatchEvent(event);
        setIsLoading(false);
        return;
      }

      if (Object.keys(selectedTickets).length === 0) {
        setIsLoading(false);
        return;
      }

      if (!selectedDate) {
        setIsLoading(false);
        return;
      }

      if (adultCount < 1) {
        alert("At least one adult is required");
        setIsLoading(false);
        return;
      }

      // Add your booking logic here
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedTicketsCount = () => {
    return Object.values(selectedTickets).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleAdultIncrement = () => {
    setAdultCount((prev) => prev + 1);
  };

  const handleAdultDecrement = () => {
    setAdultCount((prev) => Math.max(1, prev - 1));
  };

  const handleChildIncrement = () => {
    setChildCount((prev) => prev + 1);
  };

  const handleChildDecrement = () => {
    setChildCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className={`${isMobilePopup ? "pb-24" : ""} hidden lg:block`}>
      <div className="!bg-[#f7f7f7] rounded-xl p-3 shadow-sm">
        {/* Title and Categories */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <h1 className="text-xl font-medium text-gray-800 tracking-tight mb-3">
            {attractionDetails.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {attractionDetails.categories.map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#f7f7f7] text-gray-700"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Attraction Info Card */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                <i className="fi fi-rr-clock text-base text-primary-500"></i>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Opening & Closing Time</p>
                <p className="text-gray-700 font-medium">
                  {attractionDetails.openingTime} -
                  {attractionDetails.closingTime}
                </p>
              </div>
            </div>
          </div>
          {/* Date Selection */}
          <div className="mt-4">
            <h2 className="text-base font-medium text-gray-800 mb-3">
              Select Date
            </h2>
            <div className="relative">
              {isMobilePopup ? (
                // Inline calendar for mobile
                <div className="border-t border-gray-200 pt-3">
                  <DatePicker
                    selected={selectedDate ? new Date(selectedDate) : null}
                    onChange={async (date) => {
                      const dateString = date
                        ? date.toISOString().split("T")[0]
                        : "";
                      setSelectedDate(dateString);

                      // Call API when date is selected
                      if (dateString && attractionDetails?.id) {
                        try {
                          const response = await getTicketPricesForDate(
                            attractionDetails.id,
                            dateString
                          );
                          if (
                            response &&
                            response.data &&
                            response.data.ticket_prices
                          ) {
                            setTicketPrices(response.data.ticket_prices);
                          }
                        } catch (error) {
                          console.error(
                            "Error fetching date-specific pricing:",
                            error
                          );
                        }
                      }
                    }}
                    minDate={new Date()}
                    filterDate={(date) => !isDateDisabled(date)}
                    inline
                    placeholderText="Choose Date"
                    className="w-full"
                    dateFormat="dd/MM/yyyy"
                    renderDayContents={(day, date) => {
                      const isDisabled = isDateDisabled(date);
                      return (
                        <div
                          style={{ textAlign: "center", position: "relative" }}
                        >
                          <div>{day}</div>
                          {isDisabled && (
                            <div
                              style={{
                                fontSize: "0.65em",
                                color: "#EF4444",
                                position: "absolute",
                                left: 0,
                                top: "23px",
                                textAlign: "center",
                                width: "100%",
                                fontWeight: "500",
                              }}
                            >
                              N/A
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                </div>
              ) : (
                // Popup calendar for desktop
                <>
                  <DatePicker
                    minDate={new Date()}
                    filterDate={(date) => !isDateDisabled(date)}
                    placeholderText="Choose Date"
                    className="w-full h-12 px-4 pr-10 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-gray-700 cursor-pointer font-medium"
                    selected={selectedDate ? new Date(selectedDate) : null}
                    onChange={async (date) => {
                      const dateString = date
                        ? date.toISOString().split("T")[0]
                        : "";
                      setSelectedDate(dateString);

                      // Call API when date is selected
                      if (dateString && attractionDetails?.id) {
                        try {
                          const response = await getTicketPricesForDate(
                            attractionDetails.id,
                            dateString
                          );
                          if (
                            response &&
                            response.data &&
                            response.data.ticket_prices
                          ) {
                            setTicketPrices(response.data.ticket_prices);
                          }
                        } catch (error) {
                          console.error(
                            "Error fetching date-specific pricing:",
                            error
                          );
                        }
                      }
                    }}
                    showPopperArrow={false}
                    dateFormat="dd/MM/yyyy"
                    popperPlacement="bottom-start"
                    renderDayContents={(day, date) => {
                      const isDisabled = isDateDisabled(date);
                      return (
                        <div
                          style={{ textAlign: "center", position: "relative" }}
                        >
                          <div>{day}</div>
                          {isDisabled && (
                            <div
                              style={{
                                fontSize: "0.65em",
                                color: "#EF4444",
                                position: "absolute",
                                left: 0,
                                top: "23px",
                                textAlign: "center",
                                width: "100%",
                                fontWeight: "500",
                              }}
                            >
                              N/A
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    <i className="fi fi-rr-calendar text-lg"></i>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Adult and Child Quantity Selector - Only show when date is selected */}

        {/* Price and Booking Card */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">Entry fee</span>
            <span className="text-xl lg:text-2xl font-semibold text-gray-800">
              {(() => {
                // Get the first ticket from the API response
                const ticketData = ticketPrices?.[0];

                if (ticketData) {
                  if (ticketData.rate_type === "full") {
                    return ticketData.full_rate
                      ? `₹${ticketData.full_rate}`
                      : attractionDetails.price;
                  } else if (ticketData.rate_type === "pax") {
                    return ticketData.adult_price
                      ? `₹${ticketData.adult_price}`
                      : attractionDetails.price;
                  }
                }

                // Fallback to original logic if no ticket data
                return attractionDetails.rateType === "full"
                  ? attractionDetails.fullRate
                    ? `₹${attractionDetails.fullRate}`
                    : attractionDetails.price
                  : attractionDetails.rateType === "pax"
                  ? attractionDetails.adultPrice
                    ? `₹${attractionDetails.adultPrice}`
                    : attractionDetails.price
                  : attractionDetails.price;
              })()}
            </span>
          </div>

          {/* Selected Date Summary */}
          {selectedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-calendar text-blue-600"></i>
                <span className="text-sm font-medium text-blue-800">
                  Visit Date:{" "}
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {isMobilePopup ? (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10">
              {getSelectedTicketsCount() === 0 ? (
                <Button
                  onClick={handleTicketSelection}
                  size="lg"
                  className="w-full rounded-full"
                  disabled={!selectedDate}
                  icon={<i className="fi fi-rr-ticket ml-2"></i>}
                >
                  Select Tickets
                </Button>
              ) : (
                <Button
                  onClick={submitHandler}
                  size="lg"
                  className="w-full rounded-full"
                  isLoading={isLoading}
                  icon={<i className="fi fi-rr-arrow-right ml-2"></i>}
                >
                  {enquireOnly ? "Send Enquiry" : "Book Now"}
                </Button>
              )}
            </div>
          ) : (
            <>
              {getSelectedTicketsCount() === 0 ? (
                <Button
                  onClick={handleTicketSelection}
                  size="lg"
                  className="w-full rounded-full"
                  disabled={!selectedDate}
                  icon={<i className="fi fi-rr-ticket ml-2"></i>}
                >
                  Select Tickets
                </Button>
              ) : (
                <Button
                  onClick={submitHandler}
                  size="lg"
                  className="w-full rounded-full"
                  isLoading={isLoading}
                  icon={<i className="fi fi-rr-arrow-right ml-2"></i>}
                >
                  {enquireOnly ? "Send Enquiry" : "Book Now"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add padding at bottom when in popup to account for fixed button */}
      {isMobilePopup && <div className="h-20"></div>}
    </div>
  );
};

export default Form;
