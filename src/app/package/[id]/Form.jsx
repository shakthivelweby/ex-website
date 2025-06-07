"use client";

import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter, useSearchParams } from "next/navigation";
import apiMiddleware from "@/app/api/apiMiddleware";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";
import Button from "@/components/common/Button";
import isLogin, { setRedirectAfterLogin } from "@/utils/isLogin";
import { useQuery } from "@tanstack/react-query";
import { getPackageCalendarRates } from "./service";
import { formatDate } from "@/utils/formatDate";

/**
 * Form Component for Package Booking/Enquiry
 * Handles both direct booking and enquiry functionality for travel packages
 * 
 * @param {Object} props Component props
 * @param {Object} props.packageData - Contains package details including days and nights
 * @param {Object} props.selectedStayCategory - Selected accommodation category
 * @param {string} props.date - Initial selected date
 * @param {number} props.packagePrice - Price per person
 * @param {boolean} props.enquireOnly - Flag to determine if form is for enquiry only
 * @param {Object} props.packagePriceData - Contains pricing details including rate ID
 */
const Form = ({
  packageData,
  selectedStayCategory,
  date,
  packagePrice,
  enquireOnly,
  packagePriceData
}) => {
  // Navigation and URL handling
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state management
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date(date));
  const [currentMonth, setCurrentMonth] = useState(new Date(date));
  const [isLoading, setIsLoading] = useState(false);

  // Enquiry form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Error and success state management
  const [error, setError] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: "",
  });

  // Extract package details
  const { total_days, total_nights } = packageData.data;

  /**
   * Helper function to get date range for a given month
   * Used for fetching calendar rates
   */
  const getMonthDateRange = (date) => {
    const givenDate = new Date(date);
    const year = givenDate.getFullYear();
    const month = givenDate.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    return {
      start: formatDate(start),
      end: formatDate(end)
    };
  };

  // Fetch calendar rates using React Query
  const { data: calendarRates, isLoading: calendarRatesLoading } = useQuery({
    queryKey: ["package-calendar-rates", packageData.data.id, formatDate(currentMonth), selectedStayCategory.stay_category_id],
    queryFn: () => {
      const { start, end } = getMonthDateRange(currentMonth);
      return getPackageCalendarRates(packageData.data.id, start, end, selectedStayCategory.stay_category_id);
    },
    enabled: !!selectedDate,
  });

  // Process calendar rates for display
  const ratesByDate = useMemo(() => {
    if (!calendarRates?.data) return {};
    return calendarRates.data.reduce((acc, rate) => {
      if (rate.adultPrice !== null) {
        acc[rate.date] = parseFloat(rate.adultPrice).toFixed(2);
      }
      return acc;
    }, {});
  }, [calendarRates]);

  /**
   * Handle date selection change
   * Updates URL params and state
   */
  const onDateChange = (newDate) => {
    setSelectedDate(newDate);
    setCurrentMonth(newDate);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", formatDate(newDate));
    router.replace(`/package/${packageData.data.id}?${params.toString()}`);
  };

  // Form validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  // Input change handlers with validation
  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    if (error.fullName) {
      setError(prev => ({
        ...prev,
        fullName: value.trim() ? "" : "Full Name is required"
      }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (error.email) {
      setError(prev => ({
        ...prev,
        email: value ? (validateEmail(value) ? "" : "Please enter a valid email") : "Email is required"
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (error.phone) {
      setError(prev => ({
        ...prev,
        phone: value ? (validatePhone(value) ? "" : "Please enter a valid 10-digit phone number") : "Phone is required"
      }));
    }
  };

  /**
   * Handle form submission for both booking and enquiry
   * Validates form data and makes API calls
   */
  async function submitHandler() {
    setIsLoading(true);

    // Validate enquiry form fields if applicable
    if (enquireOnly) {
      const newErrors = {
        fullName: fullName.trim() ? "" : "Full Name is required",
        email: email ? (validateEmail(email) ? "" : "Please enter a valid email") : "Email is required",
        phone: phone ? (validatePhone(phone) ? "" : "Please enter a valid 10-digit phone number") : "Phone is required"
      };

      if (Object.values(newErrors).some(error => error !== "")) {
        setError(newErrors);
        setIsLoading(false);
        return;
      }
    }

    // Prepare submission data
    const data = {
      package_id: packageData.data.id,
      enquiry_date: formatDate(selectedDate),
      adult: adultCount,
      child: childCount,
      infant: infantCount,
      package_price_rate_id: packagePriceData.packagePriceRateId,
      type: "booking",
      stay_category_id: selectedStayCategory.stay_category_id,
    };

    // Add additional fields for enquiry
    if (enquireOnly) {
      data.type = "enquire";
      data.name = fullName.trim();
      data.email = email.trim();
      data.phone = phone.trim();
    }

    try {
      if (data.type === "enquire") {
        // Handle enquiry submission
        await apiMiddleware.post("/package-enquiry", data);
        setSuccessMessage({
          title: "Enquiry Sent!",
          message: "We've received your enquiry and will get back to you soon.",
        });
        setShowSuccess(true);
      } else {
   
        // Handle booking submission
        if (!isLogin()) {
          // Store checkout URL using the utility function
          const checkoutUrl = `/checkout?package_id=${packageData.data.id}&stay_category_id=${selectedStayCategory.stay_category_id}&booking_date=${formatDate(selectedDate)}&adult_count=${adultCount}&child_count=${childCount}&infant_count=${infantCount}&package_price_rate_id=${packagePriceData.packagePriceRateId}`;
          setRedirectAfterLogin(checkoutUrl);
          // Show login modal
          const event = new CustomEvent('showLogin');
          window.dispatchEvent(event);
          setIsLoading(false);
          return;
        }

        // If already logged in, redirect directly to checkout
        router.push(`/checkout?package_id=${packageData.data.id}&stay_category_id=${selectedStayCategory.stay_category_id}&booking_date=${formatDate(selectedDate)}&adult_count=${adultCount}&child_count=${childCount}&infant_count=${infantCount}&package_price_rate_id=${packagePriceData.packagePriceRateId}`);





        // const formattedData = {
        //   package_id: packageData.data.id,
        //   booking_date: formatDate(selectedDate),
        //   adult_count: adultCount,
        //   child_count: childCount,
        //   infant_count: infantCount,
        //   package_price_rate_id: packagePriceData.packagePriceRateId,
        //   type: "booking",
        //   stay_category_id: selectedStayCategory.stay_category_id,
        // }
        // await apiMiddleware.post("/package-booking", formattedData);
        // setSuccessMessage({
        //   title: "Booking Successful!",
        //   message: "Your trip has been booked successfully. Check your email for details.",
        // });
      }

      // 
      
      // Reset form for enquiry
      if (enquireOnly) {
        setFullName("");
        setEmail("");
        setPhone("");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle itinerary download
  function downloadHandler() {
    console.log("downloadHandler");
  }

  return (
    <>
      {/* Main form container */}
      <div
        className={`${!enquireOnly ? "sticky top-6" : ""
          } bg-[#f7f7f7] rounded-xl p-3 shadow-sm`}
      >
        {/* Package status badge */}
        <span className="text-xs font-medium text-gray-800  bg-green-200 rounded-full px-2 py-1 mb-2">
          <i className="fi fi-rr-pending mr-2 relative !top-0.5"></i>
          Scheduled Trip
        </span>

        {/* Price and duration display */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <div>
            <span className="text-3xl font-bold text-gray-800">
              ₹ {packagePrice}
            </span>
            <span className="text-gray-700 text-sm font-medium ml-1">
              / Person
            </span>
          </div>
          <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
            {total_nights} N &nbsp; {total_days} D
          </div>
        </div>

        {/* Date picker section */}
        <div className="mb-4 bg-white rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Starting Date
          </label>
          <div className="relative">
            <DatePicker
              minDate={new Date()}
              placeholderText="Choose Date"
              className="w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium"
              selected={selectedDate}
              onChange={(date) => onDateChange(date)}
              onMonthChange={(date) => {
                setCurrentMonth(date);
              }}
              popperPlacement="bottom-start"
              renderDayContents={(day, date) => {
                const dateStr = formatDate(date);
                const rate = ratesByDate[dateStr];
                return (
                  <div style={{ textAlign: "center", position: "relative" }}>
                    <div>{day}</div>
                    {rate && (
                      <div
                        style={{
                          fontSize: "0.7em",
                          color: "#FF385C",
                          position: "absolute",
                          left: 0,
                          top: "23px",
                          textAlign: "center",
                          width: "100%",
                          fontWeight: "500"
                        }}
                      >
                        ₹{rate}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2  pointer-events-none text-gray-500">
              <i className="fi fi-rr-calendar text-lg"></i>
            </div>
          </div>
        </div>

        {/* Ticket count section */}
        <div className="mb-4 bg-white rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-800 mb-4">
            No. of Tickets
          </label>

          {/* Adults counter */}
          <div className="flex items-center justify-between mb-2 border-b border-gray-200 pb-2">
            <div>
              <p className="font-medium text-gray-800 text-sm">Adult</p>
              <p className="text-xs text-gray-500">Over 18+</p>
            </div>
            <div className="flex items-center">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
              >
                <i className="fi fi-rr-minus text-xs"></i>
              </button>
              <span className="mx-4 w-6 text-center text-gray-800 font-medium">
                {adultCount}
              </span>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                onClick={() => setAdultCount(adultCount + 1)}
              >
                <i className="fi fi-rr-plus text-xs"></i>
              </button>
            </div>
          </div>

          {/* Children counter */}
          <div className="flex items-center justify-between mb-2 border-b border-gray-200 pb-2">
            <div>
              <p className="font-medium text-gray-800 text-sm">Child</p>
              <p className="text-xs text-gray-500">Ages 2-17</p>
            </div>
            <div className="flex items-center">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                onClick={() => setChildCount(Math.max(0, childCount - 1))}
              >
                <i className="fi fi-rr-minus text-xs"></i>
              </button>
              <span className="mx-4 w-6 text-center text-gray-800 font-medium">
                {childCount}
              </span>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                onClick={() => setChildCount(childCount + 1)}
              >
                <i className="fi fi-rr-plus text-xs"></i>
              </button>
            </div>
          </div>

          {/* Infants counter */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 text-sm">Infants</p>
              <p className="text-xs text-gray-500">Under 2</p>
            </div>
            <div className="flex items-center">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                onClick={() => setInfantCount(Math.max(0, infantCount - 1))}
              >
                <i className="fi fi-rr-minus text-xs"></i>
              </button>
              <span className="mx-4 w-6 text-center text-gray-800 font-medium">
                {infantCount}
              </span>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                onClick={() => setInfantCount(infantCount + 1)}
              >
                <i className="fi fi-rr-plus text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Enquiry form fields */}
        {enquireOnly && (
          <div className="mb-6 bg-white rounded-xl p-4">
            {/* Full Name field */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={handleFullNameChange}
                type="text"
                className={`w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer placeholder:font-normal font-medium tracking-tight ${error.fullName ? "border-red-500" : ""
                  }`}
                placeholder="Enter your full name"
              />
              {error.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  <i className="fi fi-rr-info mr-1"></i>
                  {error.fullName}
                </p>
              )}
            </div>

            {/* Email field */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Email
              </label>
              <input
                value={email}
                onChange={handleEmailChange}
                type="email"
                className={`w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer placeholder:font-normal font-medium tracking-tight ${error.email ? "border-red-500" : ""
                  }`}
                placeholder="Enter your email"
              />
              {error.email && (
                <p className="text-red-500 text-xs mt-1">
                  <i className="fi fi-rr-info mr-1"></i>
                  {error.email}
                </p>
              )}
            </div>

            {/* Phone field */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Phone
              </label>
              <input
                value={phone}
                onChange={handlePhoneChange}
                type="tel"
                maxLength={10}
                className={`w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer placeholder:font-normal font-medium tracking-tight ${error.phone ? "border-red-500" : ""
                  }`}
                placeholder="Enter your phone number"
              />
              {error.phone && (
                <p className="text-red-500 text-xs mt-1">
                  <i className="fi fi-rr-info mr-1"></i>
                  {error.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <Button
          onClick={submitHandler}
          size="lg"
          className="w-full mb-3"
          isLoading={isLoading}
          icon={<i className="fi fi-rr-arrow-right ml-2"></i>}
        >
          {enquireOnly ? "Enquire Now" : "Book Now"}
        </Button>

        <Button
          onClick={downloadHandler}
          variant="outline"
          size="lg"
          className="w-full"
          icon={<i className="fi fi-rr-download ml-2"></i>}
        >
          Download Itinerary
        </Button>
      </div>

      {/* Success popup */}
      <SuccessPopup
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={successMessage.title}
        message={successMessage.message}
      />
    </>
  );
};

export default Form;
