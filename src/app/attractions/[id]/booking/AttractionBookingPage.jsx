"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  attractionInfo,
  getAttractionTickets,
  getTicketPricesForDate,
} from "../service";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";

const AttractionBookingPage = ({
  attractionId,
  closeoutDates = [],
  guideRate = 0,
}) => {
  const router = useRouter();
  const [attractionData, setAttractionData] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Fetch attraction and ticket details
  useEffect(() => {
    fetchData();
  }, [attractionId]);

  // Check for selected date from localStorage (if coming from Form.jsx)
  useEffect(() => {
    const storedDate = localStorage.getItem(
      `attraction_${attractionId}_selectedDate`
    );
    // console.log("Checking localStorage for date:", storedDate);
    // console.log("Attraction ID:", attractionId);
    if (storedDate) {
      //console.log("Setting selected date from localStorage:", storedDate);
      setSelectedDate(storedDate);
    }
  }, [attractionId]);

  useEffect(() => {
    console.log("Selected date:", selectedDate);

    // Call API when date changes to get date-specific pricing
    if (selectedDate && attractionId) {
      console.log(
        "Date changed, fetching date-specific pricing for:",
        selectedDate
      );
      fetchDateSpecificPricing();
    }
  }, [selectedDate]);

  const fetchDateSpecificPricing = async () => {
    try {
      console.log(
        "Fetching date-specific pricing for attraction:",
        attractionId,
        "date:",
        selectedDate
      );
      const response = await getTicketPricesForDate(attractionId, selectedDate);

      if (response && response.data && response.data.ticket_prices) {
        console.log("Date-specific pricing response:", response.data);

        // Transform the new API response structure to match the expected format
        const transformedData = {
          attraction_ticket_type_prices: response.data.ticket_prices.map(
            (ticket) => ({
              id: ticket.ticket_type_id,
              attraction_ticket_type_id: ticket.attraction_ticket_type_id,
              attraction_ticket_type: {
                attraction_ticket_type_master: {
                  name: ticket.ticket_type_name,
                },
              },
              adult_price: ticket.adult_price,
              child_price: ticket.child_price,
              full_rate: ticket.full_rate,
              rate_type: ticket.rate_type,
              guide_rate: ticket.guide_rate,
              discount: ticket.discount,
              description: ticket.description,
              child_description: ticket.child_description,
              maximum_allowed_bookings_per_user:
                ticket.maximum_allowed_bookings_per_user,
              pricing_type: ticket.pricing_type,
              seasonal_period: ticket.seasonal_period,
            })
          ),
        };

        setTicketData(transformedData);

        // Also update attraction data with image and other details from API response
        if (response.data.attraction) {
          setAttractionData((prevData) => {
            const updatedAttractionData = {
              ...prevData,
              id: response.data.attraction.id || prevData.id,
              name: response.data.attraction.name || prevData.name,
              location: response.data.attraction.location || prevData.location,
              cover_image: (() => {
                const coverImage =
                  response.data.attraction.cover_image ||
                  response.data.attraction.thumb_image;
                console.log("Raw cover_image URL:", coverImage);

                // Clean up the URL if it has double paths
                if (
                  coverImage &&
                  coverImage.includes(
                    "http://127.0.0.1:8000/images/attraction/http://127.0.0.1:8000/"
                  )
                ) {
                  const cleanedUrl = coverImage.replace(
                    "http://127.0.0.1:8000/images/attraction/http://127.0.0.1:8000/",
                    "http://127.0.0.1:8000/"
                  );
                  console.log("Cleaned cover_image URL:", cleanedUrl);
                  return cleanedUrl;
                }

                return coverImage;
              })(),
              start_time:
                response.data.attraction.start_time || prevData.start_time,
              end_time: response.data.attraction.end_time || prevData.end_time,
              description:
                response.data.attraction.description || prevData.description,
            };
            console.log(
              "Updated attraction data with cover_image:",
              updatedAttractionData
            );
            return updatedAttractionData;
          });
        }

        console.log(
          "Ticket data updated with date-specific pricing:",
          transformedData
        );
      }
    } catch (error) {
      console.error("Error fetching date-specific pricing:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching booking details for attraction:", attractionId);

      if (!attractionId) {
        console.error("No attraction ID provided");
        setLoading(false);
        return;
      }

      // Disabled: const bookingResponse = await getDetailsForBooking(attractionId);
      // console.log("Booking details response:", bookingResponse);

      // Set default attraction data (API call disabled)
      setAttractionData({
        id: attractionId,
        name: "Attraction",
        location: "",
        cover_image: null,
        start_time: "09:00",
        end_time: "18:00",
        attraction_category_master: null,
        duration: "TBD",
      });

      // Set empty ticket data initially (will be populated when date is selected)
      setTicketData(null);
    } catch (error) {
      console.error("Error fetching booking data:", error);
      setAttractionData(null);
      setTicketData(null);
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
    console.log("handleAdultChildQuantityChange called:", {
      ticketTypeId,
      type,
      change,
    });
    const currentTickets = adultChildTickets[ticketTypeId] || {
      adult: 0,
      child: 0,
    };
    const newQuantity = Math.max(0, currentTickets[type] + change);
    console.log(
      "Current tickets:",
      currentTickets,
      "New quantity:",
      newQuantity
    );

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
    console.log("getTotalPrice - adultChildTickets:", adultChildTickets);
    console.log("getTotalPrice - ticketData:", ticketData);

    // Calculate adult/child tickets
    Object.entries(adultChildTickets).forEach(([ticketTypeId, tickets]) => {
      const ticket = ticketData?.attraction_ticket_type_prices?.find(
        (t) => t.attraction_ticket_type_id == ticketTypeId
      );
      console.log(
        `getTotalPrice - ticketTypeId: ${ticketTypeId}, tickets:`,
        tickets,
        "found ticket:",
        ticket
      );
      if (ticket && (tickets.adult > 0 || tickets.child > 0)) {
        if (ticket.rate_type === "full") {
          // Use full_rate for both adults and children
          let ticketPrice = ticket.full_rate;
          if (ticket.discount > 0) {
            ticketPrice =
              ticket.full_rate - (ticket.full_rate * ticket.discount) / 100;
          }
          const subtotal =
            parseFloat(ticketPrice) * (tickets.adult + tickets.child);
          console.log(
            `getTotalPrice - full_rate calculation: ${ticketPrice} * ${
              tickets.adult + tickets.child
            } = ${subtotal}`
          );
          total += subtotal;
        } else if (ticket.rate_type === "pax") {
          // Use separate adult_price and child_price
          let adultPrice = parseFloat(ticket.adult_price || 0);
          let childPrice = parseFloat(ticket.child_price || 0);

          // If adult_price or child_price is not available, fallback to full_rate
          if (adultPrice === 0 && childPrice === 0 && ticket.full_rate) {
            adultPrice = parseFloat(ticket.full_rate);
            childPrice = parseFloat(ticket.full_rate);
          }

          // Apply discount if exists
          if (ticket.discount > 0) {
            adultPrice = adultPrice - (adultPrice * ticket.discount) / 100;
            childPrice = childPrice - (childPrice * ticket.discount) / 100;
          }

          const subtotal =
            adultPrice * tickets.adult + childPrice * tickets.child;
          console.log(
            `getTotalPrice - pax calculation: adult(${adultPrice} * ${tickets.adult}) + child(${childPrice} * ${tickets.child}) = ${subtotal}`
          );
          total += subtotal;
        }
      }
    });

    // Add guide price if guide is selected
    if (needGuide && guideRate > 0) {
      console.log(`getTotalPrice - adding guide rate: ${guideRate}`);
      total += parseFloat(guideRate);
    }

    console.log(`getTotalPrice - final total: ${total}`);
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

  const handleProceedToPayment = () => {
    if (!isLogin()) {
      const event = new CustomEvent("showLogin");
      window.dispatchEvent(event);
      return;
    }

    console.log(
      "handleProceedToPayment - adultChildTickets:",
      adultChildTickets
    );
    console.log("handleProceedToPayment - ticketData:", ticketData);

    // Format the selected tickets data according to API requirements
    const formattedTickets = [];
    let totalAmount = 0;

    // Process adult/child tickets
    Object.entries(adultChildTickets).forEach(([ticketTypeId, tickets]) => {
      if (tickets.adult === 0 && tickets.child === 0) return;

      const ticket = ticketData?.attraction_ticket_type_prices?.find(
        (t) => t.attraction_ticket_type_id == ticketTypeId
      );
      console.log(
        `handleProceedToPayment - ticketTypeId: ${ticketTypeId}, tickets:`,
        tickets,
        "found ticket:",
        ticket
      );
      if (ticket && (tickets.adult > 0 || tickets.child > 0)) {
        const totalQuantity = tickets.adult + tickets.child;

        // Calculate offer price (discounted price) if discount exists
        let ticketPrice;
        if (ticket.rate_type === "full") {
          ticketPrice = ticket.full_rate;
          if (ticket.discount > 0) {
            ticketPrice =
              ticket.full_rate - (ticket.full_rate * ticket.discount) / 100;
          }
          console.log(
            `handleProceedToPayment - full_rate calculation: ${
              ticket.full_rate
            } (discount: ${
              ticket.discount
            }%) = ${ticketPrice} * ${totalQuantity} = ${
              ticketPrice * totalQuantity
            }`
          );
        } else if (ticket.rate_type === "pax") {
          // For pax tickets, we need to calculate based on adult/child quantities
          let adultPrice = parseFloat(ticket.adult_price || 0);
          let childPrice = parseFloat(ticket.child_price || 0);

          // If adult_price or child_price is not available, fallback to full_rate
          if (adultPrice === 0 && childPrice === 0 && ticket.full_rate) {
            adultPrice = parseFloat(ticket.full_rate);
            childPrice = parseFloat(ticket.full_rate);
          }

          // Apply discount if exists
          if (ticket.discount > 0) {
            adultPrice = adultPrice - (adultPrice * ticket.discount) / 100;
            childPrice = childPrice - (childPrice * ticket.discount) / 100;
          }

          // Calculate total for this ticket type
          const adultTotal = adultPrice * tickets.adult;
          const childTotal = childPrice * tickets.child;
          const ticketTotal = adultTotal + childTotal;
          console.log(
            `handleProceedToPayment - pax calculation: adult(${adultPrice} * ${tickets.adult}) + child(${childPrice} * ${tickets.child}) = ${ticketTotal}`
          );
          totalAmount += ticketTotal;

          formattedTickets.push({
            id: parseInt(ticketTypeId),
            attraction_ticket_type_id: parseInt(ticketTypeId),
            quantity: totalQuantity,
            adult_quantity: tickets.adult,
            child_quantity: tickets.child,
            adult_price: adultPrice,
            child_price: childPrice,
            unit_price: adultPrice, // Add required unit_price field
            total_price: ticketTotal, // Add required total_price field
            total: ticketTotal,
          });
          return; // Skip the rest of the logic for pax tickets
        }

        const ticketTotal = parseFloat(ticketPrice) * totalQuantity;
        console.log(
          `handleProceedToPayment - adding full_rate total: ${ticketTotal}`
        );
        totalAmount += ticketTotal;

        formattedTickets.push({
          id: parseInt(ticketTypeId),
          attraction_ticket_type_id: parseInt(ticketTypeId),
          quantity: totalQuantity,
          adult_quantity: tickets.adult,
          child_quantity: tickets.child,
          price: parseFloat(ticketPrice),
          unit_price: parseFloat(ticketPrice), // Add required unit_price field
          total_price: ticketTotal, // Add required total_price field
          total: ticketTotal,
        });
      }
    });

    // Add guide rate if needed
    if (needGuide && guideRate > 0) {
      console.log(`handleProceedToPayment - adding guide rate: ${guideRate}`);
      totalAmount += parseFloat(guideRate);
    }

    console.log(`handleProceedToPayment - final totalAmount: ${totalAmount}`);
    console.log(`handleProceedToPayment - formattedTickets:`, formattedTickets);

    // Prepare the booking data for checkout
    const apiBookingData = {
      attraction_id: attractionId,
      visit_date: selectedDate,
      total_amount: totalAmount,
      bookingTickets: formattedTickets,
      need_guide: needGuide,
      guide_rate: needGuide ? guideRate : 0,
    };

    console.log(
      `handleProceedToPayment - final apiBookingData:`,
      apiBookingData
    );

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
                {/* <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-base font-medium text-gray-800">
                    Select Your Tickets
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose your preferred ticket type and visit date
                  </p>
                </div> */}

                <div className="p-4 space-y-6">
                  {/* Date Selection */}

                  {/* <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-3">
                      Select Visit Date
                    </h3>



                    <div className="relative">
                      {isMobile ? (
                        // Inline calendar for mobile
                        <div className="border-t border-gray-200 pt-3">
                          <DatePicker
                            selected={
                              selectedDate ? new Date(selectedDate) : null
                            }
                            onChange={async (date) => {
                              const dateString = date
                                ? date.toISOString().split("T")[0]
                                : "";
                              setSelectedDate(dateString);

                              // Call API when date is selected
                              if (dateString && attractionId) {
                                console.log(
                                  "Mobile Date selected, calling API for:",
                                  dateString
                                );
                                try {
                                  const response = await getTicketPricesForDate(
                                    attractionId,
                                    dateString
                                  );
                                  if (response && response.data && response.data.ticket_prices) {
                                    // Transform the new API response structure to match the expected format
                                    const transformedData = {
                                      attraction_ticket_type_prices: response.data.ticket_prices.map(ticket => ({
                                        id: ticket.ticket_type_id,
                                        attraction_ticket_type_id: ticket.attraction_ticket_type_id,
                                        attraction_ticket_type: {
                                          attraction_ticket_type_master: {
                                            name: ticket.ticket_type_name
                                          }
                                        },
                                        adult_price: ticket.adult_price,
                                        child_price: ticket.child_price,
                                        full_rate: ticket.full_rate,
                                        rate_type: ticket.rate_type,
                                        guide_rate: ticket.guide_rate,
                                        discount: ticket.discount,
                                        description: ticket.description,
                                        child_description: ticket.child_description,
                                        maximum_allowed_bookings_per_user: ticket.maximum_allowed_bookings_per_user,
                                        pricing_type: ticket.pricing_type,
                                        seasonal_period: ticket.seasonal_period
                                      }))
                                    };
                                    setTicketData(transformedData);
                                    
                                    // Also update attraction data with image and other details from API response
                                    if (response.data.attraction) {
                                      setAttractionData(prevData => {
                                        const updatedAttractionData = {
                                          ...prevData,
                                          id: response.data.attraction.id || prevData.id,
                                          name: response.data.attraction.name || prevData.name,
                                          location: response.data.attraction.location || prevData.location,
                                          cover_image: (() => {
                                            const coverImage = response.data.attraction.cover_image || response.data.attraction.thumb_image;
                                            console.log("Raw cover_image URL:", coverImage);
                                            
                                            // Clean up the URL if it has double paths
                                            if (coverImage && coverImage.includes('http://127.0.0.1:8000/images/attraction/http://127.0.0.1:8000/')) {
                                              const cleanedUrl = coverImage.replace('http://127.0.0.1:8000/images/attraction/http://127.0.0.1:8000/', 'http://127.0.0.1:8000/');
                                              console.log("Cleaned cover_image URL:", cleanedUrl);
                                              return cleanedUrl;
                                            }
                                            
                                            return coverImage;
                                          })(),
                                          start_time: response.data.attraction.start_time || prevData.start_time,
                                          end_time: response.data.attraction.end_time || prevData.end_time,
                                          description: response.data.attraction.description || prevData.description,
                                        };
                                        console.log("Mobile - Updated attraction data with cover_image:", updatedAttractionData);
                                        return updatedAttractionData;
                                      });
                                    }
                                    
                                    console.log(
                                      "Mobile Ticket data updated with date-specific pricing:",
                                      transformedData
                                    );
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
                                  style={{
                                    textAlign: "center",
                                    position: "relative",
                                  }}
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
                            className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-gray-700 cursor-pointer font-medium"
                            selected={
                              selectedDate ? new Date(selectedDate) : null
                            }
                            onChange={async (date) => {
                              const dateString = date
                                ? date.toISOString().split("T")[0]
                                : "";
                              setSelectedDate(dateString);

                              // Call API when date is selected
                              if (dateString && attractionId) {
                                console.log(
                                  "Desktop Date selected, calling API for:",
                                  dateString
                                );
                                try {
                                  const response = await getTicketPricesForDate(
                                    attractionId,
                                    dateString
                                  );
                                  if (response && response.data && response.data.ticket_prices) {
                                    // Transform the new API response structure to match the expected format
                                    const transformedData = {
                                      attraction_ticket_type_prices: response.data.ticket_prices.map(ticket => ({
                                        id: ticket.ticket_type_id,
                                        attraction_ticket_type_id: ticket.attraction_ticket_type_id,
                                        attraction_ticket_type: {
                                          attraction_ticket_type_master: {
                                            name: ticket.ticket_type_name
                                          }
                                        },
                                        adult_price: ticket.adult_price,
                                        child_price: ticket.child_price,
                                        full_rate: ticket.full_rate,
                                        rate_type: ticket.rate_type,
                                        guide_rate: ticket.guide_rate,
                                        discount: ticket.discount,
                                        description: ticket.description,
                                        child_description: ticket.child_description,
                                        maximum_allowed_bookings_per_user: ticket.maximum_allowed_bookings_per_user,
                                        pricing_type: ticket.pricing_type,
                                        seasonal_period: ticket.seasonal_period
                                      }))
                                    };
                                    setTicketData(transformedData);
                                    
                                    // Also update attraction data with image and other details from API response
                                    if (response.data.attraction) {
                                      setAttractionData(prevData => {
                                        const updatedAttractionData = {
                                          ...prevData,
                                          id: response.data.attraction.id || prevData.id,
                                          name: response.data.attraction.name || prevData.name,
                                          location: response.data.attraction.location || prevData.location,
                                          cover_image: (() => {
                                            const coverImage = response.data.attraction.cover_image || response.data.attraction.thumb_image;
                                            console.log("Raw cover_image URL:", coverImage);
                                            
                                            // Clean up the URL if it has double paths
                                            if (coverImage && coverImage.includes('http://127.0.0.1:8000/images/attraction/http://127.0.0.1:8000/')) {
                                              const cleanedUrl = coverImage.replace('http://127.0.0.1:8000/images/attraction/http://127.0.0.1:8000/', 'http://127.0.0.1:8000/');
                                              console.log("Cleaned cover_image URL:", cleanedUrl);
                                              return cleanedUrl;
                                            }
                                            
                                            return coverImage;
                                          })(),
                                          start_time: response.data.attraction.start_time || prevData.start_time,
                                          end_time: response.data.attraction.end_time || prevData.end_time,
                                          description: response.data.attraction.description || prevData.description,
                                        };
                                        console.log("Desktop - Updated attraction data with cover_image:", updatedAttractionData);
                                        return updatedAttractionData;
                                      });
                                    }
                                    
                                    console.log(
                                      "Desktop Ticket data updated with date-specific pricing:",
                                      transformedData
                                    );
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
                                  style={{
                                    textAlign: "center",
                                    position: "relative",
                                  }}
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
                  </div> */}

                  {/* Ticket Types */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-800">
                        Available Tickets
                      </h3>

                      {/* Guide Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">
                          Need a guide
                        </span>
                        <button
                          onClick={() => setNeedGuide(!needGuide)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            needGuide ? "bg-primary-600" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              needGuide ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
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
                                        // Get the base price based on rate_type
                                        const basePrice =
                                          ticket.rate_type === "full"
                                            ? ticket.full_rate || 0
                                            : ticket.rate_type === "pax"
                                            ? ticket.adult_price || 0
                                            : 0;

                                        if (ticket.discount > 0) {
                                          // Show both actual price (strikethrough) and offer price when discount exists
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
                                                  ₹{basePrice}
                                                </span>
                                              </div>
                                              <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-bold text-green-600">
                                                  ₹
                                                  {Math.round(
                                                    basePrice -
                                                      (basePrice *
                                                        ticket.discount) /
                                                        100
                                                  )}
                                                </span>
                                              </div>
                                            </>
                                          );
                                        } else {
                                          // Show only actual price when no discount
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
                                                ₹{basePrice}
                                              </span>
                                            </>
                                          );
                                        }
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
                                        Over 18+ - ₹
                                        {ticket.rate_type === "full"
                                          ? ticket.full_rate || 0
                                          : ticket.rate_type === "pax"
                                          ? ticket.adult_price || 0
                                          : 0}
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
                                        Under 18 - ₹
                                        {ticket.rate_type === "full"
                                          ? ticket.full_rate || 0
                                          : ticket.rate_type === "pax"
                                          ? ticket.child_price || 0
                                          : 0}
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
                                if (ticket?.rate_type === "full") {
                                  // Calculate offer price (discounted price) if discount exists
                                  let ticketPrice = ticket?.full_rate;
                                  if (ticket?.discount > 0) {
                                    ticketPrice =
                                      ticket.full_rate -
                                      (ticket.full_rate * ticket.discount) /
                                        100;
                                  }

                                  return (
                                    <>
                                      <p className="text-sm text-gray-800">
                                        ₹{Math.round(ticketPrice)} ×{" "}
                                        {totalQuantity}
                                      </p>
                                      <p className="text-base font-semibold text-primary-600">
                                        ₹
                                        {Math.round(
                                          parseFloat(ticketPrice) *
                                            totalQuantity
                                        )}
                                      </p>
                                    </>
                                  );
                                } else if (ticket?.rate_type === "pax") {
                                  // For pax tickets, show adult and child prices separately
                                  let adultPrice = parseFloat(
                                    ticket?.adult_price || 0
                                  );
                                  let childPrice = parseFloat(
                                    ticket?.child_price || 0
                                  );

                                  // If adult_price or child_price is not available, fallback to full_rate
                                  if (
                                    adultPrice === 0 &&
                                    childPrice === 0 &&
                                    ticket?.full_rate
                                  ) {
                                    adultPrice = parseFloat(ticket.full_rate);
                                    childPrice = parseFloat(ticket.full_rate);
                                  }

                                  // Apply discount if exists
                                  if (ticket?.discount > 0) {
                                    adultPrice =
                                      adultPrice -
                                      (adultPrice * ticket.discount) / 100;
                                    childPrice =
                                      childPrice -
                                      (childPrice * ticket.discount) / 100;
                                  }

                                  const adultTotal = adultPrice * tickets.adult;
                                  const childTotal = childPrice * tickets.child;
                                  const grandTotal = adultTotal + childTotal;

                                  return (
                                    <>
                                      <div className="text-sm text-gray-800 space-y-1">
                                        {tickets.adult > 0 && (
                                          <p>
                                            Adult: ₹{Math.round(adultPrice)} ×{" "}
                                            {tickets.adult}
                                          </p>
                                        )}
                                        {tickets.child > 0 && (
                                          <p>
                                            Child: ₹{Math.round(childPrice)} ×{" "}
                                            {tickets.child}
                                          </p>
                                        )}
                                      </div>
                                      <p className="text-base font-semibold text-primary-600">
                                        ₹{Math.round(grandTotal)}
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
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-lg font-semibold text-primary-600">
                      ₹{Math.round(getTotalPrice())}
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
