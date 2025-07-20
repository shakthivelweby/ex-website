"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
 * @param {boolean} props.isMobilePopup - Flag to determine if form is in mobile popup view
 */
const Form = ({
  packageData,
  selectedStayCategory,
  date,
  packagePrice,
  enquireOnly,
  packagePriceData,
  isMobilePopup = false,
  downloadHandler,
  isDownloading,
  loadingTexts,
  downloadProgress,
  downloadSize,
  formatBytes
}) => {

  // Add new state for loading text
  const [currentLoadingText, setCurrentLoadingText] = useState(0);

  // Add effect for loading text animation
  useEffect(() => {
    let interval;
    if (isDownloading) {
      interval = setInterval(() => {
        setCurrentLoadingText((prev) => (prev + 1) % loadingTexts.length);
      }, 2000);
    } else {
      setCurrentLoadingText(0);
    }
    return () => clearInterval(interval);
  }, [isDownloading, loadingTexts.length]);

  // Add handler for download click
  const handleDownloadClick = async (e) => {
    e.preventDefault();
    if (!isLogin()) {
      const event = new CustomEvent('showLogin');
      window.dispatchEvent(event);
      return;
    }

    try {
      downloadHandler(e);
    } catch (error) {
      console.error('Error downloading itinerary:', error);
      alert('Failed to download itinerary. Please try again later.');
    }
  };


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
  const [notes, setNotes] = useState("");

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
  const { total_days, total_nights, tour_type } = packageData.data;


  const tourTypeConfig = {
    "fixed_departure": {
      title: "Scheduled Trip",
      color: "bg-green-200",
      icon: "fi fi-rr-pending"
    },
    "private": {
      title: "Private Package",
      color: "bg-blue-200",
      icon: "fi fi-rr-umbrella-beach"
    }
  }





  // Refs for form fields
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const notesRef = useRef(null);

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

  console.log(calendarRates)

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

  // Function to check if a date should be disabled
  const isDateDisabled = (date) => {
    const formattedDate = formatDate(date);
    const rateData = calendarRates?.data?.find(rate => rate.date === formattedDate);
    return rateData?.stopSale === true;
  };

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

  // Function to scroll to element with smooth behavior
  const scrollToElement = (elementRef) => {
    if (elementRef.current) {
      const yOffset = -100; // Offset to account for header
      const element = elementRef.current;
      const container = isMobilePopup ? element.closest('.overflow-y-auto') : window;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      container.scrollTo({ top: y, behavior: 'smooth' });

      // Add focus effect
      element.focus();
      element.classList.add('border-red-500', 'bg-red-50');
      setTimeout(() => {
        element.classList.remove('bg-red-50');
      }, 2000);
    }
  };

  // Validate and scroll to first error
  const validateAndScroll = () => {
    const newErrors = {
      fullName: fullName.trim() ? "" : "Full Name is required",
      email: email ? (validateEmail(email) ? "" : "Please enter a valid email") : "Email is required",
      phone: phone ? (validatePhone(phone) ? "" : "Please enter a valid 10-digit phone number") : "Phone is required"
    };

    setError(newErrors);

    // Find first error and scroll to it
    if (newErrors.fullName) {
      scrollToElement(fullNameRef);
      return false;
    }
    if (newErrors.email) {
      scrollToElement(emailRef);
      return false;
    }
    if (newErrors.phone) {
      scrollToElement(phoneRef);
      return false;
    }

    return true;
  };

  /**
   * Handle form submission for both booking and enquiry
   * Validates form data and makes API calls
   */
  async function submitHandler() {
    setIsLoading(true);

    if (enquireOnly) {
      if (!validateAndScroll()) {
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
      data.notes = notes.trim();
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
        setNotes("");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <>
      {/* Main form container */}
      <div
        className={`${!enquireOnly && !isMobilePopup ? "sticky top-6" : ""
          } ${isMobilePopup ? "pb-24" : "bg-[#f7f7f7] rounded-xl p-3 shadow-sm"}`}
      >
        {/* Enquiry Only Message */}
        {enquireOnly && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <i className="fi fi-rr-info text-yellow-600"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Enquiry Only
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  Online booking is not available for your selected dates. Please submit an enquiry and our team will get back to you with availability.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Package status badge */}
        <span className={`text-xs font-medium text-gray-800  rounded-full px-2 py-1 mb-2 ${tourTypeConfig[tour_type].color}`}>
          <i className={`${tourTypeConfig[tour_type].icon} mr-2 relative !top-0.5`}></i>
          {tourTypeConfig[tour_type].title}
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
            {total_days} D  &nbsp; {total_nights} N
          </div>
        </div>

        {/* Date picker section */}
        <div className="mb-4 bg-white rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Starting Date
          </label>
          <div className="relative">

            {isMobilePopup ? (
              // Inline calendar for mobile

              <div className="border-t border-gray-200 pt-3">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => onDateChange(date)}
                  onMonthChange={(date) => {
                    setCurrentMonth(date);
                  }}
                  dateFormat="dd/MM/yyyy"
                  inline
                  minDate={new Date()}
                  filterDate={date => !isDateDisabled(date)}
                  renderDayContents={(day, date) => {
                    const dateStr = formatDate(date);
                    const rateData = calendarRates?.data?.find(rate => rate.date === dateStr);
                    const rate = ratesByDate[dateStr];
                    return (
                      <div style={{ textAlign: "center", position: "relative" }}>
                        <div>{day}</div>
                        {rateData?.stopSale ? (
                          <div
                            style={{
                              fontSize: "0.65em",
                              color: "#EF4444",
                              position: "absolute",
                              left: 0,
                              top: "23px",
                              textAlign: "center",
                              width: "100%",
                              fontWeight: "500"
                            }}
                          >
                            N/A
                          </div>
                        ) : rate && (
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
              </div>
            ) : (
              // Popup calendar for desktop
              <>
                <DatePicker
                  minDate={new Date()}
                  placeholderText="Choose Date"
                  className="w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium"
                  selected={selectedDate}
                  onChange={(date) => onDateChange(date)}
                  onMonthChange={(date) => {
                    setCurrentMonth(date);
                  }}
                  dateFormat="dd/MM/yyyy"
                  filterDate={date => !isDateDisabled(date)}
                  popperPlacement="bottom-start"
                  renderDayContents={(day, date) => {
                    const dateStr = formatDate(date);
                    const rateData = calendarRates?.data?.find(rate => rate.date === dateStr);
                    const rate = ratesByDate[dateStr];
                    return (
                      <div style={{ textAlign: "center", position: "relative" }}>
                        <div>{day}</div>
                        {rateData?.stopSale ? (
                          <div
                            style={{
                              fontSize: "0.65em",
                              color: "#057676",
                              position: "absolute",
                              left: 0,
                              top: "23px",
                              textAlign: "center",
                              width: "100%",
                              fontWeight: "500"
                            }}
                          >
                            N/A
                          </div>
                        ) : rate && (
                          <div
                            style={{
                              fontSize: "0.7em",
                              color: "#057676",
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
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-800">
                  <i className="fi fi-rr-calendar text-lg"></i>
                </div>
              </>
            )}
          </div>
          {isMobilePopup && (
            <div className="mt-3 text-sm text-gray-500 flex items-center">
              <i className="fi fi-rr-info mr-2"></i>
              Selected date: {selectedDate ? selectedDate.toLocaleDateString() : 'None'}
            </div>
          )}
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
                ref={fullNameRef}
                value={fullName}
                onChange={handleFullNameChange}
                type="text"
                className={`w-full h-12 px-0 pr-10 border-b text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-400 placeholder:tracking-wide focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium tracking-tight transition-colors ${error.fullName ? "border-red-500" : ""}`}
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
                ref={emailRef}
                value={email}
                onChange={handleEmailChange}
                type="email"
                className={`w-full h-12 px-0 pr-10 border-b text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-400 placeholder:tracking-wide focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium tracking-tight transition-colors ${error.email ? "border-red-500" : ""}`}
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
                ref={phoneRef}
                value={phone}
                onChange={handlePhoneChange}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                className={`w-full h-12 px-0 pr-10 border-b text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-400 placeholder:tracking-wide focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium tracking-tight transition-colors ${error.phone ? "border-red-500" : ""}`}
                placeholder="Enter your phone number"
              />
              {error.phone && (
                <p className="text-red-500 text-xs mt-1">
                  <i className="fi fi-rr-info mr-1"></i>
                  {error.phone}
                </p>
              )}
            </div>

            {/* Notes/Comments field */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Additional Notes
              </label>
              <textarea
                ref={notesRef}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-400 placeholder:tracking-wide focus:outline-none focus:ring-none focus:border-primary-500 rounded-lg resize-none"
                placeholder="Any specific requirements or questions?"
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        {isMobilePopup ? (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-10">
            <Button
              onClick={submitHandler}
              size="lg"
              className="w-full rounded-full"
              isLoading={isLoading}
              icon={<i className="fi fi-rr-arrow-right ml-2"></i>}
            >
              {enquireOnly ? "Enquire Now" : "Book Now"}
            </Button>
          </div>
        ) : (
          <>
            <Button
              onClick={submitHandler}
              size="lg"
              className="w-full mb-3 rounded-full"
              isLoading={isLoading}
              icon={<i className="fi fi-rr-arrow-right ml-2"></i>}
            >
              {enquireOnly ? "Enquire Now" : "Book Now"}
            </Button>

            {/* Download Itinerary Section */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <i className="fi fi-rr-document-signed text-gray-600 text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800 mb-1">
                    Detailed Itinerary
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Download the complete day-by-day travel plan and inclusions
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleDownloadClick}
                      className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-70"
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span>{loadingTexts[currentLoadingText]}</span>
                        </div>
                      ) : (
                        <>
                          <i className="fi fi-rr-download mr-2"></i>
                          <span>Download PDF</span>
                        </>
                      )}
                    </button>

                    {/* Progress bar - only show when downloading */}
                    {isDownloading && (
                      <div className="w-full max-w-xs">
                        <div className="w-full h-1 bg-gray-100 rounded-full">
                          <div
                            className="h-full bg-primary-600 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${downloadProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                          <span>
                            {downloadProgress > 0
                              ? `${formatBytes(downloadSize.downloaded)} of ${formatBytes(downloadSize.total)}`
                              : 'Starting download...'}
                          </span>
                          {downloadProgress > 0 && <span className="font-medium">{downloadProgress}%</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add padding at bottom when in popup to account for fixed button */}
      {isMobilePopup && <div className="h-20"></div>}

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
