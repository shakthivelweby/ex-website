"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter, useSearchParams } from "next/navigation";
import apiMiddleware from "@/app/api/apiMiddleware";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";
import Button from "@/components/common/Button";
import isLogin from "@/utils/isLogin";
import { useQuery } from "@tanstack/react-query";
import { getPackageCalendarRates } from "./service";
import { formatDate } from "@/utils/formatDate";
import { usePackageRate } from "./query";
import {
  getDaysUntilDate,
  isOnlineBookingAllowed,
  shouldShowEnquiryOnly,
  MIN_BOOKING_LEAD_DAYS,
  getFirstBookableDate,
  formatBookableFromDate,
} from "@/utils/packageBookingLeadTime";

/**
 * Form Component for Package Booking/Enquiry
 * Handles both direct booking and enquiry functionality for travel packages
 *
 * @param {Object} props Component props
 * @param {Object} props.packageData - Contains package details including days and nights
 * @param {Object} props.selectedStayCategory - Selected accommodation category
 * @param {string} props.date - Initial selected date
 * @param {number} props.packagePrice - Price per person
 * @param {Object} props.packagePriceData - Contains pricing details including rate ID
 * @param {boolean} props.isMobilePopup - Flag to determine if form is in mobile popup view
 */
const Form = ({
  packageData,
  selectedStayCategory,
  date,
  packagePrice,
  packagePriceData,
  isMobilePopup = false,
  downloadHandler,
  isDownloading,
  loadingTexts,
  downloadProgress,
  downloadSize,
  formatBytes,
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
      const event = new CustomEvent("showLogin");
      window.dispatchEvent(event);
      return;
    }

    try {
      downloadHandler(e);
    } catch (error) {
      console.error("Error downloading itinerary:", error);
      alert("Failed to download itinerary. Please try again later.");
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

  const { data: livePackageRate } = usePackageRate(
    packageData.data.id,
    selectedStayCategory.package_stay_category_id,
    formatDate(selectedDate)
  );

  const effectivePriceData = livePackageRate?.data || packagePriceData;

  const isEnquiryOnly = useMemo(
    () =>
      shouldShowEnquiryOnly(
        selectedDate,
        effectivePriceData?.rateAvailable ?? false
      ),
    [selectedDate, effectivePriceData?.rateAvailable]
  );

  const isWithinBookingLeadTime = !isOnlineBookingAllowed(selectedDate);
  const daysUntilTrip = getDaysUntilDate(selectedDate);

  const canProceedToCheckout =
    effectivePriceData?.usesBasePrice || effectivePriceData?.packagePriceRateId;

  const buildCheckoutQuery = () => {
    const params = new URLSearchParams({
      package_id: String(packageData.data.id),
      stay_category_id: String(selectedStayCategory.stay_category_id),
      booking_date: formatDate(selectedDate),
      adult_count: String(adultCount),
      child_count: String(childCount),
      infant_count: String(infantCount),
    });

    if (effectivePriceData?.usesBasePrice) {
      params.set("use_base_price", "1");
    } else if (effectivePriceData?.packagePriceRateId) {
      params.set(
        "package_price_rate_id",
        String(effectivePriceData.packagePriceRateId)
      );
    }

    return params.toString();
  };

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
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: "",
    message: "",
  });

  // Extract package details
  const { total_days, total_nights, tour_type } = packageData.data;

  const tourTypeConfig = {
    fixed_departure: {
      title: "Scheduled Trip",
      color: "bg-green-200",
      icon: "fi fi-rr-pending",
    },
    private: {
      title: "Private Package",
      color: "bg-blue-200",
      icon: "fi fi-rr-umbrella-beach",
    },
  };

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
      end: formatDate(end),
    };
  };

  // Fetch calendar rates using React Query
  const { data: calendarRates } = useQuery({
    queryKey: [
      "package-calendar-rates",
      packageData.data.id,
      formatDate(currentMonth),
      selectedStayCategory.stay_category_id,
    ],
    queryFn: () => {
      const { start, end } = getMonthDateRange(currentMonth);
      return getPackageCalendarRates(
        packageData.data.id,
        start,
        end,
        selectedStayCategory.stay_category_id
      );
    },
    enabled: !!selectedDate,
  });

  const firstBookableDate = useMemo(() => getFirstBookableDate(), []);
  const bookableFromLabel = formatBookableFromDate(firstBookableDate);

  // Function to check if a date should be disabled
  const isDateDisabled = (date) => {
    const formattedDate = formatDate(date);
    const rateData = calendarRates?.data?.find(
      (rate) => rate.date === formattedDate
    );
    return rateData?.stopSale === true;
  };

  const getDayClassName = (date) => {
    const dateStr = formatDate(date);
    const rateData = calendarRates?.data?.find((rate) => rate.date === dateStr);
    const isFirstBookable = dateStr === formatDate(firstBookableDate);
    const classes = [];

    if (rateData?.stopSale) {
      classes.push("pkg-day--unavailable");
    } else if (!isOnlineBookingAllowed(date)) {
      classes.push("pkg-day--enquiry");
    } else {
      classes.push("pkg-day--bookable");
    }

    if (isFirstBookable) {
      classes.push("pkg-day--first-bookable");
    }

    return classes.join(" ");
  };

  const renderCalendarDayContents = (day) => (
    <span className="pkg-day-num">{day}</span>
  );

  const renderCalendarHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div className="pkg-cal-header">
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          type="button"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30"
          aria-label="Previous month"
        >
          <i className="fi fi-rr-angle-left text-sm" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {date.toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30"
          aria-label="Next month"
        >
          <i className="fi fi-rr-angle-right text-sm" />
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5 px-1 pb-2">
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
          Book
        </span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
          Enquiry
        </span>
        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-teal-700">
          From
        </span>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600">
          N/A
        </span>
      </div>
    </div>
  );

  const calendarPickerProps = {
    selected: selectedDate,
    onChange: (date) => onDateChange(date),
    onMonthChange: (date) => setCurrentMonth(date),
    dateFormat: "dd/MM/yyyy",
    minDate: new Date(),
    filterDate: (date) => !isDateDisabled(date),
    renderDayContents: renderCalendarDayContents,
    renderCustomHeader: renderCalendarHeader,
    dayClassName: getDayClassName,
    calendarClassName: "package-booking-datepicker",
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
      setError((prev) => ({
        ...prev,
        fullName: value.trim() ? "" : "Full Name is required",
      }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (error.email) {
      setError((prev) => ({
        ...prev,
        email: value
          ? validateEmail(value)
            ? ""
            : "Please enter a valid email"
          : "Email is required",
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (error.phone) {
      setError((prev) => ({
        ...prev,
        phone: value
          ? validatePhone(value)
            ? ""
            : "Please enter a valid 10-digit phone number"
          : "Phone is required",
      }));
    }
  };

  // Function to scroll to element with smooth behavior
  const scrollToElement = (elementRef) => {
    if (elementRef.current) {
      const yOffset = -100; // Offset to account for header
      const element = elementRef.current;
      const container = isMobilePopup
        ? element.closest(".overflow-y-auto")
        : window;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      container.scrollTo({ top: y, behavior: "smooth" });

      // Add focus effect
      element.focus();
      element.classList.add("border-red-500", "bg-red-50");
      setTimeout(() => {
        element.classList.remove("bg-red-50");
      }, 2000);
    }
  };

  // Validate and scroll to first error
  const validateAndScroll = () => {
    const newErrors = {
      fullName: fullName.trim() ? "" : "Full Name is required",
      email: email
        ? validateEmail(email)
          ? ""
          : "Please enter a valid email"
        : "Email is required",
      phone: phone
        ? validatePhone(phone)
          ? ""
          : "Please enter a valid 10-digit phone number"
        : "Phone is required",
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

    if (isEnquiryOnly) {
      if (!validateAndScroll()) {
        setIsLoading(false);
        return;
      }
    }

    // Validate minimum members requirement (infants are not counted as members)
    const totalMembers = adultCount + childCount;
    const minimumMembers = packageData?.data?.minimum_members;
    
    if (minimumMembers && totalMembers < minimumMembers) {
      setErrorMessage({
        title: "Minimum Members Required",
        message: `Minimum ${minimumMembers} member(s) required for this package. You have selected ${totalMembers} member(s).`,
      });
      setShowError(true);
      setIsLoading(false);
      return;
    }

    // Prepare submission data
    const data = {
      package_id: packageData.data.id,
      enquiry_date: formatDate(selectedDate),
      adult: adultCount,
      child: childCount,
      infant: infantCount,
      package_price_rate_id: effectivePriceData.packagePriceRateId,
      type: "booking",
      stay_category_id: selectedStayCategory.stay_category_id,
    };

    // Add additional fields for enquiry
    if (isEnquiryOnly) {
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
        if (isEnquiryOnly) {
          setErrorMessage({
            title: "Enquiry Required",
            message:
              "Online booking is not available for this date. Please submit an enquiry instead.",
          });
          setShowError(true);
          setIsLoading(false);
          return;
        }

        if (!canProceedToCheckout) {
          setErrorMessage({
            title: "Rate Unavailable",
            message:
              "No booking rate is configured for this date. Please submit an enquiry instead.",
          });
          setShowError(true);
          setIsLoading(false);
          return;
        }

        router.push(`/checkout/package?${buildCheckoutQuery()}`);

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
      if (isEnquiryOnly) {
        setFullName("");
        setEmail("");
        setPhone("");
        setNotes("");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage({
        title: "Error",
        message: error.response?.data?.message || "Something went wrong. Please try again.",
      });
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Main form container */}
      <div
        className={`${!isEnquiryOnly && !isMobilePopup ? "sticky top-6" : ""} ${
          isMobilePopup ? "pb-24" : "bg-[#f7f7f7] rounded-xl p-3 shadow-sm"
        }`}
      >
        {/* Enquiry Only Message */}
        {isEnquiryOnly && (
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
                  {isWithinBookingLeadTime ? (
                    <>
                      Online booking is available for travel dates more than{" "}
                      {MIN_BOOKING_LEAD_DAYS} days from today. Your selected
                      date is{" "}
                      {daysUntilTrip <= 0
                        ? "today or in the past"
                        : `only ${daysUntilTrip} day${
                            daysUntilTrip === 1 ? "" : "s"
                          } away`}
                      . Please submit an enquiry and our team will assist you.
                    </>
                  ) : (
                    <>
                      Online booking is not available for your selected dates.
                      Please submit an enquiry and our team will get back to you
                      with availability.
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Package status badge */}
        <span
          className={`text-xs font-medium text-gray-800  rounded-full px-2 py-1 mb-2 ${isEnquiryOnly ? 'bg-blue-200' : tourTypeConfig[tour_type].color}`}
        >
          <i
            className={`${isEnquiryOnly ? 'fi fi-rr-umbrella-beach' : tourTypeConfig[tour_type].icon} mr-2 relative !top-0.5`}
          ></i>
          {isEnquiryOnly ? 'Private Package' : tourTypeConfig[tour_type].title}
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
            {total_days} D &nbsp; {total_nights} N
          </div>
        </div>

        {/* Date picker section */}
        <div className="mb-4 bg-white rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Starting Date
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Online booking from{" "}
            <span className="font-medium text-green-700">{bookableFromLabel}</span>
            . Earlier dates are enquiry only.
          </p>
          <div className="relative">
            {isMobilePopup ? (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <DatePicker {...calendarPickerProps} inline />
              </div>
            ) : (
              <>
                <DatePicker
                  {...calendarPickerProps}
                  placeholderText="Choose Date"
                  className="w-full h-11 px-3 pr-10 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer font-medium bg-white"
                  popperPlacement="bottom-start"
                  popperClassName="package-booking-datepicker-popper"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <i className="fi fi-rr-calendar text-lg"></i>
                </div>
              </>
            )}
          </div>

          {isMobilePopup && selectedDate && (
            <p className="mt-3 text-sm text-gray-600">
              <span className="font-medium text-gray-800">Selected:</span>{" "}
              {selectedDate.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
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
        {isEnquiryOnly && (
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
                className={`w-full h-12 px-0 pr-10 border-b text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-400 placeholder:tracking-wide focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium tracking-tight transition-colors ${
                  error.fullName ? "border-red-500" : ""
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
                ref={emailRef}
                value={email}
                onChange={handleEmailChange}
                type="email"
                className={`w-full h-12 px-0 pr-10 border-b text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-400 placeholder:tracking-wide focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium tracking-tight transition-colors ${
                  error.email ? "border-red-500" : ""
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
                ref={phoneRef}
                value={phone}
                onChange={handlePhoneChange}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                className={`w-full h-12 px-0 pr-10 border-b text-[16px] text-gray-800 border-gray-300 bg-white placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-400 placeholder:tracking-wide focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium tracking-tight transition-colors ${
                  error.phone ? "border-red-500" : ""
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
              {isEnquiryOnly ? "Enquire Now" : "Book Now"}
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
              {isEnquiryOnly ? "Enquire Now" : "Book Now"}
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
                              ? `${formatBytes(
                                  downloadSize.downloaded
                                )} of ${formatBytes(downloadSize.total)}`
                              : "Starting download..."}
                          </span>
                          {downloadProgress > 0 && (
                            <span className="font-medium">
                              {downloadProgress}%
                            </span>
                          )}
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

      {/* Error popup */}
      {showError && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:min-h-screen">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300" 
              onClick={() => setShowError(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm mx-auto transform rounded-2xl bg-white shadow-xl transition-all duration-300 animate-modal-pop z-10 my-auto">
              {/* Background Decoration */}
              <div className="absolute inset-0">
                <div 
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full" 
                  style={{
                    background: "radial-gradient(circle at center, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0) 70%)"
                  }}
                />
                <div 
                  className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full" 
                  style={{
                    background: "radial-gradient(circle at center, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0) 70%)"
                  }}
                />
              </div>

              {/* Content Container */}
              <div className="relative px-6 pt-8 pb-6">
                {/* Close Button */}
                <button
                  onClick={() => setShowError(false)}
                  className="absolute right-4 top-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <i className="fi fi-rr-cross text-base"></i>
                </button>

                {/* Error Icon */}
                <div className="mb-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <div 
                      className="absolute inset-0 rounded-full opacity-25"
                      style={{
                        background: "radial-gradient(circle at center, #ef4444 0%, transparent 70%)"
                      }}
                    />
                    <div className="absolute inset-2 rounded-full bg-red-100/50 animate-pulse" />
                    <div className="relative h-full flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-red-100" />
                        <div className="relative z-10 w-16 h-16 rounded-full bg-white flex items-center justify-center">
                          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 animate-fade-in">
                    {errorMessage.title || "Error"}
                  </h2>
                  <p className="text-gray-600 animate-fade-in-delay">
                    {errorMessage.message || "Something went wrong. Please try again."}
                  </p>
                </div>

                {/* Action Button */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowError(false)}
                    className="w-full h-12 bg-red-600 text-white font-medium rounded-full flex items-center justify-center hover:bg-red-700 transition-all duration-200 animate-fade-in-delay-2 shadow-lg shadow-red-600/20 hover:shadow-red-600/30"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Form;
